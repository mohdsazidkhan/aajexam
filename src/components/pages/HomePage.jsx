"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import config from '../../lib/config/appConfig';

import {
  FaTrophy,
  FaCrown,
  FaStar,
  FaMedal,
  FaRocket,
  FaBrain,
  FaChartLine,
  FaAward,
  FaGem,
  FaBook,
  FaFlask,
  FaLaptopCode,
  FaGlobe,
  FaCalculator,
  FaPalette,
  FaLeaf,
  FaUserGraduate,
  FaLayerGroup,
  FaClock,
  FaQuestionCircle,
  FaUserCircle,
  FaLevelUpAlt,
  FaArrowRight,
  FaMobileAlt,
  FaDownload,
  FaGoogle,
  FaUsers,
  FaGraduationCap,
  FaNewspaper,
  FaHistory,
  FaFutbol,
  FaFilm,
  FaLanguage,
  FaPlane,
  FaComments,
  FaTh,
  FaGamepad,
  FaBriefcase,
  FaCheckCircle,
  FaShieldAlt,
  FaDollarSign,
} from "react-icons/fa";
import { FaMagic } from "react-icons/fa";
import API from "../../lib/api";
import { hasActiveSubscription } from "../../lib/utils/subscriptionUtils";
import { handleAuthError } from "../../lib/utils/authUtils";
import QuizStartModal from "../QuizStartModal";
import TopPerformers from "../TopPerformers";
import SystemUpdateModal from "../SystemUpdateModal";
import MonthlyWinnersDisplay from "../MonthlyWinnersDisplay";
import LivePrizePool from "../LivePrizePool";
import Skeleton from "../Skeleton";
import HomePageSkeleton from "../HomePageSkeleton";
import CompetitionProgressCard from "../CompetitionProgressCard";

import UnifiedFooter from "../UnifiedFooter";
import ReferralBanner from "../ReferralBanner";
import Sidebar from "../Sidebar";
import { useSelector } from "react-redux";
import { safeLocalStorage } from "../../lib/utils/storage";
import MobileAppWrapper from "../MobileAppWrapper";
// Category color mappings for both light and dark modes
const getCategoryColors = (categoryName) => {
  const colors = {
    "General Knowledge": {
      background: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      accent: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      titleColor: 'text-gray-800 dark:text-gray-200',
      descriptionColor: 'text-gray-700 dark:text-gray-300',
      labelColor: 'text-gray-600 dark:text-gray-400',
      valueColor: 'text-gray-800 dark:text-gray-200',
      iconGradient: 'from-gray-400 to-gray-500',
      buttonGradient: 'from-gray-600 to-gray-700'
    },
    "Current Affairs": {
      background: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
      border: 'border-red-200 dark:border-red-700',
      accent: 'bg-gradient-to-br from-red-500/20 to-pink-500/20',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200',
      iconGradient: 'from-red-400 to-secondary-500',
      buttonGradient: 'from-red-600 to-red-700'
    },
    "Science": {
      background: 'bg-gradient-to-br from-secondary-50 to-cyan-50 dark:from-secondary-900/20 dark:to-cyan-900/20',
      border: 'border-secondary-200 dark:border-secondary-700',
      accent: 'bg-gradient-to-br from-secondary-500/20 to-cyan-500/20',
      iconBg: 'bg-secondary-100 dark:bg-secondary-800',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      titleColor: 'text-secondary-800 dark:text-secondary-200',
      descriptionColor: 'text-secondary-700 dark:text-secondary-300',
      labelColor: 'text-secondary-600 dark:text-secondary-400',
      valueColor: 'text-secondary-800 dark:text-secondary-200',
      iconGradient: 'from-secondary-400 to-secondary-500',
      buttonGradient: 'from-secondary-600 to-secondary-700'
    },
    "Mathematics": {
      background: 'bg-gradient-to-br from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-secondary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-600 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-secondary-400',
      valueColor: 'text-primary-800 dark:text-primary-200',
      iconGradient: 'from-primary-400 to-primary-500',
      buttonGradient: 'from-primary-600 to-primary-700'
    },
    "History": {
      background: 'bg-gradient-to-br from-amber-50 to-primary-50 dark:from-amber-900/20 dark:to-primary-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      accent: 'bg-gradient-to-br from-amber-500/20 to-primary-500/20',
      iconBg: 'bg-amber-100 dark:bg-amber-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
      titleColor: 'text-amber-800 dark:text-amber-200',
      descriptionColor: 'text-amber-700 dark:text-amber-300',
      labelColor: 'text-amber-600 dark:text-amber-400',
      valueColor: 'text-amber-800 dark:text-amber-200',
      iconGradient: 'from-amber-400 to-amber-500',
      buttonGradient: 'from-amber-600 to-amber-700'
    },
    "Geography": {
      background: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-700',
      accent: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      iconBg: 'bg-green-100 dark:bg-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      descriptionColor: 'text-green-700 dark:text-green-300',
      labelColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-800 dark:text-green-200',
      iconGradient: 'from-green-400 to-green-500',
      buttonGradient: 'from-green-600 to-green-700'
    },
    "Sports": {
      background: 'bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      accent: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      titleColor: 'text-emerald-800 dark:text-emerald-200',
      descriptionColor: 'text-emerald-700 dark:text-emerald-300',
      labelColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-800 dark:text-emerald-200',
      iconGradient: 'from-emerald-400 to-emerald-500',
      buttonGradient: 'from-emerald-600 to-emerald-700'
    },
    "Entertainment": {
      background: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      border: 'border-pink-200 dark:border-pink-700',
      accent: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      iconBg: 'bg-pink-100 dark:bg-pink-800',
      iconColor: 'text-pink-600 dark:text-pink-400',
      titleColor: 'text-pink-800 dark:text-pink-200',
      descriptionColor: 'text-pink-700 dark:text-pink-300',
      labelColor: 'text-pink-600 dark:text-pink-400',
      valueColor: 'text-pink-800 dark:text-pink-200',
      iconGradient: 'from-pink-400 to-pink-500',
      buttonGradient: 'from-pink-600 to-pink-700'
    },
    "Technology": {
      background: 'bg-gradient-to-br from-primary-50 from-red-50 dark:from-primary-900/20 dark:from-red-900/20',
      border: 'border-indigo-200 dark:border-indigo-700',
      accent: 'bg-gradient-to-br from-primary-500/20 from-red-500/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200',
      iconGradient: 'from-primary-400 to-indigo-500',
      buttonGradient: 'from-primary-600 to-indigo-700'
    },
    "Literature & Language": {
      background: 'bg-gradient-to-br from-violet-50 from-red-50 dark:from-violet-900/20 dark:from-red-900/20',
      border: 'border-violet-200 dark:border-violet-700',
      accent: 'bg-gradient-to-br from-violet-500/20 from-red-500/20',
      iconBg: 'bg-violet-100 dark:bg-violet-800',
      iconColor: 'text-violet-600 dark:text-violet-400',
      titleColor: 'text-violet-800 dark:text-violet-200',
      descriptionColor: 'text-violet-700 dark:text-violet-300',
      labelColor: 'text-violet-600 dark:text-violet-400',
      valueColor: 'text-violet-800 dark:text-violet-200',
      iconGradient: 'from-violet-400 to-violet-500',
      buttonGradient: 'from-violet-600 to-violet-700'
    },
    "Competitive Exams": {
      background: 'bg-gradient-to-br from-sky-50 to-secondary-50 dark:from-sky-900/20 dark:to-secondary-900/20',
      border: 'border-sky-200 dark:border-sky-700',
      accent: 'bg-gradient-to-br from-sky-500/20 to-secondary-500/20',
      iconBg: 'bg-sky-100 dark:bg-sky-800',
      iconColor: 'text-sky-600 dark:text-sky-400',
      titleColor: 'text-sky-800 dark:text-sky-200',
      descriptionColor: 'text-sky-700 dark:text-sky-300',
      labelColor: 'text-sky-600 dark:text-sky-400',
      valueColor: 'text-sky-800 dark:text-sky-200',
      iconGradient: 'from-sky-400 to-sky-500',
      buttonGradient: 'from-sky-600 to-sky-700'
    },
    "Economics": {
      background: 'bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-amber-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-700 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-primary-400',
      valueColor: 'text-primary-800 dark:text-primary-200',
      iconGradient: 'from-primary-400 to-primary-500',
      buttonGradient: 'from-primary-600 to-primary-700'
    },
    "Travel": {
      background: 'bg-gradient-to-br from-cyan-50 to-secondary-50 dark:from-cyan-900/20 dark:to-secondary-900/20',
      border: 'border-cyan-200 dark:border-cyan-700',
      accent: 'bg-gradient-to-br from-cyan-500/20 to-secondary-500/20',
      iconBg: 'bg-cyan-100 dark:bg-cyan-800',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      titleColor: 'text-cyan-800 dark:text-cyan-200',
      descriptionColor: 'text-cyan-700 dark:text-cyan-300',
      labelColor: 'text-cyan-600 dark:text-cyan-400',
      valueColor: 'text-cyan-800 dark:text-cyan-200',
      iconGradient: 'from-cyan-400 to-cyan-500',
      buttonGradient: 'from-cyan-600 to-cyan-700'
    },
    "Social": {
      background: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
      border: 'border-purple-200 dark:border-purple-700',
      accent: 'bg-gradient-to-br from-purple-500/20 to-indigo-500/20',
      iconBg: 'bg-purple-100 dark:bg-purple-800',
      iconColor: 'text-primary-600 dark:text-primary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-700 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-primary-400',
      valueColor: 'text-primary-800 dark:text-primary-200',
      iconGradient: 'from-purple-400 from-red-500',
      buttonGradient: 'from-purple-600 from-red-700'
    },
    "News": {
      background: 'bg-gradient-to-br from-red-50 to-primary-50 dark:from-red-900/20 dark:to-primary-900/20',
      border: 'border-red-200 dark:border-red-700',
      accent: 'bg-gradient-to-br from-red-500/20 to-primary-500/20',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconColor: 'text-primary-600 dark:text-red-400',
      titleColor: 'text-red-800 dark:text-red-200',
      descriptionColor: 'text-red-700 dark:text-red-300',
      labelColor: 'text-primary-600 dark:text-red-400',
      valueColor: 'text-red-800 dark:text-red-200',
      iconGradient: 'from-red-400 to-secondary-500',
      buttonGradient: 'from-red-600 to-red-700'
    },
    "Miscellaneous": {
      background: 'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900/20 dark:to-gray-900/20',
      border: 'border-slate-200 dark:border-slate-700',
      accent: 'bg-gradient-to-br from-slate-500/20 to-gray-500/20',
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600 dark:text-slate-400',
      titleColor: 'text-slate-800 dark:text-slate-200',
      descriptionColor: 'text-slate-700 dark:text-slate-300',
      labelColor: 'text-slate-600 dark:text-slate-400',
      valueColor: 'text-slate-800 dark:text-slate-200',
      iconGradient: 'from-slate-400 to-slate-500',
      buttonGradient: 'from-slate-600 to-slate-700'
    },
    "Gaming": {
      background: 'bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-900/20 dark:to-pink-900/20',
      border: 'border-fuchsia-200 dark:border-fuchsia-700',
      accent: 'bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20',
      iconBg: 'bg-fuchsia-100 dark:bg-fuchsia-800',
      iconColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      titleColor: 'text-fuchsia-800 dark:text-fuchsia-200',
      descriptionColor: 'text-fuchsia-700 dark:text-fuchsia-300',
      labelColor: 'text-fuchsia-600 dark:text-fuchsia-400',
      valueColor: 'text-fuchsia-800 dark:text-fuchsia-200',
      iconGradient: 'from-fuchsia-400 to-fuchsia-500',
      buttonGradient: 'from-fuchsia-600 to-fuchsia-700'
    },
    // Legacy category names for backward compatibility
    "Math": {
      background: 'bg-gradient-to-br from-primary-50 to-red-50 dark:from-primary-900/20 dark:to-red-900/20',
      border: 'border-primary-200 dark:border-primary-700',
      accent: 'bg-gradient-to-br from-primary-500/20 to-secondary-500/20',
      iconBg: 'bg-primary-100 dark:bg-primary-800',
      iconColor: 'text-primary-600 dark:text-secondary-400',
      titleColor: 'text-primary-800 dark:text-primary-200',
      descriptionColor: 'text-primary-600 dark:text-primary-300',
      labelColor: 'text-primary-600 dark:text-secondary-400',
      valueColor: 'text-primary-800 dark:text-primary-200',
      iconGradient: 'from-primary-400 to-primary-500',
      buttonGradient: 'from-primary-600 to-primary-700'
    },
    "IQ": {
      background: 'bg-gradient-to-br from-secondary-50 to-cyan-50 dark:from-secondary-900/20 dark:to-cyan-900/20',
      border: 'border-secondary-200 dark:border-secondary-700',
      accent: 'bg-gradient-to-br from-secondary-500/20 to-cyan-500/20',
      iconBg: 'bg-secondary-100 dark:bg-secondary-800',
      iconColor: 'text-secondary-600 dark:text-secondary-400',
      titleColor: 'text-secondary-800 dark:text-secondary-200',
      descriptionColor: 'text-secondary-700 dark:text-secondary-300',
      labelColor: 'text-secondary-600 dark:text-secondary-400',
      valueColor: 'text-secondary-800 dark:text-secondary-200',
      iconGradient: 'from-secondary-400 to-secondary-500',
      buttonGradient: 'from-secondary-600 to-secondary-700'
    },
    "Art": {
      background: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20',
      border: 'border-pink-200 dark:border-pink-700',
      accent: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
      iconBg: 'bg-pink-100 dark:bg-pink-800',
      iconColor: 'text-pink-600 dark:text-pink-400',
      titleColor: 'text-pink-800 dark:text-pink-200',
      descriptionColor: 'text-pink-700 dark:text-pink-300',
      labelColor: 'text-pink-600 dark:text-pink-400',
      valueColor: 'text-pink-800 dark:text-pink-200',
      iconGradient: 'from-pink-400 to-pink-500',
      buttonGradient: 'from-pink-600 to-pink-700'
    },
    "Nature": {
      background: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
      border: 'border-green-200 dark:border-green-700',
      accent: 'bg-gradient-to-br from-green-500/20 to-emerald-500/20',
      iconBg: 'bg-green-100 dark:bg-green-800',
      iconColor: 'text-green-600 dark:text-green-400',
      titleColor: 'text-green-800 dark:text-green-200',
      descriptionColor: 'text-green-700 dark:text-green-300',
      labelColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-800 dark:text-green-200',
      iconGradient: 'from-green-400 to-green-500',
      buttonGradient: 'from-green-600 to-green-700'
    },
    "Education": {
      background: 'bg-gradient-to-br from-sky-50 to-secondary-50 dark:from-sky-900/20 dark:to-secondary-900/20',
      border: 'border-sky-200 dark:border-sky-700',
      accent: 'bg-gradient-to-br from-sky-500/20 to-secondary-500/20',
      iconBg: 'bg-sky-100 dark:bg-sky-800',
      iconColor: 'text-sky-600 dark:text-sky-400',
      titleColor: 'text-sky-800 dark:text-sky-200',
      descriptionColor: 'text-sky-700 dark:text-sky-300',
      labelColor: 'text-sky-600 dark:text-sky-400',
      valueColor: 'text-sky-800 dark:text-sky-200',
      iconGradient: 'from-sky-400 to-sky-500',
      buttonGradient: 'from-sky-600 to-sky-700'
    },
    "General": {
      background: 'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20',
      border: 'border-gray-200 dark:border-gray-700',
      accent: 'bg-gradient-to-br from-gray-500/20 to-slate-500/20',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-600 dark:text-gray-400',
      titleColor: 'text-gray-800 dark:text-gray-200',
      descriptionColor: 'text-gray-700 dark:text-gray-300',
      labelColor: 'text-gray-600 dark:text-gray-400',
      valueColor: 'text-gray-800 dark:text-gray-200',
      iconGradient: 'from-gray-400 to-gray-500',
      buttonGradient: 'from-gray-600 to-gray-700'
    }
  };
  return colors[categoryName] || colors["General Knowledge"]; // Default to General Knowledge colors if category not found
};

