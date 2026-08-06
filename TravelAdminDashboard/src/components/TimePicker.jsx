import React, { useEffect, useMemo, useRef, useState } from 'react';

const pad = (n) => String(n).padStart(2, '0');
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function parseHHMM(v) {
  const m = /^(\d{1,2})(?::(\d{1,2}))?$/.exec(v || '');
  if (!m) return null;
  let h = clamp(parseInt(m[1], 10), 0, 23);
  let min = clamp(parseInt(m[2] || '0', 10), 0, 59);
  return { h, min };
}

function toHHMM(h, min) { return `${pad(h)}:${pad(min)}`; }

export default function TimePicker({ value, onChange, step = 10, className = '', placeholder = '00:00' }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const listRef = useRef(null);

  const options = useMemo(() => {
    const list = [];
    const inc = Math.max(1, step);
    for (let t = 0; t < 24 * 60; t += inc) {
      const h = Math.floor(t / 60);
      const m = t % 60;
      list.push(toHHMM(h, m));
    }
    return list;
  }, [step]);

  const selectedIndex = useMemo(() => options.indexOf(value || ''), [options, value]);

  useEffect(() => {
    if (open && listRef.current) {
      const el = listRef.current.querySelector('[data-active="true"]');
      if (el) {
        el.scrollIntoView({ block: 'center' });
      }
    }
  }, [open]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!btnRef.current) return;
      if (!btnRef.current.parentElement.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const commit = (val) => {
    if (onChange) onChange(val);
    setOpen(false);
  };

  const stepDelta = (delta) => {
    const parsed = parseHHMM(value || '00:00') || { h: 0, min: 0 };
    let total = parsed.h * 60 + parsed.min + delta * step;
    if (total < 0) total = 24 * 60 + (total % (24 * 60));
    total = total % (24 * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    commit(toHHMM(h, m));
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!open) setOpen(true); else stepDelta(1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); if (!open) setOpen(true); else stepDelta(-1); }
    if (e.key === 'Enter' && !open) { e.preventDefault(); setOpen(true); }
    if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div className={`tp-wrap ${className}`}>
      <button ref={btnRef} type="button" className="tp-display" onClick={() => setOpen((o) => !o)} onKeyDown={onKeyDown} aria-haspopup="listbox" aria-expanded={open}>
        <span className="tp-text">{value || placeholder}</span>
        <svg className="tp-caret" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
      {open && (
        <div className="tp-popover" role="listbox" ref={listRef}>
          {options.map((opt, i) => (
            <div
              role="option"
              key={opt}
              className={`tp-item ${i === selectedIndex ? 'active' : ''}`}
              data-active={i === selectedIndex}
              onClick={() => commit(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
