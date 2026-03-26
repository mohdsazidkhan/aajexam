"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { FaTimes, FaBook, FaQuestionCircle, FaBlog } from "react-icons/fa";
import { getCurrentUser } from "../lib/utils/authUtils";
import { toast } from "react-toastify";

const CreateActionModal = ({ isOpen, onClose }) => {
  const router = useRouter();

  if (!isOpen) return null;

  const handleQuizClick = () => {
    onClose?.();
    router.push("/pro/quiz/create");
  };

  const handleQuestionClick = () => {
    onClose?.();
    router.push("/pro/questions/new");
  };

  const handleBlogClick = () => {
    onClose?.();
    router.push("/pro/create-blog");
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`bottom-sheet open`}>
        <div className="bottom-sheet-handle">
          <div className="handle-bar"></div>
        </div>

        <div className="bottom-sheet-header">
          <h3 className="text-md lg:text-md lg:text-xl font-bold text-gray-800 dark:text-white">
            What would you like to post?
          </h3>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="bottom-sheet-content">
          <button onClick={handleQuizClick} className="action-card quiz-card">
            <div className="action-card-icon quiz-icon">
              <FaBook className="text-3xl" />
            </div>
            <div className="action-card-content">
              <h4 className="action-card-title">Create Quiz</h4>
              <p className="action-card-description">
                Design custom quizzes with 5-10 questions
              </p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>

          <button onClick={handleQuestionClick} className="action-card question-card">
            <div className="action-card-icon question-icon">
              <FaQuestionCircle className="text-3xl" />
            </div>
            <div className="action-card-content">
              <h4 className="action-card-title">Post Question</h4>
              <p className="action-card-description">
                Share interesting questions with the community
              </p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>

          <button onClick={handleBlogClick} className="action-card blog-card">
            <div className="action-card-icon blog-icon">
              <FaBlog className="text-3xl" />
            </div>
            <div className="action-card-content">
              <h4 className="action-card-title">Post Blog</h4>
              <p className="action-card-description">
                Write blogs and share your knowledge with the community
              </p>
            </div>
            <div className="action-card-arrow">→</div>
          </button>
        </div>
      </div>


      <style jsx>{`
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
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
        .bottom-sheet.open { transform: translateY(0); }
        :global(.dark) .bottom-sheet { background: #1f2937; }
        .bottom-sheet-handle { padding: 12px 0; display: flex; justify-content: center; }
        .handle-bar { width: 40px; height: 4px; background: #d1d5db; border-radius: 2px; }
        :global(.dark) .handle-bar { background: #4b5563; }
        .bottom-sheet-header { padding: 0 10px 10px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e7eb; }
        :global(.dark) .bottom-sheet-header { border-bottom-color: #374151; }
        .close-button { width: 28px; height: 28px; border-radius: 50%; background: #f3f4f6; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #6b7280; transition: all 0.2s; }
        .close-button:hover { background: #e5e7eb; color: #374151; }
        :global(.dark) .close-button { background: #374151; color: #9ca3af; }
        :global(.dark) .close-button:hover { background: #4b5563; color: #d1d5db; }
        .bottom-sheet-content { padding: 20px 10px; display: flex; flex-direction: column; gap: 16px; }
        .action-card { display: flex; align-items: center; gap: 10px; padding: 5px; border-radius: 16px; border: 2px solid transparent; background: white; cursor: pointer; transition: all 0.3s ease; text-align: left; width: 100%; }
        .action-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .action-card:active { transform: translateY(0); }
        .quiz-card { border-color: #e0e7ff; background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%); }
        .quiz-card:hover { border-color: #818cf8; }
        .question-card { border-color: #fce7f3; background: linear-gradient(135deg, #fef3f8 0%, #fce7f3 100%); }
        .question-card:hover { border-color: #f472b6; }
        .blog-card { border-color: #e9d5ff; background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%); }
        .blog-card:hover { border-color: #a855f7; }
        :global(.dark) .action-card { background: #374151; }
        :global(.dark) .quiz-card { background: linear-gradient(135deg, #312e81 0%, #4c1d95 100%); border-color: #6366f1; }
        :global(.dark) .question-card { background: linear-gradient(135deg, #831843 0%, #9d174d 100%); border-color: #ec4899; }
        :global(.dark) .blog-card { background: linear-gradient(135deg, #581c87 0%, #6b21a8 100%); border-color: #9333ea; }
        .action-card-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .quiz-icon { background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%); color: white; }
        .question-icon { background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); color: white; }
        .blog-icon { background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); color: white; }
        .action-card-content { flex: 1; }
        .action-card-title { font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 2px; }
        :global(.dark) .action-card-title { color: white; }
        .action-card-description { font-size: 14px; color: #6b7280; line-height: 1.4; }
        :global(.dark) .action-card-description { color: #9ca3af; }
        .action-card-arrow { font-size: 24px; color: #9ca3af; transition: transform 0.2s; }
        .action-card:hover .action-card-arrow { transform: translateX(4px); color: #6b7280; }
        :global(.dark) .action-card-arrow { color: #6b7280; }
        :global(.dark) .action-card:hover .action-card-arrow { color: #9ca3af; }
      `}</style>
    </>
  );
};

export default CreateActionModal;


