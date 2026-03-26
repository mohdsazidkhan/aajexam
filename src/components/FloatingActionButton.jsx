"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { FaPlus } from "react-icons/fa";
import CreateActionModal from './CreateActionModal';

const FloatingActionButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Check if user is logged in (client-side only)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userSubscription, setUserSubscription] = useState("free");
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);

  React.useEffect(() => {
    // Check localStorage for user info
    if (typeof window !== "undefined") {
      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const user = JSON.parse(userInfo);
        setIsLoggedIn(true);
        setUserSubscription(user?.subscriptionStatus || "free");
        
        // Check if subscription is expired
        if (user?.subscriptionExpiry) {
          const now = new Date();
          const expiryDate = new Date(user.subscriptionExpiry);
          setIsSubscriptionExpired(expiryDate < now);
        }
      }
    }
  }, []);

  // Only show for users with active paid subscription
  const hasActiveSubscription = () => {
    if (!isLoggedIn) return false;
    
    const paidPlans = ['basic', 'premium', 'pro'];
    if (!paidPlans.includes(userSubscription.toLowerCase())) return false;
    
    return !isSubscriptionExpired;
  };

  if (!hasActiveSubscription()) return null;

  return (
    <>
      {/* Floating Action Button - Only visible on mobile for paid users */}
      <div className="fab-container">
        <button
          onClick={() => setIsModalOpen(true)}
          className="fab-button"
          aria-label="Create Quiz or Question"
        >
          <FaPlus  />
        </button>
      </div>

      {/* Bottom Sheet Modal */}
      <CreateActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userSubscription={userSubscription}
      />

      <style jsx>{`
        /* Floating Action Button - Mobile Only */
        .fab-container {
          position: fixed;
          bottom: 80px;
          right: 0;
          left: 0;
          z-index: 60;
          justify-content: center;
          display: flex;
        }

        .fab-button {
          width: 40px;
          height: 40px;
          border-radius: 4%;
          background: linear-gradient(135deg, #f4c838 0%, #cd370f 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;

        }
        .fab-button svg {
          font-size: 16px;
        }
        .fab-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
        }

        .fab-button:active {
          transform: scale(0.95);
        }

        /* Modal Backdrop */
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Bottom Sheet */
        .bottom-sheet {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-radius: 24px 24px 0 0;
          z-index: 1001;
          max-height: 80vh;
          overflow-y: auto;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
        }

        .bottom-sheet.open {
          transform: translateY(0);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        /* Dark mode support */
        :global(.dark) .bottom-sheet {
          background: #1f2937;
        }

        /* Handle Bar */
        .bottom-sheet-handle {
          padding: 12px 0;
          display: flex;
          justify-content: center;
          cursor: grab;
        }

        .handle-bar {
          width: 40px;
          height: 4px;
          background: #d1d5db;
          border-radius: 2px;
        }

        :global(.dark) .handle-bar {
          background: #4b5563;
        }

        /* Header */
        .bottom-sheet-header {
          padding: 0 10px 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #e5e7eb;
        }

        :global(.dark) .bottom-sheet-header {
          border-bottom-color: #374151;
        }

        .close-button {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f3f4f6;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }

        .close-button:hover {
          background: #e5e7eb;
          color: #374151;
        }

        :global(.dark) .close-button {
          background: #374151;
          color: #9ca3af;
        }

        :global(.dark) .close-button:hover {
          background: #4b5563;
          color: #d1d5db;
        }

        /* Content */
        .bottom-sheet-content {
          padding: 20px 10px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* Action Cards */
        .action-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px;
          border-radius: 16px;
          border: 2px solid transparent;
          background: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }

        .action-card:active {
          transform: translateY(0);
        }

        .quiz-card {
          border-color: #e0e7ff;
          background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
        }

        .quiz-card:hover {
          border-color: #818cf8;
        }

        .question-card {
          border-color: #fce7f3;
          background: linear-gradient(135deg, #fef3f8 0%, #fce7f3 100%);
        }

        .question-card:hover {
          border-color: #f472b6;
        }

        :global(.dark) .action-card {
          background: #374151;
        }

        :global(.dark) .quiz-card {
          background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%);
          border-color: #6366f1;
        }

        :global(.dark) .question-card {
          background: linear-gradient(135deg, #831843 0%, #9d174d 100%);
          border-color: #ec4899;
        }

        /* Action Card Icon */
        .action-card-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quiz-icon {
          background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%);
          color: white;
        }

        .question-icon {
          background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%);
          color: white;
        }

        /* Action Card Content */
        .action-card-content {
          flex: 1;
        }

        .action-card-title {
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 2px;
        }

        :global(.dark) .action-card-title {
          color: white;
        }

        .action-card-description {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.4;
        }

        :global(.dark) .action-card-description {
          color: #9ca3af;
        }

        /* Action Card Arrow */
        .action-card-arrow {
          font-size: 24px;
          color: #9ca3af;
          transition: transform 0.2s;
        }

        .action-card:hover .action-card-arrow {
          transform: translateX(4px);
          color: #6b7280;
        }

        :global(.dark) .action-card-arrow {
          color: #6b7280;
        }

        :global(.dark) .action-card:hover .action-card-arrow {
          color: #9ca3af;
        }

        /* Footer */
        .bottom-sheet-footer {
          padding: 10px;
          border-top: 1px solid #e5e7eb;
        }

        :global(.dark) .bottom-sheet-footer {
          border-top-color: #374151;
        }

        /* Desktop - Hide everything */
        @media (min-width: 769px) {
          .fab-container,
          .modal-backdrop,
          .bottom-sheet {
            display: none !important;
          }
        }

        /* Smooth scrolling */
        .bottom-sheet::-webkit-scrollbar {
          width: 6px;
        }

        .bottom-sheet::-webkit-scrollbar-track {
          background: transparent;
        }

        .bottom-sheet::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }

        :global(.dark) .bottom-sheet::-webkit-scrollbar-thumb {
          background: #4b5563;
        }
      `}</style>
    </>
  );
};

export default FloatingActionButton;
