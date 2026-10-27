'use client';

import Select from '../common/ui/Select';
import React, { useState, useEffect } from 'react';
import { m as motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Megaphone, Send, X as XIcon } from 'lucide-react';
import API from '../../lib/api';
import UserSearchPicker from './UserSearchPicker';
import { ANNOUNCE_CONDITIONS } from '../../lib/announceConditions';

const EMPTY_FORM = { title: '', description: '', target: 'all', condition: '' };
const GROUP_TARGETS = ['all', 'pro', 'free'];

// Shared "Announce" compose modal — used by both the Notifications page's
// quick-send button and the dedicated Announcements page, so the send logic
// (and its specific/selected-user picker) lives in one place.
const AnnounceModal = ({ isOpen, onClose, onSent, initialForm }) => {
  const [composeForm, setComposeForm] = useState(EMPTY_FORM);

  // Lets a caller (e.g. the Coupons page) open the modal with a prefilled message.
  useEffect(() => {
    if (isOpen && initialForm) setComposeForm({ ...EMPTY_FORM, ...initialForm });
  }, [isOpen, initialForm]);
  const [specificUser, setSpecificUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [sending, setSending] = useState(false);
  const [audienceCount, setAudienceCount] = useState(null);

  // Live preview: how many students the chosen group + profile condition reaches.
  useEffect(() => {
    if (!isOpen || !GROUP_TARGETS.includes(composeForm.target)) { setAudienceCount(null); return undefined; }
    let alive = true;
    setAudienceCount(null);
    const qs = new URLSearchParams({ target: composeForm.target, ...(composeForm.condition && { condition: composeForm.condition }) });
    API.request(`/api/admin/notifications/broadcast?${qs}`)
      .then((res) => { if (alive && res?.success) setAudienceCount(res.count); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isOpen, composeForm.target, composeForm.condition]);

  const handleClose = () => {
    if (sending) return;
    setComposeForm(EMPTY_FORM);
    setSpecificUser(null);
    setSelectedUsers([]);
    onClose();
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!composeForm.title.trim() || !composeForm.description.trim()) {
      toast.error('Title and message are required');
      return;
    }
    if (composeForm.target === 'specific' && !specificUser) {
      toast.error('Please select a user');
      return;
    }
    if (composeForm.target === 'selected' && selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    const isUserTarget = composeForm.target === 'specific' || composeForm.target === 'selected';
    const payload = {
      title: composeForm.title,
      description: composeForm.description,
      target: isUserTarget ? 'users' : composeForm.target,
      ...(!isUserTarget && composeForm.condition && { condition: composeForm.condition }),
      ...(isUserTarget && {
        userIds: composeForm.target === 'specific' ? [specificUser._id] : selectedUsers.map((u) => u._id)
      })
    };

    setSending(true);
    try {
      const res = await API.request('/api/admin/notifications/broadcast', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res?.success) {
        toast.success(`Sent to ${res.count ?? 0} user${res.count === 1 ? '' : 's'}`);
        setComposeForm(EMPTY_FORM);
        setSpecificUser(null);
        setSelectedUsers([]);
        onSent?.();
        onClose();
      } else {
        toast.error(res?.message || 'Failed to send');
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/60 z-[200] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-background-surface rounded-2xl xl:rounded-3xl border border-border-primary p-4 xl:p-5 relative"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg xl:text-2xl font-bold italic tracking-tight flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary-600" /> Announce
              </h3>
              <button aria-label="Close" onClick={handleClose} className="p-2 hover:bg-background-surface-secondary rounded-lg transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1.5">Send to</label>
                <Select
                  value={composeForm.target}
                  onChange={(e) => {
                    const target = e.target.value;
                    setComposeForm((f) => ({ ...f, target, condition: GROUP_TARGETS.includes(target) ? f.condition : '' }));
                    setSpecificUser(null);
                    setSelectedUsers([]);
                  }}
                  className="w-full px-3 py-2.5 border rounded-lg xl:rounded-xl text-sm font-bold bg-background-surface text-content-primary outline-none focus:border-primary-600 border-border-primary"
                >
                  <option value="all">All users</option>
                  <option value="pro">PRO subscribers only</option>
                  <option value="free">Free users only</option>
                  <option value="specific">Specific user</option>
                  <option value="selected">Selected users</option>
                </Select>
              </div>
              {GROUP_TARGETS.includes(composeForm.target) && (
                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1.5">Profile condition</label>
                  <Select
                    value={composeForm.condition}
                    onChange={(e) => setComposeForm((f) => ({ ...f, condition: e.target.value }))}
                    className="w-full px-3 py-2.5 border rounded-lg xl:rounded-xl text-sm font-bold bg-background-surface text-content-primary outline-none focus:border-primary-600 border-border-primary"
                  >
                    <option value="">No condition (everyone in this group)</option>
                    {ANNOUNCE_CONDITIONS.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </Select>
                  <p className="mt-1 text-[11px] font-bold text-primary-600">
                    {audienceCount === null ? 'Counting...' : `Will be sent to ${audienceCount} student${audienceCount === 1 ? '' : 's'}`}
                  </p>
                </div>
              )}
              {composeForm.target === 'specific' && (
                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1.5">User</label>
                  <UserSearchPicker value={specificUser} onChange={setSpecificUser} placeholder="Search by name or email..." />
                </div>
              )}
              {composeForm.target === 'selected' && (
                <div>
                  <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1.5">Users</label>
                  <UserSearchPicker multiple value={selectedUsers} onChange={setSelectedUsers} placeholder="Search by name or email..." />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1.5">Title</label>
                <input
                  type="text"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm((f) => ({ ...f, title: e.target.value }))}
                  maxLength={200}
                  placeholder="e.g. New PYQ papers added!"
                  className="w-full px-3 py-2.5 border rounded-lg xl:rounded-xl text-sm bg-background-surface text-content-primary outline-none focus:border-primary-600 border-border-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-content-muted uppercase tracking-[0.08em] mb-1.5">Message</label>
                <textarea
                  value={composeForm.description}
                  onChange={(e) => setComposeForm((f) => ({ ...f, description: e.target.value }))}
                  maxLength={5000}
                  rows={8}
                  placeholder="What do you want to tell them?"
                  className="w-full px-3 py-2.5 border rounded-lg xl:rounded-xl text-sm bg-background-surface text-content-primary outline-none focus:border-primary-600 border-border-primary"
                />
                <p className="mt-1 text-right text-[10px] font-bold text-content-muted tabular-nums">{composeForm.description.length}/5000</p>
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-on-primary rounded-lg xl:rounded-xl font-bold uppercase text-xs tracking-[0.08em] hover:brightness-110 transition-all disabled:opacity-50 bg-primary-600"
              >
                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Announcement'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnnounceModal;
