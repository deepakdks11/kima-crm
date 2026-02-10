@echo off
set GIT_TERMINAL_PROMPT=0
echo Check git status...
git status
echo.
echo Staging all changes...
git add .
echo.
echo Committing changes...
git commit -m "Update"
echo.
echo Pushing to remote...
git push
echo.
if errorlevel 1 (
    echo.
    echo Push failed. You might need to authenticate manually.
    echo Try running: git push
)
pause
