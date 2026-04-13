'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import API from '../../lib/api';
import Loading from '../Loading';
import MobileAppWrapper from '../MobileAppWrapper';
import { isAuthenticated } from '../../lib/auth';
import {
  Heart, Bookmark, Share2, ChevronUp, ChevronDown, Filter, X, Search,
  CheckCircle2, XCircle, Flame, Zap, BookOpen, Newspaper, BarChart3,
  HelpCircle, ArrowLeft, Plus, TrendingUp, BookmarkCheck, Lightbulb,
  Music, Volume2, VolumeX, Disc3
} from 'lucide-react';

// ──── Gradient config per subject ────
const SUBJECT_GRADIENTS = {
  'Quantitative': 'from-blue-900 via-blue-800 to-blue-600',
  'Quant': 'from-blue-900 via-blue-800 to-blue-600',
  'Reasoning': 'from-purple-900 via-purple-800 to-purple-600',
  'English': 'from-emerald-900 via-emerald-800 to-emerald-600',
  'GK': 'from-orange-900 via-orange-800 to-orange-600',
  'General': 'from-slate-900 via-slate-800 to-slate-600',
};

const TYPE_GRADIENTS = {
  'question': 'from-blue-900 via-blue-800 to-indigo-700',
  'fact': 'from-purple-900 via-indigo-900 to-purple-700',
  'tip': 'from-amber-900 via-amber-800 to-yellow-700',
  'current_affairs': 'from-red-900 via-rose-800 to-red-700',
  'poll': 'from-teal-900 via-emerald-800 to-green-700',
};

const TYPE_ICONS = {
  question: HelpCircle,
  fact: BookOpen,
  tip: Zap,
  current_affairs: Newspaper,
  poll: BarChart3,
};

const DIFFICULTY_STYLES = {
  easy: 'bg-green-500/20 text-green-300 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  hard: 'bg-red-500/20 text-red-300 border-red-500/30',
};

