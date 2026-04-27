#define MyAppName      "Danza con Altura"
#define MyAppVersion   "1.0"
#define MyAppPublisher "Danza con Altura"
#define MyAppExe       "start.bat"
#define DistDir        "dist"

[Setup]
AppId={{A1B2C3D4-E5F6-7890-ABCD-EF1234567890}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\DanzaConAltura
DefaultGroupName={#MyAppName}
OutputDir=output
OutputBaseFilename=DanzaConAltura-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear acceso directo en el escritorio"; GroupDescription: "Accesos directos:"

[Files]
Source: "{#DistDir}\node\*";       DestDir: "{app}\node";       Flags: ignoreversion recursesubdirs
Source: "{#DistDir}\backend\*";    DestDir: "{app}\backend";    Flags: ignoreversion recursesubdirs
Source: "{#DistDir}\frontend\*";   DestDir: "{app}\frontend";   Flags: ignoreversion recursesubdirs
Source: "{#DistDir}\start.bat";    DestDir: "{app}";            Flags: ignoreversion
Source: "{#DistDir}\stop.bat";     DestDir: "{app}";            Flags: ignoreversion

[Icons]
Name: "{group}\{#MyAppName}";             Filename: "{app}\start.bat"; WorkingDir: "{app}"; Comment: "Iniciar sistema Danza con Altura"
Name: "{group}\Detener sistema";          Filename: "{app}\stop.bat";  WorkingDir: "{app}"; Comment: "Detener el sistema"
Name: "{group}\Desinstalar {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}";       Filename: "{app}\start.bat"; WorkingDir: "{app}"; Tasks: desktopicon

[Run]
Filename: "{app}\start.bat"; Description: "Iniciar {#MyAppName} ahora"; Flags: nowait postinstall skipifsilent shellexec

[UninstallRun]
Filename: "{app}\stop.bat"; Flags: runhidden
