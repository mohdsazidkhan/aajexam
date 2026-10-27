'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search } from 'lucide-react';
import useTranslate from '../../../hooks/useTranslate';

// Drop-in replacement for a native <select>: same props (value, onChange(e), name, required, disabled,
// className, style, title, children as <option>/<optgroup>) and the same e.target.value in onChange,
// but the list is always searchable and styled like the state / city picker on Settings.
// The list is portalled to <body> and positioned from the trigger, so it is never clipped by a
// modal, table or overflow-hidden card.

const textOf = (node) => React.Children.toArray(node)
  .map((c) => (typeof c === 'string' || typeof c === 'number' ? String(c) : (c?.props?.children ? textOf(c.props.children) : '')))
  .join('');

const collect = (children, out, group = '') => {
  React.Children.forEach(children, (ch) => {
    if (!ch || typeof ch !== 'object') return;
    if (ch.type === 'option') {
      const label = textOf(ch.props.children);
      out.push({ value: String(ch.props.value ?? label), label, disabled: !!ch.props.disabled, group });
    } else if (ch.type === 'optgroup') {
      collect(ch.props.children, out, ch.props.label || '');
    } else if (ch.props?.children) {
      collect(ch.props.children, out, group);
    }
  });
  return out;
};

// Layout classes belong on the wrapper (so the control sits in its row/grid like the native select did);
// everything else styles the trigger itself.
const LAYOUT = /^(?:[a-z-]+:)*(?:w-|min-w-|max-w-|flex-|grow|shrink|basis-|col-|row-|self-|order-|-?m[trblxy]?-|hidden$|block$|inline|flex$)/;

const Select = ({
  value,
  defaultValue,
  onChange,
  children,
  className = '',
  style,
  disabled = false,
  required = false,
  name,
  id,
  title,
  placeholder,
  'aria-label': ariaLabel,
}) => {
  const { translate } = useTranslate();
  const [inner, setInner] = useState(defaultValue ?? '');
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState('');
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  const current = value !== undefined ? String(value ?? '') : String(inner ?? '');
  const options = useMemo(() => collect(children, []), [children]);
  const selected = options.find((o) => o.value === current);
  const q = term.trim().toLowerCase();
  const filtered = useMemo(() => (q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options), [options, q]);

  const place = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 180);
    const left = Math.min(Math.max(8, r.left), Math.max(8, window.innerWidth - width - 8));
    const below = window.innerHeight - r.bottom;
    const up = below < 260 && r.top > below;
    setPos({ left, width, ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }), maxHeight: Math.max(160, Math.min(320, (up ? r.top : below) - 12)) });
  }, []);

  const close = useCallback(() => { setOpen(false); setTerm(''); }, []);

  useEffect(() => {
    if (!open) return undefined;
    place();
    const onDown = (e) => {
      if (wrapRef.current?.contains(e.target) || listRef.current?.contains(e.target)) return;
      close();
    };
    const onScroll = (e) => { if (!listRef.current?.contains(e.target)) close(); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', close);
    };
  }, [open, place, close]);

  useEffect(() => { if (open) searchRef.current?.focus(); }, [open, pos]);
  useEffect(() => { setActive(0); }, [q, open]);

  const pick = (o) => {
    if (o.disabled) return;
    if (value === undefined) setInner(o.value);
    const target = { value: o.value, name, id };
    onChange?.({ target, currentTarget: target, preventDefault() {}, stopPropagation() {} });
    close();
    triggerRef.current?.focus();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); triggerRef.current?.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(filtered.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[active]) pick(filtered[active]); }
  };

  const tokens = String(className || '').split(/\s+/).filter(Boolean);
  const wrapCls = tokens.filter((t) => LAYOUT.test(t)).join(' ');
  const triggerCls = tokens.filter((t) => !LAYOUT.test(t) && !/^(?:[a-z-]+:)*appearance-none$/.test(t)).join(' ');
  const wide = /(^|\s)w-full(\s|$)/.test(wrapCls) || /(^|\s)flex-1(\s|$)/.test(wrapCls);

  const grouped = filtered.some((o) => o.group);
  let lastGroup = '';

  return (
    <div ref={wrapRef} className={`relative ${wide ? '' : 'inline-block align-middle'} min-w-0 ${wrapCls}`}>
      <button
        ref={triggerRef}
        type="button"
        id={id}
        title={title}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && (open ? close() : setOpen(true))}
        style={style}
        className={`flex w-full items-center justify-between gap-2 text-left ${triggerCls} ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className={`flex-1 min-w-0 truncate ${selected && selected.value !== '' ? '' : 'opacity-70'}`}>{selected ? selected.label : (placeholder || ' ')}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value={current}
          onChange={() => {}}
          className="absolute inset-x-0 bottom-0 h-px w-full opacity-0 pointer-events-none"
        />
      )}

      {open && pos && typeof document !== 'undefined' && createPortal(
        <div
          ref={listRef}
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }}
          className="z-[9999] flex flex-col bg-background-surface border border-border-primary rounded-xl overflow-hidden font-outfit"
        >
          <div className="relative shrink-0 border-b border-border-primary p-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={translate('Search...')}
              className="w-full pl-8 pr-2 py-1.5 bg-transparent outline-none text-sm font-medium text-content-primary placeholder:text-content-muted"
            />
          </div>
          <ul role="listbox" className="py-1 overflow-y-auto">
            {filtered.length > 0 ? filtered.map((o, i) => {
              const header = grouped && o.group && o.group !== lastGroup ? o.group : null;
              if (grouped) lastGroup = o.group;
              return (
                <React.Fragment key={`${o.value}-${i}`}>
                  {header && <li className="px-4 pt-2 pb-1 text-xs font-bold uppercase tracking-[0.08em] text-content-muted">{header}</li>}
                  <li
                    role="option"
                    aria-selected={o.value === current}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(o)}
                    className={`px-4 py-2.5 text-sm font-medium transition-colors ${o.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${o.value === current ? 'bg-background-surface-secondary text-primary-600' : 'text-content-primary'} ${i === active && !o.disabled && o.value !== current ? 'bg-background-surface-secondary' : ''}`}
                  >
                    {o.label || ' '}
                  </li>
                </React.Fragment>
              );
            }) : (
              <li className="p-4 text-center text-sm font-medium text-content-muted">{translate('No results found')}</li>
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Select;
