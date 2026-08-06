import React, { useEffect } from 'react';
import './SuccessNotification.css';

const SuccessNotification = ({ message, isVisible, onClose, autoClose = true, duration = 3000 }) => {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="success-notification">
      <div className="notification-content">
        <div className="notification-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#231F20" strokeWidth="1.5"/>
            <path d="M6.67 10L8.75 12.5L13.33 7.5" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="notification-text">{message}</span>
      </div>
      <button className="notification-close" onClick={onClose}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M6.67 6.67L13.33 13.33M13.33 6.67L6.67 13.33" stroke="#231F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
};

export default SuccessNotification; 