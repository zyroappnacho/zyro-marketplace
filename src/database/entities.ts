// Database entity interfaces that map directly to database tables

export interface UserEntity {
  id: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'influencer' | 'company';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface InfluencerEntity {
  id: string;
  user_id: string;
  full_name: string;
  instagram_username?: string;
  tiktok_username?: string;
  instagram_followers: number;
  tiktok_followers: number;
  profile_image?: string;
  phone?: string;
  address?: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface AudienceStatEntity {
  id: string;
  influencer_id: string;
  type: 'country' | 'city' | 'age_range';
  value: string;
  percentage: number;
  created_at: string;
}

export interface MonthlyStatEntity {
  id: string;
  influencer_id: string;
  month: number;
  year: number;
  views: number;
  engagement: number;
  reach: number;
  created_at: string;
}

export interface CompanyEntity {
  id: string;
  user_id: string;
  company_name: string;
  cif: string;
  address: string;
  phone: string;
  contact_person: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEntity {
  id: string;
  company_id: string;
  plan: '3months' | '6months' | '12months';
  price: number;
  start_date: string;
  end_date: string;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface AdminEntity {
  id: string;
  user_id: string;
  username: string;
  full_name: string;
  permissions: string; // JSON string
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignEntity {
  id: string;
  title: string;
  description: string;
  business_name: string;
  category: 'restaurantes' | 'movilidad' | 'ropa' | 'eventos' | 'delivery' | 'salud-belleza' | 'alojamiento' | 'discotecas';
  city: string;
  address: string;
  latitude?: number;
  longitude?: number;
  images: string; // JSON string
  min_instagram_followers?: number;
  min_tiktok_followers?: number;
  max_companions: number;
  what_includes: string; // JSON string
  instagram_stories: number;
  tiktok_videos: number;
  content_deadline: number;
  company_id: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CollaborationRequestEntity {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  request_date: string;
  proposed_content: string;
  reservation_date?: string;
  reservation_time?: string;
  companions: number;
  special_requests?: string;
  delivery_address?: string;
  delivery_phone?: string;
  preferred_delivery_time?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ContentDeliveredEntity {
  id: string;
  collaboration_request_id: string;
  type: 'instagram_story' | 'tiktok_video';
  url: string;
  delivered_at: string;
}

export interface NotificationEntity {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data?: string; // JSON string
  read: boolean;
  sent_at?: string;
  created_at: string;
}

export interface PaymentTransactionEntity {
  id: string;
  company_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  processed_at?: string;
  created_at: string;
}

// Utility types for database operations
export type CreateUserData = Omit<UserEntity, 'id' | 'created_at' | 'updated_at'>;
export type UpdateUserData = Partial<Omit<UserEntity, 'id' | 'created_at' | 'updated_at'>>;

export type CreateInfluencerData = Omit<InfluencerEntity, 'id' | 'created_at' | 'updated_at'>;
export type UpdateInfluencerData = Partial<Omit<InfluencerEntity, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type CreateCompanyData = Omit<CompanyEntity, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCompanyData = Partial<Omit<CompanyEntity, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

export type CreateCampaignData = Omit<CampaignEntity, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCampaignData = Partial<Omit<CampaignEntity, 'id' | 'created_at' | 'updated_at'>>;

export type CreateCollaborationRequestData = Omit<CollaborationRequestEntity, 'id' | 'created_at' | 'updated_at'>;
export type UpdateCollaborationRequestData = Partial<Omit<CollaborationRequestEntity, 'id' | 'campaign_id' | 'influencer_id' | 'created_at' | 'updated_at'>>;

// Database query result types
export interface UserWithProfile extends UserEntity {
  // Joined data from related tables
  profile?: InfluencerEntity | CompanyEntity | AdminEntity;
}

export interface CampaignWithCompany extends CampaignEntity {
  company?: CompanyEntity;
  company_name_full?: string;
}

export interface CollaborationRequestWithDetails extends CollaborationRequestEntity {
  campaign?: CampaignEntity;
  influencer?: InfluencerEntity;
  content_delivered?: ContentDeliveredEntity[];
}