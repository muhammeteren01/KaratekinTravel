import React, { useState, useEffect } from 'react';
import './AddTourStep5.css';
import ProgressSteps from './ProgressSteps';

const AddTourStep5 = ({ onNext, onBack, formData, setFormData, updateMode = false, updatedStep = null }) => {
  const [policyText, setPolicyText] = useState(formData.cancellationPolicyText || '');

  useEffect(() => {
    // keep local state in sync if formData changes from outside (update mode)
    setPolicyText(formData.cancellationPolicyText || '');
  }, [formData.cancellationPolicyText]);

  const handleSaveAndContinue = () => {
    setFormData(prev => ({
      ...prev,
      cancellationPolicyText: policyText?.trim() || ''
    }));
    onNext();
  };

  return (
    <div className="step5-container">
      <div className="step5-content">
        {/* Progress Steps */}
        <div className="step5-progress-section">
          <ProgressSteps currentStep={6} updateMode={updateMode} updatedStep={updatedStep} />
        </div>

        {/* Main Content */}
        <div className="step5-main-content">
          <div className="step5-form-section">
            <h2 className="step5-section-title">İptal / Değişim Politikanızı Belirleyin</h2>
            <textarea
              className="step5-textarea"
              placeholder="İptal / Değişim Politikası"
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              rows={8}
            />
          </div>

          {/* Form Actions */}
          <div className="step5-form-actions">
            <button 
              type="button" 
              className="step5-back-button"
              onClick={onBack}
            >
              Geri
            </button>
            
            <button
              onClick={handleSaveAndContinue}
              className="step5-save-continue-btn"
              type="button"
            >
              Kaydet ve Devam Et
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTourStep5;