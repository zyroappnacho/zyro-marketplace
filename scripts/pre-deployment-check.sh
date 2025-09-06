#!/bin/bash

# Zyro Marketplace - Pre-Deployment Check Script
# Este script verifica que todo esté listo antes del deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to print colored output
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

check_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header "🔍 ZYRO MARKETPLACE - PRE-DEPLOYMENT CHECK"
echo ""

# Check 1: Project Structure
echo "📁 Checking project structure..."

if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json not found"
fi

if [ -f "app.config.js" ]; then
    check_pass "app.config.js exists"
else
    check_fail "app.config.js not found"
fi

if [ -f "eas.json" ]; then
    check_pass "eas.json exists"
else
    check_fail "eas.json not found"
fi

if [ -f ".env.production" ]; then
    check_pass ".env.production exists"
else
    check_fail ".env.production not found"
fi

# Check 2: Node.js and npm
echo ""
echo "🔧 Checking development environment..."

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -ge 16 ]; then
        check_pass "Node.js version: $NODE_VERSION (✓ >= 16)"
    else
        check_fail "Node.js version: $NODE_VERSION (✗ < 16 required)"
    fi
else
    check_fail "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    check_pass "npm version: $NPM_VERSION"
else
    check_fail "npm not installed"
fi

# Check 3: EAS CLI
echo ""
echo "📱 Checking Expo EAS CLI..."

if command -v eas &> /dev/null; then
    EAS_VERSION=$(eas --version)
    check_pass "EAS CLI version: $EAS_VERSION"
    
    # Check authentication
    if eas whoami &> /dev/null; then
        EAS_USER=$(eas whoami)
        check_pass "Authenticated as: $EAS_USER"
    else
        check_fail "Not authenticated with Expo (run: eas login)"
    fi
else
    check_fail "EAS CLI not installed (run: npm install -g @expo/eas-cli)"
fi

# Check 4: Project Configuration
echo ""
echo "⚙️ Checking project configuration..."

# Validate app.config.js
if [ -f "app.config.js" ]; then
    if node -c app.config.js &> /dev/null; then
        check_pass "app.config.js syntax is valid"
    else
        check_fail "app.config.js has syntax errors"
    fi
fi

# Validate eas.json
if [ -f "eas.json" ]; then
    if python -m json.tool eas.json &> /dev/null 2>&1; then
        check_pass "eas.json syntax is valid"
    else
        check_fail "eas.json has syntax errors"
    fi
fi

# Check package.json scripts
if [ -f "package.json" ]; then
    if grep -q "\"build:production\"" package.json; then
        check_pass "build:production script exists"
    else
        check_warning "build:production script not found"
    fi
    
    if grep -q "\"submit:stores\"" package.json; then
        check_pass "submit:stores script exists"
    else
        check_warning "submit:stores script not found"
    fi
fi

# Check 5: Dependencies
echo ""
echo "📦 Checking dependencies..."

if [ -f "package.json" ] && [ -d "node_modules" ]; then
    # Check if dependencies are installed
    if npm list &> /dev/null; then
        check_pass "All dependencies are installed"
    else
        check_warning "Some dependencies may be missing (run: npm install)"
    fi
    
    # Check for security vulnerabilities
    if npm audit --audit-level=high &> /dev/null; then
        check_pass "No high-severity security vulnerabilities"
    else
        check_warning "Security vulnerabilities found (run: npm audit fix)"
    fi
else
    check_fail "Dependencies not installed (run: npm install)"
fi

# Check 6: Assets
echo ""
echo "🎨 Checking assets..."

if [ -f "assets/icon.png" ]; then
    check_pass "App icon exists"
else
    check_warning "App icon not found (assets/icon.png)"
fi

if [ -f "assets/splash.png" ]; then
    check_pass "Splash screen exists"
else
    check_warning "Splash screen not found (assets/splash.png)"
fi

if [ -f "assets/adaptive-icon.png" ]; then
    check_pass "Adaptive icon exists"
else
    check_warning "Adaptive icon not found (assets/adaptive-icon.png)"
fi

# Check 7: Store Configuration
echo ""
echo "🏪 Checking store configuration..."

# Check for Google Play service account
if [ -f "google-service-account.json" ]; then
    check_pass "Google Play service account key exists"
else
    check_warning "Google Play service account key not found (required for Android submission)"
fi

