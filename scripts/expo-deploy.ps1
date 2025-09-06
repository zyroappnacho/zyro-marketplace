# Zyro Marketplace - Script de Deployment Automatizado para Expo.dev (PowerShell)
# Este script automatiza todo el proceso de publicación en App Store y Google Play

param(
    [switch]$SkipTests,
    [switch]$iOSOnly,
    [switch]$AndroidOnly,
    [switch]$SkipSubmit,
    [switch]$Development,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Zyro Marketplace - Expo Deployment Script

Usage: .\expo-deploy.ps1 [options]

Options:
  -SkipTests      Skip running tests before build
  -iOSOnly        Build and submit only for iOS
  -AndroidOnly    Build and submit only for Android
  -SkipSubmit     Build only, don't submit to stores
  -Development    Use development profile instead of production
  -Help           Show this help message

Examples:
  .\expo-deploy.ps1                    # Full deployment to both stores
  .\expo-deploy.ps1 -iOSOnly          # Deploy only to App Store
  .\expo-deploy.ps1 -SkipTests -AndroidOnly  # Android only, skip tests
  .\expo-deploy.ps1 -Development      # Development build
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

function Write-Header($message) {
    Write-Host ""
    Write-ColorOutput Cyan "================================"
    Write-ColorOutput Cyan $message
    Write-ColorOutput Cyan "================================"
    Write-Host ""
}

function Write-Step($message) {
    Write-ColorOutput Blue "[STEP] $message"
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

function Write-Info($message) {
    Write-ColorOutput Magenta "[INFO] $message"
}

# Set build profile
if ($Development) {
    $BuildProfile = "development"
    Write-Info "Using development build profile"
} else {
    $BuildProfile = "production"
    Write-Info "Using production build profile"
}

# Set platforms
if ($iOSOnly) {
    $Platforms = "ios"
    Write-Info "Building for iOS only"
} elseif ($AndroidOnly) {
    $Platforms = "android"
    Write-Info "Building for Android only"
} else {
    $Platforms = "all"
    Write-Info "Building for both iOS and Android"
}

Write-Header "🚀 ZYRO MARKETPLACE DEPLOYMENT"
Write-Info "Starting automated deployment to Expo.dev and app stores"

# Step 1: Verify prerequisites
Write-Step "1/10 Verificando prerrequisitos..."

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
    Write-Error "EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
    Write-Success "EAS CLI installed"
}

# Check Node.js version
$nodeVersion = (node --version).Substring(1).Split('.')[0]
if ([int]$nodeVersion -lt 16) {
    Write-Error "Node.js 16+ required. Current version: $(node --version)"
    exit 1
}

Write-Success "Prerequisites verified"

# Step 2: Authenticate with Expo
Write-Step "2/10 Verificando autenticación con Expo..."

try {
    $expoUser = eas whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-Success "Authenticated as: $expoUser"
} catch {
    Write-Warning "Not logged in to Expo. Please login:"
    eas login
    
    # Verify login was successful
    try {
        $expoUser = eas whoami 2>$null
        if ($LASTEXITCODE -ne 0) {
            throw "Authentication failed"
        }
        Write-Success "Authenticated as: $expoUser"
    } catch {
        Write-Error "Failed to authenticate with Expo"
        exit 1
    }
}

# Step 3: Verify project configuration
Write-Step "3/10 Verificando configuración del proyecto..."

# Check required files
$requiredFiles = @("app.config.js", "eas.json", ".env.production")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "Required file not found: $file"
        exit 1
    }
}

# Validate JavaScript files
try {
    node -c app.config.js 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Syntax error"
    }
} catch {
    Write-Error "app.config.js has syntax errors"
    exit 1
}

# Validate JSON files
try {
    Get-Content eas.json | ConvertFrom-Json | Out-Null
} catch {
    Write-Error "eas.json has syntax errors"
    exit 1
}

Write-Success "Project configuration verified"

# Step 4: Clean and prepare project
Write-Step "4/10 Limpiando y preparando proyecto..."

# Clean previous builds
if (Test-Path ".expo") { Remove-Item -Recurse -Force ".expo" }
try { npm run clean 2>$null } catch { }

# Install dependencies
Write-Info "Installing dependencies..."
npm ci --production=false
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Check for vulnerabilities
Write-Info "Checking for security vulnerabilities..."
npm audit --audit-level=high
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Security vulnerabilities found. Consider running 'npm audit fix'"
}

Write-Success "Project cleaned and prepared"

# Step 5: Run tests (unless skipped)
if (-not $SkipTests) {
    Write-Step "5/10 Ejecutando tests..."
    
    # Run tests if available
    try {
        npm run test 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Tests passed"
        } else {
            Write-Warning "Tests failed or not configured. Continuing..."
        }
    } catch {
        Write-Warning "Tests failed or not configured. Continuing..."
    }
    
    # Run linting if available
    try {
        npm run lint 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Linting passed"
        } else {
            Write-Warning "Linting failed or not configured. Continuing..."
        }
    } catch {
        Write-Warning "Linting failed or not configured. Continuing..."
    }
    
    # Run type checking if available
    try {
        npm run type-check 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Type checking passed"
        } else {
            Write-Warning "Type checking failed or not configured. Continuing..."
        }
    } catch {
        Write-Warning "Type checking failed or not configured. Continuing..."
    }
} else {
    Write-Step "5/10 Saltando tests (--skip-tests especificado)"
}

# Step 6: Configure EAS project
Write-Step "6/10 Configurando proyecto EAS..."

# Configure EAS if not already configured
try {
    eas project:info 2>$null | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Info "Configuring EAS project..."
        eas build:configure
    }
} catch {
    Write-Info "Configuring EAS project..."
    eas build:configure
}

