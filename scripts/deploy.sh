#!/bin/bash

# Zyro Marketplace Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
SKIP_TESTS=${2:-false}

echo -e "${GREEN}🚀 Starting deployment for ${ENVIRONMENT} environment${NC}"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Check if we're on the correct branch
if [[ "$ENVIRONMENT" == "production" ]]; then
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ "$CURRENT_BRANCH" != "main" ]]; then
        echo -e "${RED}❌ Production deployments must be from 'main' branch${NC}"
        exit 1
    fi
fi

# Load environment variables
if [[ -f ".env.${ENVIRONMENT}" ]]; then
    echo -e "${YELLOW}📋 Loading environment variables for ${ENVIRONMENT}${NC}"
    export $(cat .env.${ENVIRONMENT} | xargs)
else
    echo -e "${RED}❌ Environment file .env.${ENVIRONMENT} not found${NC}"
    exit 1
fi

# Check for required tools
echo -e "${YELLOW}🔧 Checking required tools...${NC}"
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js is required but not installed${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm is required but not installed${NC}"; exit 1; }
command -v expo >/dev/null 2>&1 || { echo -e "${RED}❌ Expo CLI is required but not installed${NC}"; exit 1; }

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Run type checking
echo -e "${YELLOW}🔍 Running type checking...${NC}"
npm run type-check

# Run linting
echo -e "${YELLOW}🧹 Running linting...${NC}"
npm run lint

# Run tests (unless skipped)
if [[ "$SKIP_TESTS" != "true" ]]; then
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    npm run test:coverage
    
    # Check test coverage
    COVERAGE_THRESHOLD=80
    COVERAGE=$(npm run test:coverage --silent | grep -o 'All files.*[0-9]\+' | grep -o '[0-9]\+' | tail -1)
    if [[ "$COVERAGE" -lt "$COVERAGE_THRESHOLD" ]]; then
        echo -e "${RED}❌ Test coverage ($COVERAGE%) is below threshold ($COVERAGE_THRESHOLD%)${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Test coverage: $COVERAGE%${NC}"
else
    echo -e "${YELLOW}⚠️  Skipping tests${NC}"
fi

# Clean cache
echo -e "${YELLOW}🧽 Cleaning cache...${NC}"
npm run clean:cache

# Build the application
echo -e "${YELLOW}🏗️  Building application for ${ENVIRONMENT}...${NC}"
if [[ "$ENVIRONMENT" == "production" ]]; then
    npm run build:production
else
    npm run build:staging
fi

# Publish to Expo
echo -e "${YELLOW}📤 Publishing to Expo...${NC}"
if [[ "$ENVIRONMENT" == "production" ]]; then
    expo publish --release-channel production --non-interactive
else
    expo publish --release-channel staging --non-interactive
fi

# Generate build artifacts
echo -e "${YELLOW}📱 Generating build artifacts...${NC}"
if [[ "$ENVIRONMENT" == "production" ]]; then
    # Build for both platforms in production
    eas build --platform all --profile production --non-interactive
else
    # Build APK for staging
    eas build --platform android --profile staging --non-interactive
fi

# Run post-deployment checks
echo -e "${YELLOW}🔍 Running post-deployment checks...${NC}"
sleep 30 # Wait for deployment to propagate

# Health check
HEALTH_URL="${API_BASE_URL}/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" || echo "000")

if [[ "$HTTP_STATUS" == "200" ]]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed (HTTP $HTTP_STATUS)${NC}"
    exit 1
fi

# Send deployment notification
echo -e "${YELLOW}📢 Sending deployment notification...${NC}"
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MESSAGE=$(git log -1 --pretty=%B)

# In a real implementation, you would send to Slack, Discord, etc.
echo "Deployment completed successfully!"
echo "Environment: $ENVIRONMENT"
echo "Commit: $COMMIT_HASH"
echo "Message: $COMMIT_MESSAGE"
echo "Build URL: Check Expo dashboard for build status"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
# Remove any temporary files if needed

echo -e "${GREEN}✨ All done! Your app is now live on ${ENVIRONMENT}.${NC}"