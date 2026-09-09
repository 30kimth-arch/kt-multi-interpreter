(()=>{
  const installBtn=document.getElementById('installPwaBtn');
  const help=document.getElementById('pwaHelp');
  const helpTitle=document.getElementById('pwaHelpTitle');
  const helpText=document.getElementById('pwaHelpText');
  const closeBtn=document.getElementById('pwaHelpClose');
  let deferredPrompt=null;

  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  const isIOS=()=>/iphone|ipad|ipod/i.test(navigator.userAgent);

  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{}));
  }

  function showHelp(title,text){
    if(helpTitle) helpTitle.textContent=title;
    if(helpText) helpText.textContent=text;
    if(help) help.classList.remove('hidden');
  }

  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    deferredPrompt=e;
    if(installBtn && !isStandalone()) installBtn.classList.remove('hidden');
  });

  window.addEventListener('appinstalled',()=>{
    deferredPrompt=null;
    if(installBtn) installBtn.classList.add('hidden');
  });

  if(installBtn){
    if(isStandalone()) installBtn.classList.add('hidden');
    else installBtn.classList.remove('hidden');

    installBtn.addEventListener('click',async()=>{
      if(isStandalone()) return;
      if(deferredPrompt){
        deferredPrompt.prompt();
        await deferredPrompt.userChoice.catch(()=>{});
        deferredPrompt=null;
        return;
      }
      if(isIOS()){
        showHelp('홈 화면에 추가','Safari 하단의 공유 버튼(□↑)을 누른 뒤 “홈 화면에 추가”를 선택하세요. 추가 후 KT Multi Interpreter 아이콘으로 실행하면 앱 화면이 그대로 유지됩니다.');
      }else{
        showHelp('앱 설치 / 바탕화면 아이콘','Chrome 또는 Edge 주소창 오른쪽의 설치 아이콘을 선택하거나 브라우저 메뉴에서 “앱 설치”를 선택하세요. 설치 후 바탕화면 또는 시작 메뉴의 KT Multi Interpreter 아이콘으로 실행할 수 있습니다.');
      }
    });
  }

  if(closeBtn) closeBtn.addEventListener('click',()=>help?.classList.add('hidden'));
  if(help) help.addEventListener('click',e=>{if(e.target===help) help.classList.add('hidden');});

  // Keep same-origin navigation inside the PWA window. External links open separately without replacing the meeting screen.
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href]');
    if(!a) return;
    const url=new URL(a.href,location.href);
    if(url.origin===location.origin && url.pathname.startsWith('/kt-multi-interpreter/')){
      a.removeAttribute('target');
    }else if(/^https?:$/.test(url.protocol)){
      a.target='_blank';
      a.rel='noopener noreferrer';
    }
  });
})();
