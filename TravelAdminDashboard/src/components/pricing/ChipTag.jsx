import React from 'react';
import '../pricing/PricingComponents.css';

/*
Props:
- text: string label
- onRemove?: () => void
- tone?: 'blue' | 'gray'  (visual theme, default 'blue')
- size?: 'sm' | 'md'      (default 'md')
*/
const ChipTag = ({ text, onRemove, tone = 'blue', size = 'md' }) => {
  const cls = `chip-tag ${tone} ${size}`;
  return (
    <span className={cls} title={text}>
      <span className="chip-text">{text}</span>
      {onRemove && (
        <button
          type="button"
          className="chip-remove"
          aria-label={`Kaldır: ${text}`}
          onClick={onRemove}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M3 3l6 6M9 3L3 9" stroke="#B91C1C" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </span>
  );
};

export default ChipTag;
