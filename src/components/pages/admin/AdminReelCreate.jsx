"use client";

import React, { useState } from "react";
import API from '../../../lib/api';
import { toast } from "react-toastify";
import Button from '../../ui/Button';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame, ArrowLeft, HelpCircle, BookOpen, Zap, Newspaper, BarChart3,
  Plus, Trash2, ChevronDown, Music, Clock, Play, Pause, Search, Volume2, VolumeX
} from 'lucide-react';

const TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'blue', desc: 'MCQ with explanation & tricks' },
  { value: 'fact', label: 'Fact', icon: BookOpen, color: 'purple', desc: 'Quick facts & one-liners' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, color: 'amber', desc: 'Shortcuts & formulas' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, color: 'red', desc: 'Daily CA with key points' },
  { value: 'poll', label: 'Poll', icon: BarChart3, color: 'green', desc: 'Community polls & opinions' },
];

const COLOR_MAP = {
  blue: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  purple: 'border-purple-500 bg-purple-50 dark:bg-purple-950/30',
  amber: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
  red: 'border-red-500 bg-red-50 dark:bg-red-950/30',
  green: 'border-green-500 bg-green-50 dark:bg-green-950/30',
};

const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-slate-400";
const labelClass = "block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5";

const AdminReelCreate = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('');

  // Common fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState('');

  // Question fields
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [explanation, setExplanation] = useState('');
  const [shortcutTrick, setShortcutTrick] = useState('');

  // Fact fields
  const [highlightText, setHighlightText] = useState('');
  const [keyPoints, setKeyPoints] = useState(['']);

  // Tip fields
  const [formula, setFormula] = useState('');
  const [steps, setSteps] = useState(['']);
  const [tryYourself, setTryYourself] = useState(['']);

  // CA fields
  const [caDate, setCaDate] = useState(new Date().toISOString().split('T')[0]);
  const [caCategory, setCaCategory] = useState('');
  const [tableData, setTableData] = useState([{ key: '', value: '' }]);
  const [keyTakeaway, setKeyTakeaway] = useState('');

  // Poll fields
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

  React.useEffect(() => {
    API.getReelAudioList().then(res => {
      if (res?.success) {
        const list = res.data.map(a => ({ ...a, audioDuration: null }));
        setAudioList(list);
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
    if (audioPlaying === file && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
      setAudioPlaying(null);
      return;
    }
    if (audioPreviewRef.current) { audioPreviewRef.current.pause(); audioPreviewRef.current = null; }
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
    if (audioPlaying !== file) handleAudioPlayPause(file);
  };

  const toggleAudioMute = () => {
    setAudioMuted(prev => {
      const next = !prev;
      if (audioPreviewRef.current) audioPreviewRef.current.volume = next ? 0 : 0.5;
      return next;
    });
  };

  React.useEffect(() => {
    return () => { if (audioPreviewRef.current) { audioPreviewRef.current.pause(); } };
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleArrayChange = (setter, arr, index, value) => {
    const newArr = [...arr];
    newArr[index] = value;
    setter(newArr);
  };

  const addArrayItem = (setter, arr) => setter([...arr, '']);
  const removeArrayItem = (setter, arr, index) => {
    if (arr.length <= 1) return;
    setter(arr.filter((_, i) => i !== index));
  };

  const handleTableChange = (index, field, value) => {
    const newData = [...tableData];
    newData[index][field] = value;
    setTableData(newData);
  };

  const handlePollOptionChange = (index, value) => {
    const newOptions = [...pollOptions];
    newOptions[index] = { text: value };
    setPollOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) { toast.error('Select a card type'); return; }

    setLoading(true);
    try {
      const data = {
        type, title, content, subject, topic, examType, difficulty,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        audioFile, duration: duration ? parseInt(duration) : 0
      };

      if (type === 'question') {
        Object.assign(data, { questionText, options, correctAnswerIndex, explanation, shortcutTrick });
      } else if (type === 'fact') {
        Object.assign(data, { highlightText, keyPoints: keyPoints.filter(Boolean) });
      } else if (type === 'tip') {
        Object.assign(data, { formula, steps: steps.filter(Boolean), tryYourself: tryYourself.filter(Boolean) });
      } else if (type === 'current_affairs') {
        Object.assign(data, {
          caDate, caCategory,
          tableData: tableData.filter(t => t.key && t.value),
          keyTakeaway
        });
      } else if (type === 'poll') {
        Object.assign(data, { pollQuestion, pollOptions: pollOptions.filter(o => o.text) });
      }

      const res = await API.createReel(data);
      if (res?.success) {
        toast.success(res.message || 'Reel created!');
        router.push('/admin/reels');
      } else {
        toast.error(res?.message || 'Failed to create reel');
      }
    } catch (err) {
      toast.error(err.message || 'Error creating reel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
        <main className="flex-1 transition-all duration-300">
          <div className="p-0 lg:p-6 max-w-full mx-auto mt-4 lg:mt-2">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => router.back()} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" /> Create Reel
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Create a new learning card</p>
              </div>
            </div>

            {/* Type Selection */}
            {!type ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {TYPES.map((t) => (
                  <motion.button
                    key={t.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setType(t.value)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all hover:shadow-lg ${COLOR_MAP[t.color]}`}
                  >
                    <t.icon className="w-8 h-8 mb-3 opacity-80" />
                    <h3 className="font-bold text-slate-900 dark:text-white">{t.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.desc}</p>
                  </motion.button>
                ))}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Type badge + change */}
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    type === 'question' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                    type === 'fact' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                    type === 'tip' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    type === 'current_affairs' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {type === 'current_affairs' ? 'Current Affairs' : type}
                  </span>
                  <button type="button" onClick={() => setType('')} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Change type</button>
                </div>

                {/* Common Fields */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white">Common Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Title</label>
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Card title" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Subject</label>
                      <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Quantitative, Reasoning, GK" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Topic</label>
                      <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Profit & Loss, Blood Relations" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Exam Type</label>
                      <input type="text" value={examType} onChange={e => setExamType(e.target.value)} placeholder="e.g. SSC, Banking, Railway" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Difficulty</label>
                      <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Tags (comma separated)</label>
                      <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. maths, shortcuts, rbi" className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Content / Description</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Additional content text..." rows={3} className={inputClass} />
                  </div>
                </div>

                {/* Type-specific fields */}
                {type === 'question' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-blue-200 dark:border-blue-800 p-5 space-y-4">
                    <h3 className="font-bold text-blue-700 dark:text-blue-400">Question Details</h3>
                    <div>
                      <label className={labelClass}>Question Text *</label>
                      <textarea value={questionText} onChange={e => setQuestionText(e.target.value)} placeholder="Type the question..." rows={3} className={inputClass} required />
                    </div>
                    <div className="space-y-3">
                      <label className={labelClass}>Options (4 required) *</label>
                      {options.map((opt, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setCorrectAnswerIndex(i)}
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${correctAnswerIndex === i
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 text-slate-400 hover:border-green-400'}`}
                          >
                            {String.fromCharCode(65 + i)}
                          </button>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(i, e.target.value)}
                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                            className={`flex-1 ${inputClass}`}
                            required
                          />
                        </div>
                      ))}
                      <p className="text-xs text-green-600 dark:text-green-400">Click letter to mark correct answer. Currently: {String.fromCharCode(65 + correctAnswerIndex)}</p>
                    </div>
                    <div>
                      <label className={labelClass}>Explanation</label>
                      <textarea value={explanation} onChange={e => setExplanation(e.target.value)} placeholder="Explain the answer..." rows={3} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Shortcut / Trick</label>
                      <textarea value={shortcutTrick} onChange={e => setShortcutTrick(e.target.value)} placeholder="Quick formula or trick..." rows={2} className={inputClass} />
                    </div>
                  </div>
                )}

                {type === 'fact' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-5 space-y-4">
                    <h3 className="font-bold text-purple-700 dark:text-purple-400">Fact Details</h3>
                    <div>
                      <label className={labelClass}>Highlight Text (big centered text)</label>
                      <input type="text" value={highlightText} onChange={e => setHighlightText(e.target.value)} placeholder="e.g. 5 August 2019" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Key Points</label>
                      {keyPoints.map((kp, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                          <input type="text" value={kp} onChange={e => handleArrayChange(setKeyPoints, keyPoints, i, e.target.value)} placeholder="Key point..." className={`flex-1 ${inputClass}`} />
                          <button type="button" onClick={() => removeArrayItem(setKeyPoints, keyPoints, i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem(setKeyPoints, keyPoints)} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add point</button>
                    </div>
                  </div>
                )}

                {type === 'tip' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 space-y-4">
                    <h3 className="font-bold text-amber-700 dark:text-amber-400">Trick / Shortcut Details</h3>
                    <div>
                      <label className={labelClass}>Formula</label>
                      <input type="text" value={formula} onChange={e => setFormula(e.target.value)} placeholder="e.g. CP × 1.25 = SP" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Steps</label>
                      {steps.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-400 w-14">Step {i + 1}</span>
                          <input type="text" value={s} onChange={e => handleArrayChange(setSteps, steps, i, e.target.value)} placeholder="Step description..." className={`flex-1 ${inputClass}`} />
                          <button type="button" onClick={() => removeArrayItem(setSteps, steps, i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem(setSteps, steps)} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add step</button>
                    </div>
                    <div>
                      <label className={labelClass}>Try Yourself Examples</label>
                      {tryYourself.map((t, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input type="text" value={t} onChange={e => handleArrayChange(setTryYourself, tryYourself, i, e.target.value)} placeholder="e.g. 45² = 2025" className={`flex-1 ${inputClass}`} />
                          <button type="button" onClick={() => removeArrayItem(setTryYourself, tryYourself, i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => addArrayItem(setTryYourself, tryYourself)} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add example</button>
                    </div>
                  </div>
                )}

                {type === 'current_affairs' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800 p-5 space-y-4">
                    <h3 className="font-bold text-red-700 dark:text-red-400">Current Affairs Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Date *</label>
                        <input type="date" value={caDate} onChange={e => setCaDate(e.target.value)} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>CA Category</label>
                        <select value={caCategory} onChange={e => setCaCategory(e.target.value)} className={inputClass}>
                          <option value="">Select category</option>
                          <option value="National">National</option>
                          <option value="International">International</option>
                          <option value="Economy">Economy</option>
                          <option value="Sports">Sports</option>
                          <option value="Science & Tech">Science & Tech</option>
                          <option value="Defence">Defence</option>
                          <option value="Awards">Awards</option>
                          <option value="Appointments">Appointments</option>
                          <option value="Schemes">Schemes</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Data Table (Key-Value pairs)</label>
                      {tableData.map((row, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input type="text" value={row.key} onChange={e => handleTableChange(i, 'key', e.target.value)} placeholder="Label (e.g. Repo Rate)" className={`flex-1 ${inputClass}`} />
                          <input type="text" value={row.value} onChange={e => handleTableChange(i, 'value', e.target.value)} placeholder="Value (e.g. 6.00%)" className={`flex-1 ${inputClass}`} />
                          <button type="button" onClick={() => { if (tableData.length > 1) setTableData(tableData.filter((_, j) => j !== i)); }} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                      <button type="button" onClick={() => setTableData([...tableData, { key: '', value: '' }])} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add row</button>
                    </div>
                    <div>
                      <label className={labelClass}>Key Takeaway</label>
                      <textarea value={keyTakeaway} onChange={e => setKeyTakeaway(e.target.value)} placeholder="One-line key takeaway..." rows={2} className={inputClass} />
                    </div>
                  </div>
                )}

                {type === 'poll' && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-green-200 dark:border-green-800 p-5 space-y-4">
                    <h3 className="font-bold text-green-700 dark:text-green-400">Poll Details</h3>
                    <div>
                      <label className={labelClass}>Poll Question *</label>
                      <input type="text" value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} placeholder="What do you want to ask?" className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Poll Options (min 2) *</label>
                      {pollOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold text-slate-400 w-5">{i + 1}.</span>
                          <input type="text" value={opt.text} onChange={e => handlePollOptionChange(i, e.target.value)} placeholder={`Option ${i + 1}`} className={`flex-1 ${inputClass}`} required={i < 2} />
                          {pollOptions.length > 2 && (
                            <button type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      ))}
                      {pollOptions.length < 6 && (
                        <button type="button" onClick={() => setPollOptions([...pollOptions, { text: '' }])} className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"><Plus className="w-3 h-3" /> Add option</button>
                      )}
                    </div>
                  </div>
                )}

                {/* Audio & Duration — Instagram Style */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-pink-200 dark:border-pink-800/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Music className="w-5 h-5 text-pink-500" /> Add Audio
                    </h3>
                    {audioFile && (
                      <button type="button" onClick={() => { setAudioFile(''); if (audioPreviewRef.current) { audioPreviewRef.current.pause(); audioPreviewRef.current = null; } setAudioPlaying(null); }}
                        className="text-xs font-bold text-red-500 hover:underline">Remove</button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input value={audioSearch} onChange={e => setAudioSearch(e.target.value)} placeholder="Search audio..." className={`${inputClass} pl-9`} />
                  </div>

                  {/* Audio List */}
                  <div className="space-y-2 max-h-56 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {filteredAudios.map(a => (
                      <div key={a.value}
                        onClick={() => handleAudioSelect(a.value)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${audioFile === a.value
                          ? 'bg-pink-50 dark:bg-pink-950/30 border border-pink-300 dark:border-pink-700'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'}`}
                      >
                        <button type="button" onClick={e => { e.stopPropagation(); handleAudioPlayPause(a.value); }}
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${audioPlaying === a.value
                            ? 'bg-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          {audioPlaying === a.value ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${audioFile === a.value ? 'text-pink-600 dark:text-pink-400' : 'text-slate-800 dark:text-white'}`}>{a.label}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-[11px] text-slate-400 truncate">{a.artist}</p>
                            {a.audioDuration && (
                              <span className="text-[10px] font-medium text-slate-400 tabular-nums">{formatAudioDuration(a.audioDuration)}</span>
                            )}
                          </div>
                        </div>
                        {audioFile === a.value && (
                          <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center shrink-0">
                            <span className="text-white text-[10px] font-bold">✓</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredAudios.length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No audio found</p>
                    )}
                  </div>

                  {/* Mute toggle */}
                  {audioPlaying && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Now Playing</span>
                      </div>
                      <button type="button" onClick={toggleAudioMute} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                        {audioMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-pink-500" />}
                      </button>
                    </div>
                  )}

                  {/* Duration */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <label className={labelClass}>Duration (seconds)</label>
                    <div className="relative">
                      <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 15" min="5" max="120" className={inputClass} />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Reel will auto-scroll after this time (5-120 sec)</p>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex items-center gap-3">
                  <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                    {loading ? 'Creating...' : 'Create & Publish Reel'}
                  </Button>
                  <button type="button" onClick={() => router.back()} className="px-6 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
  );
};

export default AdminReelCreate;
