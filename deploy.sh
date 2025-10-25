#!/bin/bash

echo "🚀 VR Space Explorer - GitHub Pages Deployment Script"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
read -p "Enter commit message (or press Enter for default): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Update VR Space Explorer"
fi
git commit -m "$commit_message"

# Check for remote
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 No remote repository found."
    echo "Please create a GitHub repository and run:"
    echo "git remote add origin https://github.com/yourusername/vr-space-explorer.git"
    echo "Then run this script again."
    exit 1
fi

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to your GitHub repository"
echo "2. Click on 'Settings' tab"
echo "3. Scroll down to 'Pages' section"
echo "4. Select 'Deploy from a branch'"
echo "5. Choose 'main' branch"
echo "6. Click 'Save'"
echo ""
echo "🌟 Your VR game will be available at:"
echo "https://yourusername.github.io/repositoryname"
echo ""
echo "⚡ Note: It may take a few minutes for GitHub Pages to build and deploy."