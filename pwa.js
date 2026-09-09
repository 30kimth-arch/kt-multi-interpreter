(()=>{
  const installBtn=document.getElementById('installPwaBtn');
  const help=document.getElementById('pwaHelp');
  const helpTitle=document.getElementById('pwaHelpTitle');
  const helpText=document.getElementById('pwaHelpText');
  const closeBtn=document.getElementById('pwaHelpClose');
  let deferredPrompt=null;

  const ua=navigator.userAgent||'';
  const isStandalone=()=>window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;
  const isIOS=()=>/iphone|ipad|ipod/i.test(ua);
  const isAndroid=()=>/android/i.test(ua);
  const isAndroidInApp=()=>isAndroid() && /(KAKAOTALK|NAVER|LINE\/|FBAN|FBAV|Instagram|; wv\)|\bwv\b)/i.test(ua);

  function chromeIntentForCurrentPage(){
    const path=`${location.host}${location.pathname}${location.search}${location.hash}`;
    return `intent://${path}#Intent;scheme=https;package=com.android.chrome;end`;
  }

  function openExternalAndroidBrowser(){
    if(!isAndroid()) return false;
    try{
      location.href=chromeIntentForCurrentPage();
      return true;
    }catch(_){
      return false;
    }
  }

  function addExternalBrowserButton(){
    if(document.getElementById('externalBrowserBtn')) return;
    const bar=document.createElement('div');
    bar.id='externalBrowserBar';
    bar.style.cssText='position:fixed;left:10px;right:10px;top:10px;z-index:99999;background:#fff;border:1px solid #d1d5db;border-radius:14px;padding:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);display:flex;gap:10px;align-items:center;justify-content:space-between;font-family:system-ui,sans-serif';
    const msg=document.createElement('div');
    msg.textContent='카카오톡/앱 내부 화면입니다. 외부 브라우저에서 열면 더 안정적으로 사용할 수 있습니다.';
    msg.style.cssText='font-size:13px;line-height:1.35;color:#111827;flex:1';
    const btn=document.createElement('button');
    btn.id='externalBrowserBtn';
    btn.type='button';
    btn.textContent='Chrome에서 열기';
    btn.style.cssText='border:0;border-radius:10px;padding:10px 12px;background:#2563eb;color:#fff;font-weight:700;white-space:nowrap';
    btn.addEventListener('click',openExternalAndroidBrowser);
    bar.append(msg,btn);
    document.body.appendChild(bar);
  }

  // KakaoTalk, Naver, LINE, Facebook, Instagram and Android WebView:
  // try to hand the page off to Chrome instead of keeping it inside the messenger's in-app browser.
  if(isAndroidInApp() && !isStandalone()){
    window.addEventListener('DOMContentLoaded',()=>{
      addExternalBrowserButton();
      setTimeout(openExternalAndroidBrowser,350);
    },{once:true});
  }

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
        showHelp('홈 화면에 추가','Safari 하단의 공유 버튼(□↑)을 누른 뒤 “홈 화면에 추가”를 선택하세요.');
      }else{
        showHelp('앱 설치 / 바탕화면 아이콘','Chrome 또는 Edge 주소창 오른쪽의 설치 아이콘을 선택하거나 브라우저 메뉴에서 “앱 설치”를 선택하세요.');
      }
    });
  }

  if(closeBtn) closeBtn.addEventListener('click',()=>help?.classList.add('hidden'));
  if(help) help.addEventListener('click',e=>{if(e.target===help) help.classList.add('hidden');});

  // Links clicked from within KT Multi Interpreter open separately so the meeting screen stays open.
  document.addEventListener('click',e=>{
    const a=e.target.closest?.('a[href]');
    if(!a) return;
    const url=new URL(a.href,location.href);
    if(/^https?:$/.test(url.protocol)){
      e.preventDefault();
      window.open(url.href,'_blank','noopener,noreferrer');
    }
  });
})();
