[Setup]
AppId={{6C88E58A-9942-4BEF-9E04-7A5590C16A41}
AppName=KT Multi Interpreter
AppVersion=1.0.0
AppPublisher=KT Multi Interpreter
DefaultDirName={localappdata}\Programs\KT Multi Interpreter
DefaultGroupName=KT Multi Interpreter
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
OutputDir=dist
OutputBaseFilename=KT_Multi_Interpreter_Windows_Setup_v1
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
UninstallDisplayName=KT Multi Interpreter
CloseApplications=yes

[Files]
Source: "publish\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\KT Multi Interpreter"; Filename: "{app}\KTMultiInterpreter.exe"
Name: "{autodesktop}\KT Multi Interpreter"; Filename: "{app}\KTMultiInterpreter.exe"; Tasks: desktopicon

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked

[Run]
Filename: "{app}\KTMultiInterpreter.exe"; Description: "Launch KT Multi Interpreter"; Flags: nowait postinstall skipifsilent
