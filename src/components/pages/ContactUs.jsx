
import { useState } from "react";

import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaHeadset,
  FaComments,
  FaRocket,
} from "react-icons/fa";
// MobileAppWrapper import removed
import UnifiedFooter from '../UnifiedFooter';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaWhatsapp,
  FaDiscord,
  FaTelegramPlane,
} from "react-icons/fa";

// Define social links from .env
const socialLinks = [
  { icon: <FaFacebookF />, url: process.env.NEXT_PUBLIC_FACEBOOK_URL },
  { icon: <FaTwitter />, url: process.env.NEXT_PUBLIC_TWITTER_URL },
  { icon: <FaInstagram />, url: process.env.NEXT_PUBLIC_INSTAGRAM_URL },
  { icon: <FaYoutube />, url: process.env.NEXT_PUBLIC_YOUTUBE_URL },
  { icon: <FaLinkedinIn />, url: process.env.NEXT_PUBLIC_LINKEDIN_URL },
  { icon: <FaWhatsapp />, url: process.env.NEXT_PUBLIC_WHATSAPP_URL },
  { icon: <FaDiscord />, url: process.env.NEXT_PUBLIC_DISCORD_URL },
  { icon: <FaTelegramPlane />, url: process.env.NEXT_PUBLIC_TELEGRAM_URL },
];

const ContactUs = ({ contactInfo = {
  email: 'support@mohdsazidkhan.com',
  phone: '+91 7678 13 1912',
  address: 'Badarpur, Delhi, India',
  businessHours: 'Mon - Fri: 9:00 AM - 9:00 PM'
} }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: `Subject: ${formData.subject}\n${formData.message}`,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <>
      <div className="min-h-screen bg-aajexam-light dark:bg-aajexam-dark">
        <div className="container mx-auto px-4 lg:px-10 py-8 lg:py-8 mt-0">
          {/* Hero Section */}
          <div className="text-center mb-4 lg:mb-12">
            <div className="w-16 lg:w-24 h-16 lg:h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaComments className="text-white text-3xl" />
            </div>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary-600 via-red-600 to-primary-700 bg-clip-text text-transparent mb-4">
              Get in Touch
            </h1>
            <p className="text-md lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Have questions about our quiz platform? We'd love to hear from you.
              Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl px-2 py-4 md:p-8 border border-white/20">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white mb-6">
                  Contact Information
                </h2>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/30 dark:to-red-900/30 rounded-2xl border border-primary-200 dark:border-primary-700">
                    <div className="w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <FaEnvelope className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Email
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/30 dark:to-teal-900/30 rounded-2xl border border-green-200 dark:border-green-700">
                    <div className="w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <FaPhone className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Phone
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {contactInfo.phone}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/30 dark:to-red-900/30 rounded-2xl border border-primary-200 dark:border-primary-700">
                    <div className="w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <FaMapMarkerAlt className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Address
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-primary-50 to-red-50 dark:from-primary-900/30 dark:to-red-900/30 rounded-2xl border border-primary-200 dark:border-primary-700">
                    <div className="w-8 lg:w-12 h-8 lg:h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                      <FaClock className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        Business Hours
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {contactInfo.businessHours}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Support */}
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
                <div className="text-center">
                  <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaHeadset className="text-white text-2xl" />
                  </div>
                  <h3 className="text-md lg:text-2xl font-bold text-gray-800 dark:text-white mb-4">
                    Need Immediate Help?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Our support team is available 24/7 to assist you with any
                    questions or issues.
                  </p>
                  <button className="bg-gradient-to-r from-green-500 to-primary-500 text-white px-3 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold hover:from-green-600 hover:to-primary-600 transition-all duration-300 transform hover:scale-105">
                    Live Chat Support
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl px-2 py-4 md:p-8 border border-white/20">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center">
                  <FaPaperPlane className="text-white text-2xl" />
                </div>
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-white">
                  Send Message
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter your email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-300 resize-none"
                    placeholder="Enter your message here..."
                  />
                </div>

                {status === "success" && (
                  <div className="text-green-600 dark:text-green-400 font-semibold">
                    Message sent successfully!
                  </div>
                )}
                {status === "error" && (
                  <div className="text-primary-600 dark:text-red-400 font-semibold">
                    Failed to send message. Please try again.
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-2 lg:py-3 px-4 lg:px-6 rounded-xl font-semibold hover:from-primary-600 hover:to-secondary-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <FaPaperPlane className="text-sm" />
                  <span>Send Message</span>
                </button>
              </form>
              <div className="mt-8 flex flex-wrap justify-center items-center gap-2 lg:gap-4">
                {socialLinks.map((item, index) => (
                  <a
                    key={index}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={new URL(item.url).hostname}
                    className="w-8 lg:w-11 h-8 lg:h-11 rounded-full text-white flex items-center justify-center text-xl 
           shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3
           bg-gradient-to-bl from-primary-500 to-secondary-500 
           dark:from-gray-700 dark:to-gray-900 hover:shadow-2xl"
                  >
                    {item.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-4 lg:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-8">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-6 text-center border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaRocket className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Fast Response
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get quick responses to your queries within 24 hours
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-6 text-center border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                24/7 Support
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Round-the-clock customer support for all your needs
              </p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl lg:rounded-2xl p-3 lg:p-6 text-center border border-white/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-10 lg:w-16 h-10 lg:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaComments className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                Expert Team
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Experienced professionals ready to help you succeed
              </p>
            </div>
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default ContactUs;



