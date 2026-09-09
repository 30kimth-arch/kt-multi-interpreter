let currentMinutes=null;

function minutesText(data){
 const m=data.minutes||{}, lines=[];
 lines.push(m.title||state?.room?.name||t('minutesTitle'));
 lines.push('');
 lines.push(`${t('room')}: ${data.room?.name||''}`);
 lines.push(`${t('code')}: ${data.room?.code||''}`);
 lines.push(`${t('participants')}: ${(data.participants||[]).join(', ')}`);
 lines.push(`Messages: ${data.message_count||0}`);
 lines.push(`Generated: ${new Date(data.generated_at||Date.now()).toLocaleString()}`);
 lines.push('');
 lines.push(`[${t('summary')}]`);
 lines.push(m.summary||t('none'));
 lines.push('');
 lines.push(`[${t('decisions')}]`);
 if((m.decisions||[]).length) m.decisions.forEach((x,i)=>lines.push(`${i+1}. ${x}`)); else lines.push(t('none'));
 lines.push('');
 lines.push(`[${t('actions')}]`);
 if((m.action_items||[]).length) m.action_items.forEach((x,i)=>{
   const meta=[x.owner,x.due].filter(Boolean).join(' / ');
   lines.push(`${i+1}. ${x.task}${meta?` (${meta})`:''}`);
 }); else lines.push(t('none'));
 lines.push('');
 lines.push(`[${t('unresolved')}]`);
 if((m.unresolved_items||[]).length) m.unresolved_items.forEach((x,i)=>lines.push(`${i+1}. ${x}`)); else lines.push(t('none'));
 return lines.join('\n');
}

function renderMinutes(data){
 currentMinutes=data;
 const m=data.minutes||{};
 $('minutesMeta').textContent=`${data.room?.name||''} · ${(data.participants||[]).join(', ')} · ${data.message_count||0} messages`;
 const list=(arr)=>arr?.length?'<ul>'+arr.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>':'<p>'+esc(t('none'))+'</p>';
 const actions=m.action_items?.length?'<ul>'+m.action_items.map(x=>{
   const meta=[x.owner,x.due].filter(Boolean).join(' / ');
   return '<li>'+esc(x.task)+(meta?' <span class="muted">('+esc(meta)+')</span>':'')+'</li>';
 }).join('')+'</ul>':'<p>'+esc(t('none'))+'</p>';
 $('minutesContent').innerHTML=
   '<div class="minutes-section"><h3>'+esc(t('summary'))+'</h3><p>'+esc(m.summary||t('none'))+'</p></div>'+ 
   '<div class="minutes-section"><h3>'+esc(t('decisions'))+'</h3>'+list(m.decisions)+'</div>'+ 
   '<div class="minutes-section"><h3>'+esc(t('actions'))+'</h3>'+actions+'</div>'+ 
   '<div class="minutes-section"><h3>'+esc(t('unresolved'))+'</h3>'+list(m.unresolved_items)+'</div>';
 $('minutesModal').classList.remove('hidden');
}

async function createMinutes(){
 if(state?.mode!=='host'||!state?.room)return;
 $('minutesBtn').disabled=true;
 const old=$('minutesBtn').textContent;
 $('minutesBtn').textContent=t('minutesWorking');
 setStatus('minutesStatus','',true);
 try{
   const r=await authFetch(SB+'/functions/v1/generate-meeting-minutes',{
     method:'POST',
     body:JSON.stringify({room_id:state.room.id,output_lang:profile.language})
   });
   const j=await r.json().catch(()=>({}));
   if(!r.ok) throw new Error(j.error||String(r.status));
   renderMinutes(j);
 }catch(e){
   setStatus('minutesStatus',t('minutesFail'));
 }finally{
   $('minutesBtn').disabled=false;
   $('minutesBtn').textContent=old;
 }
}

