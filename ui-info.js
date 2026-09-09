(()=>{
  const VERSION='v2026.09.10';
  const BUILD_DATE='2026-09-10';
  const CREATOR='KIM TAE HUN';
  const TEXT={
    en:{guide:'Guide',title:'Connection & Usage Guide',close:'Close',creator:'Creator',version:'Version',date:'Build date',html:`<h3>1. Open the app</h3><p>Open the KT Multi Interpreter link in Chrome, Edge or Safari. The default interface language is English.</p><h3>2. Select language</h3><p>Choose English, 한국어, Tiếng Việt, 简体中文 or 日本語 from the language menu. The whole interface and received-message translation language change together.</p><h3>3. Sign in</h3><p>Enter your User ID / Employee No. and Name, then press Start.</p><h3>4. Create or join a meeting</h3><p>The host selects Create Room. Participants enter the 6-character room code and wait for host approval.</p><h3>5. Android</h3><p>Use Chrome for the most stable experience. If you opened the link from KakaoTalk, LINE, Naver or another in-app browser, use Open in Chrome / Open in browser when shown.</p><h3>6. iPhone / iPad</h3><p>Open the link in Safari. To add an icon, tap Share (□↑) → Add to Home Screen.</p><h3>7. PC</h3><p>Open the link in Chrome or Edge. Use Install / Add icon to create an app shortcut on the desktop or Start menu.</p>`},
    ko:{guide:'접속 설명서',title:'접속 및 사용 설명서',close:'닫기',creator:'프로그램 제작자',version:'버전',date:'제작일',html:`<h3>1. 앱 접속</h3><p>KT Multi Interpreter 링크를 Chrome, Edge 또는 Safari에서 엽니다. 최초 기본 화면 언어는 영어입니다.</p><h3>2. 언어 선택</h3><p>상단 언어 메뉴에서 English, 한국어, Tiếng Việt, 简体中文, 日本語 중 하나를 선택합니다. 화면 전체와 수신 메시지 번역 언어가 함께 변경됩니다.</p><h3>3. 로그인</h3><p>사용자 ID / 사번과 이름을 입력한 후 시작을 누릅니다.</p><h3>4. 회의방 만들기 / 참가</h3><p>방장은 회의방 생성을 선택합니다. 참가자는 6자리 방 코드를 입력하고 방장의 승인을 기다립니다.</p><h3>5. Android 접속</h3><p>Chrome 사용을 권장합니다. 카카오톡, LINE, 네이버 등 앱 내부에서 링크를 열었다면 표시되는 Chrome에서 열기 / 브라우저에서 열기를 선택하세요.</p><h3>6. iPhone / iPad</h3><p>Safari에서 링크를 엽니다. 아이콘 추가는 공유(□↑) → 홈 화면에 추가를 선택합니다.</p><h3>7. PC</h3><p>Chrome 또는 Edge에서 링크를 엽니다. 설치 / 아이콘 추가 기능으로 바탕화면 또는 시작 메뉴에 바로가기를 만들 수 있습니다.</p>`},
    vi:{guide:'Hướng dẫn',title:'Hướng dẫn truy cập và sử dụng',close:'Đóng',creator:'Người tạo chương trình',version:'Phiên bản',date:'Ngày tạo',html:`<h3>1. Mở ứng dụng</h3><p>Mở liên kết KT Multi Interpreter bằng Chrome, Edge hoặc Safari. Ngôn ngữ mặc định ban đầu là tiếng Anh.</p><h3>2. Chọn ngôn ngữ</h3><p>Chọn English, 한국어, Tiếng Việt, 简体中文 hoặc 日本語. Toàn bộ giao diện và ngôn ngữ dịch tin nhắn nhận sẽ thay đổi cùng lúc.</p><h3>3. Đăng nhập</h3><p>Nhập ID người dùng / mã nhân viên và tên, sau đó nhấn Bắt đầu.</p><h3>4. Tạo hoặc tham gia phòng họp</h3><p>Chủ phòng chọn Tạo phòng. Người tham gia nhập mã phòng 6 ký tự và chờ chủ phòng phê duyệt.</p><h3>5. Android</h3><p>Nên dùng Chrome. Nếu mở liên kết từ KakaoTalk, LINE, Naver hoặc trình duyệt trong ứng dụng khác, hãy chọn Mở bằng Chrome / Mở bằng trình duyệt.</p><h3>6. iPhone / iPad</h3><p>Mở bằng Safari. Để thêm biểu tượng, chọn Chia sẻ (□↑) → Thêm vào Màn hình chính.</p><h3>7. PC</h3><p>Mở bằng Chrome hoặc Edge. Dùng Install / Add icon để tạo lối tắt trên Desktop hoặc menu Start.</p>`},
    zh:{guide:'连接说明',title:'连接和使用说明',close:'关闭',creator:'程序制作者',version:'版本',date:'制作日期',html:`<h3>1. 打开应用</h3><p>使用 Chrome、Edge 或 Safari 打开 KT Multi Interpreter 链接。首次默认界面语言为英语。</p><h3>2. 选择语言</h3><p>从语言菜单选择 English、한국어、Tiếng Việt、简体中文 或 日本語。整个界面和接收消息的翻译语言会同时切换。</p><h3>3. 登录</h3><p>输入用户 ID / 员工编号和姓名，然后点击开始。</p><h3>4. 创建或加入会议室</h3><p>主持人选择创建会议室。参加者输入 6 位房间代码并等待主持人批准。</p><h3>5. Android</h3><p>建议使用 Chrome。如果从 KakaoTalk、LINE、Naver 等应用内浏览器打开链接，请选择“在 Chrome 中打开 / 在浏览器中打开”。</p><h3>6. iPhone / iPad</h3><p>使用 Safari 打开链接。添加图标：共享(□↑) → 添加到主屏幕。</p><h3>7. PC</h3><p>使用 Chrome 或 Edge 打开链接。通过 Install / Add icon 可在桌面或开始菜单创建快捷方式。</p>`},
    ja:{guide:'接続説明',title:'接続・使用説明書',close:'閉じる',creator:'プログラム制作者',version:'バージョン',date:'制作日',html:`<h3>1. アプリを開く</h3><p>KT Multi Interpreter のリンクを Chrome、Edge、Safari で開きます。初回の標準表示言語は英語です。</p><h3>2. 言語を選択</h3><p>English、한국어、Tiếng Việt、简体中文、日本語から選択します。画面全体と受信メッセージの翻訳言語が同時に切り替わります。</p><h3>3. ログイン</h3><p>ユーザーID / 社員番号と名前を入力し、開始を押します。</p><h3>4. 会議室の作成 / 参加</h3><p>ホストは会議室を作成します。参加者は6桁のルームコードを入力し、ホストの承認を待ちます。</p><h3>5. Android</h3><p>Chrome の使用を推奨します。KakaoTalk、LINE、Naver などのアプリ内ブラウザで開いた場合は「Chromeで開く / ブラウザで開く」を選択してください。</p><h3>6. iPhone / iPad</h3><p>Safari でリンクを開きます。アイコン追加は共有(□↑) → ホーム画面に追加を選択します。</p><h3>7. PC</h3><p>Chrome または Edge で開きます。Install / Add icon からデスクトップまたはスタートメニューにショートカットを作成できます。</p>`}
  };
  const $=id=>document.getElementById(id);
  let last='';
  function sync(){
    const lang=TEXT[$('uiLang')?.value]?$('uiLang').value:'en';
    if(lang===last && $('guideModal')?.classList.contains('hidden')) return;
    last=lang; const x=TEXT[lang];
    if($('guideBtn')) $('guideBtn').textContent=x.guide;
    if($('appCreatorLabel')) $('appCreatorLabel').textContent=x.creator;
    if($('appVersionLabel')) $('appVersionLabel').textContent=x.version;
    if($('appDateLabel')) $('appDateLabel').textContent=x.date;
    if($('appCreator')) $('appCreator').textContent=CREATOR;
    if($('appVersion')) $('appVersion').textContent=VERSION;
    if($('appDate')) $('appDate').textContent=BUILD_DATE;
    if($('guideTitle')) $('guideTitle').textContent=x.title;
    if($('guideContent')) $('guideContent').innerHTML=x.html;
    if($('guideClose')) $('guideClose').textContent=x.close;
  }
  document.addEventListener('DOMContentLoaded',()=>{
    sync();
    $('uiLang')?.addEventListener('change',()=>setTimeout(sync,0));
    $('guideBtn')?.addEventListener('click',()=>{sync();$('guideModal')?.classList.remove('hidden')});
    $('guideClose')?.addEventListener('click',()=>$('guideModal')?.classList.add('hidden'));
    $('guideModal')?.addEventListener('click',e=>{if(e.target===$('guideModal')) $('guideModal').classList.add('hidden')});
    setInterval(sync,600);
  });
})();
