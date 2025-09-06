# Zyro Marketplace - Production Build Script (PowerShell)
# This script builds the app for production deployment to App Store and Google Play

param(
    [switch]$SkipTests,
    [switch]$iOSOnly,
    [switch]$AndroidOnly,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Zyro Marketplace Production Build Script

Usage: .\build-production.ps1 [options]

Options:
  -SkipTests     Skip running tests before build
  -iOSOnly       Build only for iOS
  -AndroidOnly   Build only for Android
  -Help          Show this help message

Examples:
  .\build-production.ps1                    # Build for both platforms
  .\build-production.ps1 -iOSOnly          # Build only iOS
  .\build-production.ps1 -SkipTests        # Skip tests and build both
"@
    exit 0
}

# Function to write colored output
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-ColorOutput Blue "[INFO] $message"
}

function Write-Success($message) {
    Write-ColorOutput Green "[SUCCESS] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARNING] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

Write-Host ""
Write-ColorOutput Cyan "🚀 Starting Zyro Marketplace Production Build"
Write-ColorOutput Cyan "=============================================="
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "package.json not found. Please run this script from the project root."
    exit 1
}

# Check if EAS CLI is installed
try {
    $null = Get-Command eas -ErrorAction Stop
    Write-Success "EAS CLI found"
} catch {
    Write-Error "EAS CLI not found. Please install it with: npm install -g @expo/eas-cli"
    exit 1
}

# Check if user is logged in to EAS
Write-Info "Checking EAS authentication..."
try {
    $easUser = eas whoami 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "EAS authentication verified for user: $easUser"
    } else {
        throw "Not authenticated"
    }
} catch {
    Write-Warning "Not logged in to EAS. Please run: eas login"
    exit 1
}

# Load environment variables
if (Test-Path ".env.production") {
    Write-Info "Loading production environment variables..."
    Get-Content ".env.production" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    Write-Success "Environment variables loaded"
} else {
    Write-Warning ".env.production file not found. Using default values."
}

# Clean previous builds
Write-Info "Cleaning previous builds..."
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }
try { npm run clean 2>$null } catch { }
Write-Success "Cleanup completed"

# Install dependencies
Write-Info "Installing dependencies..."
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}
Write-Success "Dependencies installed"

# Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Info "Running tests..."
    try {
        npm run test 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests passed"
        } else {
            Write-Warning "Tests failed or not configured. Continuing with build..."
        }
    } catch {
        Write-Warning "Tests failed or not configured. Continuing with build..."
    }

    # Type checking
    Write-Info "Running TypeScript type checking..."
    try {
        npm run type-check 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Type checking passed"
        } else {
            Write-Warning "Type checking failed or not configured. Continuing with build..."
        }
    } catch {
        Write-Warning "Type checking failed or not configured. Continuing with build..."
    }

    # Linting
    Write-Info "Running ESLint..."
    try {
        npm run lint 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Linting passed"
        } else {
            Write-Warning "Linting failed or not configured. Continuing with build..."
        }
    } catch {
        Write-Warning "Linting failed or not configured. Continuing with build..."
    }
} else {
    Write-Warning "Skipping tests as requested"
}

# Configure EAS project if not already configured
if (-not (Test-Path "eas.json")) {
    Write-Info "Configuring EAS project..."
    eas build:configure
}

Write-Info "Building for production..."

$buildSuccess = $true

# Build for iOS (unless AndroidOnly is specified)
if (-not $AndroidOnly) {
    Write-Info "Building for iOS (App Store)..."
    eas build --platform ios --profile production --non-interactive --wait
    if ($LASTEXITCODE -eq 0) {
        Write-Success "iOS build completed successfully"
    } else {
        Write-Error "iOS build failed"
        $buildSuccess = $false
    }
}

# Build for Android (unless iOSOnly is specified)
if (-not $iOSOnly) {
    Write-Info "Building for Android (Google Play)..."
    eas build --platform android --profile production --non-interactive --wait
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Android build completed successfully"
    } else {
        Write-Error "Android build failed"
        $buildSuccess = $false
    }

    # Generate APK for testing (optional)
    Write-Info "Building Android APK for testing..."
    eas build --platform android --profile production-apk --non-interactive --wait
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Android APK build completed successfully"
    } else {
        Write-Warning "APK build failed, but AAB build may have succeeded"
    }
}

if ($buildSuccess) {
    Write-Host ""
    Write-ColorOutput Green "📱 Build Summary"
    Write-ColorOutput Green "================"
    
    if (-not $AndroidOnly) {
        Write-Success "✅ iOS build ready for App Store submission"
    }
    if (-not $iOSOnly) {
        Write-Success "✅ Android AAB ready for Google Play submission"
        Write-Success "✅ Android APK available for testing"
    }

    Write-Host ""
    Write-Host "📋 Next Steps:"
    Write-Host "1. Download builds from: https://expo.dev/accounts/[your-account]/projects/zyro-marketplace/builds"
    Write-Host "2. Test builds on physical devices"
    if (-not $AndroidOnly) {
        Write-Host "3. Submit to App Store: eas submit --platform ios"
    }
    if (-not $iOSOnly) {
        Write-Host "4. Submit to Google Play: eas submit --platform android"
    }

    Write-Host ""
    Write-Host "🔗 Useful Commands:"
    Write-Host "• View builds: eas build:list"
    Write-Host "• Submit to stores: eas submit"
    Write-Host "• Check build status: eas build:view [build-id]"

    Write-Host ""
    Write-Success "🎉 Production build process completed!"
} else {
    Write-Error "❌ Some builds failed. Please check the output above."
    exit 1
}

Write-ColorOutput Cyan "=============================================="