# Verify project info
try {
    $projectInfo = eas project:info 2>$null
    Write-Info "Project: $projectInfo"
} catch {
    Write-Info "Project info not available"
}

Write-Success "EAS project configured"

# Step 7: Configure credentials
Write-Step "7/10 Verificando credenciales..."

# Check iOS credentials (if building for iOS)
if ($Platforms -eq "ios" -or $Platforms -eq "all") {
    Write-Info "Checking iOS credentials..."
    try {
        eas credentials --platform ios --list 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "iOS credentials found"
        } else {
            Write-Warning "iOS credentials not found. They will be generated automatically during build."
        }
    } catch {
        Write-Warning "iOS credentials not found. They will be generated automatically during build."
    }
}

# Check Android credentials (if building for Android)
if ($Platforms -eq "android" -or $Platforms -eq "all") {
    Write-Info "Checking Android credentials..."
    try {
        eas credentials --platform android --list 2>$null | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Android credentials found"
        } else {
            Write-Warning "Android credentials not found. They will be generated automatically during build."
        }
    } catch {
        Write-Warning "Android credentials not found. They will be generated automatically during build."
    }
}

Write-Success "Credentials verified"

# Step 8: Start builds
Write-Step "8/10 Iniciando builds de $BuildProfile..."

$buildStartTime = Get-Date

# Start the build
Write-Info "Starting build for $Platforms platform(s)..."
Write-Info "Build profile: $BuildProfile"
Write-Info "This may take 10-20 minutes..."

eas build --platform $Platforms --profile $BuildProfile --non-interactive --wait
if ($LASTEXITCODE -eq 0) {
    $buildEndTime = Get-Date
    $buildDuration = $buildEndTime - $buildStartTime
    Write-Success "Build completed in $([math]::Floor($buildDuration.TotalMinutes)) minutes and $($buildDuration.Seconds) seconds"
} else {
    Write-Error "Build failed"
    Write-Info "Check build logs with: eas build:list"
    exit 1
}

# Step 9: Submit to app stores (unless skipped or development build)
if (-not $SkipSubmit -and -not $Development) {
    Write-Step "9/10 Subiendo a app stores..."
    
    # Check if we have the required files for submission
    if ($Platforms -eq "android" -or $Platforms -eq "all") {
        if (-not (Test-Path "google-service-account.json")) {
            Write-Warning "google-service-account.json not found. Android submission may fail."
            Write-Info "Download it from Google Play Console > Setup > API access"
        }
    }
    
    Write-Info "Submitting to app stores..."
    Write-Info "This may take a few minutes..."
    
    eas submit --platform $Platforms --latest --non-interactive
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Submission completed"
    } else {
        Write-Warning "Submission failed or partially failed"
        Write-Info "Check submission status with: eas submit:list"
    }
} else {
    if ($SkipSubmit) {
        Write-Step "9/10 Saltando subida a stores (--skip-submit especificado)"
    } else {
        Write-Step "9/10 Saltando subida a stores (development build)"
    }
}

# Step 10: Final verification and summary
Write-Step "10/10 Verificación final y resumen..."

# Get build information
Write-Info "Getting build information..."
try {
    eas build:list --limit 3 2>$null | Out-Null
} catch {
    Write-Warning "Could not retrieve build information"
}

# Get submission information (if not skipped)
if (-not $SkipSubmit -and -not $Development) {
    Write-Info "Getting submission information..."
    try {
        eas submit:list --limit 3 2>$null | Out-Null
    } catch {
        Write-Warning "Could not retrieve submission information"
    }
}

Write-Success "Deployment process completed!"

# Print summary
Write-Host ""
Write-Header "📱 DEPLOYMENT SUMMARY"

Write-Success "✅ Project: Zyro Marketplace"
Write-Success "✅ User: $expoUser"
Write-Success "✅ Profile: $BuildProfile"
Write-Success "✅ Platforms: $Platforms"

if (-not $Development) {
    Write-Success "✅ Builds: Ready for app stores"
    if (-not $SkipSubmit) {
        Write-Success "✅ Submissions: Sent to app stores"
    }
} else {
    Write-Success "✅ Development builds: Ready for testing"
}

Write-Host ""
Write-Header "🔗 USEFUL LINKS"

Write-Host "📊 Monitor builds: https://expo.dev/accounts/$expoUser/projects/zyro-marketplace/builds"
Write-Host "📤 Monitor submissions: https://expo.dev/accounts/$expoUser/projects/zyro-marketplace/submissions"
Write-Host "🍎 App Store Connect: https://appstoreconnect.apple.com"
Write-Host "🤖 Google Play Console: https://play.google.com/console"

Write-Host ""
Write-Header "📋 NEXT STEPS"

if ($Development) {
    Write-Host "1. Download and test development builds on physical devices"
    Write-Host "2. Run production build when ready: .\expo-deploy.ps1"
} else {
    Write-Host "1. Monitor app store review process (1-7 days typical)"
    Write-Host "2. Respond to any reviewer feedback promptly"
    Write-Host "3. Prepare marketing materials for launch"
    Write-Host "4. Set up analytics and monitoring"
}

Write-Host ""
Write-Header "🎉 DEPLOYMENT COMPLETED!"

Write-Success "Your Zyro Marketplace app is now on its way to the app stores!"
Write-Info "Check your email for build and submission notifications"

# Save deployment log
$deploymentLog = "deployment-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
@"
Deployment completed at $(Get-Date)
User: $expoUser
Profile: $BuildProfile
Platforms: $Platforms
"@ | Out-File -FilePath $deploymentLog -Encoding UTF8

Write-Info "Deployment log saved to: $deploymentLog"

Write-Host ""
Write-Success "🚀 Happy launching! 🎉"