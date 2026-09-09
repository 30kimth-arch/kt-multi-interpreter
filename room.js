async function login(){
 const id=$('loginId').value.trim(),name=$('displayName').value.trim();lang=$('uiLang').value;
 if(!/^[A-Za-z0-9._-]{2,40}$/.test(id)){setStatus('loginStatus',t('invalidId'));return}
 if(!name){setStatus('loginStatus',t('needName'));return}
 $('startBtn').disabled=true;setStatus('loginStatus',t('working'),true);
 try{
  const ar=await fetch(SB+'/auth/v1/signup',{method:'POST',headers:headers(),body:'{}'});const a=await ar.json();
  if(!ar.ok||!a.access_token||!a.user?.id)throw new Error('AUTH');
  const pr=await fetch(SB+'/rest/v1/profiles',{method:'POST',headers:{...headers(a.access_token),'prefer':'return=representation'},body:JSON.stringify({user_id:a.user.id,login_id:id,display_name:name,language:lang})});
  const p=await pr.json().catch(()=>null);
  if(!pr.ok){
   await fetch(SB+'/auth/v1/logout',{method:'POST',headers:headers(a.access_token,false)}).catch(()=>{});
   if(pr.status===409){setStatus('loginStatus',t('duplicate'));return}
   throw new Error('PROFILE');
  }
  session={access_token:a.access_token,refresh_token:a.refresh_token,user_id:a.user.id};
  profile=Array.isArray(p)?p[0]:p;state={mode:null,room:null,membership:null};saveSession();saveState();showLobby();
 }catch{setStatus('loginStatus',t('loginFail'))}
 finally{$('startBtn').disabled=false}
}
function showLobby(){
 stopTimers();$('loginView').classList.add('hidden');$('roomView').classList.add('hidden');$('lobbyView').classList.remove('hidden');$('logoutBtn').classList.remove('hidden');$('uiLang').disabled=true;
 $('profileText').textContent=profile.display_name+' · '+profile.login_id+' · '+langName(profile.language);applyLang(profile.language);setStatus('loginStatus','');
}
async function createRoom(){
 const name=$('roomName').value.trim();if(!name){setStatus('createStatus',t('needRoom'));return}
 $('createBtn').disabled=true;setStatus('createStatus',t('creating'),true);
 try{
  let room=null;
  for(let i=0;i<6;i++){
   const rr=await authFetch(SB+'/rest/v1/rooms',{method:'POST',headers:{prefer:'return=representation'},body:JSON.stringify({code:code6(),name,owner_id:session.user_id,max_participants:20,status:'active'})});
   if(rr.ok){room=(await rr.json())[0];break}
   if(rr.status!==409)throw new Error('ROOM');
  }
  if(!room)throw new Error('ROOM');
  const mr=await authFetch(SB+'/rest/v1/room_members',{method:'POST',body:JSON.stringify({room_id:room.id,user_id:session.user_id,display_name:profile.display_name,language:profile.language,role:'owner',status:'approved',decided_at:new Date().toISOString()})});
  if(!mr.ok)throw new Error('MEMBER');
  state={mode:'host',room,membership:{role:'owner',status:'approved'}};saveState();setStatus('createStatus','');enterRoom();
 }catch{setStatus('createStatus',t('createFail'))}
 finally{$('createBtn').disabled=false}
}
async function joinRoom(){
 const code=$('roomCodeInput').value.trim().toUpperCase();if(!/^[A-Z0-9]{6}$/.test(code)){setStatus('joinStatus',t('badCode'));return}
 $('joinBtn').disabled=true;setStatus('joinStatus',t('joining'),true);
 try{
  const r=await fetch(SB+'/functions/v1/join-room-request',{method:'POST',headers:headers(session.access_token),body:JSON.stringify({room_code:code})});
  const j=await r.json().catch(()=>({}));
  if(!r.ok){
   if(j.error==='ROOM_FULL'){setStatus('joinStatus',t('roomFull'));return}
   if(j.error==='ROOM_NOT_FOUND'){setStatus('joinStatus',t('notFound'));return}
   throw new Error('JOIN');
  }
  state={mode:'member',room:j.room,membership:j.membership};saveState();setStatus('joinStatus','');enterRoom();
 }catch{setStatus('joinStatus',t('joinFail'))}
 finally{$('joinBtn').disabled=false}
}
function enterRoom(){
 $('loginView').classList.add('hidden');$('lobbyView').classList.add('hidden');$('roomView').classList.remove('hidden');$('logoutBtn').classList.remove('hidden');$('uiLang').disabled=true;
 $('roomCodeOut').textContent=state.room.code;$('roomNameOut').textContent=state.room.name;$('roleOut').textContent=state.mode==='host'?t('host'):t('member');$('languageOut').textContent=langName(profile.language);
 $('hostMembersSection').classList.toggle('hidden',state.mode!=='host');$('minutesSection').classList.toggle('hidden',state.mode!=='host');lastId=0;rendered.clear();$('chat').innerHTML='';
 if(state.mode==='host'){showChat();loadMembers();memberTimer=setInterval(loadMembers,2500)}
 else{checkMemberStatus();statusTimer=setInterval(checkMemberStatus,1600)}
 applyLang(profile.language);
}
function showWaiting(){$('waitingView').classList.remove('hidden');$('blockedView').classList.add('hidden');$('chat').classList.add('hidden');$('composer').classList.add('hidden')}
function showBlocked(){$('waitingView').classList.add('hidden');$('blockedView').classList.remove('hidden');$('chat').classList.add('hidden');$('composer').classList.add('hidden');clearInterval(statusTimer)}
function showChat(){$('waitingView').classList.add('hidden');$('blockedView').classList.add('hidden');$('chat').classList.remove('hidden');$('composer').classList.remove('hidden');if(!msgTimer){loadMessages();msgTimer=setInterval(loadMessages,1200)}}
async function checkMemberStatus(){
 if(state.mode!=='member')return;
 const r=await authFetch(SB+'/functions/v1/room-info',{
  method:'POST',
  body:JSON.stringify({room_id:state.room.id})
 });
 if(!r.ok){
  if(r.status===403||r.status===404)showBlocked();
  return;
 }
 const j=await r.json().catch(()=>({}));
 if(j.room?.status!=='active'){showBlocked();return}
 $('countOut').textContent=(j.approved_count||0)+' / '+(j.room?.max_participants||20);
 const m=j.membership;
 if(!m)return;
 state.membership=m;saveState();
 if(m.status==='approved'){clearInterval(statusTimer);showChat()}
 else if(m.status==='rejected'||m.status==='removed')showBlocked();
 else showWaiting();
}
async function hostApi(body){
 const r=await fetch(SB+'/functions/v1/host-members',{method:'POST',headers:headers(session.access_token),body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));
 if(!r.ok)throw new Error(j.error||'HOST');return j;
}
async function loadMembers(){
 if(state.mode!=='host')return;
 try{
  const j=await hostApi({action:'list',room_id:state.room.id});const members=j.members||[];
  const approved=members.filter(m=>m.status==='approved').length;$('countOut').textContent=approved+' / '+(j.room?.max_participants||20);
  const box=$('memberList');box.innerHTML='';
  for(const m of members.filter(m=>m.role==='member'&&(m.status==='pending'||m.status==='approved'))){
   const d=document.createElement('div');d.className='member';
   const badge=m.status==='pending'?t('pending'):t('approved');
   d.innerHTML='<div class="member-top"><strong>'+esc(m.display_name)+'</strong><span class="badge '+m.status+'">'+esc(badge)+'</span></div><div class="member-meta">'+esc(langName(m.language))+'</div><div class="member-actions"></div>';
   const a=d.querySelector('.member-actions');
   if(m.status==='pending'){
    const b1=document.createElement('button');b1.className='btn green';b1.textContent=t('approve');b1.onclick=()=>decision(m.id,'approved');
    const b2=document.createElement('button');b2.className='btn red';b2.textContent=t('reject');b2.onclick=()=>decision(m.id,'rejected');a.append(b1,b2);
   }else{
    const b=document.createElement('button');b.className='btn red';b.style.gridColumn='1/-1';b.textContent=t('remove');b.onclick=()=>decision(m.id,'removed');a.append(b);
   }
   box.appendChild(d);
  }
  if(!box.children.length)box.innerHTML='<div class="note" style="margin-top:10px">'+esc(t('noPending'))+'</div>';
  setStatus('memberStatus','');
 }catch{setStatus('memberStatus',t('decisionFail'))}
}
async function decision(id,decision){
 try{await hostApi({action:'decision',room_id:state.room.id,member_id:id,decision});await loadMembers()}
 catch{setStatus('memberStatus',t('decisionFail'))}
}
