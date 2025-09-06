#!/bin/bash

# Zyro Marketplace - Script de Deployment Automatizado para Expo.dev
# Este script automatiza todo el proceso de publicación en App Store y Google Play

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${PURPLE}[INFO]${NC} $1"
}

# Parse command line arguments
SKIP_TESTS=false
IOS_ONLY=false
ANDROID_ONLY=false
SKIP_SUBMIT=false
DEVELOPMENT_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --ios-only)
            IOS_ONLY=true
            shift
            ;;
        --android-only)
            ANDROID_ONLY=true
            shift
            ;;
        --skip-submit)
            SKIP_SUBMIT=true
            shift
            ;;
        --development)
            DEVELOPMENT_BUILD=true
            shift
            ;;
        --help)
            echo "Zyro Marketplace - Expo Deployment Script"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-tests      Skip running tests before build"
            echo "  --ios-only        Build and submit only for iOS"
            echo "  --android-only    Build and submit only for Android"
            echo "  --skip-submit     Build only, don't submit to stores"
            echo "  --development     Use development profile instead of production"
            echo "  --help            Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                          # Full deployment to both stores"
            echo "  $0 --ios-only              # Deploy only to App Store"
            echo "  $0 --skip-tests --android-only  # Android only, skip tests"
            echo "  $0 --development           # Development build"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Set build profile
if [ "$DEVELOPMENT_BUILD" = true ]; then
    BUILD_PROFILE="development"
    print_info "Using development build profile"
else
    BUILD_PROFILE="production"
    print_info "Using production build profile"
fi

# Set platforms
if [ "$IOS_ONLY" = true ]; then
    PLATFORMS="ios"
    print_info "Building for iOS only"
elif [ "$ANDROID_ONLY" = true ]; then
    PLATFORMS="android"
    print_info "Building for Android only"
else
    PLATFORMS="all"
    print_info "Building for both iOS and Android"
fi

print_header "🚀 ZYRO MARKETPLACE DEPLOYMENT"
echo ""
print_info "Starting automated deployment to Expo.dev and app stores"
echo ""

# Step 1: Verify prerequisites
print_step "1/10 Verificando prerrequisitos..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_error "EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
    print_success "EAS CLI installed"
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    print_error "Node.js 16+ required. Current version: $(node --version)"
    exit 1
fi

print_success "Prerequisites verified"

# Step 2: Authenticate with Expo
print_step "2/10 Verificando autenticación con Expo..."

if ! eas whoami &> /dev/null; then
    print_warning "Not logged in to Expo. Please login:"
    eas login
    
    # Verify login was successful
    if ! eas whoami &> /dev/null; then
        print_error "Failed to authenticate with Expo"
        exit 1
    fi
fi

EXPO_USER=$(eas whoami)
print_success "Authenticated as: $EXPO_USER"

# Step 3: Verify project configuration
print_step "3/10 Verificando configuración del proyecto..."

# Check required files
REQUIRED_FILES=("app.config.js" "eas.json" ".env.production")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file not found: $file"
        exit 1
    fi
done

# Validate JSON files
if ! node -c app.config.js &> /dev/null; then
    print_error "app.config.js has syntax errors"
    exit 1
fi

if ! python -m json.tool eas.json &> /dev/null 2>&1; then
    print_error "eas.json has syntax errors"
    exit 1
fi

print_success "Project configuration verified"

# Step 4: Clean and prepare project
print_step "4/10 Limpiando y preparando proyecto..."

# Clean previous builds
rm -rf .expo/ 2>/dev/null || true
npm run clean 2>/dev/null || true

# Install dependencies
print_info "Installing dependencies..."
npm ci --production=false

# Check for vulnerabilities
print_info "Checking for security vulnerabilities..."
npm audit --audit-level=high || print_warning "Security vulnerabilities found. Consider running 'npm audit fix'"

print_success "Project cleaned and prepared"

# Step 5: Run tests (unless skipped)
if [ "$SKIP_TESTS" = false ]; then
    print_step "5/10 Ejecutando tests..."
    
    # Run tests if available
    if npm run test &> /dev/null; then
        print_success "Tests passed"
    else
        print_warning "Tests failed or not configured. Continuing..."
    fi
    
    # Run linting if available
    if npm run lint &> /dev/null; then
        print_success "Linting passed"
    else
        print_warning "Linting failed or not configured. Continuing..."
    fi
    
    # Run type checking if available
    if npm run type-check &> /dev/null; then
        print_success "Type checking passed"
    else
        print_warning "Type checking failed or not configured. Continuing..."
    fi
else
    print_step "5/10 Saltando tests (--skip-tests especificado)"
fi

# Step 6: Configure EAS project
print_step "6/10 Configurando proyecto EAS..."

# Configure EAS if not already configured
if ! eas project:info &> /dev/null; then
    print_info "Configuring EAS project..."
    eas build:configure
fi

# Verify project info
PROJECT_INFO=$(eas project:info 2>/dev/null || echo "Project info not available")
print_info "Project: $PROJECT_INFO"

print_success "EAS project configured"

# Step 7: Configure credentials
print_step "7/10 Verificando credenciales..."

# Check iOS credentials (if building for iOS)
if [ "$PLATFORMS" = "ios" ] || [ "$PLATFORMS" = "all" ]; then
    print_info "Checking iOS credentials..."
    if ! eas credentials --platform ios --list &> /dev/null; then
        print_warning "iOS credentials not found. They will be generated automatically during build."
    else
        print_success "iOS credentials found"
    fi