// Icon mapping for categories
const categoryIcons = {
  "General Knowledge": FaBook,
  "Current Affairs": FaNewspaper,
  "Science": FaFlask,
  "Mathematics": FaCalculator,
  "History": FaHistory,
  "Geography": FaGlobe,
  "Sports": FaFutbol,
  "Entertainment": FaFilm,
  "Technology": FaLaptopCode,
  "Literature & Language": FaLanguage,
  "Competitive Exams": FaGraduationCap,
  "Economics": FaBriefcase,
  "Travel": FaPlane,
  "Social": FaComments,
  "News": FaNewspaper,
  "Miscellaneous": FaTh,
  "Gaming": FaGamepad,
  // Legacy category names for backward compatibility
  Science: FaFlask,
  Technology: FaLaptopCode,
  Geography: FaGlobe,
  Math: FaCalculator,
  Mathematics: FaCalculator,
  IQ: FaBrain,
  Art: FaPalette,
  Nature: FaLeaf,
  Education: FaUserGraduate,
  General: FaBook,
  Default: FaBook,
};

// Level badge icons
const levelBadgeIcons = {
  Starter: FaUserGraduate,
  Rookie: FaStar,
  Explorer: FaRocket,
  Thinker: FaBrain,
  Strategist: FaChartLine,
  Achiever: FaAward,
  Mastermind: FaGem,
  Champion: FaTrophy,
  Prodigy: FaMedal,
  Wizard: FaMagic,
  Legend: FaCrown,
  Default: FaStar,
};

// Level play count info for display (cumulative quiz attempts, monthly pricing)
const levelsInfo = [
  { level: 1, quizzes: 5, plan: "Free", amount: 0, prize: 0 },
  { level: 2, quizzes: 10, plan: "Free", amount: 0, prize: 0 },
  { level: 3, quizzes: 15, plan: "Free", amount: 0, prize: 0 },
  { level: 4, quizzes: 20, plan: "Free", amount: 0, prize: 0 },
  { level: 5, quizzes: 25, plan: "Free", amount: 0, prize: 0 },
  { level: 6, quizzes: 30, plan: "Free", amount: 0, prize: 0 },
  { level: 7, quizzes: 35, plan: "Free", amount: 0, prize: 0 },
  { level: 8, quizzes: 40, plan: "Free", amount: 0, prize: 0 },
  { level: 9, quizzes: 45, plan: "Free", amount: 0, prize: 0 },
  {
    level: 10,
    quizzes: config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT || 50,
    plan: "Pro",
    amount: 99,
    prize: 'Dynamic',
  },
];

