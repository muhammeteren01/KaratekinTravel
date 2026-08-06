import React, { useState } from 'react';
import './TagInput.css';

const TagInput = ({ 
  label, 
  placeholder = "Etiketler", 
  value = [], 
  onChange, 
  className = '',
  ...props 
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      const newTags = [...value, inputValue.trim()];
      onChange(newTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`tag-input ${className}`}>
      {label && (
        <label className="tag-input-label">
          {label}
        </label>
      )}
      
      <div className="tag-input-row">
        <input
          type="text"
          className="tag-input-field"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          {...props}
        />
        <button
          type="button"
          className="tag-add-button"
          onClick={handleAddTag}
          disabled={!inputValue.trim()}
        >
          Etiket Ekle
        </button>
      </div>

      {value.length > 0 && (
        <div className="added-tags-section">
          <div className="added-tags-header">
            <span className="added-tags-title">Eklenen Etiketler</span>
          </div>
          <div className="tags-container">
            {value.map((tag, index) => (
              <div key={index} className="tag-item">
                <span className="tag-text">{tag}</span>
                <button
                  type="button"
                  className="tag-remove-button"
                  onClick={() => handleRemoveTag(tag)}
                  aria-label={`Remove ${tag} tag`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.75 3.31L3.6 2.46L5 3.86L6.4 2.46L7.25 3.31L5.85 4.71L7.25 6.11L6.4 6.96L5 5.56L3.6 6.96L2.75 6.11L4.15 4.71L2.75 3.31Z" fill="#C50000"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagInput; 