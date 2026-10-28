'use client';

import Select from '../../common/ui/Select';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from '@/components/common/AppLink';
import { m as motion } from 'framer-motion';
import API from '../../../lib/api';
import MobileAppWrapper from '../../common/MobileAppWrapper';
import Button from '../../common/ui/Button';
import PageHero from '../../common/ui/PageHero';
import { isAuthenticated } from '../../../lib/auth';
import {
  ArrowLeft, Flame, HelpCircle, BookOpen, Zap, Newspaper, BarChart3, Plus, Trash2,
  Music, Clock, Play, Pause, Search, Volume2, VolumeX
} from 'lucide-react';
import useTranslate from '../../../hooks/useTranslate';

const TYPES = [
  { value: 'question', label: 'Question', icon: HelpCircle, color: 'border-border-primary bg-background-surface hover:border-primary-500', desc: 'MCQ with explanation' },
  { value: 'fact', label: 'Fact', icon: BookOpen, color: 'border-border-primary bg-background-surface hover:border-primary-500', desc: 'Quick fact or one-liner' },
  { value: 'tip', label: 'Tip / Trick', icon: Zap, color: 'border-border-primary bg-background-surface hover:border-primary-500', desc: 'Shortcut or formula' },
  { value: 'current_affairs', label: 'Current Affairs', icon: Newspaper, color: 'border-border-primary bg-background-surface hover:border-primary-500', desc: 'Daily CA card' },
  { value: 'poll', label: 'Poll', icon: BarChart3, color: 'border-border-primary bg-background-surface hover:border-primary-500', desc: 'Community poll' },
];

const inputClass = "w-full px-4 py-2.5 rounded-lg xl:rounded-xl bg-background-surface border border-border-primary text-sm text-content-primary focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 outline-none placeholder:text-slate-400";
const labelClass = "block text-sm font-semibold text-content-secondary mb-1.5";

