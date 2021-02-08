@echo off
IF "%1"=="" GOTO End
@echo on
dir /s /a:d *.svn* /b > excludedirs.txt
echo excludedirs.txt >> excludedirs.txt
echo deploy.bat >> excludedirs.txt
echo RSAKeyGenerator.zip >> excludedirs.txt
xcopy . C:\bbq\ /EXCLUDE:excludedirs.txt /s /y /d
cf push %1 --path C:\bbq\
:End