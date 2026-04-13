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

        // Handle 401 Unauthorized — clear auth and redirect to login
        if (response.status === 401 && typeof window !== 'undefined') {
          const authKeys = ['token', 'refreshToken', 'authToken', 'userInfo', 'userData'];
          authKeys.forEach(key => localStorage.removeItem(key));
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return { success: false, message: 'Session expired' };
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
  async getProfile() {
    return this.request('/api/student/profile');
  }

  async getAnalytics() {
    return this.request('/api/student/analytics');
  }

  async getAnalyticsReport() {
    if (this._analyticsReportPromise) return this._analyticsReportPromise;

    this._analyticsReportPromise = this.request('/api/analytics/report').finally(() => {
      setTimeout(() => {
        this._analyticsReportPromise = null;
      }, 2000);
    });

    return this._analyticsReportPromise;
  }

  async getDailyDose() {
    if (this._dailyDosePromise) return this._dailyDosePromise;

    this._dailyDosePromise = this.request('/api/daily-dose').finally(() => {
      setTimeout(() => {
        this._dailyDosePromise = null;
      }, 2000);
    });

    return this._dailyDosePromise;
  }

  async getStudyMaterials(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/study-materials${query ? `?${query}` : ''}`);
  }

  // ===== QUIZ ENDPOINTS =====
  async getQuizzes(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/quiz/quizzes${query ? `?${query}` : ''}`);
  }

  async getQuizById(id) {
    return this.request(`/api/quiz/quizzes/${id}`);
  }

  async startQuiz(quizId) {
    return this.request(`/api/quiz/quizzes/${quizId}/start`, { method: 'POST' });
  }

  async submitQuiz(quizId, { attemptId, answers, totalTime }) {
    return this.request(`/api/quiz/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ attemptId, answers, totalTime })
    });
  }

  async getQuizLeaderboard(quizId, limit = 20) {
    return this.request(`/api/quiz/quizzes/${quizId}/leaderboard?limit=${limit}`);
  }

  async getMyQuizAttempts(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/quiz/my-attempts${query ? `?${query}` : ''}`);
  }

  async getQuizAttemptDetail(attemptId) {
    return this.request(`/api/quiz/my-attempts/${attemptId}`);
  }

  async getSubjectsForExam(examId) {
    return this.request(`/api/quiz/subjects?exam=${examId}`);
  }

  async getTopicsForSubject(subjectId) {
    return this.request(`/api/quiz/topics?subject=${subjectId}`);
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
  async getPublicLandingStats() {
    return this.request('/api/public/landing-stats');
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

  async getIndividualUserAnalytics(userId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/admin/analytics/users/${userId}/full?${queryString}`);
  }

  async getAdminAllUsersSummary() {
    return this.request('/api/admin/analytics/all-users-summary');
  }

  async getAdminUsersWithEarnings(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request('/api/admin/analytics/users-with-earnings?' + queryString);
  }

  // ===== ADMIN ENDPOINTS =====

  async getAdminStats() {
    return this.request('/api/admin/stats');
  }

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

  // ===== BLOG ENDPOINTS (Admin) =====
  async getAdminBlogs(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/admin/blogs${query ? `?${query}` : ''}`);
  }

  async getAdminBlog(id) {
    return this.request(`/api/admin/blogs/${id}`);
  }

  async createBlog(blogData) {
    if (blogData.featuredImageFile) {
      const formData = new FormData();
      Object.entries(blogData).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          value.forEach(tag => formData.append('tags[]', tag));
        } else if (key === 'featuredImageFile') {
          formData.append('featuredImageFile', value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return this.request('/api/admin/blogs', { method: 'POST', body: formData });
    }
    return this.request('/api/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(blogData)
    });
  }

  async updateBlog(id, blogData) {
    if (blogData.featuredImageFile) {
      const formData = new FormData();
      Object.entries(blogData).forEach(([key, value]) => {
        if (key === 'tags' && Array.isArray(value)) {
          value.forEach(tag => formData.append('tags[]', tag));
        } else if (key === 'featuredImageFile') {
          formData.append('featuredImageFile', value);
        } else if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      return this.request(`/api/admin/blogs/${id}`, { method: 'PUT', body: formData });
    }
    return this.request(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(blogData)
    });
  }

  async deleteBlog(id) {
    return this.request(`/api/admin/blogs/${id}`, { method: 'DELETE' });
  }

  async publishBlog(id) {
    return this.request(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' })
    });
  }

  async unpublishBlog(id) {
    return this.request(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'draft' })
    });
  }

  async toggleBlogFeatured(id) {
    const res = await this.request(`/api/admin/blogs/${id}`);
    const blog = res.blog;
    return this.request(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isFeatured: !blog.isFeatured })
    });
  }

  async toggleBlogPinned(id) {
    const res = await this.request(`/api/admin/blogs/${id}`);
    const blog = res.blog;
    return this.request(`/api/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isPinned: !blog.isPinned })
    });
  }

  // ===== BLOG ENDPOINTS (Public) =====
  async getPublishedBlogs(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/public/blogs${query ? `?${query}` : ''}`);
  }

  async getFeaturedBlogs(limit = 5) {
    return this.request(`/api/public/blogs/featured?limit=${limit}`);
  }

  async getBlogBySlug(slug) {
    return this.request(`/api/public/blogs/${slug}`);
  }

  async getBlogsByExam(examId, params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/public/blogs/exam/${examId}${query ? `?${query}` : ''}`);
  }

  async searchBlogs(q, params = {}) {
    const query = this.buildQuery({ q, ...params });
    return this.request(`/api/public/blogs/search?${query}`);
  }

  async incrementBlogViews(id) {
    return this.request(`/api/public/blogs/${id}`, { method: 'POST' });
  }

  async incrementBlogLikes(id) {
    return this.request(`/api/public/blogs/${id}/like`, { method: 'POST' });
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

  // ===== COMMUNITY QUESTIONS =====
  async getCommunityQuestions(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/community-questions${query ? `?${query}` : ''}`);
  }

  async getMyCommunityQuestions(params = {}) {
    const query = this.buildQuery(params);
    return this.request(`/api/community-questions/my${query ? `?${query}` : ''}`);
  }

  async getCommunityQuestion(id) {
    return this.request(`/api/community-questions/${id}`);
  }

  async createCommunityQuestion(data) {
    return this.request('/api/community-questions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async deleteCommunityQuestion(id) {
    return this.request(`/api/community-questions/${id}`, {
      method: 'DELETE'
    });
  }

  async toggleCommunityQuestionLike(id) {
    return this.request(`/api/community-questions/${id}/like`, {
      method: 'POST'
    });
  }

  // ===== REELS - PUBLIC/USER =====
  async getReelsFeed(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/reels/feed${queryString ? `?${queryString}` : ''}`);
  }

  async searchReels({ query = '', page = 1, limit = 20 } = {}) {
    const queryString = this.buildQuery({ query, page, limit });
    return this.request(`/api/reels/search${queryString ? `?${queryString}` : ''}`);
  }

  async getReelById(id) {
    return this.request(`/api/reels/${id}`);
  }

  async createReel(reelData) {
    return this.request('/api/reels/create', {
      method: 'POST',
      body: JSON.stringify(reelData)
    });
  }

  async likeReel(id) {
    return this.request(`/api/reels/${id}/like`, { method: 'POST' });
  }

  async bookmarkReel(id) {
    return this.request(`/api/reels/${id}/bookmark`, { method: 'POST' });
  }

  async answerReel(id, selectedOptionIndex) {
    return this.request(`/api/reels/${id}/answer`, {
      method: 'POST',
      body: JSON.stringify({ selectedOptionIndex })
    });
  }

  async viewReel(id, timeSpentSeconds = 0) {
    return this.request(`/api/reels/${id}/view`, {
      method: 'POST',
      body: JSON.stringify({ timeSpentSeconds })
    });
  }

  async shareReel(id) {
    return this.request(`/api/reels/${id}/share`, { method: 'POST' });
  }

  async voteReelPoll(id, optionIndex) {
    return this.request(`/api/reels/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex })
    });
  }

  async getBookmarkedReels(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/reels/bookmarked${queryString ? `?${queryString}` : ''}`);
  }

  async getTrendingReels(limit = 12) {
    return this.request(`/api/reels/trending?limit=${limit}`);
  }

  async getMyReels(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/reels/mine${queryString ? `?${queryString}` : ''}`);
  }

  async getReelsFilterOptions() {
    return this.request('/api/reels/stats');
  }

  async getReelAudioList() {
    return this.request('/api/reels/audio');
  }

  // ===== REELS - ADMIN =====
  async getAdminReels(params = {}) {
    const queryString = this.buildQuery(params);
    return this.request(`/api/admin/reels${queryString ? `?${queryString}` : ''}`);
  }

  async updateAdminReel(id, data) {
    return this.request(`/api/admin/reels/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteAdminReel(id) {
    return this.request(`/api/admin/reels/${id}`, { method: 'DELETE' });
  }

  async getAdminReelsAnalytics() {
    return this.request('/api/admin/reels/analytics');
  }
}

const API = new ApiService();
export default API;