# Check environment variables
if [ -f ".env.production" ]; then
    # Check for critical environment variables
    if grep -q "API_URL" .env.production; then
        check_pass "API_URL configured"
    else
        check_warning "API_URL not configured in .env.production"
    fi
    
    if grep -q "FIREBASE_PROJECT_ID" .env.production; then
        check_pass "Firebase project ID configured"
    else
        check_warning "Firebase project ID not configured"
    fi
fi

# Check 8: Legal Documents
echo ""
echo "📄 Checking legal documents..."

if [ -f "privacy-policy.md" ]; then
    check_pass "Privacy policy exists"
else
    check_warning "Privacy policy not found (required for app stores)"
fi

if [ -f "terms-of-service.md" ]; then
    check_pass "Terms of service exists"
else
    check_warning "Terms of service not found (required for app stores)"
fi

# Check 9: Build Scripts
echo ""
echo "🛠️ Checking build scripts..."

if [ -f "scripts/expo-deploy.sh" ]; then
    if [ -x "scripts/expo-deploy.sh" ]; then
        check_pass "Expo deployment script is executable"
    else
        check_warning "Expo deployment script exists but is not executable (run: chmod +x scripts/expo-deploy.sh)"
    fi
else
    check_warning "Expo deployment script not found"
fi

if [ -f "scripts/build-production.sh" ]; then
    if [ -x "scripts/build-production.sh" ]; then
        check_pass "Production build script is executable"
    else
        check_warning "Production build script exists but is not executable (run: chmod +x scripts/build-production.sh)"
    fi
else
    check_warning "Production build script not found"
fi

# Check 10: Git Status
echo ""
echo "📝 Checking git status..."

if command -v git &> /dev/null; then
    if git rev-parse --git-dir &> /dev/null; then
        # Check if there are uncommitted changes
        if git diff-index --quiet HEAD --; then
            check_pass "No uncommitted changes"
        else
            check_warning "There are uncommitted changes (consider committing before deployment)"
        fi
        
        # Check current branch
        CURRENT_BRANCH=$(git branch --show-current)
        if [ "$CURRENT_BRANCH" = "main" ] || [ "$CURRENT_BRANCH" = "master" ]; then
            check_pass "On main/master branch: $CURRENT_BRANCH"
        else
            check_warning "Not on main/master branch (current: $CURRENT_BRANCH)"
        fi
    else
        check_info "Not a git repository"
    fi
else
    check_info "Git not installed"
fi

# Summary
echo ""
print_header "📊 PRE-DEPLOYMENT CHECK SUMMARY"
echo ""

echo -e "${GREEN}✅ Checks passed: $CHECKS_PASSED${NC}"
if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Checks failed: $CHECKS_FAILED${NC}"
fi

echo ""

# Recommendations
if [ $CHECKS_FAILED -gt 0 ]; then
    echo -e "${RED}🚫 DEPLOYMENT NOT RECOMMENDED${NC}"
    echo "Please fix the failed checks before proceeding with deployment."
    echo ""
    echo "Common fixes:"
    echo "• Install missing dependencies: npm install"
    echo "• Install EAS CLI: npm install -g @expo/eas-cli"
    echo "• Login to Expo: eas login"
    echo "• Fix configuration file syntax errors"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  DEPLOYMENT POSSIBLE WITH WARNINGS${NC}"
    echo "You can proceed with deployment, but consider addressing the warnings."
    echo ""
    echo "Recommended actions:"
    echo "• Add missing assets (app icon, splash screen)"
    echo "• Configure Google Play service account for Android"
    echo "• Add privacy policy and terms of service"
    echo "• Commit any pending changes"
    echo ""
    echo "To proceed with deployment:"
    echo "  ./scripts/expo-deploy.sh"
else
    echo -e "${GREEN}🎉 ALL CHECKS PASSED - READY FOR DEPLOYMENT!${NC}"
    echo ""
    echo "Your Zyro Marketplace app is ready for deployment to app stores."
    echo ""
    echo "To start deployment:"
    echo "  ./scripts/expo-deploy.sh"
    echo ""
    echo "For specific platforms:"
    echo "  ./scripts/expo-deploy.sh --ios-only"
    echo "  ./scripts/expo-deploy.sh --android-only"
fi

echo ""
echo "For more deployment options, run:"
echo "  ./scripts/expo-deploy.sh --help"

exit 0