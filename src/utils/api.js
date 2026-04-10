const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Validate API configuration
if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set in production. Using fallback URL:', API_BASE_URL);
}

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 API Service initialized with base URL:', this.baseURL);
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');
    }

    const isFormData = options && options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;

    const defaultHeaders = {
      'Content-Type': isFormData ? undefined : 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Ensure headers is always an object and remove undefined values
    const headers = {
      ...defaultHeaders,
      ...(options.headers || {}),
    };

    // Remove undefined values from headers
    Object.keys(headers).forEach(key => {
      if (headers[key] === undefined) {
        delete headers[key];
      }
    });

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`📡 Response status: ${response.status}`);
      }

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      if (process.env.NODE_ENV !== 'production') {
        console.log('📦 Response data:', data);
      }

      if (!response.ok) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('❌ API Error1:', response);
        }

        const error = new Error();
        error.response = { status: response.status, data };
        error.message = data.message || data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw error;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('💥 API Error2:', error);
      }

      if (error.response) {
        throw error;
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        const networkError = new Error('Network error: Unable to connect to server. Please check your internet connection.');
        networkError.isNetworkError = true;
        throw networkError;
      }

      if (!error.message) {
        error.message = 'An unexpected error occurred. Please try again.';
      }

      throw error;
    }
  }

  // ===== AUTH ENDPOINTS =====
  async login(credentials) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async googleAuth(googleData) {
    return this.request('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData)
    });
  }

  async updateProfile(profileData) {
    return this.request('/api/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async resetPassword(data) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ===== STUDENT ENDPOINTS =====
  async getProfile() {
    return this.request('/api/student/profile');
  }

  // ===== SEARCH ENDPOINTS =====
  async searchAll({ query = '', page = 1, limit = 12 }) {
    const searchQuery = new URLSearchParams({ query, page, limit }).toString();
    return this.request(`/api/search?${searchQuery}`);
  }

  // ===== SUBSCRIPTION ENDPOINTS =====
  async getSubscriptionStatus(userId) {
    return this.request(`/api/subscription/status/${userId}`);
  }

  async getSubscriptionTransactions(userId) {
    return this.request(`/api/subscription/transactions/${userId}`);
  }

  // Get user payment transactions with filtering (authenticated user only)
  async getUserPaymentTransactions(filters = {}) {
    const queryParams = new URLSearchParams();

    if (filters.month) queryParams.set('month', filters.month);
    if (filters.year) queryParams.set('year', filters.year);
    if (filters.type) queryParams.set('type', filters.type);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.limit) queryParams.set('limit', filters.limit);
    if (filters.page) queryParams.set('page', filters.page);

    const queryString = queryParams.toString();
    const endpoint = `/api/subscription/payment-transactions${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Get transaction filter options (months, years) (authenticated user only)
  async getTransactionFilterOptions() {
    return this.request('/api/subscription/transaction-filters');
  }

  // ===== PAYU PAYMENT ENDPOINTS =====
  async createPayuSubscriptionOrder(orderData) {
    return this.request('/api/subscription/create-payu-order', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async verifyPayuSubscription(verificationData) {
    return this.request('/api/subscription/verify-payu', {
      method: 'POST',
      body: JSON.stringify(verificationData)
    });
  }

  // ===== BANK DETAILS ENDPOINTS =====
  async saveBankDetails(bankData) {
    return this.request('/api/bank-details', {
      method: 'POST',
      body: JSON.stringify(bankData)
    });
  }

  async getBankDetails() {
    try {
      return await this.request('/api/bank-details/my-details');
    } catch (err) {
      if (err?.response?.status === 404) {
        // Normalize "not found" to a non-throwing response
        return { success: true, bankDetail: null };
      }
      throw err;
    }
  }

  // ===== PUBLIC ENDPOINTS =====
  async getPublicLandingStats() {
    return this.request('/api/public/landing-stats');
  }

  async getPublicLevels() {
    return this.request('/api/public/levels');
  }

  // ===== ANALYTICS ENDPOINTS =====
  async getAnalyticsDashboard() {
    return this.request('/api/analytics/dashboard');
  }

  async getUserAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/users?${queryString}`);
  }

  async getFinancialAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/financial?${queryString}`);
  }

  async getIndividualUserAnalytics(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/individual-user/${userId}?${queryString}`);
  }

  // ===== ADMIN ENDPOINTS =====
  async getAdminStats() {
    console.log('🔍 Calling getAdminStats...');
    try {
      const result = await this.request('/api/admin/stats');
      console.log('✅ getAdminStats result:', result);
      return result;
    } catch (error) {
      console.error('❌ getAdminStats error:', error);
      throw error;
    }
  }

  // Students
  async getAdminStudents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/students?${queryString}`);
  }

  async updateStudent(id, studentData) {
    return this.request(`/api/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(id) {
    return this.request(`/api/admin/students/${id}`, {
      method: 'DELETE'
    });
  }

  // Contacts
  async getAdminContacts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/contacts?${queryString}`);
  }

  async deleteContact(id) {
    return this.request(`/api/admin/contacts/${id}`, {
      method: 'DELETE'
    });
  }

  // Badges
  async assignBadge(studentId, badge) {
    return this.request('/api/admin/assign-badge', {
      method: 'POST',
      body: JSON.stringify({ studentId, badge })
    });
  }

  // Admin Bank Details
  async getAdminBankDetails(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/bank-details?${queryString}`);
  }

  // Admin Payment Transactions
  async getAdminPaymentTransactions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/payment-transactions?${queryString}`);
  }

  async getAdminTransactionSummary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/payment-transactions/summary?${queryString}`);
  }

  async getAdminTransactionFilterOptions() {
    return this.request('/api/admin/payment-transactions/filter-options');
  }

  // Admin Subscriptions
  async getAdminSubscriptions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/subscriptions?${queryString}`);
  }

  async getAdminSubscriptionSummary(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/subscriptions/summary?${queryString}`);
  }

  async getAdminSubscriptionFilterOptions() {
    return this.request('/api/admin/subscriptions/filter-options');
  }

}

const API = new ApiService();
export default API;
