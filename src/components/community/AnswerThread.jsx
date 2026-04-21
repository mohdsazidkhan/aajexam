'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  ThumbsUp, ThumbsDown, CornerDownRight, Flag, Trash2, Shield, GraduationCap,
  CheckCircle2, Pin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API from '../../lib/api';
import { getCurrentUser } from '../../lib/utils/authUtils';

const timeAgo = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d`;
  return d.toLocaleDateString();
};

const RoleBadge = ({ role }) => {
  if (role === 'mentor') return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded">
      <GraduationCap className="w-2.5 h-2.5" /> MENTOR
    </span>
  );
  if (role === 'admin') return (
    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded">
      <Shield className="w-2.5 h-2.5" /> ADMIN
    </span>
  );
  return null;
};

function AnswerItem({
  item, onVote, onReply, onDelete, onFlag, onAccept,
  isReply = false, currentUserId, canAccept
}) {
  const [myVote, setMyVote] = useState(
    item.upvotedBy?.some(u => String(u) === String(currentUserId)) ? 'up'
    : item.downvotedBy?.some(u => String(u) === String(currentUserId)) ? 'down'
    : null
  );
  const [upvotes, setUpvotes] = useState(item.upvotes || 0);
  const [downvotes, setDownvotes] = useState(item.downvotes || 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleVote = async (action) => {
    if (!currentUserId) return toast.error('Please login');
    if (String(item.author?._id) === String(currentUserId)) return;
    const prev = { myVote, upvotes, downvotes };
    let nu = upvotes, nd = downvotes, nm = myVote;
    if (action === 'up') {
      if (myVote === 'up') { nu--; nm = null; }
      else { nu++; if (myVote === 'down') nd--; nm = 'up'; }
    } else {
      if (myVote === 'down') { nd--; nm = null; }
      else { nd++; if (myVote === 'up') nu--; nm = 'down'; }
    }
    setMyVote(nm); setUpvotes(nu); setDownvotes(nd);
    const res = await onVote(item._id, action);
    if (!res?.success) {
      setMyVote(prev.myVote); setUpvotes(prev.upvotes); setDownvotes(prev.downvotes);
      toast.error(res?.message || 'Vote failed');
    } else {
      setUpvotes(res.upvotes); setDownvotes(res.downvotes); setMyVote(res.myVote);
    }
  };

  const submitReply = async () => {
    if (replyText.trim().length < 2) return;
    const ok = await onReply({ body: replyText, parentId: item._id });
    if (ok) { setReplyText(''); setShowReplyBox(false); }
  };

  const isOwner = String(item.author?._id) === String(currentUserId);

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-slate-200 dark:border-slate-700' : item.isAcceptedAnswer ? 'border-2 border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10 rounded-xl p-3' : ''} py-3`}>
      {item.isAcceptedAnswer && !isReply && (
        <div className="mb-2 inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
          <CheckCircle2 className="w-3.5 h-3.5" /> Accepted Answer
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <button
            onClick={() => handleVote('up')}
            className={`p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition ${myVote === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}
          >
            <ThumbsUp className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{upvotes - downvotes}</span>
          <button
            onClick={() => handleVote('down')}
            className={`p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition ${myVote === 'down' ? 'text-red-600' : 'text-slate-400'}`}
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs mb-1">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
              {(item.author?.name || '?').charAt(0).toUpperCase()}
            </div>
            <span className="font-bold text-slate-800 dark:text-slate-200">{item.author?.name || 'User'}</span>
            {item.author?.username && (
              <Link href={`/u/${item.author.username}`} className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline">
                @{item.author.username}
              </Link>
            )}
            <RoleBadge role={item.authorRole} />
            {item.isPinned && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded">
                <Pin className="w-2.5 h-2.5" /> PINNED
              </span>
            )}
            <span className="text-slate-400">· {timeAgo(item.createdAt)}</span>
            {item.isEdited && <span className="text-slate-400 text-[10px]">(edited)</span>}
          </div>

          <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words leading-relaxed">
            {item.body}
          </p>
          {item.image && (
            <img src={item.image} alt="" className="mt-2 max-h-64 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-white" />
          )}

          <div className="mt-2 flex items-center gap-4 text-xs">
            {!isReply && (
              <button onClick={() => setShowReplyBox(v => !v)} className="flex items-center gap-1 text-slate-500 hover:text-primary-600 transition">
                <CornerDownRight className="w-3.5 h-3.5" /> Reply{item.replyCount ? ` (${item.replyCount})` : ''}
              </button>
            )}
            {canAccept && !isReply && (
              <button
                onClick={() => onAccept(item._id)}
                className={`flex items-center gap-1 transition ${item.isAcceptedAnswer ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-emerald-600'}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {item.isAcceptedAnswer ? 'Accepted' : 'Accept'}
              </button>
            )}
            {!isOwner && (
              <button onClick={() => onFlag(item._id)} className="text-slate-400 hover:text-red-500 transition">
                <Flag className="w-3.5 h-3.5" />
              </button>
            )}
            {isOwner && (
              <button onClick={() => onDelete(item._id)} className="text-slate-400 hover:text-red-500 transition">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {showReplyBox && (
            <div className="mt-2 flex gap-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submitReply()}
                placeholder="Write a reply…"
                className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button onClick={submitReply} className="px-3 py-1.5 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                Post
              </button>
            </div>
          )}

          {item.replies?.length > 0 && (
            <div className="mt-2">
              {item.replies.map(r => (
                <AnswerItem
                  key={r._id}
                  item={r}
                  onVote={onVote}
                  onReply={onReply}
                  onDelete={onDelete}
                  onFlag={onFlag}
                  onAccept={onAccept}
                  isReply
                  currentUserId={currentUserId}
                  canAccept={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AnswerThread({ questionId, questionAuthorId, onAnswerPosted }) {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('top');
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = typeof window !== 'undefined' ? getCurrentUser() : null;
  const currentUserId = user?.id || user?._id;
  const canAccept = currentUserId && String(currentUserId) === String(questionAuthorId);

  const load = useCallback(async (nextSort = sort) => {
    setLoading(true);
    try {
      const res = await API.getCommunityAnswers(questionId, { sort: nextSort, limit: 50 });
      if (res?.success) {
        setItems(res.answers || []);
        setTotal(res.pagination?.total || 0);
      }
    } finally { setLoading(false); }
  }, [questionId, sort]);

  useEffect(() => { load(); }, [load]);

  const handleVote = async (id, action) => API.voteCommunityAnswer(id, action);

  const handleReply = async ({ body, parentId }) => {
    if (!user) { toast.error('Please login to reply'); return false; }
    const res = await API.postCommunityAnswer(questionId, { body, parentId });
    if (res?.success) { await load(); return true; }
    toast.error(res?.message || 'Reply failed');
    return false;
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this answer?')) return;
    const res = await API.deleteCommunityAnswer(id);
    if (res?.success) { toast.success('Deleted'); await load(); }
    else toast.error(res?.message || 'Delete failed');
  };

  const handleFlag = async (id) => {
    const reason = prompt('Why are you reporting this? (optional)') || '';
    const res = await API.flagCommunityAnswer(id, reason);
    if (res?.success) toast.success('Reported');
    else toast.error(res?.message || 'Report failed');
  };

  const handleAccept = async (id) => {
    const res = await API.acceptCommunityAnswer(id);
    if (res?.success) { toast.success(res.accepted ? 'Marked as accepted' : 'Unaccepted'); await load(); }
    else toast.error(res?.message || 'Failed');
  };

  const submitNew = async () => {
    if (!user) return toast.error('Please login to answer');
    if (newAnswer.trim().length < 2) return;
    setSubmitting(true);
    try {
      const res = await API.postCommunityAnswer(questionId, { body: newAnswer });
      if (res?.success) {
        setNewAnswer('');
        await load();
        if (onAnswerPosted) onAnswerPosted();
      } else {
        toast.error(res?.message || 'Failed to post');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {total} {total === 1 ? 'Answer' : 'Answers'}
        </h3>
        {items.length > 0 && (
          <div className="flex gap-1.5 text-[10px] font-bold">
            {['top', 'new'].map(s => (
              <button
                key={s}
                onClick={() => { setSort(s); load(s); }}
                className={`px-2.5 py-1 rounded uppercase tracking-wider ${sort === s ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
              >
                {s === 'top' ? 'Top' : 'Newest'}
              </button>
            ))}
          </div>
        )}
      </div>

      {user ? (
        <div className="mb-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60">
          <textarea
            value={newAnswer}
            onChange={e => setNewAnswer(e.target.value)}
            placeholder="Write your answer…"
            rows={3}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          />
          <div className="mt-2 flex justify-end">
            <button
              disabled={submitting || newAnswer.trim().length < 2}
              onClick={submitNew}
              className="px-4 py-2 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              {submitting ? 'Posting…' : 'Post Answer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-center">
          <p className="text-sm text-slate-500">
            <Link href="/login" className="text-primary-600 font-bold hover:underline">Login</Link> to post an answer
          </p>
        </div>
      )}

      {loading && <p className="text-sm text-slate-400 py-3 text-center">Loading…</p>}
      {!loading && items.length === 0 && (
        <p className="text-sm text-slate-400 py-6 text-center">No answers yet. Be the first to help!</p>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
        {items.map(item => (
          <AnswerItem
            key={item._id}
            item={item}
            onVote={handleVote}
            onReply={handleReply}
            onDelete={handleDelete}
            onFlag={handleFlag}
            onAccept={handleAccept}
            currentUserId={currentUserId}
            canAccept={canAccept}
          />
        ))}
      </div>
    </div>
  );
}
