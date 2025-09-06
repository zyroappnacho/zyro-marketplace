// User roles and status types
export type UserRole = 'admin' | 'influencer' | 'company';
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type SubscriptionPlan = '3months' | '6months' | '12months';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';
export type CampaignCategory = 'restaurantes' | 'movilidad' | 'ropa' | 'eventos' | 'delivery' | 'salud-belleza' | 'alojamiento' | 'discotecas';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';
export type CollaborationStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
export type MessageType = 'text' | 'image' | 'agreement_template';
export type ConversationType = 'collaboration' | 'general' | 'support';

// Base User interface
export interface BaseUser {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

// Influencer interface
export interface Influencer extends BaseUser {
  fullName: string;
  instagramUsername?: string;
  tiktokUsername?: string;
  instagramFollowers: number;
  tiktokFollowers: number;
  profileImage?: string;
  phone?: string;
  address?: string;
  city: string;
  audienceStats: {
    countries: { country: string; percentage: number }[];
    cities: { city: string; percentage: number }[];
    ageRanges: { range: string; percentage: number }[];
    monthlyStats: {
      views: number;
      engagement: number;
      reach: number;
    };
  };
}

// Company interface
export interface Company extends BaseUser {
  companyName: string;
  cif: string;
  address: string;
  phone: string;
  contactPerson: string;
  subscription: {
    plan: SubscriptionPlan;
    price: number;
    startDate: Date;
    endDate: Date;
    status: SubscriptionStatus;
  };
  paymentMethod: string;
}

// Admin interface
export interface Admin extends BaseUser {
  username: string;
  fullName: string;
  permissions: string[];
  lastLoginAt?: Date;
}

// Campaign interface
export interface Campaign {
  id: string;
  title: string;
  description: string;
  businessName: string;
  category: CampaignCategory;
  city: string;
  address: string;
  coordinates: { lat: number; lng: number };
  images: string[];
  requirements: {
    minInstagramFollowers?: number;
    minTiktokFollowers?: number;
    maxCompanions: number;
  };
  whatIncludes: string[];
  contentRequirements: {
    instagramStories: number;
    tiktokVideos: number;
    deadline: number; // hours
  };
  companyId: string;
  status: CampaignStatus;
  createdBy: string; // admin ID
  createdAt: Date;
  updatedAt: Date;
}

// Collaboration Request interface
export interface CollaborationRequest {
  id: string;
  campaignId: string;
  influencerId: string;
  status: CollaborationStatus;
  requestDate: Date;
  proposedContent: string;
  reservationDetails?: {
    date: Date;
    time: string;
    companions: number;
    specialRequests?: string;
  };
  deliveryDetails?: {
    address: string;
    phone: string;
    preferredTime: string;
  };
  contentDelivered?: {
    instagramStories: string[];
    tiktokVideos: string[];
    deliveredAt: Date;
  };
  adminNotes?: string;
}

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Map: undefined;
  History: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeMain: undefined;
  CollaborationDetail: {
    campaignId: string;
  };
  CollaborationRequest: {
    campaignId: string;
  };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PersonalData: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  SecuritySettings: undefined;
  PrivacySettings: undefined;
  DataExport: undefined;
  AccountDeletion: undefined;
};

// Chat and Communication types
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: UserRole;
  senderName: string;
  type: MessageType;
  content: string;
  metadata?: {
    imageUrl?: string;
    templateId?: string;
    agreementData?: any;
  };
  readBy: string[]; // Array of user IDs who have read this message
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  participants: {
    userId: string;
    role: UserRole;
    name: string;
    joinedAt: Date;
  }[];
  relatedEntityId?: string; // Campaign ID or Collaboration Request ID
  relatedEntityType?: 'campaign' | 'collaboration_request';
  lastMessage?: ChatMessage;
  unreadCount: { [userId: string]: number };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgreementTemplate {
  id: string;
  title: string;
  content: string;
  variables: string[]; // Variables that can be replaced in the template
  category: 'collaboration' | 'general' | 'cancellation';
  isActive: boolean;
  createdBy: string; // Admin ID
  createdAt: Date;
  updatedAt: Date;
}