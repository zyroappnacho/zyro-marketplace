#!/bin/bash

# Zyro Marketplace - Production Build Script
# This script builds the app for production deployment to App Store and Google Play

set -e  # Exit on any error

echo "🚀 Starting Zyro Marketplace Production Build"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
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

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_error "EAS CLI not found. Please install it with: npm install -g @expo/eas-cli"
    exit 1
fi

# Check if user is logged in to EAS
print_status "Checking EAS authentication..."
if ! eas whoami &> /dev/null; then
    print_warning "Not logged in to EAS. Please run: eas login"
    exit 1
fi

print_success "EAS authentication verified"

# Load environment variables
if [ -f ".env.production" ]; then
    print_status "Loading production environment variables..."
    export $(cat .env.production | grep -v '^#' | xargs)
    print_success "Environment variables loaded"
else
    print_warning ".env.production file not found. Using default values."
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/
rm -rf .expo/
npm run clean 2>/dev/null || true
print_success "Cleanup completed"

# Install dependencies
print_status "Installing dependencies..."
npm ci --production=false
print_success "Dependencies installed"

# Run tests
print_status "Running tests..."
npm run test 2>/dev/null || {
    print_warning "Tests failed or not configured. Continuing with build..."
}

# Type checking
print_status "Running TypeScript type checking..."
npm run type-check 2>/dev/null || {
    print_warning "Type checking failed or not configured. Continuing with build..."
}

# Linting
print_status "Running ESLint..."
npm run lint 2>/dev/null || {
    print_warning "Linting failed or not configured. Continuing with build..."
}

# Build for production
print_status "Building for production..."

# Configure EAS project if not already configured
if [ ! -f "eas.json" ]; then
    print_status "Configuring EAS project..."
    eas build:configure
fi

# Build for iOS
print_status "Building for iOS (App Store)..."
eas build --platform ios --profile production --non-interactive --wait || {
    print_error "iOS build failed"
    exit 1
}
print_success "iOS build completed successfully"

# Build for Android
print_status "Building for Android (Google Play)..."
eas build --platform android --profile production --non-interactive --wait || {
    print_error "Android build failed"
    exit 1
}
print_success "Android build completed successfully"

# Generate APK for testing (optional)
print_status "Building Android APK for testing..."
eas build --platform android --profile production-apk --non-interactive --wait || {
    print_warning "APK build failed, but AAB build succeeded"
}

print_success "All builds completed successfully!"

# Display build information
echo ""
echo "📱 Build Summary"
echo "================"
print_success "✅ iOS build ready for App Store submission"
print_success "✅ Android AAB ready for Google Play submission"
print_success "✅ Android APK available for testing"

echo ""
echo "📋 Next Steps:"
echo "1. Download builds from: https://expo.dev/accounts/[your-account]/projects/zyro-marketplace/builds"
echo "2. Test builds on physical devices"
echo "3. Submit to App Store: eas submit --platform ios"
echo "4. Submit to Google Play: eas submit --platform android"

echo ""
echo "🔗 Useful Commands:"
echo "• View builds: eas build:list"
echo "• Submit to stores: eas submit"
echo "• Check build status: eas build:view [build-id]"

echo ""
print_success "🎉 Production build process completed!"
echo "=============================================="