import React, { useState } from 'react';
import './FilterDropdown.css';
import arrowDownIcon from '../assets/icons/arrow-line-down.svg';

const FilterDropdown = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className="filter-dropdown">
      <div className="filter-dropdown__container">
        <button 
          className="filter-dropdown__trigger"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="filter-dropdown__value">{value}</span>
          <img 
            src={arrowDownIcon} 
            alt="Dropdown arrow" 
            className="filter-dropdown__arrow"
          />
        </button>
        
        {isOpen && (
          <div className="filter-dropdown__menu">
            {options.map((option) => (
              <button
                key={option}
                className={`filter-dropdown__option ${value === option ? 'filter-dropdown__option--selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterDropdown; 