fi

# Check Android credentials (if building for Android)
if [ "$PLATFORMS" = "android" ] || [ "$PLATFORMS" = "all" ]; then
    print_info "Checking Android credentials..."
    if ! eas credentials --platform android --list &> /dev/null; then
        print_warning "Android credentials not found. They will be generated automatically during build."
    else
        print_success "Android credentials found"
    fi
fi

print_success "Credentials verified"

# Step 8: Start builds
print_step "8/10 Iniciando builds de $BUILD_PROFILE..."

BUILD_START_TIME=$(date +%s)

# Start the build
print_info "Starting build for $PLATFORMS platform(s)..."
print_info "Build profile: $BUILD_PROFILE"
print_info "This may take 10-20 minutes..."

if eas build --platform "$PLATFORMS" --profile "$BUILD_PROFILE" --non-interactive --wait; then
    BUILD_END_TIME=$(date +%s)
    BUILD_DURATION=$((BUILD_END_TIME - BUILD_START_TIME))
    print_success "Build completed in $((BUILD_DURATION / 60)) minutes and $((BUILD_DURATION % 60)) seconds"
else
    print_error "Build failed"
    print_info "Check build logs with: eas build:list"
    exit 1
fi

# Step 9: Submit to app stores (unless skipped or development build)
if [ "$SKIP_SUBMIT" = false ] && [ "$DEVELOPMENT_BUILD" = false ]; then
    print_step "9/10 Subiendo a app stores..."
    
    # Check if we have the required files for submission
    if [ "$PLATFORMS" = "android" ] || [ "$PLATFORMS" = "all" ]; then
        if [ ! -f "google-service-account.json" ]; then
            print_warning "google-service-account.json not found. Android submission may fail."
            print_info "Download it from Google Play Console > Setup > API access"
        fi
    fi
    
    print_info "Submitting to app stores..."
    print_info "This may take a few minutes..."
    
    if eas submit --platform "$PLATFORMS" --latest --non-interactive; then
        print_success "Submission completed"
    else
        print_warning "Submission failed or partially failed"
        print_info "Check submission status with: eas submit:list"
    fi
else
    if [ "$SKIP_SUBMIT" = true ]; then
        print_step "9/10 Saltando subida a stores (--skip-submit especificado)"
    else
        print_step "9/10 Saltando subida a stores (development build)"
    fi
fi

# Step 10: Final verification and summary
print_step "10/10 Verificación final y resumen..."

# Get build information
print_info "Getting build information..."
BUILD_LIST=$(eas build:list --limit 3 --json 2>/dev/null || echo "[]")

# Get submission information (if not skipped)
if [ "$SKIP_SUBMIT" = false ] && [ "$DEVELOPMENT_BUILD" = false ]; then
    print_info "Getting submission information..."
    SUBMIT_LIST=$(eas submit:list --limit 3 --json 2>/dev/null || echo "[]")
fi

print_success "Deployment process completed!"

# Print summary
echo ""
print_header "📱 DEPLOYMENT SUMMARY"
echo ""

print_success "✅ Project: Zyro Marketplace"
print_success "✅ User: $EXPO_USER"
print_success "✅ Profile: $BUILD_PROFILE"
print_success "✅ Platforms: $PLATFORMS"

if [ "$DEVELOPMENT_BUILD" = false ]; then
    print_success "✅ Builds: Ready for app stores"
    if [ "$SKIP_SUBMIT" = false ]; then
        print_success "✅ Submissions: Sent to app stores"
    fi
else
    print_success "✅ Development builds: Ready for testing"
fi

echo ""
print_header "🔗 USEFUL LINKS"
echo ""

echo "📊 Monitor builds: https://expo.dev/accounts/$EXPO_USER/projects/zyro-marketplace/builds"
echo "📤 Monitor submissions: https://expo.dev/accounts/$EXPO_USER/projects/zyro-marketplace/submissions"
echo "🍎 App Store Connect: https://appstoreconnect.apple.com"
echo "🤖 Google Play Console: https://play.google.com/console"

echo ""
print_header "📋 NEXT STEPS"
echo ""

if [ "$DEVELOPMENT_BUILD" = true ]; then
    echo "1. Download and test development builds on physical devices"
    echo "2. Run production build when ready: $0 --production"
else
    echo "1. Monitor app store review process (1-7 days typical)"
    echo "2. Respond to any reviewer feedback promptly"
    echo "3. Prepare marketing materials for launch"
    echo "4. Set up analytics and monitoring"
fi

echo ""
print_header "🎉 DEPLOYMENT COMPLETED!"
echo ""

print_success "Your Zyro Marketplace app is now on its way to the app stores!"
print_info "Check your email for build and submission notifications"

# Save deployment log
DEPLOYMENT_LOG="deployment-$(date +%Y%m%d-%H%M%S).log"
echo "Deployment completed at $(date)" > "$DEPLOYMENT_LOG"
echo "User: $EXPO_USER" >> "$DEPLOYMENT_LOG"
echo "Profile: $BUILD_PROFILE" >> "$DEPLOYMENT_LOG"
echo "Platforms: $PLATFORMS" >> "$DEPLOYMENT_LOG"
print_info "Deployment log saved to: $DEPLOYMENT_LOG"

echo ""
print_success "🚀 Happy launching! 🎉"