@echo off
echo 🚀 VR Space Explorer - GitHub Pages Deployment Script
echo ==================================================

REM Check if git is initialized
if not exist ".git" (
    echo 📦 Initializing Git repository...
    git init
)

REM Add all files
echo 📁 Adding files to Git...
git add .

REM Commit changes
echo 💾 Committing changes...
set /p commit_message="Enter commit message (or press Enter for default): "
if "%commit_message%"=="" set commit_message=Update VR Space Explorer
git commit -m "%commit_message%"

REM Check for remote
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo 🔗 No remote repository found.
    echo Please create a GitHub repository and run:
    echo git remote add origin https://github.com/yourusername/vr-space-explorer.git
    echo Then run this script again.
    pause
    exit /b 1
)

REM Push to GitHub
echo 🌐 Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ✅ Deployment complete!
echo.
echo 📋 Next steps:
echo 1. Go to your GitHub repository
echo 2. Click on 'Settings' tab
echo 3. Scroll down to 'Pages' section
echo 4. Select 'Deploy from a branch'
echo 5. Choose 'main' branch
echo 6. Click 'Save'
echo.
echo 🌟 Your VR game will be available at:
echo https://yourusername.github.io/repositoryname
echo.
echo ⚡ Note: It may take a few minutes for GitHub Pages to build and deploy.
pause