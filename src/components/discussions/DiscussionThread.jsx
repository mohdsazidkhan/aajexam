'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  MessageSquare, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown,
  Flag, Trash2, CornerDownRight, Shield, GraduationCap, Lightbulb, Pin
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

function CommentItem({ item, onVote, onReply, onDelete, onFlag, isReply = false, currentUserId }) {
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
    // optimistic
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
    if (ok) {
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  const isOwner = String(item.author?._id) === String(currentUserId);

  return (
    <div className={`${isReply ? 'ml-6 pl-3 border-l-2 border-slate-200 dark:border-slate-700' : ''} py-2`}>
      <div className="flex items-start gap-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
          {(item.author?.name || '?').charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-bold text-slate-800 dark:text-slate-200">{item.author?.name || 'User'}</span>
            {item.author?.username && (
              <a
                href={`/u/${item.author.username}`}
                className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:underline"
              >
                @{item.author.username}
              </a>
            )}
            <RoleBadge role={item.authorRole} />
            {item.isPinned && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded">
                <Pin className="w-2.5 h-2.5" /> PINNED
              </span>
            )}
            {item.isAlternateSolution && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded">
                <Lightbulb className="w-2.5 h-2.5" /> ALT SOLUTION
              </span>
            )}
            <span className="text-slate-400">· {timeAgo(item.createdAt)}</span>
            {item.isEdited && <span className="text-slate-400 text-[10px]">(edited)</span>}
          </div>

          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words">
            {item.body}
          </p>
          {item.image && (
            <img src={item.image} alt="" className="mt-2 max-h-48 rounded-lg border border-slate-200 dark:border-slate-700 object-contain bg-white" />
          )}

          <div className="mt-1.5 flex items-center gap-3 text-xs">
            <button
              onClick={() => handleVote('up')}
              className={`flex items-center gap-1 hover:text-emerald-600 transition ${myVote === 'up' ? 'text-emerald-600 font-bold' : 'text-slate-500'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" /> {upvotes}
            </button>
            <button
              onClick={() => handleVote('down')}
              className={`flex items-center gap-1 hover:text-red-600 transition ${myVote === 'down' ? 'text-red-600 font-bold' : 'text-slate-500'}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" /> {downvotes > 0 ? downvotes : ''}
            </button>
            {!isReply && (
              <button onClick={() => setShowReplyBox(v => !v)} className="flex items-center gap-1 text-slate-500 hover:text-primary-600 transition">
                <CornerDownRight className="w-3.5 h-3.5" /> Reply
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
            <div className="mt-1">
              {item.replies.map(r => (
                <CommentItem
                  key={r._id}
                  item={r}
                  onVote={onVote}
                  onReply={onReply}
                  onDelete={onDelete}
                  onFlag={onFlag}
                  isReply
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiscussionThread({ questionId, sourceType, sourceId, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState('top');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const user = typeof window !== 'undefined' ? getCurrentUser() : null;

  const load = useCallback(async (nextSort = sort) => {
    if (!questionId) return;
    setLoading(true);
    try {
      const res = await API.getDiscussions({ questionId, sort: nextSort, limit: 50 });
      if (res?.success) {
        setItems(res.discussions || []);
        setTotal(res.pagination?.total || 0);
      }
      setLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [questionId, sort]);

  useEffect(() => {
    if (open && !loaded) load();
  }, [open, loaded, load]);

  const handleVote = async (id, action) => {
    return await API.voteDiscussion(id, action);
  };

  const handleReply = async ({ body, parentId }) => {
    if (!user) { toast.error('Please login to reply'); return false; }
    const res = await API.createDiscussion({ questionId, body, sourceType, sourceId, parentId });
    if (res?.success) {
      await load();
      return true;
    }
    toast.error(res?.message || 'Reply failed');
    return false;
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this comment?')) return;
    const res = await API.deleteDiscussion(id);
    if (res?.success) {
      toast.success('Deleted');
      await load();
    } else toast.error(res?.message || 'Delete failed');
  };

  const handleFlag = async (id) => {
    const reason = prompt('Why are you reporting this? (optional)') || '';
    const res = await API.flagDiscussion(id, reason);
    if (res?.success) toast.success('Reported');
    else toast.error(res?.message || 'Report failed');
  };

  const submitNew = async () => {
    if (!user) return toast.error('Please login to comment');
    if (newComment.trim().length < 2) return;
    setSubmitting(true);
    try {
      const res = await API.createDiscussion({
        questionId, body: newComment, sourceType, sourceId
      });
      if (res?.success) {
        setNewComment('');
        await load();
      } else {
        toast.error(res?.message || 'Failed');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mt-3 border-t border-slate-200 dark:border-slate-700 pt-2">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 transition"
      >
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          Discussion {total > 0 && <span className="text-slate-400">({total})</span>}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-2">
          {user && (
            <div className="mb-3 flex gap-2">
              <input
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !submitting && submitNew()}
                placeholder="Share your approach, shortcut, or doubt…"
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                disabled={submitting || newComment.trim().length < 2}
                onClick={submitNew}
                className="px-4 py-2 text-xs font-bold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {submitting ? '...' : 'Post'}
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="flex gap-2 mb-2 text-[10px] font-bold">
              {['top', 'new'].map(s => (
                <button
                  key={s}
                  onClick={() => { setSort(s); load(s); }}
                  className={`px-2 py-0.5 rounded uppercase tracking-wider ${sort === s ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}
                >
                  {s === 'top' ? 'Top' : 'Newest'}
                </button>
              ))}
            </div>
          )}

          {loading && <p className="text-xs text-slate-400 py-2">Loading…</p>}
          {!loading && items.length === 0 && (
            <p className="text-xs text-slate-400 py-2">No discussions yet. Be the first to share a trick or ask a doubt.</p>
          )}

          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {items.map(item => (
              <CommentItem
                key={item._id}
                item={item}
                onVote={handleVote}
                onReply={handleReply}
                onDelete={handleDelete}
                onFlag={handleFlag}
                currentUserId={user?.id || user?._id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