function saveMinutesTxt(){
 if(!currentMinutes)return;
 const blob=new Blob(['\ufeff'+minutesText(currentMinutes)],{type:'text/plain;charset=utf-8'});
 const a=document.createElement('a');
 a.href=URL.createObjectURL(blob);
 a.download=((currentMinutes.room?.name||'meeting').replace(/[\\/:*?"<>|]+/g,'_'))+'_minutes.txt';
 document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1500);
}

function saveMinutesPdf(){
 if(!currentMinutes)return;
 const body=minutesText(currentMinutes).split('\n').map(line=>'<div>'+esc(line||' ')+'</div>').join('');
 const w=window.open('','_blank');
 if(!w){alert('Please allow pop-ups for PDF saving.');return}
 w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(currentMinutes.minutes?.title||'Meeting Minutes')}</title>
 <style>@page{size:A4;margin:16mm}body{font-family:Arial,"Malgun Gothic","Noto Sans KR",sans-serif;color:#111;font-size:12pt;line-height:1.55}div{white-space:pre-wrap;margin:2px 0}div:first-child{font-size:20pt;font-weight:700;margin-bottom:12px}</style>
 </head><body>${body}<script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
 w.document.close();
}

function stopTimers(){clearInterval(msgTimer);clearInterval(memberTimer);clearInterval(statusTimer);msgTimer=memberTimer=statusTimer=null}
async function logout(){
 stopTimers();
 try{if(session&&state?.room){await fetch(SB+'/functions/v1/leave-room',{method:'POST',headers:headers(session.access_token),body:JSON.stringify({room_id:state.room.id})}).catch(()=>{})}}catch{}
 try{if(session){await authFetch(SB+'/rest/v1/profiles?user_id=eq.'+encodeURIComponent(session.user_id),{method:'DELETE'}).catch(()=>{});await fetch(SB+'/auth/v1/logout',{method:'POST',headers:headers(session.access_token,false)}).catch(()=>{})}}catch{}
 clearLocal();location.reload();
}
async function restore(){
 session=loadJSON(KSESSION);state=loadJSON(KSTATE);if(!session)return;
 let r=await fetch(SB+'/auth/v1/user',{headers:headers(session.access_token,false)});
 if(!r.ok){const n=await refreshAuth();if(!n){clearLocal();return}}
 profile=await readProfile();if(!profile){clearLocal();return}
 applyLang(profile.language);$('logoutBtn').classList.remove('hidden');$('uiLang').disabled=true;
 if(state?.mode&&state?.room)enterRoom();else showLobby();
}

$('uiLang').addEventListener('change',e=>applyLang(e.target.value));
$('roomCodeInput').addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));
$('startBtn').onclick=login;$('createBtn').onclick=createRoom;$('joinBtn').onclick=joinRoom;$('refreshMembersBtn').onclick=loadMembers;$('sendBtn').onclick=sendMessage;$('logoutBtn').onclick=logout;
$('messageInput').addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}});

$('minutesBtn').onclick=createMinutes;
$('minutesCloseBtn').onclick=()=>{$('minutesModal').classList.add('hidden')};
$('minutesModal').addEventListener('click',e=>{if(e.target===$('minutesModal'))$('minutesModal').classList.add('hidden')});
$('saveTxtBtn').onclick=saveMinutesTxt;
$('savePdfBtn').onclick=saveMinutesPdf;

function syncMobileViewport(){
 const vv=window.visualViewport;
 if(!vv)return;
 document.documentElement.style.setProperty('--kt-vh',vv.height+'px');
 if(!$('roomView').classList.contains('hidden')){
   const input=$('messageInput');
   if(document.activeElement===input){
     setTimeout(()=>input.scrollIntoView({block:'nearest',behavior:'smooth'}),40);
     setTimeout(()=>$('chat').scrollTop=$('chat').scrollHeight,80);
   }
 }
}
if(window.visualViewport){
 visualViewport.addEventListener('resize',syncMobileViewport);
 visualViewport.addEventListener('scroll',syncMobileViewport);
}
$('messageInput').addEventListener('focus',syncMobileViewport);
window.addEventListener('orientationchange',()=>setTimeout(syncMobileViewport,250));
syncMobileViewport();

history.replaceState({ktApp:true},'',location.href);
history.pushState({ktApp:true},'',location.href);
window.addEventListener('popstate',()=>{
 history.pushState({ktApp:true},'',location.href);
});

async function resumeFromBackground(){
 if(document.visibilityState!=='visible'||!session)return;
 if(state?.mode==='host'){
  await loadMembers().catch(()=>{});
  await loadMessages().catch(()=>{});
 }else if(state?.mode==='member'){
  await checkMemberStatus().catch(()=>{});
  await loadMessages().catch(()=>{});
 }
}
document.addEventListener('visibilitychange',resumeFromBackground);
window.addEventListener('pageshow',resumeFromBackground);
window.addEventListener('focus',resumeFromBackground);

window.addEventListener('online',()=>{
 if($('connectionText')) $('connectionText').textContent=t('connected');
 resumeFromBackground();
});
window.addEventListener('offline',()=>{
 if($('connectionText')) $('connectionText').textContent='Offline';
});

applyLang('en');restore();
