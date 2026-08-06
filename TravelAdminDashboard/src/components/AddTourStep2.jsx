import React, { useState, useRef, useEffect } from 'react';
import ProgressSteps from './ProgressSteps';
import OpenStreetMap from './OpenStreetMap';
import OpenStreetMapSearch from './OpenStreetMapSearch';
import './AddTourStep2.css';
import RouteStops from './RouteStops';
import TimeInput from './TimeInput';

const AddTourStep2 = ({ onNext, onBack, formData, setFormData, updateMode = false, updatedStep = null }) => {
  // Get current date for default values (always today or future)
  const getCurrentDate = () => {
    const today = new Date();
    const day = today.getDate();
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const month = months[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Check if a date string is in the past
  const isDateInPast = (dateString) => {
    const parts = dateString.split(' ');
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                         'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const month = monthNames.indexOf(parts[1]);
      const year = parseInt(parts[2]);
      
      const selectedDate = new Date(year, month, day);
      const today = new Date();
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      return selectedDate < todayDate;
    }
    return false;
  };

  // Step 2 (Rota Oluşturma) no longer manages dates per Figma
  
  // Calendar navigation state
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [addedStops, setAddedStops] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [pendingStop, setPendingStop] = useState(null);
  const [pendingTime, setPendingTime] = useState('');
  // No time selection in this step
  const [subPendingTimes, setSubPendingTimes] = useState({});

  // Date pickers removed in this step

  // Date selection removed

  const handleRemoveStop = (stopId) => {
    setAddedStops(prev => prev.filter(stop => stop.id !== stopId));
  };

  const handleLocationAdd = (location) => {
  // Hold as pending until user sets time and confirms
  setPendingStop(location);
  // don't auto-set time; user will type if needed
  };

  const handleLocationSelect = (location) => {
    setPendingStop(location);
  };

  const handleConfirmAdd = () => {
    if (!pendingStop) return;
    const time = pendingTime && /\d{1,2}:\d{2}/.test(pendingTime) ? pendingTime : undefined;
    setAddedStops(prev => [...prev, { ...pendingStop, ...(time ? { time } : {}) }]);
    setPendingStop(null);
    setPendingTime('');
  };

  const handleAddSubStop = (parentId) => {
    // Minimal implementation: add a dummy sub-stop; you can connect a real search later
    const time = subPendingTimes[parentId] || '10:30';
    setAddedStops(prev => prev.map(s => {
      if (s.id !== parentId) return s;
      const newSub = { id: Date.now(), name: 'Ara Durak', time };
      const subStops = Array.isArray(s.subStops) ? [...s.subStops, newSub] : [newSub];
      return { ...s, subStops };
    }));
  };

  const handleRemoveSubStop = (parentId, subId) => {
    setAddedStops(prev => prev.map(s => {
      if (s.id !== parentId) return s;
      const subStops = (s.subStops || []).filter(ss => (ss.id ?? ss) !== subId);
      return { ...s, subStops };
    }));
  };

  const handleSubmit = () => {
  const step2Data = { stops: addedStops };
    
    setFormData({ ...formData, ...step2Data });
    onNext();
  };

  // Calendar navigation functions
  const navigateCalendar = (direction) => {
    const newDate = new Date(calendarDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCalendarDate(newDate);
  };

  const formatDateString = (day, month, year) => {
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                   'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    return `${day} ${months[month]} ${year}`;
  };

  // Calendar rendering removed

  // Drag & Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(index);
  };

  const handleDragLeave = () => {
    setDragOverItem(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Swap the two items
    const newStops = [...addedStops];
    const temp = newStops[draggedItem];
    newStops[draggedItem] = newStops[dropIndex];
    newStops[dropIndex] = temp;
    
    setAddedStops(newStops);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Touch events for mobile
  const handleTouchStart = (e, index) => {
    setDraggedItem(index);
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const stopItem = elementBelow?.closest('.rs-card');
    
    if (stopItem) {
      const allStops = Array.from(document.querySelectorAll('.rs-card'));
      const overIndex = allStops.indexOf(stopItem);
      if (overIndex !== -1) {
        setDragOverItem(overIndex);
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (draggedItem !== null && dragOverItem !== null && draggedItem !== dragOverItem) {
      // Swap the two items
      const newStops = [...addedStops];
      const temp = newStops[draggedItem];
      newStops[draggedItem] = newStops[dragOverItem];
      newStops[dragOverItem] = temp;
      
      setAddedStops(newStops);
    }
    
    setDraggedItem(null);
    setDragOverItem(null);
  };

  return (
    <div className="add-tour-step2">
      <div className="step2-container">
        <div className="step2-layout">
          {/* Progress Steps - Vertical Layout */}
          <div className="progress-steps-container">
            <ProgressSteps currentStep={2} updateMode={updateMode} updatedStep={updatedStep} />
          </div>

          {/* Form Content */}
          <div className="form-content">
            <div className="form-section">

              {/* Route Creation */}
              <div className="form-group">
                <label className="form-label">Rota Oluşturma</label>
                <div className="route-container">
                  <OpenStreetMap 
                    onLocationAdd={handleLocationAdd}
                    addedStops={addedStops}
                    onStopRemove={handleRemoveStop}
                  />
                  
                    <div className="route-actions">
                    <div className="route-actions-row">
                      <div className="search-container">
                        <OpenStreetMapSearch onLocationSelect={handleLocationSelect} />
                        {pendingStop && (
                          <div className="selected-location-pill" title={pendingStop.name}>
                            <span className="sl-dot"/>
                            <span className="sl-text">{pendingStop.name}</span>
                            <button type="button" className="sl-clear" onClick={()=>setPendingStop(null)} aria-label="Seçimi temizle">×</button>
                          </div>
                        )}
                        <TimeInput value={pendingTime} onChange={setPendingTime} />
                      </div>
                    </div>
                    <div className="route-actions-footer">
                      <button className="add-location-btn" type="button" onClick={handleConfirmAdd} disabled={!pendingStop}>
                        Konumu Ekle
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Added Stops */}
        <div className="added-stops">
                <RouteStops
                  stops={addedStops}
                  onRemove={handleRemoveStop}
                  onMoveUp={(idx)=>{
                    if (idx===0) return;
                    const newStops=[...addedStops];
                    [newStops[idx-1], newStops[idx]]=[newStops[idx], newStops[idx-1]];
                    setAddedStops(newStops);
                  }}
                  onMoveDown={(idx)=>{
                    if (idx===addedStops.length-1) return;
                    const newStops=[...addedStops];
                    [newStops[idx], newStops[idx+1]]=[newStops[idx+1], newStops[idx]];
                    setAddedStops(newStops);
                  }}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
                  onAddSubStop={handleAddSubStop}
                  onRemoveSubStop={handleRemoveSubStop}
                  draggedIndex={draggedItem}
                  dragOverIndex={dragOverItem}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="step2-button-container">
              <button 
                type="button" 
                className="step2-back-button"
                onClick={onBack}
              >
                Geri
              </button>
              
              <button className="submit-btn" onClick={handleSubmit}>
                <span>Kaydet ve Devam Et</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTourStep2; 