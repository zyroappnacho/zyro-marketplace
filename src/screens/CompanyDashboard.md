# Company Dashboard Implementation

## Overview

The Company Dashboard provides a limited view for approved companies to manage their business presence on the Zyro platform. This implementation fulfills task 15.1 from the specification.

## Features Implemented

### 1. Company Profile Display
- Shows company name and subscription status
- Displays current subscription plan (3, 6, or 12 months)
- Shows subscription status (active, expired, cancelled)

### 2. Metrics Overview
- **Active Campaigns**: Number of currently active campaigns
- **Pending Requests**: Collaboration requests awaiting approval
- **Approved Requests**: Confirmed collaborations
- **Completed Requests**: Successfully finished collaborations

### 3. Campaign Management
- Lists all campaigns created by the administrator for this company
- Shows campaign details: title, business name, category, city, status
- Displays follower requirements and campaign status
- Empty state when no campaigns exist

### 4. Collaboration Request Management
- Lists all influencer requests for company campaigns
- Shows request details:
  - Campaign title
  - Request status (pending, approved, rejected, completed, cancelled)
  - Request date
  - Reservation details (for restaurants)
  - Delivery details (for products)
  - Proposed content from influencer
- Tap to view detailed information in alert dialog

## Technical Implementation

### Redux Store
- **companyDashboardSlice**: Manages company dashboard state
- **Actions**: 
  - `fetchCompanyProfile`: Gets company information
  - `fetchCompanyCampaigns`: Gets campaigns for the company
  - `fetchCompanyCollaborationRequests`: Gets all collaboration requests
  - `fetchCompanyMetrics`: Calculates dashboard metrics

### Navigation
- Companies are routed to `CompanyDashboardScreen` instead of the regular tab navigator
- Automatic routing based on user role in `AppNavigator`

### Data Flow
1. Company logs in and is approved
2. Navigation routes to company dashboard
3. Dashboard loads company profile to get company ID
4. Fetches campaigns, collaboration requests, and metrics
5. Displays information in organized sections

## UI Components

### MetricCard
- Displays numerical metrics with titles and subtitles
- Color-coded based on metric type
- Premium styling with gold accents

### InfluencerRequestCard
- Shows collaboration request details
- Status badges with appropriate colors
- Expandable details on tap

### Empty States
- Informative messages when no data exists
- Explains next steps for companies

## Requirements Fulfilled

✅ **13.1**: Show only information related to company's business  
✅ **13.2**: List influencers who have requested collaboration  
✅ **13.3**: Show status of each request  
✅ **13.4**: Display metrics and statistics  
✅ **13.5**: Limited view compared to admin panel  

## Premium Design Elements

- Gold color palette (#C9A961, #A68B47, #D4AF37)
- Dark theme with elegant surfaces
- Zyro logo prominently displayed
- Smooth transitions and premium styling
- Consistent with overall app aesthetic

## Future Enhancements

- Real-time updates for collaboration status changes
- Push notifications for new requests
- Export functionality for metrics
- Direct communication with influencers
- Campaign performance analytics