// Level color mappings for both light and dark modes
const getLevelColors = (levelName) => {
  const colors = {
    Starter: {
      background:
        "bg-gradient-to-br from-secondary-50 to-indigo-50 dark:from-secondary-900/20 dark:to-indigo-900/20",
      border: "border-secondary-200 dark:border-secondary-700",
      accent: "bg-gradient-to-br from-secondary-500/20 to-indigo-500/20",
      iconBg: "bg-secondary-100 dark:bg-secondary-800",
      iconColor: "text-secondary-600 dark:text-secondary-400",
      titleColor: "text-secondary-800 dark:text-secondary-200",
      descriptionColor: "text-secondary-700 dark:text-secondary-300",
      labelColor: "text-secondary-600 dark:text-secondary-400",
      valueColor: "text-secondary-800 dark:text-secondary-200",
    },
    Rookie: {
      background:
        "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-700",
      accent: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
      iconBg: "bg-green-100 dark:bg-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      titleColor: "text-green-800 dark:text-green-200",
      descriptionColor: "text-green-700 dark:text-green-300",
      labelColor: "text-green-600 dark:text-green-400",
      valueColor: "text-green-800 dark:text-green-200",
    },
    Explorer: {
      background:
        "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-200 dark:border-purple-700",
      accent: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
      iconBg: "bg-purple-100 dark:bg-purple-800",
      iconColor: "text-primary-600 dark:text-primary-400",
      titleColor: "text-primary-800 dark:text-primary-200",
      descriptionColor: "text-primary-700 dark:text-primary-300",
      labelColor: "text-primary-600 dark:text-primary-400",
      valueColor: "text-primary-800 dark:text-primary-200",
    },
    Thinker: {
      background:
        "bg-gradient-to-br from-primary-50 to-amber-50 dark:from-primary-900/20 dark:to-amber-900/20",
      border: "border-primary-200 dark:border-primary-700",
      accent: "bg-gradient-to-br from-primary-500/20 to-amber-500/20",
      iconBg: "bg-primary-100 dark:bg-primary-800",
      iconColor: "text-primary-600 dark:text-secondary-400",
      titleColor: "text-primary-800 dark:text-primary-200",
      descriptionColor: "text-primary-600 dark:text-primary-300",
      labelColor: "text-primary-600 dark:text-secondary-400",
      valueColor: "text-primary-800 dark:text-primary-200",
    },
    Strategist: {
      background:
        "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20",
      border: "border-teal-200 dark:border-teal-700",
      accent: "bg-gradient-to-br from-teal-500/20 to-cyan-500/20",
      iconBg: "bg-teal-100 dark:bg-teal-800",
      iconColor: "text-teal-600 dark:text-teal-400",
      titleColor: "text-teal-800 dark:text-teal-200",
      descriptionColor: "text-teal-700 dark:text-teal-300",
      labelColor: "text-teal-600 dark:text-teal-400",
      valueColor: "text-teal-800 dark:text-teal-200",
    },
    Achiever: {
      background:
        "bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20",
      border: "border-red-200 dark:border-red-700",
      accent: "bg-gradient-to-br from-red-500/20 to-pink-500/20",
      iconBg: "bg-red-100 dark:bg-red-800",
      iconColor: "text-primary-600 dark:text-red-400",
      titleColor: "text-red-800 dark:text-red-200",
      descriptionColor: "text-red-700 dark:text-red-300",
      labelColor: "text-primary-600 dark:text-red-400",
      valueColor: "text-red-800 dark:text-red-200",
    },
    Mastermind: {
      background:
        "bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20",
      border: "border-indigo-200 dark:border-indigo-700",
      accent: "bg-gradient-to-br from-primary-500/20 to-secondary-500/20",
      iconBg: "bg-indigo-100 dark:bg-indigo-800",
      iconColor: "text-primary-600 dark:text-red-400",
      titleColor: "text-red-800 dark:text-red-200",
      descriptionColor: "text-red-700 dark:text-red-300",
      labelColor: "text-primary-600 dark:text-red-400",
      valueColor: "text-red-800 dark:text-red-200",
    },
    Champion: {
      background:
        "bg-gradient-to-br from-primary-50 to-primary-50 dark:from-primary-900/20 dark:to-primary-900/20",
      border: "border-primary-200 dark:border-primary-700",
      accent: "bg-gradient-to-br from-primary-500/20 to-primary-500/20",
      iconBg: "bg-primary-100 dark:bg-primary-800",
      iconColor: "text-primary-600 dark:text-primary-400",
      titleColor: "text-primary-800 dark:text-primary-200",
      descriptionColor: "text-primary-700 dark:text-primary-300",
      labelColor: "text-primary-600 dark:text-primary-400",
      valueColor: "text-primary-800 dark:text-primary-200",
    },
    Prodigy: {
      background:
        "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20",
      border: "border-emerald-200 dark:border-emerald-700",
      accent: "bg-gradient-to-br from-emerald-500/20 to-teal-500/20",
      iconBg: "bg-emerald-100 dark:bg-emerald-800",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      titleColor: "text-emerald-800 dark:text-emerald-200",
      descriptionColor: "text-emerald-700 dark:text-emerald-300",
      labelColor: "text-emerald-600 dark:text-emerald-400",
      valueColor: "text-emerald-800 dark:text-emerald-200",
    },
    Wizard: {
      background:
        "bg-gradient-to-br from-violet-50 from-red-50 dark:from-violet-900/20 dark:from-red-900/20",
      border: "border-violet-200 dark:border-violet-700",
      accent: "bg-gradient-to-br from-violet-500/20 from-red-500/20",
      iconBg: "bg-violet-100 dark:bg-violet-800",
      iconColor: "text-violet-600 dark:text-violet-400",
      titleColor: "text-violet-800 dark:text-violet-200",
      descriptionColor: "text-violet-700 dark:text-violet-300",
      labelColor: "text-violet-600 dark:text-violet-400",
      valueColor: "text-violet-800 dark:text-violet-200",
    },
    Legend: {
      background:
        "bg-gradient-to-br from-amber-50 to-primary-50 dark:from-amber-900/20 dark:to-primary-900/20",
      border: "border-amber-200 dark:border-amber-700",
      accent: "bg-gradient-to-br from-amber-500/20 to-primary-500/20",
      iconBg: "bg-amber-100 dark:bg-amber-800",
      iconColor: "text-amber-600 dark:text-amber-400",
      titleColor: "text-amber-800 dark:text-amber-200",
      descriptionColor: "text-amber-700 dark:text-amber-300",
      labelColor: "text-amber-600 dark:text-amber-400",
      valueColor: "text-amber-800 dark:text-amber-200",
    },
  };

  return colors[levelName] || colors.Starter; // Default to Starter colors if level not found
};

