'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import API from '../../lib/api';
import MobileAppWrapper from '../MobileAppWrapper';
import Button from '../ui/Button';
import { isAuthenticated } from '../../lib/auth';
import {
  ArrowLeft, Flame, HelpCircle, BookOpen, Zap, Newspaper, BarChart3, Plus, Trash2,
  Music, Clock, Play, Pause, Search, Volume2, VolumeX
} from 'lucide-react';

const TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'border-blue-400 bg-blue-50 dark:bg-blue-950/30', desc: 'MCQ with explanation' },
  { value: 'fact', label: 'Fact', icon: BookOpen, color: 'border-purple-400 bg-purple-50 dark:bg-purple-950/30', desc: 'Quick fact or one-liner' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, color: 'border-amber-400 bg-amber-50 dark:bg-amber-950/30', desc: 'Shortcut or formula' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, color: 'border-red-400 bg-red-50 dark:bg-red-950/30', desc: 'Daily CA card' },
  { value: 'poll', label: 'Poll', icon: BarChart3, color: 'border-green-400 bg-green-50 dark:bg-green-950/30', desc: 'Community poll' },
];

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";
const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const ReelCreate = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');

  // Pre-select type from query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const preType = params.get('type');
    if (preType && ['question', 'fact', 'tip', 'current_affairs', 'poll'].includes(preType)) {
      setType(preType);
    }
  }, []);
  // Dropdown data
  const [examsList, setExamsList] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [topicsList, setTopicsList] = useState([]);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [exRes, subRes, topRes] = await Promise.all([
          API.getAllExams(), API.getAllSubjects(), API.getAllTopics()
        ]);
        if (exRes?.success) setExamsList(exRes.data || []);
        if (subRes?.success) setSubjectsList(subRes.data || []);
        if (topRes?.success) setTopicsList(topRes.data || []);
      } catch (e) { console.error('Failed to load dropdowns:', e); }
    };
    fetchDropdowns();
  }, []);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState('');

  // Question
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [shortcutTrick, setShortcutTrick] = useState('');

  // Fact
  const [highlightText, setHighlightText] = useState('');
  const [keyPoints, setKeyPoints] = useState(['']);

  // Tip
  const [formula, setFormula] = useState('');
  const [steps, setSteps] = useState(['']);

  // Poll
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState([{ text: '' }, { text: '' }]);

  // Audio & Duration
  const [audioList, setAudioList] = useState([]);
  const [audioFile, setAudioFile] = useState('');
  const [duration, setDuration] = useState('');
  const [audioSearch, setAudioSearch] = useState('');
  const [audioPlaying, setAudioPlaying] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const audioPreviewRef = React.useRef(null);

  // Fetch audio files from server + load durations
  useEffect(() => {
    API.getReelAudioList().then(res => {
      if (res?.success) {
        const list = res.data.map(a => ({ ...a, audioDuration: null }));
        setAudioList(list);
        // Load duration for each audio file
        list.forEach((item, i) => {
          const audio = new Audio(`/reel_audio/${item.value}`);
          audio.addEventListener('loadedmetadata', () => {
            setAudioList(prev => {
              const updated = [...prev];
              if (updated[i]) updated[i] = { ...updated[i], audioDuration: Math.round(audio.duration) };
              return updated;
            });
          });
        });
      }
    });
  }, []);

  const formatAudioDuration = (sec) => {
    if (!sec) return '';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const filteredAudios = audioList.filter(a =>
    a.label.toLowerCase().includes(audioSearch.toLowerCase()) ||
    a.artist.toLowerCase().includes(audioSearch.toLowerCase())
  );

  const handleAudioPlayPause = (file) => {
    // If same file is playing, pause it
    if (audioPlaying === file && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
      setAudioPlaying(null);
      return;
    }
    // Stop any existing
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    const audio = new Audio(`/reel_audio/${file}`);
    audio.volume = audioMuted ? 0 : 0.5;
    audio.loop = true;
    audio.play();
    audioPreviewRef.current = audio;
    setAudioPlaying(file);
    audio.addEventListener('error', () => { setAudioPlaying(null); });
  };

  const handleAudioSelect = (file) => {
    setAudioFile(file);
    // Auto play selected
    if (audioPlaying !== file) handleAudioPlayPause(file);
  };

  const toggleAudioMute = () => {
    setAudioMuted(prev => {
      const next = !prev;
      if (audioPreviewRef.current) audioPreviewRef.current.volume = next ? 0 : 0.5;
      return next;
    });
  };

  // Cleanup audio on unmount
  React.useEffect(() => {
    return () => { if (audioPreviewRef.current) { audioPreviewRef.current.pause(); } };
  }, []);

  if (!isAuthenticated()) {
    return (
      <MobileAppWrapper>
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-3">Login required to create reels</p>
            <Link href="/login" className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold">Login</Link>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) { toast.error('Select card type'); return; }
    setLoading(true);
    try {
      const data = { type, title, content, subject, topic, examType, difficulty, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], audioFile, duration: duration ? parseInt(duration) : 0 };

      if (type === 'question') Object.assign(data, { questionText, options, correctAnswerIndex, explanation, shortcutTrick });
      if (type === 'fact') Object.assign(data, { highlightText, keyPoints: keyPoints.filter(Boolean) });
      if (type === 'tip') Object.assign(data, { formula, steps: steps.filter(Boolean) });
      if (type === 'poll') Object.assign(data, { pollQuestion, pollOptions: pollOptions.filter(o => o.text) });

      const res = await API.createReel(data);
      if (res?.success) { toast.success(res.message || 'Submitted!'); router.push('/reels'); }
      else toast.error(res?.message || 'Failed');
    } catch (err) { toast.error('Error'); }
    finally { setLoading(false); }
  };

  return (
    <MobileAppWrapper>
      <div className="min-h-screen">
        <div className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center gap-3 max-w-2xl mx-auto">
            <Link href="/reels" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </Link>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" /> Create Reel
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-0 sm:p-6">
          {!type ? (
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Choose Card Type</p>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                {TYPES.map(t => (
                  <motion.button key={t.value} whileTap={{ scale: 0.97 }} onClick={() => setType(t.value)}
                    className={`p-5 rounded-2xl border-2 text-left transition-all ${t.color}`}>
                    <t.icon className="w-8 h-8 mb-3 opacity-70" />
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">{t.label}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{t.desc}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-primary-500 text-white uppercase tracking-widest">{type === 'current_affairs' ? 'CA' : type}</span>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">New Reel</p>
                </div>
                <button type="button" onClick={() => setType('')} className="text-[10px] font-black text-primary-600 hover:text-primary-700 uppercase tracking-widest bg-primary-50 dark:bg-primary-950/30 px-3 py-1 rounded-lg">Change Type</button>
              </div>

              {/* Common */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>Exam</label>
                    <select value={examType} onChange={e => { setExamType(e.target.value); setSubject(''); setTopic(''); }} className={inputClass}>
                      <option value="">Select Exam</option>
                      {examsList.map(ex => <option key={ex._id} value={ex.name}>{ex.name}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Subject</label>
                    <select value={subject} onChange={e => { setSubject(e.target.value); setTopic(''); }} className={inputClass}>
                      <option value="">Select Subject</option>
                      {subjectsList.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Topic</label>
                    <select value={topic} onChange={e => setTopic(e.target.value)} className={inputClass}>
                      <option value="">Select Topic</option>
                      {topicsList.filter(t => !subject || t.subject?.name === subject).map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Difficulty</label>
                    <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
                      <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                    </select>
                  </div>
                </div>
                <div><label className={labelClass}>Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" className={inputClass} /></div>
              </div>

              {/* Question */}
              {type === 'question' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-4 space-y-3">
                  <div><label className={labelClass}>Question *</label><textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} className={inputClass} required /></div>
                  <div className="space-y-2">
                    {options.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => setCorrectAnswerIndex(i)}
                          className={`w-7 h-7 rounded-full border-2 text-xs font-bold flex items-center justify-center ${correctAnswerIndex === i ? 'border-green-500 bg-green-500 text-white' : 'border-slate-300 text-slate-400'}`}>
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input value={o} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={`Option ${String.fromCharCode(65 + i)}`} className={`flex-1 ${inputClass}`} required />
                      </div>
                    ))}
                  </div>
                  <div><label className={labelClass}>Explanation</label><textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} className={inputClass} /></div>
                  <div><label className={labelClass}>Trick</label><input value={shortcutTrick} onChange={e => setShortcutTrick(e.target.value)} className={inputClass} /></div>
                </div>
              )}

              {/* Fact */}
              {type === 'fact' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-4 space-y-3">
                  <div><label className={labelClass}>Highlight Text</label><input value={highlightText} onChange={e => setHighlightText(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Content</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Key Points</label>
                    {keyPoints.map((kp, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input value={kp} onChange={e => { const n = [...keyPoints]; n[i] = e.target.value; setKeyPoints(n); }} className={`flex-1 ${inputClass}`} />
                        {keyPoints.length > 1 && <button type="button" onClick={() => setKeyPoints(keyPoints.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setKeyPoints([...keyPoints, ''])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              )}

              {/* Tip */}
              {type === 'tip' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 space-y-3">
                  <div><label className={labelClass}>Formula</label><input value={formula} onChange={e => setFormula(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>Content</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>Steps</label>
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-slate-400 w-10">Step {i + 1}</span>
                        <input value={s} onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }} className={`flex-1 ${inputClass}`} />
                        {steps.length > 1 && <button type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setSteps([...steps, ''])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                  </div>
                </div>
              )}

              {/* Poll */}
              {type === 'poll' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-800 p-4 space-y-3">
                  <div><label className={labelClass}>Poll Question *</label><input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className={inputClass} required /></div>
                  <div>
                    {pollOptions.map((o, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input value={o.text} onChange={e => { const n = [...pollOptions]; n[i] = { text: e.target.value }; setPollOptions(n); }} placeholder={`Option ${i + 1}`} className={`flex-1 ${inputClass}`} required={i < 2} />
                        {pollOptions.length > 2 && <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-400" /></button>}
                      </div>
                    ))}
                    {pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions([...pollOptions, { text: '' }])} className="text-xs text-blue-600 flex items-center gap-1"><Plus className="w-3 h-3" /> Add option</button>}
                  </div>
                </div>
              )}

              {/* CA */}
              {type === 'current_affairs' && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-4 space-y-3">
                  <div><label className={labelClass}>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required /></div>
                  <div><label className={labelClass}>Content *</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className={inputClass} required /></div>
                </div>
              )}

              {/* Audio & Duration — Instagram Style */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-pink-200 dark:border-pink-800/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Music className="w-4 h-4 text-pink-500" /> Add Audio
                  </h3>
                  {audioFile && (
                    <button type="button" onClick={() => { setAudioFile(''); if (audioPreviewRef.current) { audioPreviewRef.current.pause(); audioPreviewRef.current = null; } setAudioPlaying(null); }}
                      className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Remove</button>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input value={audioSearch} onChange={e => setAudioSearch(e.target.value)} placeholder="Search audio..." className={`${inputClass} pl-9`} />
                </div>

                {/* Audio List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {filteredAudios.map(a => (
                    <div key={a.value}
                      onClick={() => handleAudioSelect(a.value)}
                      className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${audioFile === a.value
                        ? 'bg-pink-50 dark:bg-pink-950/30 border border-pink-300 dark:border-pink-700'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                    >
                      {/* Play/Pause */}
                      <button type="button" onClick={e => { e.stopPropagation(); handleAudioPlayPause(a.value); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${audioPlaying === a.value
                          ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                        {audioPlaying === a.value ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${audioFile === a.value ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-white'}`}>{a.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-slate-400 truncate">{a.artist}</p>
                          {a.audioDuration && (
                            <span className="text-[10px] font-medium text-slate-400 tabular-nums">{formatAudioDuration(a.audioDuration)}</span>
                          )}
                        </div>
                      </div>
                      {/* Selected check */}
                      {audioFile === a.value && (
                        <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredAudios.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-3">No audio found</p>
                  )}
                </div>

                {/* Mute toggle (when playing) */}
                {audioPlaying && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Now Playing</span>
                    </div>
                    <button type="button" onClick={toggleAudioMute} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                      {audioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-pink-500" />}
                    </button>
                  </div>
                )}

                {/* Duration */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className={labelClass}>Duration (seconds)</label>
                  <div className="relative">
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 15" min="5" max="120" className={inputClass} />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Reel will auto-scroll after this time (5-120 sec)</p>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">{loading ? 'Submitting...' : 'Submit Reel'}</Button>
            </form>
          )}
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default ReelCreate;
