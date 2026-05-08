# AttendClass - GitHub Deployment Script
Write-Host "Starting deployment to GitHub..."

# Initialize Git if not already
if (!(Test-Path .git)) {
    Write-Host "Initializing local repository..."
    git init
}

# Add Remote
Write-Host "Linking to GitHub repository..."
git remote remove origin
git remote add origin https://github.com/Ayomide-16/AttendClass.git

# Prepare files
Write-Host "Adding files..."
git add .

# Commit
Write-Host "Committing changes..."
git commit -m "Initial commit: AttendClass Full Stack Solution"

# Branching
git branch -M main

# Pushing (Force push to clear remote as requested)
Write-Host "Pushing to GitHub (Force push)..."
git push -u origin main --force

Write-Host "Deployment complete! Check: https://github.com/Ayomide-16/AttendClass"
