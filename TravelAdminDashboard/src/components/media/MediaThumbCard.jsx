import React from 'react';
import './MediaComponents.css';

/*
Props:
- image: { id?: any, name: string, preview: string }
- onRemove?: () => void
- badge?: string (e.g., 'Kapak')
- size?: 'sm' | 'md' (default 'md')
- readOnly?: boolean (hide actions)
*/
const MediaThumbCard = ({ image, onRemove, badge, size = 'md', readOnly = false }) => {
  return (
    <div className={`media-card ${size}`} title={image?.name || ''}>
      <div className="media-thumb">
        {badge && <span className="media-badge">{badge}</span>}
        <img src={image?.preview} alt={image?.name || 'media'} />
        {!readOnly && onRemove && (
          <button type="button" className="media-del" aria-label={`Sil: ${image?.name || ''}`} onClick={onRemove}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" stroke="#B91C1C" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        )}
      </div>
      <div className="media-meta">
        <span className="media-name">{image?.name}</span>
      </div>
    </div>
  );
};

export default MediaThumbCard;
