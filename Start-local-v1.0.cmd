@echo off
setlocal
where pythonw >nul 2>&1
if errorlevel 1 goto console_python
start "" pythonw "%~dp0tools\serve_local.py" --open
exit /b
:console_python
start "Heart local-v1.0" /min python "%~dp0tools\serve_local.py" --open
