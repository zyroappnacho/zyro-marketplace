#!/bin/bash

# Zyro Marketplace - Store Submission Script
# This script submits the built app to App Store and Google Play

set -e  # Exit on any error

echo "📱 Zyro Marketplace Store Submission"
echo "===================================="

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

# Function to submit to iOS App Store
submit_ios() {
    print_status "Submitting to iOS App Store..."
    
    echo ""
    echo "📋 iOS App Store Submission Checklist:"
    echo "• App icons and screenshots uploaded"
    echo "• App description and keywords set"
    echo "• Privacy policy URL configured"
    echo "• Age rating completed"
    echo "• Pricing and availability set"
    echo "• Review information provided"
    echo ""
    
    read -p "Have you completed the App Store Connect setup? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please complete App Store Connect setup first:"
        echo "1. Go to https://appstoreconnect.apple.com"
        echo "2. Create new app with bundle ID: com.zyromarketplace.app"
        echo "3. Upload screenshots and app information"
        echo "4. Set privacy policy: https://zyromarketplace.com/privacy"
        echo "5. Set support URL: https://zyromarketplace.com/support"
        echo "6. Complete age rating questionnaire"
        echo "7. Set pricing to Free"
        echo "8. Add review information and demo account"
        return 1
    fi
    
    # Submit to App Store
    eas submit --platform ios --latest || {
        print_error "iOS submission failed"
        return 1
    }
    
    print_success "iOS app submitted to App Store!"
    echo ""
    echo "📱 iOS Submission Details:"
    echo "• Bundle ID: com.zyromarketplace.app"
    echo "• Version: 1.0.0"
    echo "• Build Number: 1"
    echo "• Status: Waiting for Review"
    echo ""
    echo "🔗 Monitor status at: https://appstoreconnect.apple.com"
    echo ""
}

# Function to submit to Google Play
submit_android() {
    print_status "Submitting to Google Play Store..."
    
    echo ""
    echo "📋 Google Play Store Submission Checklist:"
    echo "• Google Play Console account created"
    echo "• App listing completed with screenshots"
    echo "• Content rating questionnaire completed"
    echo "• Privacy policy URL set"
    echo "• Target audience and content settings configured"
    echo "• Service account key configured for API access"
    echo ""
    
    read -p "Have you completed the Google Play Console setup? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Please complete Google Play Console setup first:"
        echo "1. Go to https://play.google.com/console"
        echo "2. Create new app with package name: com.zyromarketplace.app"
        echo "3. Complete app listing with screenshots and descriptions"
        echo "4. Set privacy policy: https://zyromarketplace.com/privacy"
        echo "5. Complete content rating questionnaire"
        echo "6. Set target audience and content settings"
        echo "7. Configure service account for API access"
        echo "8. Upload service account key as google-service-account.json"
        return 1
    fi
    
    # Check if service account key exists
    if [ ! -f "google-service-account.json" ]; then
        print_error "Google service account key not found!"
        echo "Please download the service account key from Google Play Console:"
        echo "1. Go to Google Play Console > Setup > API access"
        echo "2. Create or use existing service account"
        echo "3. Download JSON key file"
        echo "4. Save as 'google-service-account.json' in project root"
        return 1
    fi
    
    # Submit to Google Play
    eas submit --platform android --latest || {
        print_error "Android submission failed"
        return 1
    }
    
    print_success "Android app submitted to Google Play!"
    echo ""
    echo "📱 Android Submission Details:"
    echo "• Package Name: com.zyromarketplace.app"
    echo "• Version Name: 1.0.0"
    echo "• Version Code: 1"
    echo "• Track: Internal Testing"
    echo ""
    echo "🔗 Monitor status at: https://play.google.com/console"
    echo ""
}

# Main menu
echo ""
echo "Select submission option:"
echo "1) Submit to iOS App Store only"
echo "2) Submit to Google Play Store only"
echo "3) Submit to both stores"
echo "4) Check submission status"
echo "5) Exit"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        submit_ios
        ;;
    2)
        submit_android
        ;;
    3)
        print_status "Submitting to both stores..."
        submit_ios
        echo ""
        submit_android
        ;;
    4)
        print_status "Checking submission status..."
        eas submit:list
        ;;
    5)
        print_status "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice. Please select 1-5."
        exit 1
        ;;
esac

echo ""
echo "📋 Post-Submission Checklist:"
echo "• Monitor review status in respective consoles"
echo "• Respond to any reviewer feedback promptly"
echo "• Prepare marketing materials for launch"
echo "• Set up analytics and crash reporting"
echo "• Plan post-launch updates and improvements"

echo ""
print_success "🎉 Store submission process completed!"
echo "===================================="