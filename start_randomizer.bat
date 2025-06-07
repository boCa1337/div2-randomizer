@echo off
set "BAT_DIR=%~dp0"
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app="%BAT_DIR%index.html" --window-size=1300,760
exit