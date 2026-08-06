import React from 'react';
import './ProgressSteps.css';

const ProgressSteps = ({ currentStep = 1, isCompleted = false, changedSteps = [], updateMode = false, updatedStep = null }) => {
  const steps = [
    { id: 1, title: 'Genel Bilgiler' },
    { id: 2, title: 'Rota Oluşturma' },
    { id: 3, title: 'Otel / Konaklama' },
    { id: 4, title: 'Fiyatlandırma' },
    { id: 5, title: 'Medya ve Ek Detaylar' },
    { id: 6, title: 'İptal / Değişim Politikası' },
    { id: 7, title: 'Gözden Geçir' }
  ];

  const getStepStatus = (stepId) => {
    // Update mode: all steps completed (green), currently updated step yellow
    if (updateMode) {
      return stepId === updatedStep ? 'changed' : 'completed';
    }
    if (isCompleted) return 'completed'; // Tüm form tamamlandıysa hepsi completed
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    if (changedSteps.includes(stepId)) return 'changed';
    return 'inactive';
  };

  const renderStepIndicator = (step) => {
    const status = getStepStatus(step.id);
    
  if (status === 'completed' || status === 'changed') {
      return (
    <div className={`step-indicator ${status}`}>
          <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
            <path d="M14.1667 4.25L6.33333 12.0833L2.83333 8.58333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      );
    }
    
    return (
      <div className={`step-indicator ${status}`}>
        {step.id}
      </div>
    );
  };

  return (
    <div className="progress-steps-vertical">
  <div className="steps-progress-line"></div>
      <div className="steps-container">
        {steps.map((step) => (
          <div key={step.id} className={`step-item ${getStepStatus(step.id)}`}>
            {renderStepIndicator(step)}
            <div className="step-content">
              <span className="step-label">{step.title}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressSteps; 