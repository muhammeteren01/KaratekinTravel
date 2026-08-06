import React, { useCallback, useMemo, useState } from 'react';
import './TimeInput.css';

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

function parseTime(value) {
  const m = /^\s*(\d{1,2})(?::(\d{1,2}))?\s*$/.exec(value || '');
  if (!m) return null;
  let h = parseInt(m[1], 10);
  let min = parseInt(m[2] ?? '0', 10);
  if (isNaN(h) || isNaN(min)) return null;
  h = clamp(h, 0, 23);
  min = clamp(min, 0, 59);
  return { h, min };
}

function toStringTime(h, min) {
  const hh = String(h).padStart(2, '0');
  const mm = String(min).padStart(2, '0');
  return `${hh}:${mm}`;
}

const TimeInput = ({ value, onChange, className = '', borderless = false, step = 5 }) => {
  const [dirty, setDirty] = useState(false);
  const setTime = useCallback((h, min) => onChange && onChange(toStringTime(h, min)), [onChange]);

  const incMinutes = (delta) => {
    const parsed = parseTime(value) || { h: 0, min: 0 };
    let total = parsed.h * 60 + parsed.min + delta;
    if (total < 0) total = 24 * 60 + (total % (24 * 60));
    total = total % (24 * 60);
    const nh = Math.floor(total / 60);
    const nmin = total % 60;
    setTime(nh, nmin);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); incMinutes(step); }
    if (e.key === 'ArrowDown') { e.preventDefault(); incMinutes(-step); }
  };

  const handleBlur = (e) => {
    const parsed = parseTime(e.target.value);
    if (parsed) { setTime(parsed.h, parsed.min); setDirty(false); }
    else if (value) {
      // keep previous valid value
      onChange && onChange(value); setDirty(false);
    } else {
      onChange && onChange('00:00'); setDirty(false);
    }
  };

  const handleChange = (e) => {
    // allow free typing; commit on blur
    setDirty(true);
  // keep only digits, auto-insert colon HH:MM
  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
  let out = digits;
  if (digits.length > 2) out = `${digits.slice(0,2)}:${digits.slice(2)}`;
  onChange && onChange(out);
  };

  const invalid = useMemo(() => {
    if (!dirty) return false;
    const p = parseTime(value);
    return !p || value.length < 4;
  }, [dirty, value]);

  return (
    <div className={`ti-wrap ${borderless ? 'ti-borderless' : ''} ${invalid ? 'ti-invalid' : ''} ${className}`}>
      <button type="button" className="ti-btn" onClick={() => incMinutes(-step)} aria-label="Azalt">−</button>
      <input
        className="ti-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        inputMode="numeric"
        placeholder="00:00"
      />
      <button type="button" className="ti-btn" onClick={() => incMinutes(step)} aria-label="Arttır">+</button>
    </div>
  );
};

export default TimeInput;
