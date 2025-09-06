import { BaseUser, Influencer, Company, Admin, Campaign, CollaborationRequest } from '../types';

// Database table schemas for SQLite
export const DATABASE_SCHEMAS = {
  // Users table - base table for all user types
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'influencer', 'company')),
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Influencers table - extends users
  influencers: `
    CREATE TABLE IF NOT EXISTS influencers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      instagram_username TEXT,
      tiktok_username TEXT,
      instagram_followers INTEGER DEFAULT 0,
      tiktok_followers INTEGER DEFAULT 0,
      profile_image TEXT,
      phone TEXT,
      address TEXT,
      city TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `,

  // Audience stats table for influencers
  audience_stats: `
    CREATE TABLE IF NOT EXISTS audience_stats (
      id TEXT PRIMARY KEY,
      influencer_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('country', 'city', 'age_range')),
      value TEXT NOT NULL,
      percentage REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (influencer_id) REFERENCES influencers (id) ON DELETE CASCADE
    );
  `,

  // Monthly stats for influencers
  monthly_stats: `
    CREATE TABLE IF NOT EXISTS monthly_stats (
      id TEXT PRIMARY KEY,
      influencer_id TEXT NOT NULL,
      month INTEGER NOT NULL,
      year INTEGER NOT NULL,
      views INTEGER DEFAULT 0,
      engagement INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (influencer_id) REFERENCES influencers (id) ON DELETE CASCADE,
      UNIQUE(influencer_id, month, year)
    );
  `,

  // Companies table - extends users
  companies: `
    CREATE TABLE IF NOT EXISTS companies (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      cif TEXT UNIQUE NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `,

  // Subscriptions table for companies
  subscriptions: `
    CREATE TABLE IF NOT EXISTS subscriptions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      plan TEXT NOT NULL CHECK (plan IN ('3months', '6months', '12months')),
      price REAL NOT NULL,
      start_date DATETIME NOT NULL,
      end_date DATETIME NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'cancelled')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE
    );
  `,

  // Admins table - extends users
  admins: `
    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      permissions TEXT, -- JSON string of permissions array
      last_login_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `,

  // Campaigns table
  campaigns: `
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      business_name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('restaurantes', 'movilidad', 'ropa', 'eventos', 'delivery', 'salud-belleza', 'alojamiento', 'discotecas')),
      city TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL,
      longitude REAL,
      images TEXT, -- JSON string of image URLs array
      min_instagram_followers INTEGER,
      min_tiktok_followers INTEGER,
      max_companions INTEGER DEFAULT 0,
      what_includes TEXT, -- JSON string of includes array
      instagram_stories INTEGER DEFAULT 0,
      tiktok_videos INTEGER DEFAULT 0,
      content_deadline INTEGER DEFAULT 72, -- hours
      company_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'paused', 'completed')) DEFAULT 'draft',
      created_by TEXT NOT NULL, -- admin ID
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES admins (id)
    );
  `,

  // Collaboration requests table
  collaboration_requests: `
    CREATE TABLE IF NOT EXISTS collaboration_requests (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      influencer_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')) DEFAULT 'pending',
      request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      proposed_content TEXT NOT NULL,
      reservation_date DATETIME,
      reservation_time TEXT,
      companions INTEGER DEFAULT 0,
      special_requests TEXT,
      delivery_address TEXT,
      delivery_phone TEXT,
      preferred_delivery_time TEXT,
      admin_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (campaign_id) REFERENCES campaigns (id) ON DELETE CASCADE,
      FOREIGN KEY (influencer_id) REFERENCES influencers (id) ON DELETE CASCADE,
      UNIQUE(campaign_id, influencer_id)
    );
  `,

  // Content delivered table for collaboration requests
  content_delivered: `
    CREATE TABLE IF NOT EXISTS content_delivered (
      id TEXT PRIMARY KEY,
      collaboration_request_id TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('instagram_story', 'tiktok_video')),
      url TEXT NOT NULL,
      delivered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collaboration_request_id) REFERENCES collaboration_requests (id) ON DELETE CASCADE
    );
  `,

  // Notifications table
  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      data TEXT, -- JSON string of additional data
      read BOOLEAN DEFAULT FALSE,
      sent_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `,

  // Payment transactions table
  payment_transactions: `
    CREATE TABLE IF NOT EXISTS payment_transactions (
      id TEXT PRIMARY KEY,
      company_id TEXT NOT NULL,
      subscription_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'EUR',
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE,
      status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
      processed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies (id) ON DELETE CASCADE,
      FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
    );
  `,

  // Conversations table for chat system
  conversations: `
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('collaboration', 'general', 'support')) DEFAULT 'general',
      title TEXT NOT NULL,
      related_entity_id TEXT,
      related_entity_type TEXT CHECK (related_entity_type IN ('campaign', 'collaboration_request')),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `,

  // Conversation participants table
  conversation_participants: `
    CREATE TABLE IF NOT EXISTS conversation_participants (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'influencer', 'company')),
      name TEXT NOT NULL,
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(conversation_id, user_id)
    );
  `,

  // Chat messages table
  chat_messages: `
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'influencer', 'company')),
      sender_name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('text', 'image', 'agreement_template')) DEFAULT 'text',
      content TEXT NOT NULL,
      metadata TEXT, -- JSON string for additional data
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users (id) ON DELETE CASCADE
    );
  `,

  // Message read status table
  message_read_status: `
    CREATE TABLE IF NOT EXISTS message_read_status (
      id TEXT PRIMARY KEY,
      message_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (message_id) REFERENCES chat_messages (id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      UNIQUE(message_id, user_id)
    );
  `,

  // Agreement templates table
  agreement_templates: `
    CREATE TABLE IF NOT EXISTS agreement_templates (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      variables TEXT, -- JSON string of variables array
      category TEXT NOT NULL CHECK (category IN ('collaboration', 'general', 'cancellation')) DEFAULT 'collaboration',
      is_active BOOLEAN DEFAULT TRUE,
      created_by TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES admins (id) ON DELETE CASCADE
    );
  `
};

// Database indexes for optimization
export const DATABASE_INDEXES = {
  // User indexes
  idx_users_email: 'CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);',
  idx_users_role: 'CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);',
  idx_users_status: 'CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);',
  
  // Influencer indexes
  idx_influencers_user_id: 'CREATE INDEX IF NOT EXISTS idx_influencers_user_id ON influencers (user_id);',
  idx_influencers_city: 'CREATE INDEX IF NOT EXISTS idx_influencers_city ON influencers (city);',
  idx_influencers_instagram_followers: 'CREATE INDEX IF NOT EXISTS idx_influencers_instagram_followers ON influencers (instagram_followers);',
  idx_influencers_tiktok_followers: 'CREATE INDEX IF NOT EXISTS idx_influencers_tiktok_followers ON influencers (tiktok_followers);',
  
  // Company indexes
  idx_companies_user_id: 'CREATE INDEX IF NOT EXISTS idx_companies_user_id ON companies (user_id);',
  idx_companies_cif: 'CREATE INDEX IF NOT EXISTS idx_companies_cif ON companies (cif);',
  
  // Subscription indexes
  idx_subscriptions_company_id: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON subscriptions (company_id);',
  idx_subscriptions_status: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);',
  idx_subscriptions_end_date: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_end_date ON subscriptions (end_date);',
  
  // Campaign indexes
  idx_campaigns_company_id: 'CREATE INDEX IF NOT EXISTS idx_campaigns_company_id ON campaigns (company_id);',
  idx_campaigns_category: 'CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns (category);',
  idx_campaigns_city: 'CREATE INDEX IF NOT EXISTS idx_campaigns_city ON campaigns (city);',
  idx_campaigns_status: 'CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns (status);',
  idx_campaigns_created_by: 'CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns (created_by);',
  
  // Collaboration request indexes
  idx_collaboration_requests_campaign_id: 'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_campaign_id ON collaboration_requests (campaign_id);',
  idx_collaboration_requests_influencer_id: 'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_influencer_id ON collaboration_requests (influencer_id);',
  idx_collaboration_requests_status: 'CREATE INDEX IF NOT EXISTS idx_collaboration_requests_status ON collaboration_requests (status);',
  
  // Notification indexes
  idx_notifications_user_id: 'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);',
  idx_notifications_read: 'CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);',
  
  // Payment transaction indexes
  idx_payment_transactions_company_id: 'CREATE INDEX IF NOT EXISTS idx_payment_transactions_company_id ON payment_transactions (company_id);',
  idx_payment_transactions_subscription_id: 'CREATE INDEX IF NOT EXISTS idx_payment_transactions_subscription_id ON payment_transactions (subscription_id);',
  idx_payment_transactions_status: 'CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions (status);',
  
  // Chat system indexes
  idx_conversations_type: 'CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations (type);',
  idx_conversations_related_entity: 'CREATE INDEX IF NOT EXISTS idx_conversations_related_entity ON conversations (related_entity_id, related_entity_type);',
  idx_conversation_participants_conversation_id: 'CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants (conversation_id);',
  idx_conversation_participants_user_id: 'CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants (user_id);',
  idx_chat_messages_conversation_id: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages (conversation_id);',
  idx_chat_messages_sender_id: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages (sender_id);',
  idx_chat_messages_created_at: 'CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages (created_at);',
  idx_message_read_status_message_id: 'CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON message_read_status (message_id);',
  idx_message_read_status_user_id: 'CREATE INDEX IF NOT EXISTS idx_message_read_status_user_id ON message_read_status (user_id);',
  idx_agreement_templates_category: 'CREATE INDEX IF NOT EXISTS idx_agreement_templates_category ON agreement_templates (category);',
  idx_agreement_templates_is_active: 'CREATE INDEX IF NOT EXISTS idx_agreement_templates_is_active ON agreement_templates (is_active);'
};

// Database triggers for automatic timestamp updates
export const DATABASE_TRIGGERS = {
  // Update timestamps on users table
  trigger_users_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on influencers table
  trigger_influencers_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_influencers_updated_at
    AFTER UPDATE ON influencers
    FOR EACH ROW
    BEGIN
      UPDATE influencers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on companies table
  trigger_companies_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_companies_updated_at
    AFTER UPDATE ON companies
    FOR EACH ROW
    BEGIN
      UPDATE companies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on campaigns table
  trigger_campaigns_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_campaigns_updated_at
    AFTER UPDATE ON campaigns
    FOR EACH ROW
    BEGIN
      UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on collaboration_requests table
  trigger_collaboration_requests_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_collaboration_requests_updated_at
    AFTER UPDATE ON collaboration_requests
    FOR EACH ROW
    BEGIN
      UPDATE collaboration_requests SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on conversations table
  trigger_conversations_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_conversations_updated_at
    AFTER UPDATE ON conversations
    FOR EACH ROW
    BEGIN
      UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on chat_messages table
  trigger_chat_messages_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_chat_messages_updated_at
    AFTER UPDATE ON chat_messages
    FOR EACH ROW
    BEGIN
      UPDATE chat_messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  
  // Update timestamps on agreement_templates table
  trigger_agreement_templates_updated_at: `
    CREATE TRIGGER IF NOT EXISTS trigger_agreement_templates_updated_at
    AFTER UPDATE ON agreement_templates
    FOR EACH ROW
    BEGIN
      UPDATE agreement_templates SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `
};