// ──── Question Card ────
const QuestionReelCard = ({ reel, onAnswer }) => {
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (reel.userInteraction?.answered) {
      setAnswered(true);
      setResult({
        isCorrect: reel.userInteraction.isCorrect,
        correctAnswerIndex: reel.correctAnswerIndex,
        explanation: reel.explanation,
        shortcutTrick: reel.shortcutTrick
      });
      setSelected(reel.userInteraction.selectedOptionIndex);
    }
  }, [reel]);

  const handleSelect = async (index) => {
    if (answered) return;
    setSelected(index);

    if (!isAuthenticated()) {
      toast.error('Login to answer');
      return;
    }

    const res = await onAnswer(reel._id, index);
    if (res) {
      setAnswered(true);
      setResult(res);
    }
  };

    return (
      <div className="flex flex-col h-full px-4 sm:px-6 py-4 justify-center">
        {/* Subject & Topic tags */}
        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold border bg-blue-500/20 text-blue-300 border-blue-500/30 uppercase tracking-wide">
            {reel.subject}
          </span>
          {reel.topic && (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-bold border bg-purple-500/20 text-purple-300 border-purple-500/30">
              {reel.topic}
            </span>
          )}
          {reel.difficulty && (
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold border ${DIFFICULTY_STYLES[reel.difficulty]}`}>
              {reel.difficulty}
            </span>
          )}
        </div>

        {/* Question text */}
        <h2 className="text-base sm:text-xl font-bold text-white leading-relaxed mb-4 sm:mb-6">
          {reel.questionText}
        </h2>

      {/* Options */}
      <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
        {reel.options?.map((opt, i) => {
          let optionStyle = 'border-white/15 bg-white/5 hover:bg-white/10';
          if (answered && result) {
            if (i === result.correctAnswerIndex) {
              optionStyle = 'border-green-400/60 bg-green-500/20';
            } else if (i === selected && !result.isCorrect) {
              optionStyle = 'border-red-400/60 bg-red-500/20';
            } else {
              optionStyle = 'border-white/5 bg-white/[0.02] opacity-50';
            }
          } else if (i === selected) {
            optionStyle = 'border-white/40 bg-white/15 ring-1 ring-white/20';
          }

          return (
            <motion.button
              key={i}
              whileTap={!answered ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(i)}
              disabled={answered}
              className={`w-full flex items-center gap-2 p-2 sm:p-3 rounded-xl lg:rounded-2xl border-2 transition-all text-left ${optionStyle}`}
            >
              <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 ${answered && i === result?.correctAnswerIndex
                ? 'border-green-400 bg-green-400 text-green-900'
                : answered && i === selected && !result?.isCorrect
                  ? 'border-red-400 bg-red-400 text-red-900'
                  : i === selected ? 'border-white bg-white text-slate-900' : 'border-white/30 text-white/60'}`}>
                {answered ? (i === result?.correctAnswerIndex ? '✓' : i === selected && !result?.isCorrect ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white/90">{opt}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Answered stats */}
      {answered && reel.answeredCount > 0 && (
        <p className="text-[10px] text-white/40 text-center mt-0">
          👥 {reel.answeredCount} attempted · {Math.round((reel.correctCount / reel.answeredCount) * 100)}% correct
        </p>
      )}
    </div>
  );
};

// ──── Fact Card ────
const FactReelCard = ({ reel }) => (
  <div className="flex flex-col h-full pl-4 pb-4 justify-center">
    <div className="flex items-center gap-2 mb-2 sm:mb-4">
      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-bold uppercase tracking-widest text-white/70">{reel.subject}</span>
      {reel.topic && <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-semibold text-white/60">{reel.topic}</span>}
    </div>
    <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-2 sm:mb-4" />

    <h2 className="text-md sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-4">{reel.title}</h2>

    {reel.highlightText && (
      <div className="pb-3 sm:my-6">
        <p className="text-md sm:text-lg md:text-xl lg:text-2xl font-black text-white/90 leading-tight">{reel.highlightText}</p>
      </div>
    )}

    {reel.content && <p className="text-sm text-white/70 leading-relaxed mb-2 sm:mb-4">{reel.content}</p>}

    {reel.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-2 sm:mt-4">
        {reel.tags.map((tag, i) => (
          <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 text-[10px] font-medium text-white/50">🏷️ {tag}</span>
        ))}
      </div>
    )}
  </div>
);

// ──── Tip/Trick Card ────
const TipReelCard = ({ reel }) => (
  <div className="flex flex-col h-full pl-4 pb-4 justify-center">
    <div className="flex items-center gap-2 mb-4">
      <Zap className="w-4 h-4 text-yellow-400" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400/80">Quick Trick</span>
      {reel.subject && <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[10px] font-semibold text-white/60">{reel.subject}</span>}
    </div>
    <div className="h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent mb-5" />

    <h2 className="text-md sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-6">{reel.title}</h2>

    {reel.formula && (
      <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 mb-2 sm:mb-4 font-mono text-center">
        <p className="text-md sm:text-lg font-bold text-yellow-300">{reel.formula}</p>
      </div>
    )}

    {reel.content && <p className="text-sm text-white/70 leading-relaxed mb-4">{reel.content}</p>}
  </div>
);

// ──── Current Affairs Card ────
const CAReelCard = ({ reel }) => (
  <div className="flex flex-col h-full pl-4 pb-4 justify-center">
    <div className="flex items-center gap-2 mb-2">
      <Newspaper className="w-4 h-4 text-red-400" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-red-400/80">Current Affairs</span>
    </div>
    <p className="text-xs text-white/40 mb-2 ms:mb-4">
      📅 {reel.caDate ? new Date(reel.caDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
      {reel.caCategory && ` · ${reel.caCategory}`}
    </p>
    {/* <div className="h-px bg-gradient-to-r from-transparent via-red-400/30 to-transparent mb-5" /> */}
    <h2 className="text-md sm:text-lg md:text-xl lg:text-2xl font-extrabold text-white mb-2 sm:mb-4">{reel.title}</h2>

    {reel.content && <p className="text-sm text-white/70 leading-relaxed mb-2 sm:mb-4">{reel.content}</p>}

    {reel.tableData?.length > 0 && (
      <div className="rounded-2xl overflow-hidden border border-white/10 mb-2 sm:mb-4">
        {reel.tableData.map((row, i) => (
          <div key={i} className={`flex justify-between items-center p-1 sm:p-3 ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
            <span className="text-sm text-white/60">{row.key}</span>
            <span className="text-sm font-bold text-white/90">{row.value}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ──── Poll Card ────
const PollReelCard = ({ reel, onVote }) => {
  const [voted, setVoted] = useState(false);
  const [votedIndex, setVotedIndex] = useState(-1);
  const [pollData, setPollData] = useState(reel.pollOptions || []);

  useEffect(() => {
    if (reel.userInteraction?.votedOptionIndex >= 0) {
      setVoted(true);
      setVotedIndex(reel.userInteraction.votedOptionIndex);
    }
  }, [reel]);

  const totalVotes = pollData.reduce((sum, o) => sum + (o.votes || 0), 0);

  const handleVote = async (index) => {
    if (voted) return;
    if (!isAuthenticated()) { toast.error('Login to vote'); return; }

    const res = await onVote(reel._id, index);
    if (res && !res.alreadyVoted) {
      setVoted(true);
      setVotedIndex(index);
      setPollData(res.pollOptions);
    } else if (res?.alreadyVoted) {
      setVoted(true);
      setVotedIndex(res.votedOptionIndex);
      setPollData(res.pollOptions);
    }
  };

  return (
    <div className="flex flex-col h-full px-4 pb-4 justify-center">
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <BarChart3 className="w-4 h-4 text-green-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-400/80">Community Poll</span>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent mb-5" />

      <h2 className="text-md sm:text-lg md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-6">{reel.pollQuestion}</h2>

      <div className="space-y-3">
        {pollData.map((opt, i) => {
          const pct = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
          return (
            <motion.button
              key={i}
              whileTap={!voted ? { scale: 0.97 } : {}}
              onClick={() => handleVote(i)}
              disabled={voted}
              className="w-full text-left relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 p-2 sm:p-3.5"
            >
              {voted && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`absolute inset-y-0 left-0 ${i === votedIndex ? 'bg-green-500/20' : 'bg-white/5'}`}
                />
              )}
              <div className="relative flex justify-between items-center">
                <span className="text-sm font-bold text-white/90">{opt.text}</span>
                {voted && <span className="text-sm font-bold text-white/70">{pct}%</span>}
              </div>
            </motion.button>
          );
        })}
      </div>

      {voted && <p className="text-xs text-white/40 text-center mt-4">👥 {totalVotes} votes</p>}
    </div>
  );
};

// ──── Action Bar ────
const ActionBar = ({ reel, onLike, onBookmark, onShare, onExplanation, showExplanationIcon }) => {
  const [liked, setLiked] = useState(reel.userInteraction?.liked || false);
  const [bookmarked, setBookmarked] = useState(reel.userInteraction?.bookmarked || false);
  const [likeCount, setLikeCount] = useState(reel.likesCount || 0);

  const handleLike = async () => {
    if (!isAuthenticated()) { toast.error('Login to like'); return; }
    const res = await onLike(reel._id);
    if (res) { setLiked(res.liked); setLikeCount(res.likesCount); }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated()) { toast.error('Login to save'); return; }
    const res = await onBookmark(reel._id);
    if (res) { setBookmarked(res.bookmarked); toast.success(res.bookmarked ? 'Saved!' : 'Removed'); }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: reel.title || 'AajExam Reel', text: reel.questionText || reel.title || reel.content, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
    onShare(reel._id);
  };

  return (
    <>
      <motion.button whileTap={{ scale: 1.2 }} onClick={handleLike} aria-label={liked ? 'Unlike' : 'Like'} className="flex flex-col items-center gap-0.5 p-2">
        <Heart className={`w-7 h-7 transition-all ${liked ? 'fill-primary-500 text-primary-500' : 'text-white'}`} />
        <span className="text-[11px] font-semibold text-white">{likeCount || ''}</span>
      </motion.button>

      <motion.button whileTap={{ scale: 1.2 }} onClick={handleBookmark} aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'} className="flex flex-col items-center p-2">
        <Bookmark className={`w-7 h-7 transition-all ${bookmarked ? 'fill-white text-white' : 'text-white'}`} />
      </motion.button>

      <motion.button whileTap={{ scale: 1.2 }} onClick={handleShare} aria-label="Share" className="flex flex-col items-center p-2">
        <Share2 className="w-7 h-7 text-white" />
      </motion.button>

      {showExplanationIcon && (
        <motion.button whileTap={{ scale: 1.2 }} onClick={onExplanation} aria-label="Show explanation" className="flex flex-col items-center p-2">
          <Lightbulb className="w-7 h-7 text-yellow-400" />
        </motion.button>
      )}
    </>
  );
};

// ──── Filter Bar ────
const FilterBar = ({ filters, selected, onChange, onClose }) => (
  <motion.div
    initial={{ y: '100%' }}
    animate={{ y: 0 }}
    exit={{ y: '100%' }}
    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
    className="absolute bottom-0 left-0 right-0 z-30 max-h-[90%] overflow-y-auto rounded-t-3xl bg-slate-900/95 backdrop-blur-xl border-t border-white/10"
    style={{ scrollbarWidth: 'none' }}
  >
    {/* Handle bar */}
    <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-slate-900/95 z-10">
      <div className="w-10 h-1 rounded-full bg-white/20" />
    </div>

    <div className="px-5 pb-20 space-y-5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-white/70" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Filters</h3>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full bg-white/10">
          <X className="w-4 h-4 text-white/60" />
        </button>
      </div>

      {/* Type */}
      <section>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Card Type</p>
        <div className="flex flex-wrap gap-2">
          {[['all', 'All'], ['question', 'Questions'], ['fact', 'Facts'], ['tip', 'Tips'], ['current_affairs', 'CA'], ['poll', 'Polls']].map(([val, label]) => (
            <button key={val} onClick={() => onChange({ ...selected, type: val === 'all' ? '' : val })}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${(!selected.type && val === 'all') || selected.type === val
                ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'}`}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Subject */}
      {filters.subjects?.length > 0 && (
        <section>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Subject</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onChange({ ...selected, subject: '' })}
              className={`px-4 py-2 rounded-xl text-xs font-bold border ${!selected.subject ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}>All</button>
            {filters.subjects.map(s => (
              <button key={s} onClick={() => onChange({ ...selected, subject: s })}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${selected.subject === s ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}>{s}</button>
            ))}
          </div>
        </section>
      )}

      {/* Exam */}
      {filters.examTypes?.length > 0 && (
        <section>
          <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Exam Target</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => onChange({ ...selected, examType: '' })}
              className={`px-4 py-2 rounded-xl text-xs font-bold border ${!selected.examType ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}>All</button>
            {filters.examTypes.map(e => (
              <button key={e} onClick={() => onChange({ ...selected, examType: e })}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${selected.examType === e ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}>{e}</button>
            ))}
          </div>
        </section>
      )}

      {/* Difficulty */}
      <section>
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-3">Difficulty</p>
        <div className="flex flex-wrap gap-2 pb-4">
          {['all', 'easy', 'medium', 'hard'].map(d => (
            <button key={d} onClick={() => onChange({ ...selected, difficulty: d === 'all' ? '' : d })}
              className={`px-4 py-2 rounded-xl text-xs font-bold border ${(!selected.difficulty && d === 'all') || selected.difficulty === d
                ? 'bg-white text-black border-white' : 'bg-white/5 text-white/60 border-white/10'}`}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </section>
    </div>
  </motion.div>
);

// ──── Main Feed Component ────
const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({ type: '', subject: '', examType: '', difficulty: '' });
  const [followMap, setFollowMap] = useState({});
  const [followLoading, setFollowLoading] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);

  // Audio & Timer state
  const audioRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const goNextRef = useRef(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showMuteIcon, setShowMuteIcon] = useState(false);
  const muteTimeoutRef = useRef(null);

  // Generate readable label from any audio filename
  const getAudioLabel = (filename) => {
    if (!filename) return '';
    const name = filename.replace(/\.(mp3|wav|ogg)$/, '');
    return name.split('-').slice(0, -1).join(' ').replace(/\b\w/g, c => c.toUpperCase()) || name;
  };

  // Audio playback & countdown timer per reel
  useEffect(() => {
    // Cleanup previous audio & timer
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setTimeRemaining(0);
    setTotalDuration(0);
    setIsAudioPlaying(false);

    const reel = reels[currentIndex];
    if (!reel || !reel.audioFile || !reel.duration || reel.duration <= 0) return;

    const dur = reel.duration;
    setTimeRemaining(dur);
    setTotalDuration(dur);

    // Create and play audio
    const audio = new Audio(`/reel_audio/${reel.audioFile}`);
    audio.loop = true;
    audio.volume = isMuted ? 0 : 0.5;
    audioRef.current = audio;

    audio.play().then(() => {
      setIsAudioPlaying(true);
    }).catch(() => {
      setIsAudioPlaying(false);
    });

    // Countdown timer — auto-scroll on end
    let remaining = dur;
    timerIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsAudioPlaying(false);
        // Auto scroll to next reel after duration ends
        setTimeout(() => {
          if (goNextRef.current) goNextRef.current();
        }, 500);
      }
    }, 1000);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [currentIndex, reels]);

  // Sync mute state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : 0.5;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
    // Show mute/unmute icon in center briefly (Instagram style)
    setShowMuteIcon(true);
    if (muteTimeoutRef.current) clearTimeout(muteTimeoutRef.current);
    muteTimeoutRef.current = setTimeout(() => setShowMuteIcon(false), 800);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const audioProgress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;

  // Load filter options
  useEffect(() => {
    API.getReelsFilterOptions().then(res => {
      if (res?.success) setFilterOptions(res.data);
    });
  }, []);

  // Load reels
  const loadReels = useCallback(async (resetPage = false) => {
    const p = resetPage ? 1 : page;
    if (resetPage) setLoading(true); else setLoadingMore(true);

    try {
      const params = { page: p, limit: 10 };
      if (selectedFilters.type) params.type = selectedFilters.type;
      if (selectedFilters.subject) params.subject = selectedFilters.subject;
      if (selectedFilters.examType) params.examType = selectedFilters.examType;
      if (selectedFilters.difficulty) params.difficulty = selectedFilters.difficulty;
      if (selectedFilters.tag) params.tag = selectedFilters.tag;

      const res = await API.getReelsFeed(params);
      if (res?.success) {
        if (resetPage) {
          setReels(res.data);
          setCurrentIndex(0);
        } else {
          setReels(prev => [...prev, ...res.data]);
        }
        setHasMore(res.pagination?.hasMore || false);
        setPage(p);
      }
    } catch (err) {
      toast.error('Failed to load reels');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page, selectedFilters]);

  useEffect(() => { loadReels(true); }, [selectedFilters]);

  // When all 10 reels finished and user swipes up — load next batch
  const loadNextBatch = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const params = { page: nextPage, limit: 10 };
      if (selectedFilters.type) params.type = selectedFilters.type;
      if (selectedFilters.subject) params.subject = selectedFilters.subject;
      if (selectedFilters.examType) params.examType = selectedFilters.examType;
      if (selectedFilters.difficulty) params.difficulty = selectedFilters.difficulty;
      if (selectedFilters.tag) params.tag = selectedFilters.tag;

      const res = await API.getReelsFeed(params);
      if (res?.success && res.data?.length > 0) {
        setReels(prev => [...prev, ...res.data]);
        setHasMore(res.pagination?.hasMore || false);
        setPage(nextPage);
        // Auto move to first reel of new batch
        setCurrentIndex(prev => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      toast.error('Failed to load more reels');
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, selectedFilters]);

  // Track views + check follow status
  useEffect(() => {
    if (reels[currentIndex]) {
      API.viewReel(reels[currentIndex]._id).catch(() => {});

      // Check follow status for creator (if not already checked)
      const creatorId = reels[currentIndex].createdBy?._id;
      if (creatorId && isAuthenticated() && followMap[creatorId] === undefined) {
        API.request(`/api/users/follow-status/${creatorId}`).then(res => {
          if (res?.success) {
            setFollowMap(prev => ({ ...prev, [creatorId]: res.isFollowing }));
          }
        }).catch(() => {});
      }
    }
  }, [currentIndex]);

  // Follow/Unfollow toggle
  const handleFollowToggle = async (userId) => {
    if (!isAuthenticated()) { toast.error('Login to follow'); return; }
    setFollowLoading(userId);
    try {
      const isCurrentlyFollowing = followMap[userId];
      if (isCurrentlyFollowing) {
        await API.request(`/api/users/unfollow/${userId}`, { method: 'DELETE' });
        setFollowMap(prev => ({ ...prev, [userId]: false }));
        toast.success('Unfollowed');
      } else {
        await API.request(`/api/users/follow/${userId}`, { method: 'POST' });
        setFollowMap(prev => ({ ...prev, [userId]: true }));
        toast.success('Following!');
      }
    } catch (err) {
      toast.error('Failed');
    } finally {
      setFollowLoading(null);
    }
  };

  // Navigation
  const goNext = () => {
    setShowExplanation(false);
    setShowAllTags(false);
    if (currentIndex < reels.length - 1) {
      setCurrentIndex(i => i + 1);
    } else if (hasMore && !loadingMore) {
      loadNextBatch();
    }
  };
  // Keep ref in sync for auto-scroll timer callback
  goNextRef.current = goNext;
  const goPrev = () => {
    setShowExplanation(false);
    setShowAllTags(false);
    if (currentIndex > 0) setCurrentIndex(i => i - 1);
  };

  // Touch handling for swipe
  const handleTouchStart = (e) => { touchStartY.current = e.touches[0].clientY; };
  const handleTouchEnd = (e) => {
    const diff = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext(); else goPrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') goNext();
      if (e.key === 'ArrowUp' || e.key === 'k') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, reels.length]);

  // Mouse wheel
  useEffect(() => {
    let lastWheel = 0;
    const handleWheel = (e) => {
      const now = Date.now();
      if (now - lastWheel < 500) return;
      lastWheel = now;
      if (e.deltaY > 0) goNext(); else if (e.deltaY < 0) goPrev();
    };
    const el = containerRef.current;
    if (el) el.addEventListener('wheel', handleWheel, { passive: true });
    return () => { if (el) el.removeEventListener('wheel', handleWheel); };
  }, [currentIndex, reels.length]);

  // Handlers
  const handleAnswer = async (id, selectedOptionIndex) => {
    try {
      const res = await API.answerReel(id, selectedOptionIndex);
      return res?.success ? res : null;
    } catch { return null; }
  };

  const handleLike = async (id) => {
    try { const res = await API.likeReel(id); return res?.success ? res : null; } catch { return null; }
  };

  const handleBookmark = async (id) => {
    try { const res = await API.bookmarkReel(id); return res?.success ? res : null; } catch { return null; }
  };

  const handleShare = async (id) => {
    try { await API.shareReel(id); } catch {}
  };

  const handleVote = async (id, optionIndex) => {
    try { const res = await API.voteReelPoll(id, optionIndex); return res?.success ? res : null; } catch { return null; }
  };

  const handleFilterChange = (newFilters) => {
    setSelectedFilters(newFilters);
    setShowFilters(false);
  };

  const currentReel = reels[currentIndex];
  const getGradient = (reel) => {
    if (!reel) return 'from-slate-900 to-slate-800';
    return SUBJECT_GRADIENTS[reel.subject] || TYPE_GRADIENTS[reel.type] || 'from-slate-900 via-slate-800 to-slate-700';
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 px-6" style={{ height: '100dvh' }}>
        <div className="w-full max-w-sm space-y-4 animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-slate-800" />
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-800 rounded-full w-24" />
              <div className="h-2 bg-slate-800/60 rounded-full w-16" />
            </div>
          </div>
          <div className="h-4 bg-slate-800 rounded-full w-3/4" />
          <div className="h-4 bg-slate-800 rounded-full w-1/2" />
          <div className="space-y-3 mt-6">
            <div className="h-12 bg-slate-800/50 rounded-2xl" />
            <div className="h-12 bg-slate-800/50 rounded-2xl" />
            <div className="h-12 bg-slate-800/50 rounded-2xl" />
            <div className="h-12 bg-slate-800/50 rounded-2xl" />
          </div>
        </div>
        <p className="text-xs font-bold text-white/30 uppercase tracking-widest mt-8">Loading reels...</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white px-6">
        <Flame className="w-16 h-16 text-slate-600 mb-4" />
        <p className="text-lg font-bold mb-2">No reels yet</p>
        <p className="text-sm text-white/50 text-center">Reels will appear here once published</p>
        <Link href="/" className="mt-6 px-6 py-2.5 rounded-xl bg-white/10 text-sm font-semibold hover:bg-white/20 transition-colors">
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full overflow-hidden relative select-none bg-black pb-[70px] lg:pb-0"
      style={{ height: '100dvh', position: 'fixed', inset: 0 }}
    >
      {/* Filter Panel — overlay */}
      <AnimatePresence>
        {showFilters && (
          <FilterBar
            filters={filterOptions}
            selected={selectedFilters}
            onChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* Reel Card — Instagram style full screen */}
      <AnimatePresence mode="wait">
        {currentReel && (
          <motion.div
            key={currentReel._id}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.25 }}
            className={`h-full w-full bg-gradient-to-b ${getGradient(currentReel)} relative`}
          >
            {/* ── Top: minimal header (like Insta) ── */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 pt-2 pb-8 bg-gradient-to-b from-black/50 to-transparent">
              <div className="flex items-center gap-2">
                <Link href="/home" className="p-1.5">
                  <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <span className="text-sm font-black text-white uppercase tracking-wider">Reels</span>
                {selectedFilters.tag && (
                  <button
                    onClick={() => setSelectedFilters(prev => ({ ...prev, tag: '' }))}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-white"
                  >
                    #{selectedFilters.tag} <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Link href="/search" className="p-2">
                  <Search className="w-5 h-5 text-white" />
                </Link>
                <button onClick={() => setShowCreateDrawer(true)} className="p-2">
                  <Plus className="w-5 h-5 text-white" />
                </button>
                <button onClick={() => setShowFilters(!showFilters)} className="p-2">
                  <Filter className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* ── Audio Progress Bar (top, like Instagram stories) ── */}
            {currentReel.audioFile && currentReel.duration > 0 && (
              <div className="absolute top-0 left-0 right-0 z-30 h-[3px] bg-white/10">
                <motion.div
                  className="h-full bg-white/80 rounded-r-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${audioProgress}%` }}
                  transition={{ duration: 0.3, ease: 'linear' }}
                />
              </div>
            )}

            {/* ── Audio Timer (top center pill) ── */}
            {currentReel.audioFile && currentReel.duration > 0 && timeRemaining > 0 && (
              <div className="absolute top-[18px] left-1/2 -translate-x-1/2 z-30">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-white/70 tabular-nums">{formatTime(timeRemaining)}</span>
                </div>
              </div>
            )}

            {/* ── Mute/Unmute center feedback (Instagram style) ── */}
            <AnimatePresence>
              {showMuteIcon && currentReel.audioFile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                >
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    {isMuted ? <VolumeX className="w-8 h-8 text-white" /> : <Volume2 className="w-8 h-8 text-white" />}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Center: scrollable content ── */}
            <div className="absolute inset-0 overflow-y-auto pt-12 pb-24 pr-[50px]" style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              {currentReel.type === 'question' && <QuestionReelCard reel={currentReel} onAnswer={handleAnswer} />}
              {currentReel.type === 'fact' && <FactReelCard reel={currentReel} />}
              {currentReel.type === 'tip' && <TipReelCard reel={currentReel} />}
              {currentReel.type === 'current_affairs' && <CAReelCard reel={currentReel} />}
              {currentReel.type === 'poll' && <PollReelCard reel={currentReel} onVote={handleVote} />}
            </div>

            {/* ── Right: profile + actions (exact Instagram Reels style) ── */}
            <div className="absolute right-3 bottom-5 flex flex-col items-center gap-3 z-20" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.5))' }}>
              {/* Profile avatar + follow */}
              <div className="relative">
                <Link href={`/u/${currentReel.createdBy?.username || 'aajexam'}`}>
                  <div className="w-9 h-9 rounded-full bg-primary-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-black uppercase">
                      {(currentReel.createdBy?.username || 'A').charAt(0)}
                    </div>
                  </div>
                </Link>
                {currentReel.createdBy?._id && (
                  <button
                    onClick={() => handleFollowToggle(currentReel.createdBy._id)}
                    disabled={followLoading === currentReel.createdBy._id}
                    className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black ${
                      followMap[currentReel.createdBy._id]
                        ? 'bg-white text-gray-500'
                        : 'bg-primary-500 text-white'
                    }`}
                  >
                    {followLoading === currentReel.createdBy._id ? '·' : followMap[currentReel.createdBy._id] ? '✓' : '+'}
                  </button>
                )}
              </div>

              {/* Like */}
              <ActionBar
                reel={currentReel}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onShare={handleShare}
                showExplanationIcon={true}
                onExplanation={() => setShowExplanation(!showExplanation)}
              />

              {/* ── Spinning Vinyl Disc (Instagram audio disc) ── */}
              {currentReel.audioFile && currentReel.duration > 0 && (
                <button onClick={toggleMute} className="relative w-10 h-10">
                  <div
                    className="w-full h-full rounded-full border-2 border-white/20 bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center"
                    style={{
                      animation: isAudioPlaying && !isMuted ? 'spin 3s linear infinite' : 'none',
                    }}
                  >
                    <div className="w-3.5 h-3.5 rounded-full bg-white/20 border border-white/30" />
                    <Music className="w-3 h-3 text-white/60 absolute" />
                  </div>
                  {/* Outer ring glow when playing */}
                  {isAudioPlaying && !isMuted && (
                    <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-20" />
                  )}
                </button>
              )}
            </div>

            {/* ── Bottom: info bar (exact Instagram gradient) ── */}
            <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)' }}>
              <div className="px-4 pb-3 pt-12 pointer-events-auto">
                {/* Creator row */}
                <div className="flex items-center gap-2 mb-2">
                  <Link href={`/u/${currentReel.createdBy?.username || 'aajexam'}`} className="shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary-500 p-[1.5px]">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase">
                        {(currentReel.createdBy?.username || 'A').charAt(0)}
                      </div>
                    </div>
                  </Link>
                  <Link
                    href={`/u/${currentReel.createdBy?.username || 'aajexam'}`}
                    className="text-[13px] font-extrabold text-white hover:underline"
                    style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
                  >
                    @{currentReel.createdBy?.username || 'aajexam'}
                  </Link>
                  {currentReel.createdBy?._id && !followMap[currentReel.createdBy._id] && (
                    <button
                      onClick={() => handleFollowToggle(currentReel.createdBy._id)}
                      disabled={followLoading === currentReel.createdBy._id}
                      className="px-3 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-[11px] font-extrabold text-white border border-white/30"
                    >
                      Follow
                    </button>
                  )}
                </div>
                {/* Caption / exam info */}
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {currentReel.examType && currentReel.examType !== 'General' && (
                    <span className="text-[12px] font-semibold text-white/90" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{currentReel.examType}</span>
                  )}
                  {currentReel.subject && currentReel.subject !== 'General' && (
                    <span className="text-[12px] text-white/70">· {currentReel.subject}</span>
                  )}
                  <span className="text-[11px] text-white/50">{currentIndex + 1}/{reels.length}</span>
                </div>
                {/* Hashtags */}
                {currentReel.tags?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    {(showAllTags ? currentReel.tags : currentReel.tags.slice(0, 2)).map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedFilters(prev => ({ ...prev, type: '', subject: '', examType: '', difficulty: '' }));
                          setSelectedFilters(prev => ({ ...prev, tag }));
                          setShowFilters(false);
                        }}
                        className="text-[12px] font-bold text-white/80 hover:text-white active:text-primary-400 transition-colors"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        #{tag}
                      </button>
                    ))}
                    {currentReel.tags.length > 2 && (
                      <button
                        onClick={() => setShowAllTags(prev => !prev)}
                        className="text-[12px] font-bold text-white/50 hover:text-white transition-colors"
                        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                      >
                        {showAllTags ? 'less' : '...more'}
                      </button>
                    )}
                  </div>
                )}

                {/* ── Audio Marquee (Instagram style) ── */}
                {currentReel.audioFile && currentReel.duration > 0 && (
                  <div className="flex items-center gap-2 mr-12">
                    <Music className="w-3 h-3 text-white shrink-0" />
                    <div className="overflow-hidden flex-1">
                      <div
                        className="whitespace-nowrap"
                        style={{
                          animation: isAudioPlaying ? 'marquee 8s linear infinite' : 'none',
                        }}
                      >
                        <span className="text-[12px] font-semibold text-white/90" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                          {getAudioLabel(currentReel.audioFile)}
                          &nbsp;&nbsp;&nbsp;&middot;&nbsp;&nbsp;&nbsp;
                          {getAudioLabel(currentReel.audioFile)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Explanation / Detail bottom sheet (all reel types) ── */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="absolute bottom-0 left-0 right-0 z-30 max-h-[80%] overflow-y-auto rounded-t-3xl bg-slate-900/95 backdrop-blur-xl border-t border-white/10"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {/* Handle bar */}
                  <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-slate-900/95 z-10">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                  </div>

                  <div className="px-5 pb-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        <span className="text-sm font-black text-white uppercase tracking-wider">
                          {currentReel.type === 'question' ? 'Explanation' : 'More Details'}
                        </span>
                      </div>
                      <button onClick={() => setShowExplanation(false)} className="p-1.5 rounded-full bg-white/10">
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    </div>

                    {/* ── Question type ── */}
                    {currentReel.type === 'question' && (
                      <>
                        {currentReel.explanation && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Answer Explanation</p>
                            <p className="text-[13px] text-white/90 leading-relaxed">{currentReel.explanation}</p>
                          </div>
                        )}
                        {currentReel.shortcutTrick && (
                          <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-1.5">
                            <p className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Quick Trick
                            </p>
                            <p className="text-[13px] text-yellow-100/90 leading-relaxed">{currentReel.shortcutTrick}</p>
                          </div>
                        )}
                        {currentReel.answeredCount > 0 && (
                          <div className="flex items-center gap-3 pt-2 border-t border-white/5">
                            <span className="text-[11px] text-white/40">👥 {currentReel.answeredCount} attempted</span>
                            <span className="text-[11px] text-primary-500 font-bold">{Math.round((currentReel.correctCount / currentReel.answeredCount) * 100)}% correct</span>
                          </div>
                        )}
                        {!currentReel.explanation && !currentReel.shortcutTrick && (
                          <p className="text-sm text-white/40 text-center py-4">No explanation available for this question</p>
                        )}
                      </>
                    )}

                    {/* ── Fact type ── */}
                    {currentReel.type === 'fact' && (
                      <>
                        {currentReel.highlightText && (
                          <div className="py-3">
                            <p className="text-lg font-black text-white/90 leading-tight">{currentReel.highlightText}</p>
                          </div>
                        )}
                        {currentReel.content && (
                          <p className="text-[13px] text-white/90 leading-relaxed">{currentReel.content}</p>
                        )}
                        {currentReel.keyPoints?.length > 0 && (
                          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-2">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Key Points</p>
                            {currentReel.keyPoints.map((point, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-white/40 text-xs mt-0.5">•</span>
                                <p className="text-[13px] text-white/80">{point}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Tip type ── */}
                    {currentReel.type === 'tip' && (
                      <>
                        {currentReel.content && (
                          <p className="text-[13px] text-white/90 leading-relaxed">{currentReel.content}</p>
                        )}
                        {currentReel.formula && (
                          <div className="p-3 rounded-2xl bg-white/10 border border-white/10 font-mono text-center">
                            <p className="text-lg font-bold text-yellow-300">{currentReel.formula}</p>
                          </div>
                        )}
                        {currentReel.steps?.length > 0 && (
                          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Steps</p>
                            {currentReel.steps.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <span className="text-xs font-bold text-yellow-400/60 w-14 shrink-0">Step {i + 1}</span>
                                <p className="text-[13px] text-white/80">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {currentReel.shortcutTrick && (
                          <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 space-y-1.5">
                            <p className="text-[10px] font-bold text-yellow-400/80 uppercase tracking-widest flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5" /> Quick Trick
                            </p>
                            <p className="text-[13px] text-yellow-100/90 leading-relaxed">{currentReel.shortcutTrick}</p>
                          </div>
                        )}
                        {currentReel.tryYourself?.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Try Yourself</p>
                            {currentReel.tryYourself.map((ex, i) => (
                              <p key={i} className="text-[13px] text-white/60 font-mono">{ex}</p>
                            ))}
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Current Affairs type ── */}
                    {currentReel.type === 'current_affairs' && (
                      <>
                        {currentReel.content && (
                          <p className="text-[13px] text-white/90 leading-relaxed">{currentReel.content}</p>
                        )}
                        {currentReel.tableData?.length > 0 && (
                          <div className="rounded-2xl overflow-hidden border border-white/10">
                            {currentReel.tableData.map((row, i) => (
                              <div key={i} className={`flex justify-between items-center p-3 ${i % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}`}>
                                <span className="text-[13px] text-white/60">{row.key}</span>
                                <span className="text-[13px] font-bold text-white/90">{row.value}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {currentReel.keyTakeaway && (
                          <div className="p-3 rounded-2xl border-l-4 border-red-400/50 bg-red-500/10">
                            <p className="text-[10px] font-bold text-red-400/60 uppercase tracking-widest mb-1">Key Takeaway</p>
                            <p className="text-[13px] text-white/80 italic">"{currentReel.keyTakeaway}"</p>
                          </div>
                        )}
                      </>
                    )}

                    {/* ── Poll type ── */}
                    {currentReel.type === 'poll' && (
                      <>
                        {currentReel.content && (
                          <p className="text-[13px] text-white/90 leading-relaxed">{currentReel.content}</p>
                        )}
                        {currentReel.explanation && (
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Context</p>
                            <p className="text-[13px] text-white/90 leading-relaxed">{currentReel.explanation}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Desktop: nav arrows (left side) ── */}
            <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col gap-3 z-20">
              <button onClick={goPrev} disabled={currentIndex === 0}
                className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 disabled:opacity-20 transition-all">
                <ChevronUp className="w-5 h-5" />
              </button>
              <button onClick={goNext} disabled={currentIndex >= reels.length - 1 && !hasMore}
                className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 disabled:opacity-20 transition-all">
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading next batch — full overlay */}
      {loadingMore && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-3" />
          <p className="text-xs font-bold text-white/50 uppercase tracking-widest">Loading reels...</p>
        </div>
      )}

      {/* ── Create Reel Bottom Drawer ── */}
      <AnimatePresence>
        {showCreateDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateDrawer(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 z-[70] max-h-[85%] overflow-y-auto rounded-t-3xl bg-slate-900/95 backdrop-blur-xl border-t border-white/10"
              style={{ scrollbarWidth: 'none' }}
            >
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 rounded-full bg-white/20" />
              </div>
              <div className="px-5 pb-24 pt-2">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Create Reel</h3>
                  <button onClick={() => setShowCreateDrawer(false)} className="p-1.5 rounded-full bg-white/10">
                    <X className="w-4 h-4 text-white/60" />
                  </button>
                </div>
                <div className="space-y-2.5">
                  {[
                    { value: 'question', label: 'Question', icon: HelpCircle, gradient: 'from-blue-500 to-indigo-600', desc: 'MCQ with explanation' },
                    { value: 'fact', label: 'Fact', icon: BookOpen, gradient: 'from-purple-500 to-pink-600', desc: 'Quick fact or one-liner' },
                    { value: 'tip', label: 'Tip / Trick', icon: Zap, gradient: 'from-yellow-500 to-orange-600', desc: 'Shortcut or formula' },
                    { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, gradient: 'from-red-500 to-rose-600', desc: 'Daily CA card' },
                    { value: 'poll', label: 'Poll', icon: BarChart3, gradient: 'from-green-500 to-emerald-600', desc: 'Community poll' },
                  ].map((type) => (
                    <Link
                      key={type.value}
                      href={`/reels/create?type=${type.value}`}
                      onClick={() => setShowCreateDrawer(false)}
                      className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/10 hover:border-white/20 transition-all active:bg-white/5"
                    >
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${type.gradient} flex items-center justify-center shrink-0`}>
                        <type.icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black text-white">{type.label}</p>
                        <p className="text-[11px] text-white/50 font-medium">{type.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReelsFeed;
