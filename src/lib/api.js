const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://aajexam.com' : 'http://localhost:5000');

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

  // Build query string without undefined/null/empty values
  buildQuery(params = {}) {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const str = String(value).trim();
      if (str.length === 0 || str === 'undefined' || str === 'null') return;
      qp.set(key, str);
    });
    return qp.toString();
  }

  async request(endpoint, options = {}) {
    // Determine the effective base URL
    let effectiveBaseURL = this.baseURL;

    // Server-side fetch requires absolute URLs
    if (typeof window === 'undefined' && (!effectiveBaseURL || effectiveBaseURL.startsWith('/'))) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      effectiveBaseURL = `${siteUrl.replace(/\/$/, '')}${effectiveBaseURL}`;
    }

    // Remove duplicate /api if baseURL already ends with /api
    let finalEndpoint = endpoint;
    if (effectiveBaseURL.endsWith('/api') && endpoint.startsWith('/api/')) {
      finalEndpoint = endpoint.replace(/^\/api\//, '/');
    }
    const url = `${effectiveBaseURL}${finalEndpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (process.env.NODE_ENV !== 'production') {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      console.log('🔑 Token:', token ? 'Present' : 'Missing');

      // Debug JWT token content
      if (token) {
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            console.log('🔍 JWT Payload:', payload);
            console.log('🔍 JWT User ID:', payload.id);
            console.log('🔍 JWT Role:', payload.role);
          }
        } catch (e) {
          console.log('🔍 JWT Decode Error:', e.message);
        }
      }
    }

    const isFormData = options && options.body && typeof FormData !== 'undefined' && options.body instanceof FormData;

    const defaultHeaders = isFormData
      ? { ...(token && { Authorization: `Bearer ${token}` }) }
      : { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
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
          if (response.status !== 404) {
            console.error('❌ API Error1:', response);
          }
        }

        const error = new Error();
        error.response = { status: response.status, data };
        const dataObj = typeof data === 'object' && data !== null ? data : {};
        error.message = dataObj.message || dataObj.error || `HTTP ${response.status}: ${response.statusText}`;
        throw error;
      }

      return data;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        if (error.response?.status !== 404 && error.status !== 404) {
          console.error('💥 API Error2:', error);
        }
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

  async changePassword(data) {
    return this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ===== STUDENT ENDPOINTS =====
  async claimRewards() {
    return this.request('/api/wallet/claim', {
      method: 'POST'
    });
  }

  async getProfile() {
    return this.request('/api/student/profile');
  }

  async getAnalytics() {
    return this.request('/api/student/analytics');
  }

  async getAnalyticsReport() {
    return this.request('/api/analytics/report');
  }

  async getDailyDose() {
    return this.request('/api/daily-dose');
  }

  async getStudyMaterials(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/study-materials${query ? `?${query}` : ''}`);
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

  async getPaymentData(txnid) {
    return this.request(`/api/subscription/payment-data/${txnid}`);
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
  async getPublicCategories() {
    return this.request('/api/public/categories');
  }

  async getPublicLandingStats() {
    return this.request('/api/public/landing-stats');
  }

  async getPublicCategoriesEnhanced() {
    return this.request('/api/public/categories-enhanced');
  }

  async getPublicSitemapData() {
    return this.request('/api/public/sitemap-data');
  }

  // Exams - Public
  async getPublicExams(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/public/exams${queryString ? `?${queryString}` : ''}`);
  }

  async getExamPreview(examId) {
    return this.request(`/api/public/exams/${examId}/preview`);
  }

  // ===== ANALYTICS ENDPOINTS =====
  async getAnalyticsDashboard() {
    return this.request('/api/admin/analytics/dashboard');
  }

  async getUserAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/users?${queryString}`);
  }

  async getFinancialAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/financial?${queryString}`);
  }

  async getPerformanceAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/performance?${queryString}`);
  }

  async getMonthlyProgressAnalytics(month = null) {
    const params = month ? { month } : {};
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/monthly-progress?${queryString}`);
  }

  async getIndividualUserAnalytics(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/users/${userId}/full?${queryString}`);
  }

  async getAdminTopPerformers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/top-performers?${queryString}`);
  }

  async getAdminAllUsersSummary() {
    return this.request('/api/admin/analytics/all-users-summary');
  }

  async getAdminUsersWithEarnings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('/api/admin/analytics/users-with-earnings?' + queryString);
  }

  // ===== ADMIN ENDPOINTS =====

  // Admin Notifications
  async getAdminLatestNotifications(limit = 10, { unreadOnly = true } = {}) {
    const u = unreadOnly ? '1' : '0';
    const params = new URLSearchParams({ limit, unread: u }).toString();
    return this.request(`/api/admin/notifications/latest?${params}`);
  }
  async getAdminNotifications(page = 1, limit = 20, { unreadOnly = true } = {}) {
    const u = unreadOnly ? '1' : '0';
    const params = new URLSearchParams({ page, limit, unread: u }).toString();
    return this.request(`/api/admin/notifications?${params}`);
  }
  async markAdminNotificationRead(id) {
    return this.request(`/api/admin/notifications/${id}/read`, { method: 'PATCH' });
  }
  async clearAdminNotifications() {
    return this.request(`/api/admin/notifications`, { method: 'DELETE' });
  }

  // Admin User Wallets
  async adminGetUserWallets(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/user-wallets?${queryString}`);
  }

  async resetClaimableRewards() {
    return this.request('/api/admin/user-wallets/reset-claimable-rewards', {
      method: 'POST'
    });
  }

  // Categories
  async getAdminCategories(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/admin/categories?${queryString}`);
  }

  async createCategory(categoryData) {
    return this.request('/api/admin/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteCategory(id) {
    return this.request(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Subcategories
  async getAdminSubcategories(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/admin/subcategories?${queryString}`);
  }

  async createSubcategory(subcategoryData) {
    return this.request('/api/admin/subcategories', {
      method: 'POST',
      body: JSON.stringify(subcategoryData)
    });
  }

  async updateSubcategory(id, subcategoryData) {
    return this.request(`/api/admin/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subcategoryData)
    });
  }

  async deleteSubcategory(id) {
    return this.request(`/api/admin/subcategories/${id}`, {
      method: 'DELETE'
    });
  }

  // Questions
  async getAdminQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/questions?${queryString}`);
  }

  async createQuestion(questionData) {
    return this.request('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  }

  // ===== PRO USER QUESTIONS =====
  async createUserQuestion(payload) {
    return this.request('/api/userQuestions/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async getCurrentMonthQuestionCount(userId) {
    return this.request(`/api/userQuestions/monthly-count/${userId}`);
  }

  async getCurrentDayQuestionCount(userId) {
    return this.request(`/api/userQuestions/daily-count/${userId}`);
  }

  async getMyUserQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/userQuestions/mine/list?${queryString}`);
  }

  // ===== BLOG =====
  async createBlog(blogData) {
    const form = new FormData();
    Object.entries(blogData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'tags' && Array.isArray(value)) {
        if (value.length > 0) {
          value.forEach(tag => form.append('tags[]', tag));
        }
      } else if (key === 'featuredImageFile' && value instanceof File) {
        form.append('featuredImageFile', value);
      } else {
        form.append(key, value);
      }
    });

    return this.request('/api/blog', {
      method: 'POST',
      body: form
    });
  }

  async getCurrentMonthBlogCount() {
    return this.request('/api/blog/monthly-count');
  }

  async getMyBlogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/blog/my${queryString ? `?${queryString}` : ''}`);
  }

  async getMyBlog(id) {
    return this.request(`/api/blog/my/${id}`);
  }

  async updateBlog(id, blogData) {
    const formData = new FormData();
    Object.keys(blogData).forEach(key => {
      if (key !== 'featuredImageFile' && blogData[key] !== null && blogData[key] !== undefined) {
        if (Array.isArray(blogData[key])) {
          formData.append(key, JSON.stringify(blogData[key]));
        } else {
          formData.append(key, blogData[key]);
        }
      }
    });
    if (blogData.featuredImageFile) {
      formData.append('featuredImageFile', blogData.featuredImageFile);
    }
    return this.request(`/api/blog/my/${id}`, {
      method: 'PUT',
      body: formData
    });
  }

  async deleteBlog(id) {
    return this.request(`/api/blog/my/${id}`, {
      method: 'DELETE'
    });
  }

  async getPublicUserQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/userQuestions/public/list?${queryString}`);
  }

  async answerUserQuestion(id, selectedOptionIndex) {
    return this.request(`/api/userQuestions/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionIndex })
    });
  }

  async likeUserQuestion(id) {
    return this.request(`/api/userQuestions/${id}/like`, {
      method: 'POST'
    });
  }

  async shareUserQuestion(id) {
    return this.request(`/api/userQuestions/${id}/share`, {
      method: 'POST'
    });
  }

  async incrementUserQuestionView(id) {
    return this.request(`/api/userQuestions/${id}/view`, { method: 'POST' });
  }

  async getUserQuestionById(id) {
    return this.request(`/api/userQuestions/${id}`);
  }

  async updateQuestion(id, questionData) {
    return this.request(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  }

  async deleteQuestion(id) {
    return this.request(`/api/admin/questions/${id}`, {
      method: 'DELETE'
    });
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

  async adminCreateSubscription(data) {
    return this.request('/api/admin/subscriptions/create', {
      method: 'POST',
      body: JSON.stringify(data)
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

  // Admin User Details (with social links)
  async getAdminUserDetails(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/user-details?${queryString}`);
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

  // Referral System APIs
  async getReferralDashboard(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/referrals?${queryString}`);
  }

  async getAdminReferralHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/referral-history?${queryString}`);
  }

  async getAdminBlogRewardsHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/blog-rewards-history?${queryString}`);
  }

  async getReferralWithdrawRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/referral-withdraw-requests?${queryString}`);
  }

  async updateReferralWithdrawStatus(id, status) {
    return this.request(`/api/admin/referral-withdraw-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async toggleTopPerformer(userId, isTopPerformer) {
    return this.request(`/api/admin/users/${userId}/top-performer`, {
      method: 'PUT',
      body: JSON.stringify({ isTopPerformer }),
    });
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

  async extendUserSubscription(userId, data) {
    return this.request(`/api/admin/subscriptions/${userId}/extend`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // ===== ADMIN ARTICLES =====
  async getAdminArticles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/articles?${queryString}`);
  }

  async getAdminArticle(id) {
    return this.request(`/api/admin/articles/${id}`);
  }

  async getAdminUserBlogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/user-blogs?${queryString}`);
  }

  async createArticle(articleData) {
    const form = new FormData();
    Object.entries(articleData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => form.append('tags[]', tag));
      } else {
        form.append(key, value);
      }
    });
    return this.request('/api/admin/articles', {
      method: 'POST',
      body: form
    });
  }

  async updateArticle(id, articleData) {
    const form = new FormData();
    Object.entries(articleData).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'tags' && Array.isArray(value)) {
        value.forEach(tag => form.append('tags[]', tag));
      } else {
        form.append(key, value);
      }
    });
    return this.request(`/api/admin/articles/${id}`, {
      method: 'PUT',
      body: form
    });
  }

  async deleteArticle(id) {
    return this.request(`/api/admin/articles/${id}`, {
      method: 'DELETE'
    });
  }

  async publishArticle(id) {
    return this.request(`/api/admin/articles/${id}/publish`, {
      method: 'PATCH'
    });
  }

  async unpublishArticle(id) {
    return this.request(`/api/admin/articles/${id}/unpublish`, {
      method: 'PATCH'
    });
  }

  async toggleFeatured(id) {
    return this.request(`/api/admin/articles/${id}/toggle-featured`, {
      method: 'PATCH'
    });
  }

  async togglePinned(id) {
    return this.request(`/api/admin/articles/${id}/toggle-pinned`, {
      method: 'PATCH'
    });
  }

  async getArticleStats() {
    return this.request('/api/admin/articles-stats');
  }

  // ===== PUBLIC ARTICLES =====
  async getPublishedArticles(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/public/articles?${queryString}`);
  }

  async getFeaturedArticles(limit = 5) {
    const queryString = new URLSearchParams({ limit }).toString();
    return this.request(`/api/public/articles/featured?${queryString}`);
  }

  async getArticleBySlug(slug) {
    return this.request(`/api/public/articles/${slug}`);
  }

  async getArticlesByCategory(categoryId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/public/articles/category/${categoryId}?${queryString}`);
  }

  async getArticlesByTag(tag, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/public/articles/tag/${encodeURIComponent(tag)}?${queryString}`);
  }

  async searchArticles(query, params = {}) {
    const searchParams = new URLSearchParams({ q: query, ...params }).toString();
    return this.request(`/api/public/articles/search?${searchParams}`);
  }

  async incrementArticleViews(id) {
    return this.request(`/api/public/articles/${id}/view`, {
      method: 'POST'
    });
  }

  async incrementArticleLikes(id) {
    return this.request(`/api/public/articles/${id}/like`, {
      method: 'POST'
    });
  }

  // Student Rewards
  async getStudentRewards(userId) {
    return this.request(`/api/student/rewards/${userId}`);
  }

  async claimReward(rewardId) {
    return this.request(`/api/student/rewards/${rewardId}/claim`, {
      method: 'POST'
    });
  }

  // Student Notifications
  async getStudentNotifications() {
    return this.request('/api/student/notifications');
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/api/student/notifications/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/api/student/notifications/${notificationId}`, {
      method: 'DELETE'
    });
  }

  // ===== CONTACT ENDPOINTS =====
  async submitContactForm(contactData) {
    return this.request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  // ===== USER WALLET =====
  async getUserWallet(userId) {
    return this.request(`/api/userWallet/${userId}`);
  }

  async getWalletDetails() {
    return this.request('/api/wallet/details');
  }

  async getReferralHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/wallet/referral-history${queryString ? `?${queryString}` : ''}`);
  }

  async getBlogRewardsHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/wallet/blog-rewards-history${queryString ? `?${queryString}` : ''}`);
  }

  // Question Rewards History (User)
  async getQuestionRewardsHistory(params) {
    const query = this.buildQuery(params);
    return this.request(`/api/proUser/question/rewards-history${query ? `?${query}` : ''}`);
  }

  async getWithdrawalHistory(params) {
    const query = this.buildQuery(params);
    return this.request(`/api/proUser/withdraw-history${query ? `?${query}` : ''}`);
  }

  async createReferralWithdrawRequest(payload) {
    return this.request('/api/wallet/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  async createWithdrawRequest(payload) {
    return this.request('/api/withdrawRequests/create', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  // ===== ADMIN WITHDRAW REQUESTS =====
  async getAdminWithdrawRequests(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/withdrawRequests?${queryString}`);
  }

  async updateWithdrawRequestStatus(id, status) {
    return this.request(`/api/admin/withdrawRequests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ===== ADMIN USER QUESTIONS =====
  async getAdminUserQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/userQuestions?${queryString}`);
  }

  async updateUserQuestionStatus(id, status) {
    return this.request(`/api/admin/userQuestions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  // ===== GOVT EXAMS =====
  // Preserving custom routes for aajexam backend alignment
  async getAdminExams(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/real-exams/admin/exams${queryString ? `?${queryString}` : ''}`);
  }

  async createExam(examData) {
    return this.request('/api/real-exams/admin/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  }

  async updateExam(id, examData) {
    return this.request(`/api/real-exams/admin/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData)
    });
  }

  async deleteExam(id) {
    return this.request(`/api/real-exams/admin/exams/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories
  async getRealExamCategories() {
    return this.request('/api/real-exams/categories');
  }

  async createExamCategory(categoryData) {
    return this.request('/api/real-exams/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData)
    });
  }

  async updateExamCategory(id, categoryData) {
    return this.request(`/api/real-exams/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(categoryData)
    });
  }

  async deleteExamCategory(id) {
    return this.request(`/api/real-exams/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Exams (Public/Student)
  async getExamsByCategory(categoryId) {
    return this.request(`/api/real-exams/categories/${categoryId}/exams`);
  }

  // Exam Patterns
  async getPatternsByExam(examId) {
    return this.request(`/api/real-exams/exams/${examId}/patterns`);
  }

  async createExamPattern(patternData) {
    return this.request('/api/real-exams/patterns', {
      method: 'POST',
      body: JSON.stringify(patternData)
    });
  }

  async updateExamPattern(id, patternData) {
    return this.request(`/api/real-exams/patterns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patternData)
    });
  }

  async deleteExamPattern(id) {
    return this.request(`/api/real-exams/patterns/${id}`, {
      method: 'DELETE'
    });
  }

  // Practice Tests
  async getTestsByPattern(patternId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/real-exams/patterns/${patternId}/tests${queryString ? `?${queryString}` : ''}`);
  }

  async createPracticeTest(testData) {
    return this.request('/api/real-exams/tests', {
      method: 'POST',
      body: JSON.stringify(testData)
    });
  }

  async updatePracticeTest(id, testData) {
    return this.request(`/api/real-exams/tests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testData)
    });
  }

  async deletePracticeTest(id) {
    return this.request(`/api/real-exams/tests/${id}`, {
      method: 'DELETE'
    });
  }

  // User Test Attempts & Results
  async startPracticeTest(testId) {
    return this.request(`/api/real-exams/tests/${testId}/start`);
  }

  async saveTestAnswers(testId, attemptId, answers) {
    return this.request(`/api/real-exams/tests/${testId}/save`, {
      method: 'POST',
      body: JSON.stringify({ attemptId, answers })
    });
  }

  async submitTest(testId, answers) {
    return this.request(`/api/real-exams/tests/${testId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  }

  async getUserTestResults(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/real-exams/user/${userId}/results${queryString ? `?${queryString}` : ''}`);
  }

  async getTestAttemptDetail(testId, attemptId) {
    return this.request(`/api/real-exams/tests/${testId}/attempts/${attemptId}`);
  }

  async getExamAttemptHistory(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/real-exams/exam-attempt-history${queryString ? `?${queryString}` : ''}`);
  }

  async getTestLeaderboard(testId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/real-exams/tests/${testId}/leaderboard${queryString ? `?${queryString}` : ''}`);
  }

  // Admin - Attempts & Analytics
  async getAdminAllAttempts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/real-exams/admin/attempts${queryString ? `?${queryString}` : ''}`);
  }

  async getAdminAttemptDetails(attemptId) {
    return this.request(`/api/real-exams/admin/attempts/${attemptId}`);
  }

  // ===== EXPENSE ENDPOINTS =====
  async getAdminExpenses(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/expenses?${queryString}`);
  }

  async getAdminExpenseById(id) {
    return this.request(`/api/expenses/${id}`);
  }

  async createAdminExpense(expenseData) {
    return this.request('/api/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData)
    });
  }

  async updateAdminExpense(id, expenseData) {
    return this.request(`/api/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(expenseData)
    });
  }

  async deleteAdminExpense(id) {
    return this.request(`/api/expenses/${id}`, {
      method: 'DELETE'
    });
  }

  async getAdminExpenseSummary() {
    return this.request('/api/expenses/summary');
  }

  // ===== WALLET & REWARDS ENDPOINTS =====
  async getWalletData() {
    if (this._walletFetchPromise) return this._walletFetchPromise;

    this._walletFetchPromise = this.request('/api/wallet').finally(() => {
      // Clear the promise after a short delay to deduplicate rapid successive calls
      setTimeout(() => {
        this._walletFetchPromise = null;
      }, 500);
    });

    return this._walletFetchPromise;
  }

  async claimRewards() {
    return this.request('/api/wallet/claim', {
      method: 'POST'
    });
  }
}

const API = new ApiService();
export default API;

