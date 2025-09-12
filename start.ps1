# Start Development Server Script
# This script installs dependencies and starts the development server

Write-Host "🚀 بدء تشغيل مشروع بروفايل..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Yellow

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Make sure you're in the correct directory." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Start development server
Write-Host "🖥️  Starting development server..." -ForegroundColor Blue
Write-Host "📱 The website will open at: http://localhost:3000" -ForegroundColor Magenta
Write-Host "🛑 Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

npm run dev