const ReelCreate = () => {
  const { translate } = useTranslate();
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
        <div className="min-h-screen flex items-center justify-center bg-background-page px-4">
          <div className="text-center">
            <p className="text-lg font-bold text-content-secondary mb-3">{translate('Login required to create reels')}</p>
            <Link href="/login"className="px-6 py-2.5 rounded-lg xl:rounded-xl text-on-primary text-sm font-bold uppercase bg-primary-600">{translate('Login')}</Link>
          </div>
        </div>
      </MobileAppWrapper>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!type) { toast.error(translate('Select card type')); return; }
    setLoading(true);
    try {
      const data = { type, title, content, subject, topic, examType, difficulty, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], audioFile, duration: duration ? parseInt(duration) : 0 };

      if (type === 'question') Object.assign(data, { questionText, options, correctAnswerIndex, explanation, shortcutTrick });
      if (type === 'fact') Object.assign(data, { highlightText, keyPoints: keyPoints.filter(Boolean) });
      if (type === 'tip') Object.assign(data, { formula, steps: steps.filter(Boolean) });
      if (type === 'poll') Object.assign(data, { pollQuestion, pollOptions: pollOptions.filter(o => o.text) });

      const res = await API.createReel(data);
      if (res?.success) { toast.success(res.message || translate('Submitted!')); router.push('/student/my-reels'); }
      else toast.error(res?.message || translate('Failed'));
    } catch (err) { toast.error(translate('Error')); }
    finally { setLoading(false); }
  };

  return (
    <MobileAppWrapper>
      <div className="min-h-screen pt-3 xl:pt-4">
        <PageHero icon={Flame} eyebrow="Create Reel" title="Create Reel" />

        <div className="py-3 xl:py-4">
          {!type ? (
            <div className="space-y-2 xl:space-y-4">
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                {TYPES.map(rt => (
                  <motion.button key={rt.value} onClick={() => setType(rt.value)}
                    style={{ borderRadius: 14 }} className={`relative overflow-hidden p-2.5 xl:p-5 border text-left hover:-translate-y-1 transition-all ${rt.color}`}>
                    <span className="w-11 h-11 mb-3 flex items-center justify-center text-primary-600 border border-border-primary" style={{ borderRadius: 12 }}><rt.icon className="w-6 h-6" /></span>
                    <h2 className="font-bold text-content-primary uppercase tracking-tight text-sm">{translate(rt.label)}</h2>
                    <p className="text-[10px] text-content-muted mt-1 font-medium">{translate(rt.desc)}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center justify-between bg-background-surface p-3 border border-border-primary" style={{ borderRadius: 14 }}>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 text-[10px] font-bold text-on-primary uppercase tracking-[0.08em] bg-primary-600" style={{ borderRadius: 999 }}>{type === 'current_affairs' ? 'CA' : type}</span>
                  <p className="text-xs font-bold text-content-muted uppercase">{translate('New Reel')}</p>
                </div>
                <button type="button" onClick={() => setType('')} className="text-[10px] font-bold text-primary-600 hover:text-primary-600 uppercase tracking-[0.08em] px-3 py-1 rounded-lg">{translate('Change Type')}</button>
              </div>

              {/* Common */}
              <div style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelClass}>{translate('Exam')}</label>
                    <Select value={examType} onChange={e => { setExamType(e.target.value); setSubject(''); setTopic(''); }} className={inputClass}>
                      <option value="">{translate('Select Exam')}</option>
                      {examsList.map(ex => <option key={ex._id} value={ex.name}>{ex.name}</option>)}
                    </Select>
                  </div>
                  <div><label className={labelClass}>{translate('Subject')}</label>
                    <Select value={subject} onChange={e => { setSubject(e.target.value); setTopic(''); }} className={inputClass}>
                      <option value="">{translate('Select Subject')}</option>
                      {subjectsList.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </Select>
                  </div>
                  <div><label className={labelClass}>{translate('Topic')}</label>
                    <Select value={topic} onChange={e => setTopic(e.target.value)} className={inputClass}>
                      <option value="">{translate('Select Topic')}</option>
                      {topicsList.filter(t => !subject || t.subject?.name === subject).map(t => <option key={t._id} value={t.name}>{t.name}</option>)}
                    </Select>
                  </div>
                  <div><label className={labelClass}>{translate('Difficulty')}</label>
                    <Select value={difficulty} onChange={e => setDifficulty(e.target.value)} className={inputClass}>
                      <option value="easy">{translate('Easy')}</option><option value="medium">{translate('Medium')}</option><option value="hard">{translate('Hard')}</option>
                    </Select>
                  </div>
                </div>
                <div><label className={labelClass}>{translate('Title')}</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder={translate('Card title')} className={inputClass} /></div>
              </div>

              {/* Question */}
              {type === 'question' && (
                <div style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                  <div><label className={labelClass}>{translate('Question *')}</label><textarea value={questionText} onChange={e => setQuestionText(e.target.value)} rows={3} className={inputClass} required /></div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
                    {options.map((o, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <button type="button" onClick={() => setCorrectAnswerIndex(i)}
                          className={`w-7 h-7 rounded-full border text-xs font-bold flex items-center justify-center ${correctAnswerIndex === i ? 'border-primary-400 text-on-primary bg-primary-600' : 'border-border-primary text-content-muted'}`}>
                          {String.fromCharCode(65 + i)}
                        </button>
                        <input value={o} onChange={e => { const n = [...options]; n[i] = e.target.value; setOptions(n); }} placeholder={translate('Option {letter}', { letter: String.fromCharCode(65 + i) })} className={`flex-1 ${inputClass}`} required />
                      </div>
                    ))}
                  </div>
                  <div><label className={labelClass}>{translate('Explanation')}</label><textarea value={explanation} onChange={e => setExplanation(e.target.value)} rows={2} className={inputClass} /></div>
                  <div><label className={labelClass}>{translate('Trick')}</label><input value={shortcutTrick} onChange={e => setShortcutTrick(e.target.value)} className={inputClass} /></div>
                </div>
              )}

              {/* Fact */}
              {type === 'fact' && (
                <div style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                  <div><label className={labelClass}>{translate('Highlight Text')}</label><input value={highlightText} onChange={e => setHighlightText(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>{translate('Content')}</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>{translate('Key Points')}</label>
                    {keyPoints.map((kp, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input value={kp} onChange={e => { const n = [...keyPoints]; n[i] = e.target.value; setKeyPoints(n); }} className={`flex-1 ${inputClass}`} />
                        {keyPoints.length > 1 && <button aria-label={translate('Delete')} type="button" onClick={() => setKeyPoints(keyPoints.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-content-primary" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setKeyPoints([...keyPoints, ''])} className="text-xs text-content-primary flex items-center gap-1"><Plus className="w-3 h-3" /> {translate('Add')}</button>
                  </div>
                </div>
              )}

              {/* Tip */}
              {type === 'tip' && (
                <div style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                  <div><label className={labelClass}>{translate('Formula')}</label><input value={formula} onChange={e => setFormula(e.target.value)} className={inputClass} /></div>
                  <div><label className={labelClass}>{translate('Content')}</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className={inputClass} /></div>
                  <div>
                    <label className={labelClass}>{translate('Steps')}</label>
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-content-muted w-10">{translate('Step {n}', { n: i + 1 })}</span>
                        <input value={s} onChange={e => { const n = [...steps]; n[i] = e.target.value; setSteps(n); }} className={`flex-1 ${inputClass}`} />
                        {steps.length > 1 && <button aria-label={translate('Delete')} type="button" onClick={() => setSteps(steps.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-content-primary" /></button>}
                      </div>
                    ))}
                    <button type="button" onClick={() => setSteps([...steps, ''])} className="text-xs text-content-primary flex items-center gap-1"><Plus className="w-3 h-3" /> {translate('Add')}</button>
                  </div>
                </div>
              )}

              {/* Poll */}
              {type === 'poll' && (
                <div style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                  <div><label className={labelClass}>{translate('Poll Question *')}</label><input value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className={inputClass} required /></div>
                  <div>
                    {pollOptions.map((o, i) => (
                      <div key={i} className="flex items-center gap-2 mb-2">
                        <input value={o.text} onChange={e => { const n = [...pollOptions]; n[i] = { text: e.target.value }; setPollOptions(n); }} placeholder={translate('Option {n}', { n: i + 1 })} className={`flex-1 ${inputClass}`} required={i < 2} />
                        {pollOptions.length > 2 && <button aria-label={translate('Delete')} type="button" onClick={() => setPollOptions(pollOptions.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-content-primary" /></button>}
                      </div>
                    ))}
                    {pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions([...pollOptions, { text: '' }])} className="text-xs text-content-primary flex items-center gap-1"><Plus className="w-3 h-3" /> {translate('Add option')}</button>}
                  </div>
                </div>
              )}

              {/* CA */}
              {type === 'current_affairs' && (
                <div style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                  <div><label className={labelClass}>{translate('Title *')}</label><input value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required /></div>
                  <div><label className={labelClass}>{translate('Content *')}</label><textarea value={content} onChange={e => setContent(e.target.value)} rows={4} className={inputClass} required /></div>
                </div>
              )}

              {/* Audio & Duration — Instagram Style */}
              <section style={{ borderRadius: 16 }} className="relative overflow-hidden bg-background-surface border border-border-primary p-4 space-y-3">
                <section className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-content-secondary flex items-center gap-2">
                    <Music className="w-4 h-4 text-content-primary" /> Add Audio
                  </h2>
                  {audioFile && (
                    <button type="button" onClick={() => { setAudioFile(''); if (audioPreviewRef.current) { audioPreviewRef.current.pause(); audioPreviewRef.current = null; } setAudioPlaying(null); }}
                      className="text-[10px] font-bold text-content-primary uppercase tracking-[0.08em]">{translate('Remove')}</button>
                  )}
                </section>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted" />
                  <input value={audioSearch} onChange={e => setAudioSearch(e.target.value)} placeholder={translate('Search audio...')} className={`${inputClass} pl-9`} />
                </div>

                {/* Audio List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  {filteredAudios.map(a => (
                    <div key={a.value}
                      onClick={() => handleAudioSelect(a.value)}
                      className={`flex items-center gap-3 p-2.5 rounded-lg xl:rounded-xl cursor-pointer transition-all ${audioFile === a.value
                        ? 'border border-primary-300 dark:border-white/30'
                        : 'hover:bg-background-surface-secondary border border-transparent'}`}
                    >
                      {/* Play/Pause */}
                      <button type="button" onClick={e => { e.stopPropagation(); handleAudioPlayPause(a.value); }}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${audioPlaying === a.value
                          ?'text-on-primary bg-primary-600':'bg-background-surface-secondary text-content-muted'}`}>
                        {audioPlaying === a.value ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${audioFile === a.value ? 'text-content-primary' : 'text-content-primary'}`}>{a.label}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[12px] text-content-muted truncate">{a.artist}</p>
                          {a.audioDuration && (
                            <span className="text-[10px] font-medium text-content-muted tabular-nums">{formatAudioDuration(a.audioDuration)}</span>
                          )}
                        </div>
                      </div>
                      {/* Selected check */}
                      {audioFile === a.value && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 bg-primary-600">
                          <span className="text-on-primary text-[10px] font-bold">✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredAudios.length === 0 && (
                    <p className="text-xs text-content-muted text-center py-3">{translate('No audio found')}</p>
                  )}
                </div>

                {/* Mute toggle (when playing) */}
                {audioPlaying && (
                  <div className="flex items-center justify-between pt-2 border-t border-border-primary">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse"/>
                      <span className="text-[11px] font-semibold text-content-muted">{translate('Now Playing')}</span>
                    </div>
                    <button type="button" onClick={toggleAudioMute} className="p-1.5 rounded-lg hover:bg-background-surface-secondary">
                      {audioMuted ? <VolumeX className="w-4 h-4 text-content-muted" /> : <Volume2 className="w-4 h-4 text-content-primary" />}
                    </button>
                  </div>
                )}

                {/* Duration */}
                <div className="pt-2 border-t border-border-primary">
                  <label className={labelClass}>{translate('Duration (seconds)')}</label>
                  <div className="relative">
                    <input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder={translate('e.g. 15')} min="5" max="120" className={inputClass} />
                    <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-content-muted pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-content-muted mt-1">{translate('Reel will auto-scroll after this time (5-120 sec)')}</p>
                </div>
              </section>

              <Button type="submit" disabled={loading} className="w-full">{loading ? translate('Submitting...') : translate('Submit Reel')}</Button>
            </form>
          )}
        </div>
      </div>
    </MobileAppWrapper>
  );
};

export default ReelCreate;
