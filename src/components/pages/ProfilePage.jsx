import { useEffect, useState, useCallback, useRef } from 'react';
import Head from 'next/head';
import API from '../../lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { handleAuthError } from '../../lib/utils/authUtils';
import { toast } from 'react-hot-toast';
import { useRewards } from '../../hooks/useRewards';
import useDebounce from '../../hooks/useDebounce';
import MonthlyRewardsInfo from '../MonthlyRewardsInfo';
import config from '../../lib/config/appConfig';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaCrown,
  FaTrophy,
  FaMedal,
  FaStar,
  FaBrain,
  FaAward,
  FaArrowRight,
  FaChartLine,
  FaFire,
  FaBookOpen,
  FaUserGraduate,
  FaMagic,
  FaUniversity,
  FaGraduationCap,
  FaSave,
  FaMoneyCheckAlt,
  FaEdit,
  FaCheckCircle,
  FaBuilding,
  FaKey,
  FaPlus,
  FaRocket,
  FaGem,
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaPencilAlt,
  FaStickyNote,
  FaSearch,
  FaMoneyBill,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { getSubscriptionStatusTextWithTheme, hasActiveSubscription } from '../../lib/utils/subscriptionUtils';
import ShareComponent from '../ShareComponent';
// MobileAppWrapper import removed
import PaymentTransactions from '../PaymentTransactions';
import UnifiedNavbar from '../UnifiedNavbar';
import UnifiedFooter from '../UnifiedFooter';
import Loading from '../Loading';
import Seo from '../Seo';

// Level badge icon mapping
const levelBadgeIcons = {
  'Starter': FaUserGraduate,
  'Rookie': FaStar,
  'Explorer': FaRocket,
  'Thinker': FaBrain,
  'Strategist': FaChartLine,
  'Achiever': FaAward,
  'Mastermind': FaGem,
  'Champion': FaTrophy,
  'Prodigy': FaMedal,
  'Wizard': FaMagic,
  'Legend': FaCrown,
  Default: FaStar,
};

