import React from 'react';
import './StatCard.css';

// Import SVG icons
import cardTravelIcon from '../assets/icons/card-travel-outlined.svg';
import peopleAltIcon from '../assets/icons/people-alt-filled.svg';
import heartIcon from '../assets/icons/heart-outlined.svg';

const StatCard = ({ value, label, icon, bgColor, iconColor }) => {
  // Map icon names to the actual SVG imports
  const iconMap = {
    'card-travel': cardTravelIcon,
    'people-alt': peopleAltIcon,
    'heart': heartIcon
  };

  const iconSrc = iconMap[icon] || cardTravelIcon;

  return (
    <div className="stat-card">
      <div className="stat-card__container">
        <div className="stat-card__content">
          <div className="stat-card__text">
            <div className="stat-card__value">{value}</div>
            <div className="stat-card__label">{label}</div>
          </div>
          <div className="stat-card__icon-wrapper" style={{ backgroundColor: bgColor }}>
            <img 
              src={iconSrc} 
              alt={label} 
              className="stat-card__icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard; 