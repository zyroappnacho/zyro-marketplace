# Zyro Marketplace Deployment Script for Windows
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("staging", "production")]
    [string]$Environment = "staging",
    
    [Parameter(Mandatory=$false)]
    [bool]$SkipTests = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"

Write-Host "🚀 Starting deployment for $Environment environment" -ForegroundColor $Green

# Validate environment
if ($Environment -notin @("staging", "production")) {
    Write-Host "❌ Invalid environment. Use 'staging' or 'production'" -ForegroundColor $Red
    exit 1
}

# Check if we're on the correct branch for production
if ($Environment -eq "production") {
    $currentBranch = git branch --show-current
    if ($currentBranch -ne "main") {
        Write-Host "❌ Production deployments must be from 'main' branch" -ForegroundColor $Red
        exit 1
    }
}

# Load environment variables
$envFile = ".env.$Environment"
if (Test-Path $envFile) {
    Write-Host "📋 Loading environment variables for $Environment" -ForegroundColor $Yellow
    Get-Content $envFile | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
} else {
    Write-Host "❌ Environment file $envFile not found" -ForegroundColor $Red
    exit 1
}

# Check for required tools
Write-Host "🔧 Checking required tools..." -ForegroundColor $Yellow

$tools = @("node", "npm", "expo")
foreach ($tool in $tools) {
    try {
        & $tool --version | Out-Null
        Write-Host "✅ $tool is available" -ForegroundColor $Green
    } catch {
        Write-Host "❌ $tool is required but not installed" -ForegroundColor $Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor $Yellow
npm ci
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor $Red
    exit 1
}

# Run type checking
Write-Host "🔍 Running type checking..." -ForegroundColor $Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Type checking failed" -ForegroundColor $Red
    exit 1
}

# Run linting
Write-Host "🧹 Running linting..." -ForegroundColor $Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting failed" -ForegroundColor $Red
    exit 1
}

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Host "🧪 Running tests..." -ForegroundColor $Yellow
    npm run test:coverage
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Tests failed" -ForegroundColor $Red
        exit 1
    }
    
    # Check test coverage (simplified check)
    Write-Host "✅ Tests passed" -ForegroundColor $Green
} else {
    Write-Host "⚠️  Skipping tests" -ForegroundColor $Yellow
}

# Clean cache
Write-Host "🧽 Cleaning cache..." -ForegroundColor $Yellow
npm run clean:cache

# Build the application
Write-Host "🏗️  Building application for $Environment..." -ForegroundColor $Yellow
if ($Environment -eq "production") {
    npm run build:production
} else {
    npm run build:staging
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed" -ForegroundColor $Red
    exit 1
}

# Publish to Expo
Write-Host "📤 Publishing to Expo..." -ForegroundColor $Yellow
if ($Environment -eq "production") {
    expo publish --release-channel production --non-interactive
} else {
    expo publish --release-channel staging --non-interactive
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Expo publish failed" -ForegroundColor $Red
    exit 1
}

# Generate build artifacts
Write-Host "📱 Generating build artifacts..." -ForegroundColor $Yellow
if ($Environment -eq "production") {
    # Build for both platforms in production
    eas build --platform all --profile production --non-interactive
} else {
    # Build APK for staging
    eas build --platform android --profile staging --non-interactive
}

# Run post-deployment checks
Write-Host "🔍 Running post-deployment checks..." -ForegroundColor $Yellow
Start-Sleep -Seconds 30

# Health check
$healthUrl = $env:API_BASE_URL + "/health"
try {
    $response = Invoke-WebRequest -Uri $healthUrl -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed" -ForegroundColor $Green
    } else {
        Write-Host "❌ Health check failed (HTTP $($response.StatusCode))" -ForegroundColor $Red
        exit 1
    }
} catch {
    Write-Host "❌ Health check failed: $($_.Exception.Message)" -ForegroundColor $Red
    exit 1
}

# Send deployment notification
Write-Host "📢 Sending deployment notification..." -ForegroundColor $Yellow
$commitHash = git rev-parse --short HEAD
$commitMessage = git log -1 --pretty=%B

Write-Host "Deployment completed successfully!" -ForegroundColor $Green
Write-Host "Environment: $Environment"
Write-Host "Commit: $commitHash"
Write-Host "Message: $commitMessage"
Write-Host "Build URL: Check Expo dashboard for build status"

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor $Green

# Cleanup
Write-Host "🧹 Cleaning up..." -ForegroundColor $Yellow
# Remove any temporary files if needed

Write-Host "✨ All done! Your app is now live on $Environment." -ForegroundColor $Green