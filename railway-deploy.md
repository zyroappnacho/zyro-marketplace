# Railway Deployment Guide

## Repository Information
- **GitHub URL**: https://github.com/zyroappnacho/zyro-marketplace
- **Main Branch**: main
- **Backend Entry Point**: backend/stripe-server-optimized.js

## Required Environment Variables
```
NODE_ENV=production
PORT=3000
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

## Deployment Commands
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start server
node backend/stripe-server-optimized.js
```

## Alternative Repository Names to Try
If Railway can't find the repository, try searching for:
- zyro-marketplace
- marketplace
- zyroappnacho/zyro-marketplace