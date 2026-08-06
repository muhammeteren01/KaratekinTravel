import React from 'react';
import './ProgressIndicator.css';

const ProgressIndicator = ({ steps, currentStep }) => {
  return (
    <div className="progress-indicator">
      <div className="progress-line"></div>
      <div className="progress-steps">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={index} className="progress-step">
              <div className="step-circle-container">
                <div className={`step-circle ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                  <span className="step-number">{stepNumber}</span>
                </div>
              </div>
              <div className="step-label">
                <span className="step-title">{step.title}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator; 