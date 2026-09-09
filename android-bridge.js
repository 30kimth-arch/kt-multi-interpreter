(function(){
  if(!window.KTAndroid) return;

  function safeName(name){
    return (name||'meeting').replace(/[\\/:*?"<>|]+/g,'_');
  }

  const txtBtn=document.getElementById('saveTxtBtn');
  if(txtBtn){
    txtBtn.onclick=function(){
      if(!window.currentMinutes) return;
      const name=safeName(currentMinutes.room?.name||'meeting')+'_minutes.txt';
      KTAndroid.saveText(name,'\ufeff'+minutesText(currentMinutes));
    };
  }

  const pdfBtn=document.getElementById('savePdfBtn');
  if(pdfBtn){
    pdfBtn.onclick=function(){
      if(!window.currentMinutes) return;
      const title=currentMinutes.minutes?.title||currentMinutes.room?.name||'Meeting Minutes';
      KTAndroid.printText(title,minutesText(currentMinutes));
    };
  }
})();
