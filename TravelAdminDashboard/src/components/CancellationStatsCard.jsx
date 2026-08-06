import React from 'react';
import './CancellationStatsCard.css';

const CancellationStatsCard = ({ 
  title, 
  value, 
  icon,
  isFirst = false,
  onClick,
  isActive = false
}) => {
  return (
    <div 
      className={`cancellation-stats-card-unique ${isFirst ? 'first-stats-card' : ''} ${isActive ? 'active-stats-card' : ''}`}
      onClick={onClick}
    >
      <div className="stats-card-icon-unique">
        <img src={icon} alt={title} />
      </div>
      <div className="stats-card-content-unique">
        <h3 className="stats-card-title-unique">{title}</h3>
        <div className="stats-card-badge-unique">
          <span className="stats-card-value-unique">{value}</span>
        </div>
      </div>
    </div>
  );
};

export default CancellationStatsCard; 