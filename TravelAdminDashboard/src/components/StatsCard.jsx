import React from 'react';
import './StatsCard.css';

const StatsCard = ({ title, value, icon, iconBgColor, iconColor }) => {
  return (
    <div className="stats-card">
      <div className="stats-content">
        <div className="stats-text">
          <h3 className="stats-title">{title}</h3>
          <p className="stats-value">{value}</p>
        </div>
        <div className="stats-icon-container" style={{ backgroundColor: iconBgColor }}>
          <img 
            src={icon} 
            alt={title} 
            className="stats-icon"
            style={{ filter: iconColor }}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 