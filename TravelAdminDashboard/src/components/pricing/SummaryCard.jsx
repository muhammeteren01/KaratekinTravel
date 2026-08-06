import React from 'react';
import '../pricing/PricingComponents.css';

const SummaryCard = ({ badge, badgeColor = 'orange', sections = [] }) => {
  return (
    <div className="summary-card">
      {badge && (
        <div className={`summary-badge ${badgeColor}`}>{badge}</div>
      )}
      <div className="summary-body">
        {sections.map((sec, idx) => (
          <div key={idx} className="summary-section">
            {sec.title && (
              <div className="summary-title">
                <span className="summary-title-icon">ℹ️</span>
                <span>{sec.title}</span>
              </div>
            )}
            {Array.isArray(sec.items) && sec.items.length > 0 && (
              <ol className="summary-list">
                {sec.items.map((it, i) => (
                  <li key={i}>{it}</li>
                ))}
              </ol>
            )}
            {sec.note && (
              <div className="summary-note {sec.noteColor || ''}">{sec.note}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummaryCard;
