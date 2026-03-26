import { useRouter } from 'next/router';
import Head from 'next/head';
import { FaTrophy, FaBrain, FaShieldAlt, FaUsers, FaRocket, FaStar, FaAward, FaGraduationCap, FaLightbulb, FaHeart, FaChartLine, FaBook, FaCertificate } from 'react-icons/fa';

import MobileAppWrapper from '../MobileAppWrapper';
import config from '../../lib/config/appConfig';
import UnifiedFooter from '../UnifiedFooter';
import AuthorBio from '../AuthorBio';
import { generateBreadcrumbSchema } from '../../utils/schema';
import { getCanonicalUrl } from '../../utils/seo';

const AboutUs = () => {
  const router = useRouter();
  const canonicalUrl = getCanonicalUrl(router.asPath);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us' }
  ]);

  return (
    <MobileAppWrapper title="About Us">
      <Head>
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div className="min-h-screen bg-subg-light dark:bg-subg-dark">
        <div className="container mx-auto px-4 lg:px-10 py-8 mt-0">

          {/* Hero Section */}
          <div className="text-center mb-4 lg:mb-12">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTrophy className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl lg:text-3xl xl:text-5xl font-bold bg-gradient-to-r from-yellow-600 via-red-600 to-yellow-700 bg-clip-text text-transparent mb-4">
              About SUBG QUIZ
            </h1>
            <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              India's Premier Government Exam Preparation Platform - Where Knowledge Meets Success
            </p>
          </div>

          {/* Mission Statement */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-3 md:p-6 lg:p-8 border border-white/20 mb-12">
            <div className="flex items-center space-x-4 mb-2 lg:mb-6">
              <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <FaRocket className="text-white text-2xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                Our Mission & Vision
              </h2>
            </div>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <p className="text-md lg:text-lg leading-relaxed">
                <strong>SUBG QUIZ</strong> is India's most comprehensive government exam preparation platform, dedicated to empowering millions of aspirants preparing for competitive examinations. Founded with the vision of democratizing quality education, we provide accessible, affordable, and effective learning resources for students across the country.
              </p>

              <p className="text-md lg:text-lg leading-relaxed">
                Our platform specializes in government exam preparation including <strong>SSC (Staff Selection Commission)</strong>, <strong>UPSC (Union Public Service Commission)</strong>, <strong>Banking exams (IBPS, SBI)</strong>, <strong>Railway Recruitment Board (RRB)</strong>, and various state-level competitive examinations. With over <strong>2,000+ practice quizzes</strong> and a unique <strong>10-level progression system</strong>, we ensure comprehensive coverage of all exam syllabus.
              </p>

              <p className="text-md lg:text-lg leading-relaxed">
                We believe that every student deserves access to high-quality educational resources regardless of their economic background. Our mission is to bridge the gap between aspiration and achievement by providing scientifically designed practice tests, detailed performance analytics, and personalized learning paths that adapt to each student's unique needs and learning pace.
              </p>

              <p className="text-md lg:text-lg leading-relaxed">
                What sets SUBG QUIZ apart is our commitment to <strong>skill-based learning</strong> and <strong>merit recognition</strong>. Unlike traditional learning platforms, we combine rigorous academic preparation with a comprehensive performance-based recognition system. Our Daily, Weekly, and Monthly programs identify top performers who demonstrate exceptional dedication and knowledge.
              </p>
            </div>
          </div>

          {/* Educational Approach */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-3 md:p-6 lg:p-8 border border-white/20 mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <FaBook className="text-white text-2xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white">
                Our Educational Approach
              </h2>
            </div>

            <div className="space-y-6 text-gray-700 dark:text-gray-300">
              <p className="text-md lg:text-lg leading-relaxed">
                Our pedagogy is rooted in evidence-based learning methodologies proven to enhance retention and understanding. We employ <strong>spaced repetition</strong>, <strong>active recall</strong>, and <strong>adaptive learning algorithms</strong> to optimize your study sessions and maximize learning outcomes.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">10-Level Progression System</h3>
              <p className="text-md lg:text-lg leading-relaxed">
                Our unique 10-level system (from Starter to Legend) provides a structured learning path that gradually increases in difficulty. Each level is carefully designed to build upon previous knowledge while introducing new concepts and question patterns commonly found in government exams. This systematic progression ensures students develop a strong foundation before advancing to more complex topics.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Comprehensive Exam Coverage</h3>
              <p className="text-md lg:text-lg leading-relaxed">
                Our question bank covers all major subjects tested in government exams including <strong>General Intelligence & Reasoning</strong>, <strong>Quantitative Aptitude</strong>, <strong>English Language</strong>, <strong>General Awareness</strong>, and <strong>Current Affairs</strong>. Each quiz is meticulously crafted by subject matter experts with years of experience in competitive exam coaching.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-6 mb-3">Performance Analytics</h3>
              <p className="text-md lg:text-lg leading-relaxed">
                We provide detailed analytics that track your progress across multiple dimensions - accuracy rates, time management, topic-wise performance, and comparative analysis with peer groups. These insights help you identify strengths and weaknesses, allowing for targeted improvement in specific areas.
              </p>
            </div>
          </div>

          {/* Platform Features */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-3 md:p-6 lg:p-8 border border-white/20 mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center">
              Platform Features & Benefits
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <FaBrain className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Adaptive Learning</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our AI-powered system adapts to your learning pace and style, providing personalized quiz recommendations based on your performance history and areas needing improvement.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mb-4">
                  <FaChartLine className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Detailed Analytics</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Track your progress with comprehensive analytics including accuracy trends, time management metrics, subject-wise performance, and comparative rankings.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <FaCertificate className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Expert-Curated Content</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  All quizzes are designed by experienced educators and exam experts who understand the nuances of government competitive examinations.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-red-500 rounded-xl flex items-center justify-center mb-4">
                  <FaGraduationCap className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Multi-Exam Preparation</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Prepare for multiple government exams simultaneously with our comprehensive question bank covering SSC, UPSC, Banking, Railways, and state-level exams.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-4">
                  <FaStar className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Premium Features</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Access advanced features including unlimited practice tests, detailed solution explanations, and priority support with our premium subscription plans.
                </p>
              </div>

              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-4 lg:p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <FaTrophy className="text-white text-xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Performance Recognition</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Top performers are recognized daily, weekly, and monthly through our merit-based programs that celebrate academic excellence and consistent performance.
                </p>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-3 md:p-6 lg:p-8 border border-white/20 mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-yellow-500 to-red-500 rounded-2xl flex items-center justify-center">
                <FaShieldAlt className="text-white text-md lg:text-2xl" />
              </div>
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white">
                Trust, Credibility & Commitment
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Our Commitment to Excellence</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  SUBG QUIZ operates on a foundation of <strong>100% skill-based learning</strong> with no element of chance or gambling. Every achievement on our platform is earned through genuine knowledge, hard work, and consistent performance. We are committed to maintaining the highest standards of educational integrity and fairness.
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  As a <strong>UDYAM registered enterprise</strong> led by <strong>Mohd Sazid Khan</strong>, we operate with complete transparency and accountability. Our platform complies with all applicable educational technology regulations and data protection laws, ensuring your personal information and learning data remain secure and confidential.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  We believe in responsible education technology that empowers students without creating unhealthy competition or stress. Our platform is designed to foster a positive learning environment that encourages growth, celebrates progress, and supports every student's journey toward their career goals.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Why Students Choose SUBG QUIZ</h3>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHeart className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>Comprehensive Coverage:</strong> 2000+ quizzes covering all major government exams</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHeart className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>Expert-Designed Content:</strong> Questions crafted by experienced exam coaches</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHeart className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>Secure Platform:</strong> Bank-grade security and data encryption</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHeart className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>24/7 Support:</strong> Dedicated customer support team always available</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHeart className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>Affordable Pricing:</strong> Quality education accessible to all economic backgrounds</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <FaHeart className="text-white text-xs" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300"><strong>Regular Updates:</strong> Content updated regularly to reflect latest exam patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-yellow-100 to-red-100 dark:from-yellow-800 dark:to-red-800 rounded-3xl p-3 md:p-6 lg:p-8 text-white">
              <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                Ready to Start Your Exam Preparation Journey?
              </h2>
              <p className="text-md lg:text-xl mb-2 lg:mb-6 opacity-90 text-gray-800 dark:text-white">
                Join thousands of successful aspirants who achieved their government job dreams with SUBG QUIZ
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-white text-gray-700 dark:text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
              >
                Begin Your Preparation Today
              </button>
            </div>
          </div>

          {/* Author Bio */}
          <AuthorBio />

          {/* Last Updated */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            Last Updated: February 12, 2026
          </p>

        </div>
      </div>
      <UnifiedFooter />
    </MobileAppWrapper>
  );
};

export default AboutUs;
