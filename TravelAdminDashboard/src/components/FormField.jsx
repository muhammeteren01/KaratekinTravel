import React from 'react';
import './FormField.css';

const FormField = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  options = [], 
  required = false,
  className = '',
  helperText = '',
  ...props 
}) => {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <textarea
            className="form-input form-textarea"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            {...props}
          />
        );
      case 'select':
        return (
          <div className="form-select-wrapper">
            <select
              className="form-input form-select"
              value={value}
              onChange={onChange}
              required={required}
              {...props}
            >
              <option value="" disabled>
                {placeholder}
              </option>
              {options.map((option, index) => (
                <option key={index} value={option.value || option}>
                  {option.label || option}
                </option>
              ))}
            </select>
            <div className="select-arrow">
              <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
                <path d="M1 1L7 6L13 1" stroke="#757D8A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        );
      default:
        return (
          <input
            type={type}
            className="form-input"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            {...props}
          />
        );
    }
  };

  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="required-asterisk">*</span>}
        </label>
      )}
      {renderInput()}
      {helperText && (
        <div className="form-helper-text">{helperText}</div>
      )}
    </div>
  );
};

export default FormField; 