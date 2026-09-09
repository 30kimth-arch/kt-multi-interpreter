async function loadMessages(){
 if(!state?.room||loadingMessages)return;loadingMessages=true;
 try{
  const r=await authFetch(SB+'/rest/v1/messages?room_id=eq.'+encodeURIComponent(state.room.id)+'&id=gt.'+lastId+'&order=id.asc&select=id,user_id,speaker_name,source_lang,original_text,translations,created_at',{method:'GET'});
  if(!r.ok)return;const rows=await r.json();
  for(const m of rows){
   const mid=Number(m.id);lastId=Math.max(lastId,mid);if(rendered.has(mid))continue;rendered.add(mid);
   const mine=m.user_id===session.user_id,target=profile.language;
   const translated=!mine&&m.source_lang!==target&&m.translations&&typeof m.translations[target]==='string'?m.translations[target]:'';
   const main=translated||m.original_text;const original=translated?'<div class="original">'+esc(t('original'))+': '+esc(m.original_text)+'</div>':'';
   const d=document.createElement('div');d.className='msg '+(mine?'mine':'');
   d.innerHTML='<div class="bubble"><div class="speaker">'+esc(m.speaker_name)+'</div><div>'+esc(main)+'</div>'+original+'<div class="time">'+new Date(m.created_at).toLocaleTimeString()+'</div></div>';
   $('chat').appendChild(d);
  }
  if(rows.length)$('chat').scrollTop=$('chat').scrollHeight;
 }finally{loadingMessages=false}
}
async function sendMessage(){
 const text=$('messageInput').value.trim();if(!text||!state?.room)return;
 $('sendBtn').disabled=true;const old=$('sendBtn').textContent;$('sendBtn').textContent=t('translate');
 try{
  const r=await authFetch(SB+'/functions/v1/translate-chat-message',{method:'POST',body:JSON.stringify({room_id:state.room.id,text})});
  const j=await r.json().catch(()=>({}));if(!r.ok){alert('Translation failed: '+(j.error||r.status));return}
  $('messageInput').value='';await loadMessages();
 }finally{$('sendBtn').disabled=false;$('sendBtn').textContent=old}
}