const HomePage = () => {
  // Check if user is logged in
  const isLoggedIn = !!localStorage.getItem("token");
  const router = useRouter();
  const [homeData, setHomeData] = useState(null);
  const [userLevelData, setUserLevelData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [topQuizzes, setTopQuizzes] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showSystemUpdateModal, setShowSystemUpdateModal] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [user, setUser] = useState(null);
  console.log(userLevelData, "userLevelData");

  useEffect(() => {
    fetchHomePageData();
    fetchCategories();
    fetchLevels();
    fetchProfileCompletion();
    // Show system update modal for first-time visitors
    const hasSeenModal = localStorage.getItem("hasSeenSystemUpdateModal");
    if (!hasSeenModal) {
      setTimeout(() => {
        setShowSystemUpdateModal(true);
      }, 1000); // Show after 1 second
    }
  }, []);

  // Fetch top quizzes
  useEffect(() => {
    fetchTopQuizzes();
  }, []);

  // Refresh data when home page open
  useEffect(() => {
    fetchHomePageData();
  }, []);

  const fetchHomePageData = async () => {
    try {
      setLoading(true);
      const res = await API.getHomePageData();
      // Fetch stats for dynamic prize pool calculation
      const statsRes = await API.getPublicLandingStats();
      if (res?.success) {
        setLoading(false);
        setHomeData({
          ...res.data,
          activeProUsers: statsRes?.success ? statsRes.data.activeProUsers : 0,
        });
        setUserLevelData(res.userLevel);
      } else {
        setLoading(false);
        console.log("HomePage Data:", res);
        setError(res.message || "Failed to load home page data");
      }
    } catch (err) {
      setLoading(false);
      console.log("HomePage Data:", err);

      // Auto-logout on auth errors like 401 / Invalid token
      handleAuthError(err, router);

      // Try to show a more specific error message if available
      let msg = err?.response?.data?.message || err?.message || err?.toString();
      if (msg && msg !== "[object Object]") {
        setError(msg);
      } else {
        setError("Failed to load home page data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the new public API endpoint for categories
      const res = await API.request("/api/public/categories");
      if (res?.success && Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      setCategories([]);
    }
  };

  const fetchTopQuizzes = async () => {
    try {
      // Fetch top/popular quizzes
      const res = await API.getLevelBasedQuizzes({ limit: 8, page: 1 });
      if (res?.success && Array.isArray(res.data)) {
        // Sort by creation date or popularity
        const sorted = res.data
          .filter(quiz => quiz.isActive !== false)
          .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
          .slice(0, 8);
        setTopQuizzes(sorted);
      } else {
        setTopQuizzes([]);
      }
    } catch (err) {
      setTopQuizzes([]);
    }
  };

  const fetchLevels = async () => {
    try {
      const res = await API.getAllLevels();
      if (res?.success && Array.isArray(res.data)) {
        // Filter out Starter level (Level 0) just like landing page
        const filteredLevels = res.data.filter((level) => level.level !== 0);
        setLevels(filteredLevels);
      } else {
        // Fallback data if API fails - same structure as landing page
        const fallbackLevels = [
          { level: 1, name: "Rookie", description: "Build your foundation", quizCount: 5, quizzesRequired: 5 },
          { level: 2, name: "Explorer", description: "Discover new knowledge", quizCount: 10, quizzesRequired: 10 },
          { level: 3, name: "Thinker", description: "Develop critical thinking", quizCount: 15, quizzesRequired: 15 },
          { level: 4, name: "Strategist", description: "Master strategic learning", quizCount: 20, quizzesRequired: 20 },
          { level: 5, name: "Achiever", description: "Achieve excellence", quizCount: 25, quizzesRequired: 25 },
          { level: 6, name: "Mastermind", description: "Become a master", quizCount: 30, quizzesRequired: 30 },
          { level: 7, name: "Champion", description: "Champion level", quizCount: 35, quizzesRequired: 35 },
          { level: 8, name: "Prodigy", description: "Prodigy level", quizCount: 40, quizzesRequired: 40 },
          { level: 9, name: "Wizard", description: "Wizard level", quizCount: 45, quizzesRequired: 45 },
          { level: 10, name: "Legend", description: "Legendary status", quizCount: 50, quizzesRequired: config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT || 50 },
        ];

        setLevels(fallbackLevels);
      }
    } catch (err) {
      // Fallback data if API fails - same structure as landing page
      const fallbackLevels = [
        {
          level: 1,
          name: "Rookie",
          description: "Build your foundation",
          quizCount: 5,
          quizzesRequired: 5,
        },
        {
          level: 2,
          name: "Explorer",
          description: "Discover new knowledge",
          quizCount: 10,
          quizzesRequired: 10,
        },
        {
          level: 3,
          name: "Thinker",
          description: "Develop critical thinking",
          quizCount: 15,
          quizzesRequired: 15,
        },
        {
          level: 4,
          name: "Strategist",
          description: "Master strategic learning",
          quizCount: 20,
          quizzesRequired: 20,
        },
        {
          level: 5,
          name: "Achiever",
          description: "Achieve excellence",
          quizCount: 25,
          quizzesRequired: 25,
        },
        {
          level: 6,
          name: "Mastermind",
          description: "Become a master",
          quizCount: 30,
          quizzesRequired: 30,
        },
        {
          level: 7,
          name: "Champion",
          description: "Champion level",
          quizCount: 35,
          quizzesRequired: 35,
        },
        {
          level: 8,
          name: "Prodigy",
          description: "Prodigy level",
          quizCount: 40,
          quizzesRequired: 40,
        },
        {
          level: 9,
          name: "Wizard",
          description: "Wizard level",
          quizCount: 45,
          quizzesRequired: 45,
        },
        {
          level: 10,
          name: "Legend",
          description: "Legendary status",
          quizCount: 50,
          quizzesRequired: 50,
        },
      ];
      setLevels(fallbackLevels);
    }
  };

  const fetchProfileCompletion = async () => {
    // Only fetch profile if user is logged in
    if (!isLoggedIn) {
      return;
    }

    try {
      const res = await API.getProfile();
      console.log("🔍 Profile API Response:", res);

      if (res?.success && res.user?.profileCompletion) {
        console.log(
          "✅ Profile completion data found:",
          res.user.profileCompletion
        );
        setUser(res.user);
        setProfileCompletion(res.user.profileCompletion);
      } else {
        console.log("❌ Profile completion data not found in response");
        console.log("Response structure:", {
          success: res?.success,
          hasUser: !!res?.user,
          hasProfileCompletion: !!res?.user?.profileCompletion,
        });
      }
    } catch (err) {
      console.log("❌ Failed to fetch profile completion:", err);
      // Set default values if API fails
      setProfileCompletion({
        percentage: 0,
        isComplete: false,
        fields: [
          { name: "Full Name", completed: false },
          { name: "Email Address", completed: false },
          { name: "Phone Number", completed: false },
          { name: "Social Media Link", completed: false },
        ],
        completedFields: 0,
        totalFields: 4,
      });
    }
  };

  const handleQuizAttempt = (quiz) => {
    setSelectedQuiz(quiz);
    setShowQuizModal(true);
  };

  const handleConfirmQuizStart = (competitionType) => {
    setShowQuizModal(false);
    if (selectedQuiz) {
      // Store navigation data in localStorage
      localStorage.setItem(
        "quizNavigationData",
        JSON.stringify({
          fromPage: "home",
          quizData: selectedQuiz,
          competitionType,
        })
      );
      router.push(`/attempt-quiz/${selectedQuiz._id}`);
    }
  };

  const handleCancelQuizStart = () => {
    setShowQuizModal(false);
    setSelectedQuiz(null);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-primary-600 bg-primary-100";
      case "hard":
        return "text-primary-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const userInfo = JSON.parse(safeLocalStorage.getItem('userInfo') || 'null');
  const isOpen = useSelector((state) => state.sidebar.isOpen);

  if (loading) {
    return (
      <div className={`mainContent ${isOpen && userInfo?.role === 'admin' ? 'showPanel' : 'hidePanel'} bg-subg-light dark:bg-subg-dark min-h-screen`}>
        {userInfo && userInfo.role === 'admin' && <Sidebar />}
        <div className="relative min-h-screen bg-subg-light dark:bg-subg-dark overflow-x-hidden w-full">
          <HomePageSkeleton />
        </div>
      </div>
    );
  }

  // Non-blocking loading state managed within JSX

  // Only block the whole page for generic errors, not subscription errors or 'Not authorized' (allow public homepage)
  if (error && !error.toLowerCase().includes("subscription") && error.toLowerCase() !== "not authorized") {
    return (
      <MobileAppWrapper title="Home">
        <div className={`mainContent ${isOpen && userInfo?.role === 'admin' ? 'showPanel' : 'hidePanel'} bg-subg-light dark:bg-subg-dark min-h-screen`}>
          {userInfo && userInfo.role === 'admin' && <Sidebar />}
          <div className="min-h-screen bg-gradient-to-br from-primary-50 via-red-50 to-primary-100 dark:from-gray-900 dark:via-red-900 dark:to-primary-900 flex items-center justify-center w-full">
            <div className="text-center">
              <div className="text-primary-600 text-xl mb-4">⚠️</div>
              <p className="text-primary-600 text-lg">{error}</p>
            </div>
          </div>
        </div>
        <UnifiedFooter />
      </MobileAppWrapper>
    );
  }
  return (
    <>
      <Head>
        <title>AajExam - Student Unknown's Battle Ground Quiz Platform</title>
        <meta
          name="description"
          content="Join AajExam - India's premier skill-based quiz platform. Test your knowledge across 10+ levels, compete for monthly prizes, and earn real rewards. Start your quiz journey today!"
        />
        <meta
          name="keywords"
          content="quiz platform, online quiz, skill-based quiz, quiz competition, AajExam, student quiz, knowledge test, quiz rewards"
        />
        <meta
          property="og:title"
          content="AajExam - Student Unknown's Battle Ground Quiz Platform"
        />
        <meta
          property="og:description"
          content="Join AajExam - India's premier skill-based quiz platform. Test your knowledge across 10+ levels, compete for monthly prizes, and earn real rewards."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="AajExam - Student Unknown's Battle Ground Quiz Platform"
        />
        <meta
          name="twitter:description"
          content="Join AajExam - India's premier skill-based quiz platform. Test your knowledge across 10+ levels, compete for monthly prizes, and earn real rewards."
        />
      </Head>

      <div className={`mainContent ${isOpen && userInfo?.role === 'admin' ? 'showPanel' : 'hidePanel'} bg-subg-light dark:bg-subg-dark min-h-screen`}>
        {userInfo && userInfo.role === 'admin' && <Sidebar />}
        <div className="relative min-h-screen bg-subg-light dark:bg-subg-dark overflow-x-hidden w-full">
          {/* Hero Section - Enhanced Modern Design */}
          <section className="relative overflow-hidden z-10 bg-gradient-to-br from-primary-50 via-primary-50 to-red-50 dark:from-gray-900 dark:via-primary-900/20 dark:to-red-900/20">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/30 to-primary-400/30 rounded-full blur-3xl animate-blob"></div>
              <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-r from-red-400/30 to-pink-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
              <div className="absolute -bottom-20 left-1/2 w-80 h-80 bg-gradient-to-r from-primary-400/20 from-red-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="relative container mx-auto px-0 lg:px-6 xl:px-8 py-12 md:py-16 lg:py-24">
              <div className="text-center max-w-5xl mx-auto">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-500 text-white rounded-full text-sm font-semibold mb-6 animate-bounce shadow-lg">
                  <FaRocket className="w-4 h-4" />
                  <span>Welcome to AajExam Platform</span>
                </div>

                {/* Main Heading */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold mb-6 animate-fade-in">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 text-secondary-500 to-secondary-500 dark:from-primary-300 dark:via-primary-400 dark:to-red-400">
                    Welcome Back{userInfo?.name ? `, ${userInfo.name}` : ''}
                  </span>
                  <span className="inline-block ml-3 animate-bounce">🎯</span>
                </h1>

                {/* Subheading */}
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl  font-bold mb-6 text-gray-600 dark:text-white" style={{ animationDelay: '0.1s' }}>
                  Student Unknown's Battle Ground Quiz!
                </h2>

                {/* Description */}
                <p className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl text-gray-700 dark:text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  Explore quizzes by{" "}
                  <span className="font-bold text-primary-600 dark:text-primary-400">level</span>
                  ,{" "}
                  <span className="font-bold text-primary-600 dark:text-red-400">category</span>
                  , or{" "}
                  <span className="font-bold text-primary-600 dark:text-red-400">subcategory</span>
                  . <br className="hidden sm:block" />
                  Only{" "}
                  <span className="font-semibold text-green-600 dark:text-green-400">new quizzes</span>{" "}
                  you haven't attempted are shown!
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
                  <Link
                    href="/search"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 text-secondary-500 to-secondary-500 hover:from-primary-600 hover:via-primary-500 hover:to-secondary-600 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    <FaRocket className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span>Start Quizzing</span>
                    <FaArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/levels"
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-primary-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <FaLevelUpAlt className="w-5 h-5" />
                    <span>View Levels</span>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Phase 2: Competition Progress Dashboard */}
          {isLoggedIn && (
            <div className="container mx-auto px-4 md:px-6 lg:px-10 py-6 sm:py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CompetitionProgressCard type="daily" />
                <CompetitionProgressCard type="weekly" />
                <CompetitionProgressCard type="monthly" />
              </div>
            </div>
          )}

          {/* Referral System Section - Visible to all users */}
          <div className="container mx-auto px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 z-10">
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

              {/* Your Rewards Grid - New Design */}
              <div className="mb-8">
                <h3 className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 text-center">
                  Your Rewards:
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-md mx-auto">


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
                      Get your unique referral code
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                        2
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Share it with friends & family
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white dark:text-black font-bold text-sm sm:text-base md:text-lg">
                        3
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Friends join and buy a plan
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                      <span className="text-white font-bold text-sm sm:text-base md:text-lg">
                        4
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-primary-200 text-xs sm:text-lg">
                      Earn instant wallet money!
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="text-center">
                {!isLoggedIn ? (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-gray-700 dark:text-primary-200 text-sm sm:text-base md:text-lg font-medium">
                      Ready to start earning rewards?
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Link
                        href="/register"
                        className="inline-block bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                      >
                        🚀 Join Now & Get Referral Code
                      </Link>
                      <Link
                        href="/login"
                        className="inline-block bg-white/30 hover:bg-white/40 text-gray-800 dark:text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl border-2 border-white/30 hover:border-white/50 transition-all duration-300 text-sm sm:text-base md:text-lg"
                      >
                        🔑 Already have an account? Login
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-gray-700 dark:text-primary-200 text-sm sm:text-base md:text-lg font-medium">
                      You're already part of the referral system!
                    </p>
                    <Link
                      href="/profile"
                      className="inline-block bg-gradient-to-r from-primary-500 to-secondary-600 hover:from-primary-600 hover:to-secondary-700 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                    >
                      📱 View Your Referral Code
                    </Link>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              <div className="mt-8 text-center">
                <p className="text-gray-700 dark:text-white/80 text-sm">
                  💡 <strong>Pro Tip:</strong> Share your referral code on
                  social media, WhatsApp groups, and with classmates to reach
                  milestones faster!
                </p>
              </div>

              {/* Referral Code Preview */}
              {!isLoggedIn && (
                <div className="mt-6 bg-gray-100 dark:bg-white/10 rounded-xl lg:rounded-2xl p-3 lg:p-6 border border-gray-300 dark:border-white/20">
                  <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    What Your Referral Code Will Look Like:
                  </h4>
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="bg-gradient-to-r from-primary-400 to-secondary-500 text-primary-900 font-mono font-bold px-4 py-2 rounded-lg tracking-widest border-2 border-primary-300 shadow-lg">
                      ABC123XY
                    </div>
                    <button
                      className="px-3 py-2 bg-primary-400 text-primary-900 font-bold rounded-lg shadow hover:bg-primary-500 transition"
                      onClick={() => navigator.clipboard.writeText("ABC123XY")}
                      title="Copy Example Code"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-gray-700 dark:text-primary-200 text-sm">
                    📱 <strong>Example:</strong> When friends join using your
                    code, you both get benefits!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile App Section - HIDDEN FOR NOW
          <section className="relative py-12 md:py-16 lg:py-20 overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary-50 via-indigo-50 from-red-50 dark:from-gray-900 dark:via-secondary-900/20 dark:from-red-900/20"></div>

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 right-10 w-72 h-72 bg-gradient-to-r from-secondary-400/20 from-red-400/20 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-10 left-10 w-96 h-96 bg-gradient-to-r from-primary-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-secondary-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="relative p-1 bg-gradient-to-r from-secondary-500 via-purple-500 to-pink-500 rounded-3xl">
                  <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 md:p-4 lg:p-8 xl:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8 xl:gap-12 items-center">
                      <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-600 text-white rounded-full text-sm font-semibold mb-6 animate-bounce">
                          <FaMobileAlt className="w-4 h-4" />
                          <span>Now Available on Play Store!</span>
                        </div>

                        <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-extrabold mb-4 text-black dark:text-white">
                          Download AajExam App
                        </h2>

                        <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                          Take your learning on the go! Play quizzes anytime, anywhere with our beautiful mobile app. Compete with friends, track your progress, and win rewards.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                          {[
                            { icon: FaBrain, text: "Level-based Quizzes" },
                            { icon: FaTrophy, text: "Win Rewards" },
                            { icon: FaChartLine, text: "Track Progress" },
                            { icon: FaUsers, text: "Compete Globally" },
                          ].map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                              <div className="flex-shrink-0 w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center text-white">
                                <feature.icon className="w-5 h-5" />
                              </div>
                              <span className="font-medium">{feature.text}</span>
                            </div>
                          ))}
                        </div>

                        <a
                          href="https://play.google.com/store/apps/details?id=com.subgapp"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-gray-500 to-black hover:from-gray-600 hover:to-black-700 text-white rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                          <svg className="playStoreIcon" aria-hidden="true" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0,0h40v40H0V0z"></path><g><path d="M19.7,19.2L4.3,35.3c0,0,0,0,0,0c0.5,1.7,2.1,3,4,3c0.8,0,1.5-0.2,2.1-0.6l0,0l17.4-9.9L19.7,19.2z" fill="#EA4335"></path><path d="M35.3,16.4L35.3,16.4l-7.5-4.3l-8.4,7.4l8.5,8.3l7.5-4.2c1.3-0.7,2.2-2.1,2.2-3.6C37.5,18.5,36.6,17.1,35.3,16.4z" fill="#FBBC04"></path><path d="M4.3,4.7C4.2,5,4.2,5.4,4.2,5.8v28.5c0,0.4,0,0.7,0.1,1.1l16-15.7L4.3,4.7z" fill="#4285F4"></path><path d="M19.8,20l8-7.9L10.5,2.3C9.9,1.9,9.1,1.7,8.3,1.7c-1.9,0-3.6,1.3-4,3c0,0,0,0,0,0L19.8,20z" fill="#34A853"></path></g></svg>
                          <div className="text-left">
                            <div className="text-xs opacity-90">GET IT ON</div>
                            <div className="text-lg leading-tight">Google Play</div>
                          </div>
                          <FaDownload className="w-5 h-5 ml-2" />
                        </a>

                        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold text-primary-600 dark:text-primary-400">Free Download</span> •
                          <span className="mx-2">5+ Rating</span> •
                          <span className="mx-2">100+ Downloads</span>
                        </p>
                      </div>

                      <div className="relative flex justify-center lg:justify-end">
                        <div className="relative w-64 h-96 md:w-72 md:h-[28rem] lg:w-80 lg:h-[32rem]">
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-500">
                            <div className="w-full h-full bg-gray-900 rounded-[2.5rem] overflow-hidden relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 via-secondary-500 to-pink-600 p-6 flex flex-col items-center justify-center text-white">
                                <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-xl animate-bounce">
                                  <FaBrain className="w-12 h-12 text-secondary-600 dark:text-primary-500" />
                                </div>

                                <h3 className="text-2xl font-bold mb-2">AajExam</h3>
                                <p className="text-sm opacity-90 mb-8 text-center">Learn & Play Quiz</p>

                                <div className="grid grid-cols-2 gap-4 w-full">
                                  {[FaBrain, FaTrophy, FaChartLine, FaUsers].map((Icon, idx) => (
                                    <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center">
                                      <Icon className="w-8 h-8" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                            <FaStar className="w-8 h-8" />
                          </div>
                          <div className="absolute -bottom-4 -left-4 w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-red-400 to-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse">
                            <FaTrophy className="w-8 h-8 lg:w-10 lg:h-10" />
                          </div>
                          <div className="absolute top-1/2 -left-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg animate-pulse delay-500">
                            <FaRocket className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          */}

          {/* Prize & Rewards Section */}
          <section id="prizes" className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tl from-amber-50 via-primary-50 to-primary-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-primary-900/20 pointer-events-none" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
              <div className="text-center mb-4 lg:mb-16">
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                    Live Prize Pool
                  </span>
                </h2>
                <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Compete and earn rewards based on your performance.
                  Top players share Daily, Weekly & Monthly prize pools.                </p>
              </div>

              {/* Live Prize Pool Section */}
              <div className="container mx-auto px-4">
                <LivePrizePool isLandingPage={false} />
              </div>
            </div>
          </section>

          {/* Previous Month Winners Section */}
          <div className="container mx-auto mb-8 sm:mb-12">
            <div className="text-center my-8">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-primary-600 dark:text-white">
                  Winners
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Celebrating our top-performing students from the previous seasons.
              </p>
            </div>
            <MonthlyWinnersDisplay />
          </div>

          {/* Top Performers Section */}
          <div id="top-performers" className="container mx-auto px-4 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 z-10">
            <div className="text-center mb-8">
              <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 text-secondary-500 to-secondary-500 dark:text-white">
                  Live Leaderboard
                </span>
              </h2>
              <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Check out the real-time top performers for the current day, week, and month.
              </p>
            </div>
            <TopPerformers />
          </div>

          {/* Govt. Exam Section - Premium Redesign */}
          <section className="py-12 md:py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br from-primary-50 via-purple-50 to-pink-50 dark:from-gray-950 dark:via-indigo-950 dark:from-red-950">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-purple-100 to-pink-100 dark:from-primary-900 dark:via-purple-900 dark:to-pink-900">
              {/* Animated Blob Background */}
              <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <div className="absolute top-20 left-10 w-96 h-96 bg-secondary-400 dark:bg-secondary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob"></div>
                <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 dark:bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
                <div className="absolute -bottom-20 left-1/2 w-96 h-96 bg-pink-400 dark:bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-30 animate-blob" style={{ animationDelay: '4s' }}></div>
              </div>
              {/* Pattern Overlay */}
              <div
                className="absolute inset-0 opacity-20 dark:opacity-30"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
              ></div>
            </div>

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-10 z-10">
              {/* Header Section */}
              <div className="text-center mb-12 lg:mb-16">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-400 text-secondary-500 to-secondary-500 text-white rounded-full text-sm font-bold mb-6 shadow-2xl animate-pulse hover:animate-none transition-all">
                  <FaGraduationCap className="w-5 h-5" />
                  <span>🚀 Your Dream Job Awaits</span>
                </div>
                <h2 className="text-sm md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-extrabold mb-6">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 via-pink-600 to-cyan-600 dark:from-primary-300 dark:via-pink-300 dark:to-cyan-300 bg-[length:200%_auto] animate-gradient-shift">
                    Master Government Exams
                  </span>
                </h2>
                <p className="text-md md:text-xl text-gray-700 dark:text-gray-200 max-w-3xl mx-auto leading-relaxed">
                  Comprehensive practice tests, real exam patterns, and detailed analytics to help you crack your dream government job exam.
                </p>
              </div>

              {/* Feature Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 mb-4">
                {/* Feature Card 1 */}
                <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 lg:p-8 border border-gray-200 dark:border-white/20 hover:border-secondary-500 dark:hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-secondary-500/20 dark:hover:shadow-secondary-500/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary-500/10 to-cyan-500/10 dark:from-secondary-500/20 dark:to-cyan-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-secondary-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <FaBook className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-secondary-600 dark:group-hover:text-primary-300 transition-colors">Real Exam Patterns</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Practice with actual exam patterns and question formats from previous years to boost your confidence.
                    </p>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 lg:p-8 border border-gray-200 dark:border-white/20 hover:border-purple-500 dark:hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 dark:hover:shadow-purple-500/50">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <FaChartLine className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">Track Progress</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Monitor your performance with detailed analytics and identify areas for improvement with real-time insights.
                    </p>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="group relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-4 lg:p-8 border border-gray-200 dark:border-white/20 hover:border-primary-500 dark:hover:border-white/50 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/20 dark:hover:shadow-primary-500/50 md:col-span-2 lg:col-span-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-primary-500/10 dark:from-primary-500/20 dark:to-primary-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-500 to-primary-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl transform group-hover:rotate-12 group-hover:scale-110 transition-all duration-500">
                      <FaAward className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <h3 className="text-md lg:text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors">Detailed Solutions</h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      Get step-by-step solutions and explanations for every question to understand concepts better and learn effectively.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 lg:gap-4 mb-4">
                {[
                  { icon: FaGraduationCap, label: "Exam Categories", value: "100+", color: "from-secondary-500 to-cyan-500", hoverColor: "hover:shadow-secondary-500/50" },
                  { icon: FaBook, label: "Practice Tests", value: "100+", color: "from-purple-500 to-pink-500", hoverColor: "hover:shadow-purple-500/50" },
                  { icon: FaUsers, label: "Active Learners", value: "1000+", color: "from-green-600 to-secondary-600", hoverColor: "hover:shadow-green-600/50" },
                  { icon: FaTrophy, label: "Success Rate", value: "85%", color: "from-green-500 to-emerald-500", hoverColor: "hover:shadow-green-500/50" },
                ].map((stat, idx) => (
                  <div key={idx} className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl p-3 lg:p-6 border border-gray-200 dark:border-white/20 text-center transform hover:scale-110 transition-all duration-300 ${stat.hoverColor} hover:shadow-2xl`}>
                    <div className={`w-8 h-8 lg:w-12 lg:h-12 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <stat.icon className="w-4 lg:w-7 h-4 lg:h-7 text-white" />
                    </div>
                    <div className="text-md md:text-xl lg:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">{stat.value}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="text-center mt-8">
                <Link
                  href="/govt-exams"
                  className="group inline-flex items-center gap-2 lg:gap-4 px-5 lg:px-10 py-2 lg:py-4 bg-gradient-to-r from-primary-400 text-secondary-500 to-pink-500 hover:from-primary-500 hover:via-primary-500 hover:to-pink-600 text-white rounded-2xl font-bold text-md lg:text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-primary-500/50"
                >
                  <FaGraduationCap className="w-4 lg:w-7 h-4 lg:h-7 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Start Exam Prep</span>
                  <FaArrowRight className="w-4 lg:w-7 h-4 lg:h-7 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm md:text-base">
                  <span className="font-semibold text-primary-600 dark:text-primary-400">100% Free</span> •
                  <span className="mx-2">No Subscription Required</span> •
                  <span className="mx-2">Instant Access</span>
                </p>
              </div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-20 left-5 w-24 h-24 bg-primary-400/20 dark:bg-primary-400/30 rounded-full blur-2xl animate-bounce pointer-events-none"></div>
            <div className="absolute bottom-20 right-5 w-40 h-40 bg-pink-400/20 dark:bg-pink-400/30 rounded-full blur-2xl animate-pulse pointer-events-none"></div>
            <div className="absolute top-1/2 right-10 w-12 h-12 lg:w-16 lg:h-16 bg-cyan-400/20 dark:bg-cyan-400/30 rounded-full blur-xl animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>
          </section>

          {/* Pro User Wallet Section */}
          <section className="py-5 md:py-10 lg:py-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20 pointer-events-none" />
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-10">
              <div className="text-center mb-4 md:mb-8 lg:mb-16">
                <h2 className="text-xl md:text-3xl lg:text-4xl font-bold mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 dark:text-white">
                    Add Questions
                  </span>
                </h2>
                <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Create quality questions and contribute to the community
                  knowledge base.
                </p>
              </div>

              <div className="container mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-3 md:p-8 lg:p-12 border border-green-200 dark:border-green-700">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
                    {/* Left Side - Earning Process */}
                    <div className="space-y-6">
                      <div className="text-center lg:text-left">
                        <div className="w-12 lg:w-20 h-12 lg:h-20 mx-auto lg:mx-0 mb-4 bg-gradient-to-r from-secondary-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                          <span className="text-3xl">🧩</span>
                        </div>
                        <h3 className="text-sm md:text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 dark:text-white mb-2 lg:mb-4">
                          Share Your Knowledge
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium">
                          Build the community by creating high-quality questions. Help others prepare while improving your own understanding of the subjects.
                        </p>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            step: "1",
                            title: "Create Questions",
                            description:
                              "Submit quiz questions through the plus Icon",
                          },
                          {
                            step: "2",
                            title: "Admin Review",
                            description:
                              "Our team reviews and approves quality questions",
                          },
                          {
                            step: "3",
                            title: "Contribute",
                            description:
                              "Contribute quality questions and help others learn",
                          },
                        ].map((item, index) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                              {item.step}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 dark:text-white mb-1">
                                {item.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {item.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Side - Stats & Info */}
                    <div className="space-y-6">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl p-2 lg:p-6 border border-green-200 dark:border-green-700">
                        <h4 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                          💡 How It Works
                        </h4>
                        <div className="space-y-4">
                          <div className="flex flex-col lg:flex-row items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Daily Question Limit
                            </span>
                            <span className="font-bold text-green-600">
                              Up to 5 Questions
                            </span>
                          </div>
                          <div className="flex flex-col lg:flex-row items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Monthly Question Limit
                            </span>
                            <span className="font-bold text-green-600">
                              Up to 100 Questions
                            </span>
                          </div>
                          <div className="flex flex-col lg:flex-row items-center justify-between">
                            <span className="text-gray-600 dark:text-gray-300">
                              Question Contribution
                            </span>
                            <span className="font-bold text-green-600">
                              Contribute & Grow
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-secondary-50 to-indigo-50 dark:from-secondary-900/30 dark:to-indigo-900/30 rounded-2xl p-2 lg:p-6 border border-secondary-200 dark:border-secondary-700">
                        <h4 className="text-md lg:text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                          Extra Benefits
                        </h4>
                        <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>Create quality content</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>Help build the quiz community</span>
                          </li>

                          <li className="flex items-center space-x-2">
                            <span className="text-green-500">✓</span>
                            <span>Admin-reviewed quality standards</span>
                          </li>
                        </ul>
                      </div>

                      <div className="text-center">
                        <Link
                          href={`${isLoggedIn ? "/pro/questions/new" : "/login"}`}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                          <span className="mr-2">🚀</span>
                          {isLoggedIn ? "Post Question" : "Start Now"}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>



          {/* Profile Completion Reward Section - Only show for logged in users with incomplete profile and free subscription */}
          {isLoggedIn &&
            profileCompletion &&
            profileCompletion.percentage < 100 &&
            user?.subscriptionStatus === "free" && (
              <div className="container mx-auto px-4 sm:px-4 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 z-10">
                <div className="rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 border-2 border-green-300/30 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-900/20 dark:via-emerald-900/20 dark:to-teal-900/20">
                  <div className="text-center mb-6 sm:mb-8 md:mb-10">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-tr from-green-600 via-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl sm:shadow-2xl animate-float">
                      <FaUserGraduate className="text-white text-2xl sm:text-3xl md:text-4xl drop-shadow-lg" />
                    </div>
                    <h2 className="text-md sm:text-lg md:text-lg lg:text-xl xl:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-800 dark:text-white mb-3 sm:mb-4 md:mb-6 drop-shadow-lg">
                      🎁 Complete Your Profile & Get Basic Subscription FREE!
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-700 dark:text-gray-300 font-medium max-w-3xl mx-auto px-4 sm:px-0">
                      Complete{" "}
                      <strong className="text-green-600 dark:text-green-400">
                        100% of your profile
                      </strong>{" "}
                      and instantly unlock a{" "}
                      <strong className="text-green-600 dark:text-green-400">
                        Basic Subscription (₹9 value)
                      </strong>{" "}
                      for 30 days absolutely free!
                    </p>
                  </div>

                  <div className="p-4">
                    <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl sm:rounded-2xl p-4 lg:p-6 md:p-8 border border-green-200 dark:border-green-700">
                      <div className="text-center mb-6 sm:mb-8">
                        {/* Dynamic Progress Bar Section */}
                        {profileCompletion ? (
                          <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
                            <div className="text-center mb-4">
                              <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {profileCompletion.percentage === 100 ? (
                                  <span className="text-green-600 dark:text-green-400">
                                    Profile Completed ✅
                                  </span>
                                ) : (
                                  <span className="text-primary-600 dark:text-secondary-400">
                                    Profile Completion:{" "}
                                    {profileCompletion.percentage}%
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                {profileCompletion.percentage === 100
                                  ? "🎉 Congratulations! Your profile is 100% complete!"
                                  : `Complete ${4 - profileCompletion.completedFields
                                  } more field${4 - profileCompletion.completedFields === 1
                                    ? ""
                                    : "s"
                                  } to get 100% and unlock your reward!`}
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                              <div
                                className={`h-4 rounded-full transition-all duration-500 ease-in-out ${profileCompletion.percentage === 100
                                  ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                  : "bg-gradient-to-r from-primary-500 to-primary-500"
                                  }`}
                                style={{
                                  width: `${profileCompletion.percentage}%`,
                                }}
                              ></div>
                            </div>

                            {/* Field Status */}
                            <div className="space-y-2 text-sm">
                              {profileCompletion?.fields.map((field, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between"
                                >
                                  <span className="text-gray-600 dark:text-gray-300">
                                    {field.name}
                                  </span>
                                  <span
                                    className={
                                      field.completed
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }
                                  >
                                    {field.completed
                                      ? "✅ Complete"
                                      : "❌ Required"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-white/90 dark:bg-gray-900/90 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-200 dark:border-gray-700">
                            <div className="text-center">
                              <div className="text-lg text-gray-600 dark:text-gray-300">
                                Loading profile completion data...
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="bg-gradient-to-r from-green-700 to-emerald-700 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
                          <div className="text-2xl sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-2">
                            100% Profile Completion
                          </div>
                          <div className="text-sm sm:text-base text-green-100 mb-2">
                            Unlock Personalized Experience
                          </div>
                          <div className="text-xs sm:text-lg text-green-200">
                            Effective Progress Tracking
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                            ✅ What You Need to Complete:
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                Full Name
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                Valid Email Address
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                10-digit Phone No.
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                One Social Media Link
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3">
                            🚀 What You Get:
                          </h4>
                          <div className="space-y-2 sm:space-y-3">
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                Full Access to Free Plan (Levels 0-9)
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                Personalized Quiz Recommendations
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <FaStar className="text-white text-xs sm:text-lg" />
                              </div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                                Unlimited Quiz Attempts
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-center">
                        <div className="bg-primary-100 dark:bg-primary-900/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-primary-300 dark:border-primary-700">
                          <p className="text-primary-800 dark:text-primary-200 text-xs sm:text-lg font-medium">
                            💡 <strong>Pro Tip:</strong> Complete your profile to
                            get the reward immediately!
                          </p>
                        </div>

                        <Link
                          href="/profile"
                          className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                        >
                          <FaUserGraduate className="text-sm sm:text-base" />
                          <span>Complete Profile & Get Reward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Level Progression System Section */}
          <div className="container mx-auto px-2 sm:px-4 md:px-6 lg:px-10 text-center mb-4 md:mb-8 mt-8 sm:mt-10 md:mt-12 z-10">
            <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-tr from-primary-500 via-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl sm:shadow-2xl animate-float">
              <FaTrophy className="text-white text-2xl sm:text-lg md:text-lg lg:text-xl xl:text-2xl lg:text-4xl drop-shadow-lg" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-indigo-600 dark:text-white mb-2 sm:mb-3 md:mb-4 drop-shadow-lg">
              Level Progression System
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 dark:text-gray-200 font-medium">
              Journey from{" "}
              <span className="font-bold text-primary-600 dark:text-primary-300">
                Starter
              </span>{" "}
              to{" "}
              <span className="font-bold text-primary-600 dark:text-red-300">
                Legend
              </span>{" "}
              through{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                11 exciting levels
              </span>
            </p>
          </div>

          {/* All Levels and Categories sections are hidden if subscription is required */}
          <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 z-10">
            {/* Info Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
              {/* Scholarship Info */}
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-900/30 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 border border-primary-200 dark:border-primary-700 hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-primary-200/40 transition-all duration-300">
                <div className="flex items-center justify-start gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-primary-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <FaAward className="text-white text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                    Scholarship & Prizes
                  </h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    Only the Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} ranked
                    users in Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} (
                    <span className="font-bold text-primary-600">Legend</span>) win
                    scholarships and prizes!
                  </p>
                  <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-primary-600 mb-1 sm:mb-2">
                        ₹
                        Dynamic Pool
                      </div>
                      <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300">
                        Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS}{" "}
                        monthly prize pool
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Monthly Top {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} at
                        Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with{" "}
                        {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT ||
                          110}{" "}
                        high-score quizzes win from a dynamic prize pool!
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                    Reach Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} with{" "}
                    {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT || 110}{" "}
                    high-score quizzes to qualify for monthly prizes!
                  </p>
                </div>
              </div>

              {/* Progression Rules */}
              <div className="bg-gradient-to-br from-primary-50 to-red-100 dark:from-primary-900/30 dark:to-red-900/30 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 border border-primary-200 dark:border-primary-700 hover:scale-[1.02] sm:hover:scale-[1.03] hover:shadow-primary-200/40 transition-all duration-300">
                <div className="flex items-center justify-start gap-4 mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <FaGem className="text-white text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-md lg:text-2xl font-bold text-gray-800 dark:text-white">
                    Progression Rules
                  </h3>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Only quizzes with{" "}
                      <span className="font-bold text-green-600">
                        {config.QUIZ_CONFIG.QUIZ_HIGH_SCORE_PERCENTAGE}% or higher
                        score
                      </span>{" "}
                      count towards level progression
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Achieve high scores consistently to advance through levels
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Focus on quality over quantity - aim for excellence in every
                      quiz!
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Every month, your progress resets to encourage fresh
                      learning and growth
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-pink-500 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                      Compete each month for the Top{" "}
                      {config.QUIZ_CONFIG.TOP_PERFORMERS_USERS} prizes from a dynamic prize pool (active PRO users × ₹{config.QUIZ_CONFIG.PRIZE_PER_PRO})!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
              <h2 className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <FaStar className="text-primary-500 text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl" />
                Your Quizzes
              </h2>
            </div>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-4 sm:mb-6 md:mb-8 lg:mb-12 max-w-3xl sm:max-w-4xl px-0">
              Discover quizzes tailored to your current level and challenge
              yourself with new questions
            </p>

            {/* Quiz Section: Show login required if not logged in, else show quizzes or subscription message */}
            {!isLoggedIn ? (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-0 md:p-8 border border-white/20 flex flex-col items-center justify-center animate-fade-in">
                <div className="text-center mb-6">
                  <div className="text-primary-600 text-3xl mb-2">🔒</div>
                  <p className="text-primary-600 text-lg font-semibold mb-4">
                    Login to view your quizzes
                  </p>
                  <Link
                    href="/login"
                    className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
                  >
                    Login
                  </Link>
                </div>
              </div>
            ) : !hasActiveSubscription() ||
              (error && error.toLowerCase().includes("subscription")) ? (
              <div className="animate-fade-in">
                {/* Subscription Warning */}
                <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-0 md:p-8 border border-white/20 flex flex-col items-center justify-center mb-6">
                  <div className="text-center mb-6">
                    <div className="text-primary-600 text-3xl mb-2">⚠️</div>
                    <p className="text-primary-600 text-lg font-semibold mb-4">
                      {error && error.toLowerCase().includes("subscription")
                        ? error
                        : "Access to quizzes requires an active subscription."}
                    </p>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Subscribe now to unlock all quizzes and levels!
                    </p>
                    <Link
                      href="/subscription"
                      className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-lg"
                    >
                      Subscribe Now
                    </Link>
                  </div>
                </div>

                {/* Referral Banner - Only show for logged-in users */}
                {isLoggedIn && user && <ReferralBanner user={user} />}
              </div>
            ) : (
              <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl p-0 border border-white/20 animate-fade-in">
                {loading ? (
                  <div className="bg-gradient-to-r from-gray-50 to-primary-50 dark:from-gray-700 dark:to-primary-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} height="200px" borderRadius="1rem" className="shadow-lg" />)}
                    </div>
                  </div>
                ) : homeData?.quizzesByLevel?.length > 0 ? (
                  (() => {
                    // Find the user's current level quizzes
                    const userLevelObj = userLevelData;
                    let currentLevelData = null;
                    if (userLevelObj && userLevelObj.currentLevel + 1) {
                      currentLevelData = homeData.quizzesByLevel.find(
                        (lvl) => lvl.level === userLevelObj.currentLevel + 1
                      );
                    }
                    if (!currentLevelData) {
                      currentLevelData = homeData.quizzesByLevel[0];
                    }
                    if (!currentLevelData) return null;
                    return (
                      <div className="bg-gradient-to-r from-gray-50 to-primary-50 dark:from-gray-700 dark:to-primary-900/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                          {currentLevelData.quizzes.slice(0, 6).map((quiz) => (
                            <div
                              key={quiz._id}
                              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all duration-300 border-2 border-gray-200 dark:border-primary-400"
                            >
                              <div className="flex justify-between items-start mb-2 sm:mb-3">
                                <h4 className="font-semibold text-gray-800 dark:text-white text-xs sm:text-lg">
                                  {quiz.title}
                                </h4>
                                {quiz.isRecommended && (
                                  <FaStar className="text-primary-500 text-xs sm:text-lg" />
                                )}
                              </div>
                              {quiz.description && (
                                <p className="text-gray-600 dark:text-gray-300 text-xs mb-2 sm:mb-3 line-clamp-2">
                                  {quiz.description}
                                </p>
                              )}
                              <div className="space-y-1 mb-2 sm:mb-3">
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <FaClock className="text-xs" />
                                  <span>{quiz.timeLimit || 30} min</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-600 dark:text-gray-400">
                                  <FaQuestionCircle className="text-xs" />
                                  <span>
                                    {quiz.totalMarks || "Variable"} questions
                                  </span>
                                </div>
                                {quiz.difficulty && (
                                  <span
                                    className={`inline-block px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                                      quiz.difficulty
                                    )}`}
                                  >
                                    {quiz.difficulty}
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleQuizAttempt(quiz)}
                                className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-xs sm:text-lg md:text-base text-center"
                              >
                                Start Quiz
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-center py-12">
                    <FaQuestionCircle className="text-6xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                      No new quizzes available for your level.
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm">
                      You've attempted all available quizzes for your current
                      level!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Level-based Quizzes Section */}
          <div className="container mx-auto p-4 lg:p-4 mb-6 sm:mb-10 md:mb-12">
            {/* Categories Section - Enhanced Design */}
            <section className="container mx-auto px-0 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
              <div className="text-center mb-8 sm:mb-10 md:mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-500 text-white rounded-full text-sm font-semibold mb-4">
                  <FaBook className="w-4 h-4" />
                  <span>Explore</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 text-secondary-500 to-secondary-500 dark:from-primary-400 dark:via-primary-400 dark:to-red-400">
                    Categories
                  </span>
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Explore quizzes by category and find your perfect learning path
                </p>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-0">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} height="180px" borderRadius="1rem" className="shadow-lg" />
                  ))}
                </div>
              ) : categories && categories?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 px-0">
                  {categories?.map((category, idx) => {
                    const Icon =
                      categoryIcons[category.name] || categoryIcons.Default;
                    const categoryColors = getCategoryColors(category.name);
                    return (
                      <Link
                        key={category._id}
                        href={`/category/${category._id}`}
                        className={`group relative ${categoryColors.background} backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-105 ${categoryColors.border} p-4 sm:p-6 hover:shadow-xl`}
                        tabIndex={0}
                      >
                        {/* Icon */}
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r ${categoryColors.iconGradient} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}>
                          <Icon className="text-white text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
                        </div>
                        {/* Content */}
                        <div className="text-center">
                          <h3 className={`text-sm sm:text-base md:text-lg lg:text-md lg:text-xl font-bold ${categoryColors.titleColor} mb-2`}>
                            {category.name}
                          </h3>
                          <div className="mt-3 sm:mt-4 flex justify-center">
                            <span className={`inline-block bg-gradient-to-r ${categoryColors.buttonGradient} hover:opacity-90 text-white font-semibold py-1.5 sm:py-2 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-xs sm:text-lg md:text-base`}>
                              View Quizzes
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaBook className="text-6xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    No categories found.
                  </p>
                </div>
              )}
            </section>

            {/* Progressive Learning Levels Section - Enhanced Design */}
            <section className="py-10 lg:py-20 relative overflow-hidden bg-gradient-to-br from-primary-50 via-primary-50 to-red-50 dark:from-gray-900 dark:via-primary-900/20 dark:to-red-900/20">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary-400/20 to-primary-400/20 rounded-full blur-3xl animate-blob"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
              </div>

              <div className="relative container mx-auto px-0 sm:px-6 lg:px-10">
                <div className="text-center mb-8 lg:mb-16">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full text-sm font-semibold mb-4">
                    <FaLevelUpAlt className="w-4 h-4" />
                    <span>Level Up</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 text-secondary-500 to-secondary-500 dark:from-primary-400 dark:via-primary-400 dark:to-red-400">
                      Progressive Learning Levels
                    </span>
                  </h2>
                  <p className="text-md md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Start from Level 1 (Rookie) and progress through 10 levels.
                    Reach Level {config.QUIZ_CONFIG.USER_LEVEL_REQUIRED_FOR_MONTHLY_REWARD} (
                    {config.QUIZ_CONFIG.LEVEL_10_QUIZ_REQUIREMENT}{" "}
                    total quiz attempts) and have{" "}
                    {config.QUIZ_CONFIG.MONTHLY_REWARD_QUIZ_REQUIREMENT ||
                      110}{" "}
                    high-score quizzes to qualify for monthly rewards!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-8">
                  {loading ? (
                    [1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} height="250px" borderRadius="1rem" className="shadow-lg" />
                    ))
                  ) : (
                    levels.map((level, index) => {
                      const levelColors = getLevelColors(level.name);
                      const levelInfo = levelsInfo.find(
                        (info) => info.level === level.level
                      );
                      const playCount = levelInfo ? levelInfo.quizzes : 0;
                      return (
                        <div
                          key={level._id}
                          className={`group cursor-pointer relative overflow-hidden rounded-2xl p-2 md:p-4 lg:p-8 transition-all duration-300 transform hover:scale-105 border shadow-lg hover:shadow-xl ${levelColors.background} ${levelColors.border} hover:border-primary-500`}
                        >
                          <div
                            className={`absolute top-0 right-0 w-32 h-32 ${levelColors.accent} rounded-full -translate-y-16 translate-x-16`}
                          ></div>

                          <div className="relative z-10 text-center">
                            <div
                              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${levelColors.iconBg}`}
                            >
                              {React.createElement(
                                levelBadgeIcons[level.name] ||
                                levelBadgeIcons.Default,
                                {
                                  className: `w-8 h-8 ${levelColors.iconColor}`,
                                }
                              )}
                            </div>

                            <h3
                              className={`text-xl font-bold mb-2 ${levelColors.titleColor} text-center`}
                            >
                              Level {level.level} - {level.name}
                            </h3>
                            <p
                              className={`text-sm mb-4 ${levelColors.descriptionColor} text-center`}
                            >
                              {level.description ||
                                `Level ${level.level} challenges`}
                            </p>

                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                                <div className="text-lg font-bold text-primary-600">
                                  {level.quizCount || "N/A"}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Total Quizzes
                                </div>
                              </div>
                              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                                <div className="text-lg font-bold text-green-600">
                                  {levelInfo ? levelInfo.plan : "-"}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Plan
                                </div>
                              </div>
                              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                                <div className="text-lg font-bold text-primary-600">
                                  ₹{levelInfo ? levelInfo.amount : 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Amount
                                </div>
                              </div>
                              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg">
                                <div className="text-lg font-bold text-primary-600">
                                  ₹{levelInfo ? levelInfo.prize : 0}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-300">
                                  Prize
                                </div>
                              </div>
                            </div>

                            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-2 text-center shadow-lg mb-4">
                              <div className="text-md text-gray-900 dark:text-white text-center mb-2 drop-shadow-sm">
                                <strong>{playCount} wins to level up!</strong>
                              </div>
                            </div>
                            {(() => {
                              const userCurrentLevel =
                                userLevelData?.currentLevel || 0;
                              const nextLevel = userCurrentLevel + 1;

                              if (level.level < nextLevel) {
                                // User is ahead of this level - show unlocked button
                                return (
                                  <button
                                    onClick={() =>
                                      router.push(`/level/${level.level}`)
                                    }
                                    className="inline-block bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                                  >
                                    Unlocked
                                  </button>
                                );
                              } else if (nextLevel === level.level) {
                                // User's next level - show view quizzes button
                                return (
                                  <button
                                    onClick={() =>
                                      router.push(`/level/${level.level}`)
                                    }
                                    className="inline-block bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base md:text-lg"
                                  >
                                    View Quizzes
                                  </button>
                                );
                              } else {
                                // User hasn't reached this level yet - show locked button
                                return (
                                  <button
                                    disabled
                                    className="inline-block bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold py-2 px-4 rounded-xl shadow-lg cursor-not-allowed text-sm sm:text-base md:text-lg opacity-60"
                                  >
                                    Locked
                                  </button>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      );
                    }))}
                </div>

                <div className="text-center mt-12">
                  <Link
                    href="/register"
                    className="inline-flex items-center space-x-2 px-4 md:px-8 py-2 md:py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all duration-300"
                  >
                    <span>Start Your Journey</span>
                    <FaArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Platform Stats Section */}
            <div className="container mx-auto px-0 md:px-6 lg:px-10 py-6 sm:py-8 md:py-10 lg:py-12 z-10">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-gray-800 dark:to-primary-900/30 rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-primary-200 dark:border-primary-700 flex flex-col items-center relative overflow-hidden">
                <h2 className="text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-red-500 to-indigo-600 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 drop-shadow-lg">
                  Platform Stats
                </h2>
                <div className="absolute -top-10 right-10 w-32 h-32 bg-gradient-to-br from-primary-300/30 to-red-300/20 rounded-full blur-2xl z-0 animate-pulse-slow" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tl from-primary-300/20 to-secondary-200/10 rounded-full blur-2xl z-0 animate-pulse-slow" />
                <div className="relative grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-7 gap-4 sm:gap-6 w-full max-w-4xl z-10">
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaLevelUpAlt className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      10
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Levels
                    </div>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaBook className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      12
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Categories
                    </div>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-secondary-500 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaLayerGroup className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      100+
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Subcategories
                    </div>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaStar className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      4K+
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Quizzes
                    </div>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaQuestionCircle className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      20K+
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Questions
                    </div>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-secondary-500 to-indigo-500 rounded-full flex items-center justify-center mb-2 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <FaGraduationCap className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      100+
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Exams
                    </div>
                  </div>
                  <div className="flex flex-col items-center group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-pink-500 to-green-500 rounded-full flex items-center justify-center mb-2">
                      <FaUserCircle className="text-white text-xl sm:text-2xl md:text-3xl animate-float" />
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-white animate-count">
                      1K+
                    </div>
                    <div className="text-xs sm:text-lg text-gray-600 dark:text-gray-300 text-center">
                      Students
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Update Modal */}
            <SystemUpdateModal
              isOpen={showSystemUpdateModal}
              onClose={() => {
                setShowSystemUpdateModal(false);
                localStorage.setItem("hasSeenSystemUpdateModal", "true");
              }}
            />

            {/* Quiz Start Confirmation Modal */}
            <QuizStartModal
              isOpen={showQuizModal}
              onClose={handleCancelQuizStart}
              onConfirm={handleConfirmQuizStart}
              quiz={selectedQuiz}
            />
          </div>
        </div>
      </div>
      <UnifiedFooter />
    </>
  );
};

export default HomePage;