const ProfilePage = () => {
  const router = useRouter();
  const [student, setStudent] = useState(null);
  const [playedQuizzes, setPlayedQuizzes] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [error, setError] = useState('');
  const [bankDetails, setBankDetails] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  console.log(student, 'student')
  // Get rewards data
  const { rewards: rewardsData, loading: rewardsLoading } = useRewards();
  console.log(rewardsData, 'rewardsData')
  // Edit Profile State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    socialLinks: {
      instagram: '',
      facebook: '',
      x: '',
      youtube: ''
    }
  });
  const [editProfileErrors, setEditProfileErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Username validation state
  const [usernameValidation, setUsernameValidation] = useState({
    isChecking: false,
    isAvailable: null,
    suggestions: [],
    message: ''
  });

  const [bankFormData, setBankFormData] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: '',
    branchName: ''
  });
  const [bankFormErrors, setBankFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [bankDetailsSaved, setBankDetailsSaved] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  console.log("Student data:", student);
  // Handler for create actions - now allows all users
  const handleCreateAction = (path, actionName) => {
    // All users can now create content
    router.push(path);
  };
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [landingStats, setLandingStats] = useState({ activeProUsers: 0 });

  const fetchProfileAndQuizzes = async () => {
    try {
      // Fetch landing stats for prize pool calculation
      API.getPublicLandingStats().then(res => {
        if (res.success) {
          setLandingStats(res.data);
        }
      }).catch(err => console.error("Error fetching landing stats:", err));

      const profileRes = await API.getProfile();
      console.log('🔍 Profile API Response in ProfilePage:', profileRes);

      // Set the user data correctly
      if (profileRes?.success && profileRes?.user) {
        setStudent(profileRes.user);
        console.log('✅ User data set:', profileRes.user);
      } else {
        console.log('❌ No user data found in response');
        setStudent({});
      }

      // Set profile completion data if available
      if (profileRes?.user?.profileCompletion) {
        console.log('✅ Profile completion data found in ProfilePage:', profileRes.user.profileCompletion);
        setProfileCompletion(profileRes.user.profileCompletion);
      } else {
        console.log('❌ Profile completion data not found in ProfilePage response');
        console.log('Response structure:', {
          success: profileRes?.success,
          hasUser: !!profileRes?.user,
          hasProfileCompletion: !!profileRes?.user?.profileCompletion
        });

        // Set default profile completion data
        setProfileCompletion({
          percentage: 0,
          isComplete: false,
          fields: [
            { name: 'Full Name', completed: false, value: '' },
            { name: 'Email Address', completed: false, value: '' },
            { name: 'Phone Number', completed: false, value: '' },
            { name: 'Social Media Link', completed: false, value: '' }
          ],
          completedFields: 0,
          totalFields: 4
        });
      }
      try {
        const historyRes = await API.getQuizHistory({ page: 1, limit: 6 });
        setPlayedQuizzes(historyRes.data?.attempts || []);
      } catch (quizErr) {
        setPlayedQuizzes([]); // Still show profile even if quizzes fail
      }

      // Fetch exam attempt history
      try {
        const examHistoryRes = await API.getExamAttemptHistory({ page: 1, limit: 6 });
        setExamAttempts(examHistoryRes.data?.attempts || []);
      } catch (examErr) {
        console.error('Error fetching exam history:', examErr);
        setExamAttempts([]); // Still show profile even if exam history fails
      }

      // Check if user is eligible for bank details
      console.log('🔍 Checking bank details eligibility for user:', profileRes?.user);
      if (isEligibleForBankDetails(profileRes)) {
        console.log('✅ User is eligible for bank details, fetching...');
        try {
          const bankRes = await API.getBankDetails();
          console.log('📦 Bank details API response:', bankRes);
          if (bankRes.success && bankRes.bankDetail) {
            console.log('✅ Bank details found:', bankRes.bankDetail);
            setBankDetails(bankRes.bankDetail);
            // Pre-fill form data with existing bank details
            setBankFormData({
              accountHolderName: bankRes.bankDetail.accountHolderName,
              accountNumber: bankRes.bankDetail.accountNumber,
              bankName: bankRes.bankDetail.bankName,
              ifscCode: bankRes.bankDetail.ifscCode,
              branchName: bankRes.bankDetail.branchName
            });
          } else {
            console.log('❌ No bank details in response:', bankRes);
          }
        } catch (bankErr) {
          // Check if it's a 404 error (no bank details yet) vs other errors
          if (bankErr.response && bankErr.response.status === 404) {
            // User doesn't have bank details yet - this is normal
            console.log('ℹ️ No bank details found yet - user can add them');
            setBankDetails(null);
          } else {
            // Actual error occurred
            console.error('❌ Error fetching bank details:', bankErr);
            // Don't show error to user since bank details are optional
          }
        }
      } else {
        console.log('❌ User is not eligible for bank details');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      handleAuthError(err, router);
      setError('Failed to load profile');
    }
  };

  // Guard against double-invocation in React StrictMode (dev) causing duplicate fetches
  const hasFetchedRef = useRef(false);
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchProfileAndQuizzes();
  }, []);

  // Debounce username checking
  const debouncedUsername = useDebounce(editProfileData.username, 1000);

  // Username validation effect
  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3 && student?._id) {
      checkUsernameAvailability(debouncedUsername, student._id);
    }
  }, [debouncedUsername, student?._id]);

  // All users can now access bank details
  const isEligibleForBankDetails = (user) => {
    if (!user) {
      console.log('❌ No user data for eligibility check');
      return false;
    }

    // All users are now eligible for bank details
    return true;
  };

  // Check if user has Free plan subscription
  const isFreePlanUser = (user) => {
    if (!user) {
      console.log('❌ No user data for Free plan check');
      return false;
    }

    const isFreePlan = user.subscriptionStatus === 'free';

    console.log('🔍 Free Plan Check:', {
      subscriptionStatus: user.subscriptionStatus,
      isFreePlan,
      shouldShowProfileCompletion: isFreePlan
    });

    return isFreePlan;
  };

  // Handle bank form input changes
  const handleBankFormChange = (e) => {
    const { name, value } = e.target;
    setBankFormData({
      ...bankFormData,
      [name]: value
    });

    // Clear error for this field when user types
    if (bankFormErrors[name]) {
      setBankFormErrors({
        ...bankFormErrors,
        [name]: ''
      });
    }
  };

  // Validate bank form
  const validateBankForm = () => {
    const errors = {};

    if (!bankFormData.accountHolderName.trim()) {
      errors.accountHolderName = 'Account holder name is required';
    }

    if (!bankFormData.accountNumber.trim()) {
      errors.accountNumber = 'Account number is required';
    } else if (!/^\d{9,18}$/.test(bankFormData.accountNumber.trim())) {
      errors.accountNumber = 'Please enter a valid account number (9-18 digits)';
    }

    if (!bankFormData.bankName.trim()) {
      errors.bankName = 'Bank name is required';
    }

    if (!bankFormData.ifscCode.trim()) {
      errors.ifscCode = 'IFSC code is required';
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankFormData.ifscCode.trim())) {
      errors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0123456)';
    }

    if (!bankFormData.branchName.trim()) {
      errors.branchName = 'Branch name is required';
    }

    setBankFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit bank details
  const handleBankFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateBankForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const response = await API.saveBankDetails(bankFormData);
      if (response.success) {
        setBankDetails(response.bankDetail);
        setShowBankForm(false);
        setBankDetailsSaved(true);
        // Show success message
        toast.success('Bank details saved successfully!');
      }
    } catch (err) {
      console.error('Error saving bank details:', err);
      toast.error(err.response?.data?.message || 'Failed to save bank details');
    } finally {
      setIsSaving(false);
    }
  };

  // Edit Profile Functions
  const handleEditProfile = () => {
    setEditProfileData({
      name: student.name || '',
      email: student.email || '',
      phone: student.phone || '',
      username: student.username || '',
      socialLinks: {
        instagram: student.socialLinks?.instagram || '',
        facebook: student.socialLinks?.facebook || '',
        x: student.socialLinks?.x || '',
        youtube: student.socialLinks?.youtube || ''
      }
    });
    setEditProfileErrors({});
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditProfileData({
      name: '',
      email: '',
      phone: '',
      username: '',
      socialLinks: {
        instagram: '',
        facebook: '',
        x: '',
        youtube: ''
      }
    });
    setEditProfileErrors({});
  };

  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;

    // Handle social links separately
    if (name.startsWith('socialLinks.')) {
      const socialPlatform = name.split('.')[1];
      setEditProfileData({
        ...editProfileData,
        socialLinks: {
          ...editProfileData.socialLinks,
          [socialPlatform]: value
        }
      });
    } else {
      setEditProfileData({
        ...editProfileData,
        [name]: value
      });
    }

    // Clear error for this field when user types
    if (editProfileErrors[name]) {
      setEditProfileErrors({
        ...editProfileErrors,
        [name]: ''
      });
    }

    // Handle username validation
    if (name === 'username') {
      // Reset validation state
      setUsernameValidation({
        isChecking: false,
        isAvailable: null,
        suggestions: [],
        message: ''
      });

      // Clear error for username field
      if (editProfileErrors.username) {
        setEditProfileErrors({
          ...editProfileErrors,
          username: ''
        });
      }
    }
  };

  // Debounced username validation
  const checkUsernameAvailability = async (username, currentUserId) => {
    if (!username || username.length < 3) {
      setUsernameValidation({
        isChecking: false,
        isAvailable: null,
        suggestions: [],
        message: ''
      });
      return;
    }

    setUsernameValidation(prev => ({ ...prev, isChecking: true }));

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          currentUserId: currentUserId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsernameValidation({
          isChecking: false,
          isAvailable: data.available,
          suggestions: data.suggestions || [],
          message: data.available ? 'Username is available!' : 'Username is already taken'
        });
      } else {
        setUsernameValidation({
          isChecking: false,
          isAvailable: false,
          suggestions: [],
          message: data.message || 'Error checking username'
        });
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameValidation({
        isChecking: false,
        isAvailable: null,
        suggestions: [],
        message: 'Error checking username availability'
      });
    }
  };


  const validateEditProfile = () => {
    const errors = {};

    if (!editProfileData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!editProfileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(editProfileData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!editProfileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(editProfileData.phone.trim())) {
      errors.phone = 'Phone number must be exactly 10 digits';
    }

    // Validate username if provided
    if (editProfileData.username && editProfileData.username.trim()) {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(editProfileData.username.trim())) {
        errors.username = 'Username must be 3-20 characters long and contain only letters, numbers, and underscores';
      } else if (usernameValidation.isAvailable === false) {
        errors.username = 'Username is already taken';
      }
    }

    // Validate social media URLs
    const urlRegex = /^https?:\/\/.+/;
    const socialPlatforms = ['instagram', 'facebook', 'x', 'youtube'];

    socialPlatforms.forEach(platform => {
      const url = editProfileData.socialLinks[platform];
      if (url && url.trim() && !urlRegex.test(url.trim())) {
        errors[`socialLinks.${platform}`] = `Please enter a valid URL for ${platform}`;
      }
    });

    setEditProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!validateEditProfile()) {
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const response = await API.updateProfile(editProfileData);
      if (response.success) {
        setStudent(response.user);
        setIsEditingProfile(false);
        toast.success('Profile updated successfully!');
        fetchProfileAndQuizzes();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const showResult = (quiz) => {
    // Store quiz result in sessionStorage for access in quiz-result page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('quizResult', JSON.stringify(quiz));
    }
    router.push("/quiz-result");
  }

  // Function to extract username from social media URLs
  const extractUsername = (url, platform) => {
    if (!url) return '';

    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      switch (platform) {
        case 'instagram':
          // Extract username from instagram.com/username or instagram.com/@username
          const instagramMatch = pathname.match(/\/(?:@)?([^\/\?]+)/);
          return instagramMatch ? instagramMatch[1].replace('@', '') : '';

        case 'facebook':
          // Extract username from facebook.com/username
          const facebookMatch = pathname.match(/\/([^\/\?]+)/);
          return facebookMatch ? facebookMatch[1] : '';

        case 'x':
          // Extract username from x.com/username or twitter.com/username
          const xMatch = pathname.match(/\/([^\/\?]+)/);
          return xMatch ? xMatch[1] : '';

        case 'youtube':
          // Extract username from youtube.com/@username or youtube.com/c/username or youtube.com/user/username
          const youtubeMatch = pathname.match(/\/(?:@|c\/|user\/)([^\/\?]+)/);
          return youtubeMatch ? youtubeMatch[1] : '';

        default:
          return '';
      }
    } catch (error) {
      console.error('Error extracting username:', error);
      return '';
    }
  };
  // Use new backend level structure
  const userLevel = student?.levelInfo?.currentLevel || { number: 0, name: 'Starter' };
  const nextLevel = student?.levelInfo?.nextLevel;
  const quizzesPlayed = student?.levelInfo?.progress?.quizzesPlayed || 0;

  // Daily Stats from student.dailyProgress
  const dailyWins = student?.dailyProgress?.highScoreWins || 0;
  const dailyAttempts = student?.dailyProgress?.totalQuizAttempts || 0;
  const dailyAccuracy = student?.dailyProgress?.accuracy || 0;

  // Weekly Stats from student.weeklyProgress
  const weeklyWins = student?.weeklyProgress?.highScoreWins || 0;
  const weeklyAttempts = student?.weeklyProgress?.totalQuizAttempts || 0;
  const weeklyAccuracy = student?.weeklyProgress?.accuracy || 0;

  // Monthly Stats
  const highScoreQuizzes = student?.monthlyProgress?.highScoreWins || 0;
  const monthlyAttempts = student?.monthlyProgress?.totalQuizAttempts || 0;
  const highScoreRate = student?.monthlyProgress?.accuracy || 0;

  // Debug logging for level progression
  console.log('🎯 Level Progression Data:', {
    userLevel,
    nextLevel,
    quizzesPlayed,
    highScoreQuizzes,
    highScoreRate,
    fullStudent: student
  });

  const message =
    "🔥 Share Your Referral Code & Earn Instant Wallet Money! 💰🔥\n\n" +
    "Invite your friends to AajExam and earn real wallet rewards you can withdraw anytime! 🚀\n\n" +
    "Here's what you earn:\n\n" +
    `1️⃣ ₹${config.QUIZ_CONFIG.REFERRAL_REWARD_PRO} when your friend buys the Pro Plan (first-time)\n\n` +
    "🔗 Login / Register on Website:\n\n" +
    "https://aajexam.com/register";

  if (error)
    return (
      <div className="min-h-screen bg-subg-light dark:bg-subg-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-primary-600 text-4xl mb-4">⚠️</div>
          <p className="text-primary-600 text-xl">{error}</p>
        </div>
      </div>
    );

  if (!student) {
    console.log('🔍 Student is null/undefined, showing loading...');
    return <Loading fullScreen={true} size="lg" color="yellow" message="Loading your profile..." />;
  }



  return (
    <>
      <Seo
        title="My Profile - AajExam User Dashboard"
        description="View your AajExam profile, track your progress, manage your account settings, and see your quiz achievements and rewards."
        noIndex={true}
      />
      <>
        <div className="container mx-auto min-h-screenpx-0 lg:px-10">
          <div>
            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 rounded-t-none rounded-b-2xl">
              {/* Cover Photo Area */}
              <div className="h-20 lg:h-32 bg-gradient-to-r from-red-800 to-primary-800 relative">
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
              </div>

              {/* Profile Info */}
              <div className="px-2 lg:px-4 pb-2 lg:pb-4 relative">
                {/* Profile Picture */}
                <div className="flex items-end -mt-16 mb-4">
                  <div className="w-20 lg:w-24 h-20 lg:h-24 text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-full border-2 border-gray-400 dark:border-gray-600 shadow-lg flex items-center justify-center">
                    {student?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-4 flex-1">
                    <h1 className="text-md lg:text-xl font-bold text-gray-900 dark:text-white">{student?.name || 'User'}</h1>
                    {student?.username && (
                      <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">@{student.username}</p>
                    )}
                    <p className="text-s">
                      <strong className="text-green-600 dark:text-green-400">{"Level "}{student?.level?.currentLevel || ''}{" - "}</strong>
                      <strong className="text-secondary-600 dark:text-secondary-400">{student?.levelInfo?.currentLevel?.name || 'Level 0'}</strong>
                    </p>
                  </div>
                  <button
                    onClick={handleEditProfile}
                    className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <div className='flex justify-between items-center gap-2'><span><FaPencilAlt /></span> <span>Edit</span></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Facebook-style Profile Details */}
            <div className="bg-white dark:bg-gray-800 mt-2 mx-3 lg:mx-0 p-0 lg:p-4 rounded-2xl">
              {/* Profile Completion Progress Bar - Only show for Free plan users */}
              {isFreePlanUser(student) && profileCompletion ? (
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-2 lg:p-4 border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FaUserGraduate className="text-green-600 dark:text-green-400" />
                        Profile Completion
                      </h3>
                      <span className={`text-md lg:text-2xl font-bold ${profileCompletion.percentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-primary-600 dark:text-primary-600'}`}>
                        {profileCompletion.percentage === 100 ? 'Completed ✅' : `${profileCompletion.percentage}%`}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ease-in-out ${profileCompletion.percentage === 100
                          ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                          : 'bg-gradient-to-r from-primary-500 to-primary-500'
                          }`}
                        style={{ width: `${profileCompletion.percentage}%` }}
                      ></div>
                    </div>

                    {/* Status Message */}
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      {profileCompletion.percentage === 100
                        ? '🎉 Congratulations! Your profile is complete!'
                        : `Complete ${4 - profileCompletion.completedFields} more field${4 - profileCompletion.completedFields === 1 ? '' : 's'} to get 100%!`
                      }
                    </div>

                    {/* Field Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                      {profileCompletion.fields.map((field, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                          <span className="text-gray-700 dark:text-gray-300">{field.name}</span>
                          <span className={field.completed ? 'text-green-500' : 'text-red-500'}>
                            {field.completed ? '✅' : '❌'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Reward Info */}
                    {profileCompletion.percentage === 100 && (
                      <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <FaCheckCircle className="text-lg" />
                          <span className="font-semibold">Your profile is 100% complete!</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isFreePlanUser(student) ? (
                <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="text-center">
                      <div className="text-lg text-gray-600 dark:text-gray-300">
                        Loading profile completion data...
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* About Section */}
              <div className="px-4 lg:px-6 py-3 lg:py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">About</h2>

                  {/* Followers/Following Stats */}
                  {student?.username && (
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => router.push(`/profile/${student.username}/followers`)}
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <span className="font-bold">{student?.followersCount || 0}</span> Followers
                      </button>
                      <button
                        onClick={() => router.push(`/profile/${student.username}/following`)}
                        className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        <span className="font-bold">{student?.followingCount || 0}</span> Following
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Information - Show either details or edit form */}
              {!isEditingProfile && (
                // Show Profile Details
                <div className="px-4 xl:px-6 py-3 xl:py-6 space-y-4">
                  {/* Contact Info */}
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    {/* Email with masking & eye toggle */}
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-3">
                        <FaEnvelope className="text-gray-400 text-lg" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {!student?.email
                              ? 'Not provided'
                              : showEmail
                                ? student.email
                                : (() => {
                                  const email = student.email;
                                  const [local, domain] = email.split('@');
                                  if (!domain) return email;
                                  if (local.length <= 4) {
                                    // If very short, just show first char and mask rest
                                    const first = local.slice(0, 1);
                                    const last = local.slice(-1);
                                    const middleMask = local.length > 2 ? '*'.repeat(local.length - 2) : '';
                                    return `${first}${middleMask}${last}@${domain}`;
                                  }
                                  const firstTwo = local.slice(0, 2);
                                  const lastTwo = local.slice(-2);
                                  const middleMask = '*'.repeat(local.length - 4);
                                  return `${firstTwo}${middleMask}${lastTwo}@${domain}`;
                                })()}
                          </p>
                        </div>
                      </div>
                      {student?.email && (
                        <button
                          type="button"
                          onClick={() => setShowEmail((prev) => !prev)}
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
                          aria-label={showEmail ? 'Hide email' : 'Show email'}
                        >
                          {showEmail ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>

                    {/* Phone with masking & eye toggle */}
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-3">
                        <FaPhone className="text-gray-400 text-lg" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {!student?.phone
                              ? 'Not provided'
                              : showPhone
                                ? student.phone
                                : (() => {
                                  const phone = String(student.phone);
                                  if (phone.length <= 4) {
                                    // Too short, just mask middle if any
                                    const first = phone.slice(0, 1);
                                    const last = phone.slice(-1);
                                    const middleMask = phone.length > 2 ? '*'.repeat(phone.length - 2) : '';
                                    return `${first}${middleMask}${last}`;
                                  }
                                  const firstTwo = phone.slice(0, 2);
                                  const lastTwo = phone.slice(-2);
                                  const middleMask = '*'.repeat(Math.max(phone.length - 4, 0));
                                  return `${firstTwo}${middleMask}${lastTwo}`;
                                })()}
                          </p>
                        </div>
                      </div>
                      {student?.phone && (
                        <button
                          type="button"
                          onClick={() => setShowPhone((prev) => !prev)}
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300 transition-colors"
                          aria-label={showPhone ? 'Hide phone number' : 'Show phone number'}
                        >
                          {showPhone ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      )}
                    </div>

                    {/* Subscription Status */}
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-3">
                        <FaCrown className="text-primary-500 text-lg" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Subscription</p>
                          {(() => {
                            const statusInfo = getSubscriptionStatusTextWithTheme(student.subscriptionStatus);
                            return (
                              <p className={`font-medium ${statusInfo.textColor}`}>
                                {statusInfo.text}
                              </p>
                            );
                          })()}
                          {/* Subscription Expiry Date */}
                          {student?.subscriptionExpiry && student.subscriptionStatus !== 'free' && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Expires: {new Date(student.subscriptionExpiry).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <Link
                        href="/subscription"
                        className="text-sm px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center space-x-1"
                      >
                        <FaRocket className="text-xs" />
                        <span>{student.subscriptionStatus === 'free' ? 'Upgrade' : 'Manage'}</span>
                      </Link>
                    </div>
                  </div>


                  {/* Social Media Links */}
                  {(student.socialLinks?.instagram || student.socialLinks?.facebook || student.socialLinks?.x || student.socialLinks?.youtube) && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Social Media</h3>
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        {student.socialLinks?.instagram && (
                          <a
                            href={student.socialLinks.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FaInstagram className="text-pink-500 text-lg" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Instagram</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{extractUsername(student.socialLinks.instagram, 'instagram')}</p>
                            </div>
                          </a>
                        )}

                        {student.socialLinks?.facebook && (
                          <a
                            href={student.socialLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FaFacebookF className="text-secondary-600 text-lg" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">Facebook</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{extractUsername(student.socialLinks.facebook, 'facebook')}</p>
                            </div>
                          </a>
                        )}

                        {student.socialLinks?.x && (
                          <a
                            href={student.socialLinks.x}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FaTwitter className="text-black dark:text-white text-lg" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">X (Twitter)</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{extractUsername(student.socialLinks.x, 'x')}</p>
                            </div>
                          </a>
                        )}

                        {student.socialLinks?.youtube && (
                          <a
                            href={student.socialLinks.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <FaYoutube className="text-primary-600 text-lg" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">YouTube</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">@{extractUsername(student.socialLinks.youtube, 'youtube')}</p>
                            </div>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Subscription Details */}
              {student.subscription?.isActive && (
                <>
                  <div className="bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/30 dark:to-red-900/30 rounded-2xl p-3 lg:p-6 border border-primary-200 dark:border-primary-700">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                        <FaStar className="text-white text-xl" />
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Current Plan</span>
                        {(() => {
                          const statusInfo = getSubscriptionStatusTextWithTheme(student.subscriptionStatus);
                          return (
                            <>
                              <span className={`text-md lg:text-xl lg:text-2xl font-bold ${statusInfo.textColor}`}>
                                {statusInfo.text}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Expires On</span>
                        <p className="text-md sm:text-lg lg:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                          {new Date(student.subscription?.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Edit Profile Form */}
            {isEditingProfile && (
              <div className="bg-white dark:bg-gray-800 mt-2 lg:mt-4">
                <div className="px-4 lg:px-6 py-3 lg:py-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editProfileData.name}
                        onChange={handleEditProfileChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors.name
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}
                        placeholder="Enter your full name"
                      />
                      {editProfileErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{editProfileErrors.name}</p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editProfileData.email}
                        onChange={handleEditProfileChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors.email
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}
                        placeholder="Enter your email address"
                      />
                      {editProfileErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{editProfileErrors.email}</p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editProfileData.phone}
                        onChange={handleEditProfileChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors.phone
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                          }`}
                        placeholder="Enter your phone number (10 digits)"
                      />
                      {editProfileErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{editProfileErrors.phone}</p>
                      )}
                    </div>

                    {/* Username Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editProfileData.username}
                        onChange={handleEditProfileChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors.username
                          ? 'border-red-500 focus:ring-red-500'
                          : usernameValidation.isAvailable === true
                            ? 'border-green-500 focus:ring-green-500'
                            : usernameValidation.isAvailable === false
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        placeholder="Enter your username"
                      />

                      {/* Username validation messages */}
                      {usernameValidation.isChecking && (
                        <p className="text-secondary-500 text-xs mt-1">Checking username availability...</p>
                      )}

                      {!usernameValidation.isChecking && usernameValidation.message && (
                        <p className={`text-xs mt-1 ${usernameValidation.isAvailable === true
                          ? 'text-green-600 dark:text-green-400'
                          : usernameValidation.isAvailable === false
                            ? 'text-red-500'
                            : 'text-gray-500 dark:text-gray-400'
                          }`}>
                          {usernameValidation.message}
                        </p>
                      )}

                      {/* Username suggestions */}
                      {!usernameValidation.isChecking && usernameValidation.isAvailable === false && usernameValidation.suggestions.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Suggested usernames:</p>
                          <div className="flex flex-wrap gap-2">
                            {usernameValidation.suggestions.slice(0, 3).map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setEditProfileData({ ...editProfileData, username: suggestion })}
                                className="text-xs bg-secondary-100 dark:bg-secondary-900 text-secondary-800 dark:text-secondary-200 px-2 py-1 rounded hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {editProfileErrors.username && (
                        <p className="text-red-500 text-xs mt-1">{editProfileErrors.username}</p>
                      )}
                    </div>

                    {/* Social Media Links Section */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Social Media Links (Optional)</h4>
                      <div className="space-y-3">
                        {/* Instagram */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span className="flex items-center space-x-2">
                              <FaInstagram className="text-pink-500" />
                              <span>Instagram</span>
                            </span>
                          </label>
                          <input
                            type="url"
                            name="socialLinks.instagram"
                            value={editProfileData.socialLinks.instagram}
                            onChange={handleEditProfileChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors['socialLinks.instagram']
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="https://instagram.com/yourusername"
                          />
                          {editProfileErrors['socialLinks.instagram'] && (
                            <p className="text-red-500 text-xs mt-1">{editProfileErrors['socialLinks.instagram']}</p>
                          )}
                        </div>

                        {/* Facebook */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span className="flex items-center space-x-2">
                              <FaFacebookF className="text-secondary-600" />
                              <span>Facebook</span>
                            </span>
                          </label>
                          <input
                            type="url"
                            name="socialLinks.facebook"
                            value={editProfileData.socialLinks.facebook}
                            onChange={handleEditProfileChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors['socialLinks.facebook']
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="https://facebook.com/yourusername"
                          />
                          {editProfileErrors['socialLinks.facebook'] && (
                            <p className="text-red-500 text-xs mt-1">{editProfileErrors['socialLinks.facebook']}</p>
                          )}
                        </div>

                        {/* X (Twitter) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span className="flex items-center space-x-2">
                              <FaTwitter className="text-black dark:text-white" />
                              <span>X (Twitter)</span>
                            </span>
                          </label>
                          <input
                            type="url"
                            name="socialLinks.x"
                            value={editProfileData.socialLinks.x}
                            onChange={handleEditProfileChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors['socialLinks.x']
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="https://x.com/yourusername"
                          />
                          {editProfileErrors['socialLinks.x'] && (
                            <p className="text-red-500 text-xs mt-1">{editProfileErrors['socialLinks.x']}</p>
                          )}
                        </div>

                        {/* YouTube */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span className="flex items-center space-x-2">
                              <FaYoutube className="text-primary-600" />
                              <span>YouTube</span>
                            </span>
                          </label>
                          <input
                            type="url"
                            name="socialLinks.youtube"
                            value={editProfileData.socialLinks.youtube}
                            onChange={handleEditProfileChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all duration-300 ${editProfileErrors['socialLinks.youtube']
                              ? 'border-red-500 focus:ring-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}
                            placeholder="https://youtube.com/@yourusername"
                          />
                          {editProfileErrors['socialLinks.youtube'] && (
                            <p className="text-red-500 text-xs mt-1">{editProfileErrors['socialLinks.youtube']}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="flex-1 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <FaSave className="text-sm" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={isUpdatingProfile}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="my-4 mx-3 lg:mx-0 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 rounded-2xl p-3 lg:p-6 border border-emerald-200 dark:border-emerald-700">
              <div className="flex items-center space-x-4">
                <div className="min-h-12 min-w-12 w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                  <FaAward className="text-white text-xl" />
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Achievement Badges</span>
                  <p className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                    {student.badges && student.badges.length > 0
                      ? student.badges.join(', ')
                      : 'No badges yet'}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Facebook-style Stats Section */}
          <div className="bg-white dark:bg-gray-800 pt-2 mx-3 lg:mx-0 lg:mt-4 rounded-2xl">
            <div className="px-4 lg:px-6 py-3 lg:py-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quiz Stats</h2>
            </div>
            <div className="px-4 lg:px-6 py-3 lg:py-6">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 text-center">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800">
                  <div className="text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400">{dailyWins} / {dailyAttempts}</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Daily Wins</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800">
                  <div className="text-xl lg:text-2xl font-bold text-purple-600 dark:text-purple-400">{weeklyWins} / {weeklyAttempts}</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Weekly Wins</div>
                </div>
                <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl border border-primary-100 dark:border-primary-800">
                  <div className="text-xl lg:text-2xl font-bold text-secondary-600 dark:text-primary-400">{highScoreQuizzes} / {monthlyAttempts}</div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Monthly Wins</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:gap-4 mt-4 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{dailyAccuracy}%</div>
                  <div className="text-[10px] lg:text-xs text-gray-500">Daily Accuracy</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{weeklyAccuracy}%</div>
                  <div className="text-[10px] lg:text-xs text-gray-500">Weekly Accuracy</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-sm font-bold text-gray-800 dark:text-gray-200">{highScoreRate}%</div>
                  <div className="text-[10px] lg:text-xs text-gray-500">Monthly Accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Quick Actions */}

          <div className="features-section bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 lg:p-8 border border-white/30 hover-lift mt-4 mx-3 lg:mx-0">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 lg:w-20 h-12 lg:h-20 bg-gradient-to-r from-green-500 via-secondary-500 from-red-500 rounded-2xl flex items-center justify-center shadow-lg glow-animation">
                <FaPlus className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                  Create Content
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                  Create questions to contribute to the community
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {/* Create Question */}
              <div
                onClick={() => handleCreateAction('/pro/questions/new', 'create questions')}
                className="group cursor-pointer bg-gradient-to-br from-green-50 to-secondary-50 dark:from-green-900/20 dark:to-secondary-900/20 rounded-2xl p-4 lg:p-6 border border-green-200 dark:border-green-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-green-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <FaStickyNote className="text-white text-lg lg:text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Create Question</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Post new questions</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Create and submit quality questions to help the community
                </p>
                <p className="text-secondary-600 dark:text-secondary-400 text-xs font-medium mb-4">
                  📅 You Can Add Max 100 Questions Per Month
                </p>
                <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                  <span>Create Now</span>
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>

              {/* My Questions */}
              <div
                onClick={() => router.push('/pro/questions/mine')}
                className="group cursor-pointer bg-gradient-to-br from-secondary-50 from-red-50 dark:from-secondary-900/20 dark:from-red-900/20 rounded-2xl p-4 lg:p-6 border border-secondary-200 dark:border-secondary-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <FaSearch className="text-white text-lg lg:text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">My Questions</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">View submissions</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Track your submitted questions and their status
                </p>
                <div className="flex items-center text-secondary-600 dark:text-secondary-400 text-sm font-medium">
                  <span>View Questions</span>
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>

              {/* Wallet */}
              <div
                onClick={() => router.push('/pro/wallet')}
                className="group cursor-pointer bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 rounded-2xl p-4 lg:p-6 border border-primary-200 dark:border-primary-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                    <FaMoneyBill className="text-white text-lg lg:text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">My Wallet</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Earnings & withdrawals</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Check your earnings and withdraw funds
                </p>
                <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                  <span>View Wallet</span>
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>

              {/* Create Quiz */}
              <div
                onClick={() => handleCreateAction('/pro/quiz/create', 'create quizzes')}
                className="group cursor-pointer bg-gradient-to-br from-primary-50 from-red-50 dark:from-primary-900/20 dark:from-red-900/20 rounded-2xl p-4 lg:p-6 border border-indigo-200 dark:border-indigo-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-primary-500 from-red-500 rounded-xl flex items-center justify-center">
                    <FaStickyNote className="text-white text-lg lg:text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Create Quiz</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Build custom quizzes</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                  Create your own quizzes and share your knowledge
                </p>
                <div className="flex items-center text-primary-600 dark:text-red-400 text-sm font-medium">
                  <span>Create Now</span>
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>

              {/* My Quizzes */}
              <div
                onClick={() => router.push('/pro/quizzes/mine')}
                className="group cursor-pointer bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-2xl p-4 lg:p-6 border border-pink-200 dark:border-pink-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <FaSearch className="text-white text-lg lg:text-xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">My Quizzes</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">View your quizzes</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Track your submitted quizzes and approval status
                </p>
                <div className="flex items-center text-pink-600 dark:text-pink-400 text-sm font-medium">
                  <span>View Quizzes</span>
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>

              {/* Create Blog - Only for Pro ₹99 users */}
              {(() => {
                if (!student) return false;

                // PRIORITY: Check currentSubscription first (most reliable source)
                if (student.currentSubscription) {
                  const sub = student.currentSubscription;
                  const now = new Date();

                  // Check if subscription is active, plan is 'pro', amount is 99, and not expired
                  const isActive = sub.status === 'active';
                  const isProPlan = sub.plan === 'pro';
                  const is99Amount = sub.amount === 99;
                  const isNotExpired = !sub.endDate || new Date(sub.endDate) > now;

                  if (isActive && isProPlan && is99Amount && isNotExpired) {
                    return true;
                  }
                }

                // Fallback: Check subscriptionStatus and subscriptionExpiry
                const isProStatus = (student.subscriptionStatus || '').toLowerCase() === 'pro';
                const isNotExpired = !student.subscriptionExpiry || new Date(student.subscriptionExpiry) > new Date();
                const hasProSubscription = student.subscription?.planName?.toLowerCase() === 'pro' &&
                  student.subscription?.isActive;

                return isProStatus && isNotExpired && hasProSubscription;
              })() && (
                  <>
                    <div
                      onClick={() => router.push('/pro/create-blog')}
                      className="group cursor-pointer bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl p-4 lg:p-6 border border-purple-200 dark:border-purple-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center">
                          <FaStickyNote className="text-white text-lg lg:text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white text-lg">Create Blog</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Write blogs</p>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                        Share your knowledge by writing educational blogs
                      </p>
                      <div className="flex items-center text-primary-600 dark:text-primary-400 text-sm font-medium">
                        <span>Create Now</span>
                        <FaArrowRight className="ml-2 text-xs" />
                      </div>
                    </div>

                    {/* My Blogs */}
                    <div
                      onClick={() => router.push('/pro/my-blogs')}
                      className="group cursor-pointer bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 rounded-2xl p-4 lg:p-6 border border-violet-200 dark:border-violet-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-10 lg:w-12 h-10 lg:h-12 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <FaSearch className="text-white text-lg lg:text-xl" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 dark:text-white text-lg">My Blogs</h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">View submissions</p>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        Track your blog submissions and rewards
                      </p>
                      <div className="flex items-center text-violet-600 dark:text-violet-400 text-sm font-medium">
                        <span>View Blogs</span>
                        <FaArrowRight className="ml-2 text-xs" />
                      </div>
                    </div>
                  </>
                )}
            </div>
          </div>




          <div className="my-4 mx-3 lg:mx-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
              {/* Reward Center Referral Section */}
              <div className="lg:col-span-2">
                <div className="rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4   xl:p-12 border-2 border-purple-300/30">
                  <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 md:w-24 md:h-24 bg-gradient-to-tr from-primary-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl sm:shadow-2xl animate-float">
                      <FaStar className="text-white text-2xl sm:text-3xl md:text-4xl drop-shadow-lg" />
                    </div>
                    <h2 className="text-md sm:text-lg md:text-lg lg:text-xl xl:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-800 dark:text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
                      🎉 Invite Friends & Earn Rewards! 🎉
                    </h2>
                    <p className="text-center mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-primary-200 font-medium max-w-2xl sm:max-w-3xl lg:p-4 px-4 sm:px-0">
                      Invite your friends to AajExam and earn wallet rewards.
                    </p>
                  </div>

                  {/* Wallet Balance Display */}
                  <div className="bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-600/30 dark:to-emerald-600/30 rounded-xl sm:rounded-2xl p-4 lg:p-6 mb-6 sm:mb-8 border-2 border-green-400/50 text-center">
                    <div className="text-4xl lg:text-5xl font-bold text-green-700 dark:text-green-300 mb-2">
                      ₹{student.walletBalance || 0}
                    </div>
                    <div className="text-gray-800 dark:text-white font-semibold text-lg mb-2">
                      Wallet Balance
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {student.referralCount || 0} friends referred
                    </div>
                  </div>

                  {/* Your Rewards Grid - New Design */}
                  <div className="mb-8">
                    <h3 className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
                      Your Rewards:
                    </h3>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                      {/* Dynamic Prize Pool - New Card */}
                      <div className="bg-gradient-to-br from-primary-600 to-secondary-600 dark:from-primary-700 dark:to-red-800 rounded-xl sm:rounded-2xl p-4 lg:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-xl border border-primary-400/30">
                        <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3 animate-pulse">
                          🔥
                        </div>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2">
                          Monthly Prize Pool
                        </h3>
                        <div className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-black text-primary-300 mb-1 sm:mb-2 drop-shadow-md">
                          ₹{((landingStats.activeProUsers || 0) * config.QUIZ_CONFIG.PRIZE_PER_PRO).toLocaleString('en-IN')}
                        </div>
                        <p className="text-primary-100 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
                          Dynamic Pool
                        </p>
                      </div>

                      {/* Friend Buys ₹99 Plan - Purple Gradient */}
                      <div className="bg-gradient-to-br from-purple-700 to-violet-600 dark:from-purple-800 dark:to-violet-700 rounded-xl sm:rounded-2xl p-4 lg:p-6 text-center hover:scale-105 transition-transform duration-300 shadow-lg">
                        <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-3">
                          👑
                        </div>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-white mb-1 sm:mb-2">
                          Friend Buys ₹{config.SUBSCRIPTION_PLANS.PRO.price} Plan
                        </h3>
                        <div className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-primary-300 mb-1 sm:mb-2">
                          ₹{config.QUIZ_CONFIG.REFERRAL_REWARD_PRO}
                        </div>
                        <p className="text-primary-100 text-xs sm:text-lg">
                          First-time purchase
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Withdrawal Rules */}
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl sm:rounded-2xl p-4 lg:p-6 mb-6 sm:mb-8 border-2 border-primary-200 dark:border-primary-700">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 text-center">
                      Withdrawal Rules:
                    </h3>
                    <div className="space-y-2 text-center">
                      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        • Minimum withdrawal: ₹{process.env.NEXT_PUBLIC_MIN_WITHDRAW_AMOUNT || '1000'}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                        • You must be a "Top Performer in the previous month"
                      </p>
                    </div>
                  </div>

                  {/* How It Works */}
                  <div className="bg-gray-100 dark:bg-white/10 rounded-xl sm:rounded-2xl p-4 lg:p-6 mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-3 sm:mb-4 text-center">
                      How It Works
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                            1
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                          Sign up and get your unique referral code
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                            2
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                          Share your code with friends
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                            3
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                          Friends join using your code
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                          <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                            4
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                          Earn wallet rewards instantly!
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Referral Code Section */}
                  <div className="bg-gradient-to-r from-primary-100 via-primary-100 to-red-100 dark:from-primary-500/25 dark:text-secondary-500/25 dark:to-secondary-500/25 rounded-2xl p-2 md:p-4 lg:p-6 border border-primary-300/40 dark:border-primary-400/30 mb-6">
                    <div className="text-center">
                      <h4 className="text-gray-800 dark:text-white font-bold text-lg lg:text-xl mb-4 flex items-center justify-center gap-2">
                        <span className="text-2xl">🔑</span>
                        Your Unique Referral Code
                      </h4>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
                        <div className="bg-gradient-to-r from-primary-300 to-primary-400 text-gray-900 dark:text-gray-900 font-mono font-bold px-6 py-3 rounded-xl tracking-widest border-2 border-primary-200 dark:border-primary-300 shadow-lg text-lg lg:text-xl select-all">
                          {student.referralCode}
                        </div>
                        <button
                          className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-600 hover:to-primary-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2"
                          onClick={() => {
                            navigator.clipboard.writeText(student.referralCode);
                          }}
                          title="Copy Referral Code"
                        >
                          <span>📋</span>
                          Copy Code
                        </button>
                      </div>

                      <p className="text-gray-700 dark:text-primary-200 text-sm">
                        💡 Share this code with friends to start earning rewards!
                      </p>
                    </div>
                  </div>

                  {/* Share Section */}
                  <div className="text-center">
                    <h4 className="text-gray-800 dark:text-white font-bold text-lg mb-4">Share Your Referral Code</h4>
                    <ShareComponent
                      url={window.location.origin}
                      text={message}
                    />
                  </div>

                  {/* Footer Info */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-800 dark:text-white/90 text-sm leading-relaxed">
                      🚀 <strong>Pro Tip:</strong> Share your referral code on social media, WhatsApp groups, and with classmates to earn more wallet rewards!
                      <br />
                      <span className="text-primary-700 dark:text-primary-300 font-medium">
                        Every referral earns you instant wallet rewards!
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Bank Details Card - Only shown for eligible users (level 10 or pro subscription) */}

          {isEligibleForBankDetails(student) && (
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 lg:p-8 border border-white/30 my-4 mx-3 lg:mx-0 mx-3 lg:mx-0 hover-lift">
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 lg:w-20 h-12 lg:h-20 bg-gradient-to-r from-teal-500 via-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg glow-animation">
                  <FaUniversity className="text-white text-3xl" />
                </div>
                <div>
                  <h2 className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                    Bank Details
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg">
                    {bankDetails ? 'Your banking information' : 'Add your bank account information'}
                  </p>
                </div>
              </div>

              {/* Success Message */}
              {bankDetailsSaved && (
                <div className="my-4 mx-3 lg:mx-0 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-xl p-4 text-green-700 dark:text-green-300 flex items-center">
                  <FaCheckCircle className="mr-2" /> Bank details saved successfully!
                </div>
              )}

              {/* Bank Details Display */}
              {bankDetails && !showBankForm ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-4">

                  <div className="bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-2xl p-3 lg:p-6 border border-secondary-200 dark:border-secondary-700 hover-scale">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                        <FaUser className="text-white text-xl" />
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Account Holder</span>
                        <p className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">{bankDetails.accountHolderName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl p-3 lg:p-6 border border-purple-200 dark:border-purple-700 hover-scale">
                    <div className="flex items-center justify-between space-x-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                          <FaMoneyCheckAlt className="text-white text-xl" />
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Account Number</span>
                          <p className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">
                            {showBankDetails
                              ? bankDetails.accountNumber.replace(/(\d{4})/g, '$1 ').trim()
                              : (() => {
                                const raw = String(bankDetails.accountNumber || '');
                                if (!raw) return '';
                                const digitsOnly = raw.replace(/\D/g, '');
                                if (digitsOnly.length <= 4) return '*'.repeat(digitsOnly.length);
                                const visible = digitsOnly.slice(-4);
                                const masked = '*'.repeat(digitsOnly.length - 4);
                                const combined = `${masked}${visible}`;
                                return combined.replace(/(\d{4})/g, '$1 ').trim();
                              })()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowBankDetails((prev) => !prev)}
                        className="p-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/40 text-primary-600 dark:text-primary-300 transition-colors"
                        aria-label={showBankDetails ? 'Hide bank details' : 'Show bank details'}
                      >
                        {showBankDetails ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl p-3 lg:p-6 border border-green-200 dark:border-green-700 hover-scale">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                        <FaUniversity className="text-white text-xl" />
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Bank Name</span>
                        <p className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">{bankDetails.bankName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/30 rounded-2xl p-3 lg:p-6 border border-primary-200 dark:border-primary-700 hover-scale">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-500 rounded-xl flex items-center justify-center">
                        <FaBuilding className="text-white text-xl" />
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">Branch</span>
                        <p className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">{bankDetails.branchName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl p-3 lg:p-6 border border-red-200 dark:border-red-700 hover-scale lg:col-span-2">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <FaKey className="text-white text-xl" />
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-300 text-sm font-medium">IFSC Code</span>
                        <p className="text-lg lg:text-2xl font-bold text-gray-800 dark:text-white">{bankDetails.ifscCode}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Bank Details Form */}
              {showBankForm ? (
                <form onSubmit={handleBankFormSubmit} className="space-y-6 mb-8">
                  {bankFormErrors.general && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-4 text-red-700 dark:text-red-300">
                      {bankFormErrors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="accountHolderName"
                        value={bankFormData.accountHolderName}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 lg:px-6 py-3 lg:py-6 rounded-xl border ${bankFormErrors.accountHolderName
                          ? 'border-red-500 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500`}
                        placeholder="Enter account holder name"
                      />
                      {bankFormErrors.accountHolderName && (
                        <p className="text-red-500 text-sm mt-1">{bankFormErrors.accountHolderName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="accountNumber"
                        value={bankFormData.accountNumber}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 lg:px-6 py-3 lg:py-6 rounded-xl border ${bankFormErrors.accountNumber
                          ? 'border-red-500 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500`}
                        placeholder="Enter account number"
                      />
                      {bankFormErrors.accountNumber && (
                        <p className="text-red-500 text-sm mt-1">{bankFormErrors.accountNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={bankFormData.bankName}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 lg:px-6 py-3 lg:py-6 rounded-xl border ${bankFormErrors.bankName
                          ? 'border-red-500 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500`}
                        placeholder="Enter bank name"
                      />
                      {bankFormErrors.bankName && (
                        <p className="text-red-500 text-sm mt-1">{bankFormErrors.bankName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="ifscCode"
                        value={bankFormData.ifscCode}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 lg:px-6 py-3 lg:py-6 rounded-xl border ${bankFormErrors.ifscCode
                          ? 'border-red-500 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500`}
                        placeholder="Enter IFSC code"
                      />
                      {bankFormErrors.ifscCode && (
                        <p className="text-red-500 text-sm mt-1">{bankFormErrors.ifscCode}</p>
                      )}
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                      <label className="block text-gray-700 dark:text-gray-300 font-medium">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        name="branchName"
                        value={bankFormData.branchName}
                        onChange={handleBankFormChange}
                        className={`w-full px-4 lg:px-6 py-3 lg:py-6 rounded-xl border ${bankFormErrors.branchName
                          ? 'border-red-500 dark:border-red-700'
                          : 'border-gray-300 dark:border-gray-600'
                          } bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary-500`}
                        placeholder="Enter branch name"
                      />
                      {bankFormErrors.branchName && (
                        <p className="text-red-500 text-sm mt-1">{bankFormErrors.branchName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowBankForm(false)}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="text-sm" />
                          <span>Save Bank Details</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => setShowBankForm(true)}
                    className="px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 mx-auto"
                  >
                    {bankDetails ? (
                      <>
                        <FaEdit className="text-sm" />
                        <span>Edit Bank Details</span>
                      </>
                    ) : (
                      <>
                        <FaPlus className="text-sm" />
                        <span>Add Bank Details</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Level Progression Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 lg:p-8 border border-white/30 my-4 mx-3 lg:mx-0 hover-lift">
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-12 lg:w-20 h-12 lg:h-20 bg-gradient-to-r from-green-500 via-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg glow-animation">
                <FaTrophy className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                  Level Progression
                </h2>
                <p className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg">
                  Your journey from Starter to Legend
                </p>
              </div>
            </div>

            {/* Current Level Display */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-6 mb-6">
                <div className="w-12 lg:w-20 h-12 lg:h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-xl">
                  {(() => {
                    const BadgeIcon = levelBadgeIcons[userLevel.name] || levelBadgeIcons.Default;
                    return (
                      <BadgeIcon className="text-primary-500 dark:text-primary-200 text-xl lg:text-5xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                    );
                  })()}
                </div>
                <div className="text-left">
                  <div className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                    Level {userLevel.number} - {userLevel.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Your Current Level
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* High-Score Quizzes */}
              <div className="text-center p-2 lg:p-8 bg-gradient-to-br from-primary-50 to-red-100 dark:from-primary-900/30 dark:to-red-900/30 rounded-3xl border border-primary-200 dark:border-primary-700 hover-scale">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaFire className="text-white text-2xl" />
                </div>
                <div className="text-2xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">{highScoreQuizzes}</div>
                <div className="bg-gradient-to-r from-red-50 to-primary-100 dark:from-red-900/30 dark:to-primary-900/30 rounded-3xl border border-red-200 dark:border-red-700 hover-scale">
                  <div className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg font-semibold">High-Score Quizzes</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">{config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% + Score</div>
                </div>
              </div>
              {/* Total Quizzes Played */}
              <div className="text-center p-2 lg:p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-3xl border border-green-200 dark:border-green-700 hover-scale">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaBookOpen className="text-white text-2xl" />
                </div>
                <div className="text-2xl lg:text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{quizzesPlayed}</div>
                <div className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg font-semibold">Total Quizzes Played</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">Attempted</div>
              </div>
              {/* Success Rate */}
              <div className="text-center p-2 lg:p-8 bg-gradient-to-br from-red-50 to-primary-100 dark:from-red-900/30 dark:to-primary-900/30 rounded-3xl border border-red-200 dark:border-red-700 hover-scale">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-red-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FaChartLine className="text-white text-2xl" />
                </div>
                <div className="text-2xl lg:text-4xl font-bold text-primary-600 dark:text-red-400 mb-2">{highScoreRate}%</div>
                <div className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg font-semibold">Success Rate</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">High Scores</div>
              </div>
            </div>
          </div>



          {/* Enhanced Progress Bar */}
          <div className="my-4 mx-3 lg:mx-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 dark:text-gray-300 font-bold text-lg">Progress to Next Level</span>
              <span className="text-gray-600 dark:text-gray-400 font-semibold text-lg">
                {nextLevel ? Math.round((highScoreQuizzes / nextLevel.quizzesRequired) * 100) > 100 ? 100 : Math.round((highScoreQuizzes / nextLevel.quizzesRequired) * 100) : 100}%
              </span>
            </div>

            {/* Progress Summary Cards */}
            {nextLevel && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-700">
                  <div className="text-md lg:text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                    {highScoreQuizzes}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">High Score Quizzes</div>
                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">Completed</div>
                </div>

                <div className="text-center p-4 bg-secondary-50 dark:bg-secondary-900/30 rounded-xl border border-secondary-200 dark:border-secondary-700">
                  <div className="text-md lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">
                    {nextLevel.quizzesRequired}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Required</div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-400 font-medium">For Next Level</div>
                </div>

                <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-700">
                  <div className="text-md lg:text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">
                    {Math.max(0, nextLevel.quizzesRequired - highScoreQuizzes)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Quizzes Left</div>
                  <div className="text-xs text-primary-600 dark:text-primary-400 font-medium">To Complete</div>
                </div>
              </div>
            )}

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{
                  width: `${nextLevel ? Math.min((highScoreQuizzes / nextLevel.quizzesRequired) * 100, 100) : 100}%`
                }}
              ></div>
            </div>

            {nextLevel && (
              <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">{highScoreQuizzes}</span> / <span className="font-semibold">{nextLevel.quizzesRequired}</span> high-score quizzes completed
                <br />
                <span className="text-primary-600 dark:text-primary-400 font-medium">
                  {Math.max(0, nextLevel.quizzesRequired - highScoreQuizzes)} more needed for Level {nextLevel.number}
                </span>
              </div>
            )}
          </div>

          {/* Enhanced Next Level Info */}
          {nextLevel ? (
            <div className="my-4 mx-3 lg:mx-0 bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/30 dark:to-primary-900/30 rounded-3xl p-2 lg:p-8 border border-primary-200 dark:border-primary-700">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center">
                  {(() => {
                    const BadgeIcon = levelBadgeIcons[nextLevel.name] || levelBadgeIcons.Default;
                    return (
                      <BadgeIcon className="text-primary-500 dark:text-primary-200 text-3xl lg:text-5xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                    );
                  })()}
                </div>
                <div>
                  <h3 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white">Next Level: {nextLevel.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">Level {nextLevel.number}</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg">
                Need <span className="font-bold text-green-600 text-lg lg:text-xl">{Math.max(0, nextLevel.quizzesRequired - highScoreQuizzes)}</span> more high-score quizzes ({config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}%+) to unlock Level {nextLevel.number}.
              </p>
              <div className="text-gray-600 dark:text-gray-400 text-sm">
                Progress: <span className="font-semibold text-secondary-600">{highScoreQuizzes}</span> / <span className="font-semibold text-secondary-600">{nextLevel.quizzesRequired}</span> high-score quizzes completed
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Required: {nextLevel.quizzesRequired} total high-score quizzes ({config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}%+ score)
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-3xl p-8 border border-green-200 dark:border-green-700 hover-scale">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <FaCrown className="text-white text-2xl" />
                </div>
                <div>
                  <h3 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white">Congratulations!</h3>
                  <p className="text-gray-600 dark:text-gray-300 tex-sm lg:text-lg mt-2">
                    You have reached the highest level! You are a true Quiz Legend! 🏆
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
            <button
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white dark:text-white px-4 lg:px-8 py-2 lg:py-4 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-primary-500/25 hover:dark:shadow-primary-500/40 flex items-center justify-center space-x-3 mx-auto"
              onClick={() => { router.push('/levels'); }}
            >
              <FaArrowRight className="text-sm" />
              <span>View All Levels</span>
            </button>
          </div>

          {/* Rewards Section */}
          <div className="my-4 mx-3 lg:mx-0">
            {/* Quiz Progress */}
            {rewardsData?.quizProgress && (
              <div className="mt-4 sm:mt-6">
                <h4 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">📊</span>
                  Monthly Quiz Progress
                </h4>
                <div className="bg-gradient-to-r from-secondary-50 to-indigo-50 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-2xl p-4 sm:p-6 border border-secondary-200 dark:border-secondary-700">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300">
                        Quiz Progress: {rewardsData.quizProgress?.current || 0} / {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 50}
                      </span>
                      <span className="text-xs sm:text-lg font-medium text-gray-700 dark:text-gray-300">
                        {Math.round(rewardsData.quizProgress?.percentage || 0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 sm:h-2.5">
                      <div
                        className="bg-secondary-600 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${rewardsData.quizProgress?.percentage || 0}%` }}
                      ></div>
                    </div>
                    <ul className="text-gray-600 dark:text-gray-400 text-sm space-y-2">
                      <li className="flex items-center gap-2">• <strong>Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD}</strong> Required</li>
                      <li className="flex items-center gap-2">• <strong>{config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} High Score Quizzes</strong> with {config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% Accuracy</li>
                      <li className="flex items-center gap-2">• <strong>Active PRO Subscription</strong></li>
                    </ul>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
                      <div className="text-lg sm:text-lg lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">
                        {rewardsData.quizProgress?.current || 0}
                      </div>
                      <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Completed</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-secondary-200 dark:border-secondary-600">
                      <div className="text-lg sm:text-lg lg:text-2xl font-bold text-secondary-600 dark:text-secondary-400 mb-1">
                        {rewardsData.quizProgress?.current > rewardsData.quizProgress?.required ? 0 : rewardsData.quizProgress?.required - (rewardsData.quizProgress?.current || 0)}
                      </div>
                      <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Monthly Top Performers Info */}
            <div className="my-4 sm:my-6">
              <h4 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🏆</span>
                Monthly Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} Rewards
              </h4>
              <div className="bg-gradient-to-r from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20 border border-primary-200 dark:border-primary-700 rounded-lg p-4">
                <div className="text-center">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    Every month, the top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} PRO users with Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} and {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT} high-score quizzes win prizes from a dynamic prize pool (active PRO users × ₹{config.QUIZ_CONFIG.PRIZE_PER_PRO})!
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                    {[
                      { rank: '1st', pct: '25%', medal: '🥇', bg: 'bg-primary-100 dark:bg-primary-800/30', text: 'text-primary-800 dark:text-primary-200', bold: 'text-primary-700 dark:text-primary-300' },
                      { rank: '2nd', pct: '20%', medal: '🥈', bg: 'bg-gray-100 dark:bg-gray-800/30', text: 'text-gray-800 dark:text-gray-200', bold: 'text-gray-700 dark:text-gray-300' },
                      { rank: '3rd', pct: '15%', medal: '🥉', bg: 'bg-primary-100 dark:bg-primary-800/30', text: 'text-primary-800 dark:text-primary-200', bold: 'text-primary-600 dark:text-primary-300' },
                      { rank: '4th', pct: '12%', medal: '🏅', bg: 'bg-secondary-100 dark:bg-secondary-800/30', text: 'text-secondary-800 dark:text-secondary-200', bold: 'text-secondary-700 dark:text-secondary-300' },
                      { rank: '5th', pct: '8%', medal: '🏅', bg: 'bg-green-100 dark:bg-green-800/30', text: 'text-green-800 dark:text-green-200', bold: 'text-green-700 dark:text-green-300' },
                      { rank: '6th', pct: '6%', medal: '🏅', bg: 'bg-purple-100 dark:bg-purple-800/30', text: 'text-purple-800 dark:text-purple-200', bold: 'text-purple-700 dark:text-purple-300' },
                      { rank: '7th', pct: '5%', medal: '🏅', bg: 'bg-pink-100 dark:bg-pink-800/30', text: 'text-pink-800 dark:text-pink-200', bold: 'text-pink-700 dark:text-pink-300' },
                      { rank: '8th', pct: '4%', medal: '🏅', bg: 'bg-indigo-100 dark:bg-indigo-800/30', text: 'text-indigo-800 dark:text-indigo-200', bold: 'text-indigo-700 dark:text-indigo-300' },
                      { rank: '9th', pct: '3.5%', medal: '🏅', bg: 'bg-teal-100 dark:bg-teal-800/30', text: 'text-teal-800 dark:text-teal-200', bold: 'text-teal-700 dark:text-teal-300' },
                      { rank: '10th', pct: '1.5%', medal: '🏅', bg: 'bg-red-100 dark:bg-red-800/30', text: 'text-red-800 dark:text-red-200', bold: 'text-red-700 dark:text-red-300' },
                    ].map(({ rank, pct, medal, bg, text, bold }) => (
                      <div key={rank} className={`${bg} rounded-lg p-2`}>
                        <div className="text-lg mb-1">{medal}</div>
                        <div className={`text-xs font-semibold ${text}`}>{rank}</div>
                        <div className={`text-sm font-bold ${bold}`}>{pct} of pool</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-secondary-50 dark:from-purple-900/30 dark:to-secondary-900/30 rounded-3xl p-2 md:p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex flex-col md:flex-row items-center justify-between mb-4">
                <div className="flex flex-col md:flex-row items-center space-x-3 mb-4 md:mb-0 mt-4 md:mt-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <h3 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white">Rewards & Achievements</h3>
                    <p className="text-gray-600 dark:text-gray-300">Track your progress and unlock rewards</p>
                  </div>
                </div>
                <Link
                  href="/rewards"
                  className="px-3 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-purple-500 to-secondary-600 hover:from-purple-600 hover:to-secondary-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  View Rewards
                </Link>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-2xl border border-green-200 dark:border-green-600 sm:col-span-2 md:col-span-1">
                <div className="text-lg sm:text-lg lg:text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {rewardsLoading ? '...' : `₹${rewardsData?.claimableRewards?.toLocaleString() || '0'}`}
                </div>
                <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">Total Claimable</div>
              </div>
            </div>



            {/* Unlocked Rewards Details */}
            {rewardsData?.unlocked && rewardsData.unlocked.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h4 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">✅</span>
                  Unlocked Rewards Details
                </h4>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {rewardsData.unlocked.map((reward, index) => (
                    <div key={reward?._id || `unlocked-${reward?.level}-${index}`} className="bg-secondary-50 dark:bg-secondary-900/20 border border-secondary-200 dark:border-secondary-800 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-lg font-medium text-secondary-800 dark:text-secondary-300">
                          Level {reward?.level || 'N/A'}
                        </span>
                        <span className="text-xs text-secondary-600 dark:text-secondary-400">
                          {reward?.dateUnlocked ? new Date(reward.dateUnlocked).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-lg sm:text-lg lg:text-2xl font-bold text-secondary-700 dark:text-secondary-300 mb-3">
                        ₹{(reward?.amount || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 mb-3">
                        Ready to claim! Click the button below to claim your reward.
                      </p>
                      <button
                        onClick={() => router.push('/rewards')}
                        className="w-full bg-secondary-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-secondary-700 transition-colors text-sm sm:text-base"
                      >
                        Claim on Rewards Page
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claimed Rewards Details */}
            {rewardsData?.claimed && rewardsData.claimed.length > 0 && (
              <div className="mt-4 sm:mt-6">
                <h4 className="text-lg lg:text-xl font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🎉</span>
                  Claimed Rewards Details
                </h4>
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {rewardsData.claimed.map((reward, index) => (
                    <div key={reward?._id || `claimed-${reward?.level}-${index}`} className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-lg font-medium text-gray-800 dark:text-gray-200">
                          Level {reward?.level || 'N/A'}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {reward?.dateClaimed ? new Date(reward.dateClaimed).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <p className="text-lg sm:text-lg lg:text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">
                        ₹{(reward?.amount || 0).toLocaleString()}
                      </p>
                      <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Claimed
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}



            {/* Requirements Info */}
            <div className="mt-4 sm:mt-6">
              <MonthlyRewardsInfo />
            </div>
          </div>
          {/* Enhanced Quiz History Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 lg:p-8 border border-white/30 my-4 mx-3 lg:mx-0">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 lg:w-20 h-12 lg:h-20 bg-gradient-to-r from-red-500 via-primary-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg glow-animation">
                  <FaBrain className="text-white text-3xl" />
                </div>
                <div>
                  <h2 className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                    Quiz History
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                    Your quiz attempts and achievements
                  </p>
                </div>
              </div>
              {playedQuizzes.length > 0 && (
                <Link href="/quiz-history" className="w-full lg:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white dark:text-white px-4 lg:px-8 py-2 lg:py-4 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-primary-500/25 hover:dark:shadow-primary-500/40 flex items-center justify-center space-x-3">
                  View All
                </Link>
              )}
            </div>

            {playedQuizzes?.length === 0 ? (
              <div className="text-center py-4 lg:py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaBrain className="text-white text-4xl" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xl font-semibold mb-2">No quizzes played yet.</p>
                <p className="text-gray-500 dark:text-gray-500 text-lg">Start your quiz journey today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-4 xl:grid-cols-3">
                {playedQuizzes?.map((item, idx) => (
                  <div
                    key={item._id || idx}
                    onClick={() => showResult(item)}
                    className="group cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-3xl p-2 lg:p-8 border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4 hover:scale-105 hover-lift"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaMedal className="text-white text-2xl" />
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${item.scorePercentage >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {item.scorePercentage >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE ? '✅ High Score' : '📝 Completed'}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white mb-4 text-md md:text-lg lg:text-xl">
                      {item.quizTitle || 'Untitled Quiz'}
                    </h3>

                    <div className="space-y-3 text-base mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Score:</span>
                        <span className="font-bold text-gray-800 dark:text-white text-md lg:text-lg">{item.scorePercentage}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Correct:</span>
                        <span className="font-bold text-gray-800 dark:text-white">{item.score}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">{item.categoryName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {new Date(item.attemptedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white dark:text-white px-4 lg:px-8 py-2 lg:py-4 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-primary-500/25 hover:dark:shadow-primary-500/40 flex items-center justify-center space-x-3 mx-auto">
                      <span className="text-base">View Result</span>
                      <FaArrowRight className="ml-2 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Exam Attempt History Card */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-2 lg:p-8 border border-white/30 my-4 mx-3 lg:mx-0">
            <div className="flex flex-col lg:flex-row items-center justify-between mb-8">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 lg:w-20 h-12 lg:h-20 bg-gradient-to-r from-secondary-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg glow-animation">
                  <FaUniversity className="text-white text-3xl" />
                </div>
                <div>
                  <h2 className="text-md md:text-md lg:text-2xl xl:text-4xl font-bold text-gray-800 dark:text-white">
                    Exam History
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-md lg:text-lg">
                    Your exam attempts and performance
                  </p>
                </div>
              </div>
              {examAttempts.length > 0 && (
                <Link href="/exam-history" className="w-full lg:w-auto bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white dark:text-white px-4 lg:px-8 py-2 lg:py-4 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-primary-500/25 hover:dark:shadow-primary-500/40 flex items-center justify-center space-x-3">
                  View All
                </Link>
              )}
            </div>

            {examAttempts?.length === 0 ? (
              <div className="text-center py-4 lg:py-16">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaUniversity className="text-white text-4xl" />
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-xl font-semibold mb-2">No exams attempted yet.</p>
                <p className="text-gray-500 dark:text-gray-500 text-lg">Start Exam Prep today!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2 lg:gap-4 xl:grid-cols-3">
                {examAttempts?.slice(0, 6).map((item, idx) => (
                  <div
                    key={item._id || idx}
                    onClick={() => {
                      if (item.practiceTest) {
                        router.push(`/govt-exams/test/${item.practiceTest}/result?attempt=${item._id}`);
                      }
                    }}
                    className="group cursor-pointer bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-3xl p-2 lg:p-8 border border-gray-200 dark:border-gray-600 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-4 hover:scale-105 hover-lift"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <FaGraduationCap className="text-white text-2xl" />
                      </div>
                      <div className={`px-4 py-2 rounded-full text-sm font-bold ${item.accuracy >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : item.accuracy >= 50
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                        {item.accuracy >= config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE ? '✅ High Score' : item.accuracy >= 50 ? '📝 Good' : '📝 Attempted'}
                      </div>
                    </div>

                    <h3 className="font-bold text-gray-800 dark:text-white mb-2 text-md md:text-lg lg:text-xl">
                      {item.testTitle || 'Untitled Test'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {item.examName || 'Unknown Exam'}
                    </p>

                    <div className="space-y-3 text-base mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Score:</span>
                        <span className="font-bold text-gray-800 dark:text-white text-md md:text-lg">
                          {item.score}/{item.totalMarks}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Accuracy:</span>
                        <span className="font-bold text-gray-800 dark:text-white">{item.accuracy?.toFixed(1) || 0}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Correct:</span>
                        <span className="font-bold text-gray-800 dark:text-white">{item.correctCount || 0}</span>
                      </div>
                      {item.rank && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Rank:</span>
                          <span className="font-bold text-primary-600 dark:text-primary-400">#{item.rank}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Category:</span>
                        <span className="font-bold text-secondary-600 dark:text-secondary-400">{item.categoryName || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Date:</span>
                        <span className="font-bold text-gray-800 dark:text-white">
                          {item.submittedAt ? new Date(item.submittedAt).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 dark:from-primary-500 dark:to-secondary-500 dark:hover:from-primary-600 dark:hover:to-secondary-600 text-white dark:text-white px-4 lg:px-8 py-2 lg:py-4 rounded-2xl transition-all duration-300 font-bold text-lg transform hover:scale-105 shadow-lg hover:shadow-xl dark:shadow-secondary-500/25 hover:dark:shadow-primary-500/40 flex items-center justify-center space-x-3 mx-auto">
                      <span className="text-base">View Result</span>
                      <FaArrowRight className="ml-2 text-sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Transactions Section */}
          <div className="my-4 mx-3 lg:mx-0 pb-6">
            <PaymentTransactions />
          </div>
        </div>
      </>
    </>

  );
}

export default ProfilePage;

