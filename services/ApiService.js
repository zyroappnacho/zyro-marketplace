// Mock API Service for ZYRO Marketplace
// In production, replace with actual backend endpoints

class ApiService {
  constructor() {
    this.baseURL = 'https://api.zyro.com/v1'; // Replace with actual API URL
    this.timeout = 10000;
  }

  // Helper method for API calls
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

      // Mock responses for development
      return this.getMockResponse(endpoint, options);
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Network error occurred');
    }
  }

  // Mock response generator
  getMockResponse(endpoint, options) {
    const method = options.method || 'GET';
    
    // Authentication endpoints
    if (endpoint === '/auth/login' && method === 'POST') {
      return {
        success: true,
        data: {
          user: {
            id: 'user_123',
            email: options.body?.email || 'user@example.com',
            role: 'influencer',
            name: 'Ana García',
            verified: true,
            followers: 15000
          },
          token: 'mock_jwt_token_12345'
        }
      };
    }

    if (endpoint === '/auth/register' && method === 'POST') {
      return {
        success: true,
        message: 'Registration successful. Please check your email for verification.'
      };
    }

    // Collaborations endpoints
    if (endpoint === '/collaborations' && method === 'GET') {
      return {
        success: true,
        data: {
          collaborations: [
            {
              id: 1,
              title: 'Degustación Premium',
              business: 'Restaurante Elegance',
              category: 'restaurantes',
              city: 'Madrid',
              description: 'Experiencia gastronómica exclusiva con menú degustación de 7 platos.',
              requirements: 'Min. 10K seguidores IG',
              minFollowers: 10000,
              status: 'active',
              createdAt: '2025-01-15T10:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            pages: 1
          }
        }
      };
    }

    if (endpoint.startsWith('/collaborations/') && method === 'GET') {
      const id = endpoint.split('/')[2];
      return {
        success: true,
        data: {
          id: parseInt(id),
          title: 'Degustación Premium',
          business: 'Restaurante Elegance',
          category: 'restaurantes',
          city: 'Madrid',
          description: 'Experiencia gastronómica exclusiva con menú degustación de 7 platos.',
          requirements: 'Min. 10K seguidores IG',
          minFollowers: 10000,
          status: 'active',
          address: 'Calle Serrano 45, Madrid',
          phone: '+34 91 123 4567',
          email: 'reservas@elegance.com'
        }
      };
    }

    if (endpoint === '/collaborations/request' && method === 'POST') {
      return {
        success: true,
        data: {
          requestId: 'req_' + Date.now(),
          status: 'pending',
          message: 'Your collaboration request has been submitted successfully.'
        }
      };
    }

    // User profile endpoints
    if (endpoint === '/user/profile' && method === 'GET') {
      return {
        success: true,
        data: {
          id: 'user_123',
          name: 'Ana García',
          email: 'ana@example.com',
          role: 'influencer',
          instagram: '@ana_lifestyle',
          followers: 15000,
          verified: true,
          joinedAt: '2024-12-01T00:00:00Z'
        }
      };
    }

    if (endpoint === '/user/profile' && method === 'PUT') {
      return {
        success: true,
        message: 'Profile updated successfully'
      };
    }

    // Notifications endpoints
    if (endpoint === '/notifications' && method === 'GET') {
      return {
        success: true,
        data: {
          notifications: [
            {
              id: 1,
              type: 'collaboration_approved',
              title: '¡Colaboración Aprobada!',
              message: 'Tu solicitud para "Degustación Premium" ha sido aprobada.',
              read: false,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            }
          ],
          unreadCount: 1
        }
      };
    }

    // Analytics endpoints
    if (endpoint === '/analytics/dashboard' && method === 'GET') {
      return {
        success: true,
        data: {
          totalCollaborations: 45,
          activeCollaborations: 3,
          totalReach: 2100000,
          averageEngagement: 4.2,
          monthlyGrowth: 15.3
        }
      };
    }

    // Default response
    return {
      success: false,
      error: 'Endpoint not found'
    };
  }

  // Authentication methods
  async login(email, password) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async logout() {
    return this.makeRequest('/auth/logout', {
      method: 'POST'
    });
  }

  // Collaboration methods
  async getCollaborations(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    return this.makeRequest(`/collaborations?${queryParams}`);
  }

  async getCollaboration(id) {
    return this.makeRequest(`/collaborations/${id}`);
  }

  async requestCollaboration(collaborationId, requestData) {
    return this.makeRequest('/collaborations/request', {
      method: 'POST',
      body: JSON.stringify({ collaborationId, ...requestData })
    });
  }

  async getMyRequests() {
    return this.makeRequest('/collaborations/my-requests');
  }

  // User methods
  async getProfile() {
    return this.makeRequest('/user/profile');
  }

  async updateProfile(profileData) {
    return this.makeRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async uploadProfileImage(imageData) {
    return this.makeRequest('/user/profile/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: imageData
    });
  }

  // Notification methods
  async getNotifications() {
    return this.makeRequest('/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.makeRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async updateNotificationSettings(settings) {
    return this.makeRequest('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
  }

  // Analytics methods
  async getDashboardAnalytics() {
    return this.makeRequest('/analytics/dashboard');
  }

  async getCollaborationAnalytics(collaborationId) {
    return this.makeRequest(`/analytics/collaborations/${collaborationId}`);
  }

  // Company methods
  async getCompanyDashboard() {
    return this.makeRequest('/company/dashboard');
  }

  async createCampaign(campaignData) {
    return this.makeRequest('/company/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData)
    });
  }

  async getCampaignRequests(campaignId) {
    return this.makeRequest(`/company/campaigns/${campaignId}/requests`);
  }

  async approveRequest(requestId) {
    return this.makeRequest(`/company/requests/${requestId}/approve`, {
      method: 'PUT'
    });
  }

  async rejectRequest(requestId, reason) {
    return this.makeRequest(`/company/requests/${requestId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Admin methods
  async getAdminDashboard() {
    return this.makeRequest('/admin/dashboard');
  }

  async getPendingApprovals() {
    return this.makeRequest('/admin/approvals/pending');
  }

  async approveUser(userId) {
    return this.makeRequest(`/admin/users/${userId}/approve`, {
      method: 'PUT'
    });
  }

  async rejectUser(userId, reason) {
    return this.makeRequest(`/admin/users/${userId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Payment methods
  async createPaymentIntent(amount, currency = 'EUR') {
    return this.makeRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify({ amount, currency })
    });
  }

  async confirmPayment(paymentIntentId) {
    return this.makeRequest('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ paymentIntentId })
    });
  }

  async getPaymentHistory() {
    return this.makeRequest('/payments/history');
  }

  // Search methods
  async searchCollaborations(query, filters = {}) {
    return this.makeRequest('/search/collaborations', {
      method: 'POST',
      body: JSON.stringify({ query, filters })
    });
  }

  async getSearchSuggestions(query) {
    return this.makeRequest(`/search/suggestions?q=${encodeURIComponent(query)}`);
  }
}

export default new ApiService();