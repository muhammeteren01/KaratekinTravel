import React from 'react';
import './TourCreationSuccess.css';
import ProgressSteps from './ProgressSteps';

const TourCreationSuccess = ({ onGoToTours }) => {
  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-progress-section">
          <ProgressSteps currentStep={6} isCompleted={true} />
        </div>
        
        <div className="success-main-content">
          <div className="success-icon">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
              <circle cx="28" cy="28" r="28" fill="#34C759"/>
              <path d="M16 28l8 8 16-16" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="success-text-section">
            <div className="success-title-group">
              <h1 className="success-title">Form Başarıyla Kaydedildi!</h1>
              <p className="success-description">
                Belirlediğiniz özelliklerde turunuz kaydedildi! Turlarınızı yönetmek ve düzenlemek için tıklayın.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourCreationSuccess; 