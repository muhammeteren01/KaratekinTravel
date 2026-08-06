import React from 'react';
import './NewVehicleDefinition.css';

// Reuses the seat layout preview from NewVehicleDefinition without the header
const VehicleSeatPreview = () => {
  return (
    <div className="nvd-vehicle-preview">
      <div className="nvd-vehicle-layout">
        <div className="nvd-vehicle-left">
          <div className="nvd-driver-section">
            <div className="nvd-control-item nvd-door">Kapı</div>
            <div className="nvd-control-item nvd-space">Boşluk</div>
          </div>
          <div className="nvd-steering-wheel">
            <svg width="62" height="64" viewBox="0 0 62 64" fill="none">
              <circle cx="31" cy="32" r="29" stroke="#FFFFFF" strokeWidth="2"/>
              <circle cx="31" cy="32" r="25" stroke="#FFFFFF" strokeWidth="2"/>
              <path d="M50 45L31 32L12 45" stroke="#FFFFFF" strokeWidth="2"/>
              <path d="M31 7L31 32" stroke="#FFFFFF" strokeWidth="2"/>
              <path d="M50 19L31 32" stroke="#FFFFFF" strokeWidth="2"/>
              <circle cx="31" cy="32" r="3" stroke="#FFFFFF" strokeWidth="2"/>
            </svg>
          </div>
        </div>

        <div className="nvd-seating-area">
          <div className="nvd-seat-row">
            <div className="nvd-seat nvd-seat-filled">Koltuk</div>
            <div className="nvd-seat nvd-seat-filled">Koltuk</div>
            <div className="nvd-seat nvd-corridor">Koridor</div>
            <div className="nvd-seat nvd-space">Boşluk</div>
            <div className="nvd-seat nvd-seat-filled">Koltuk</div>
          </div>
          <div className="nvd-seat-row">
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-corridor">Koridor</div>
            <div className="nvd-seat nvd-space">Boşluk</div>
            <div className="nvd-seat nvd-seat-filled">Koltuk</div>
          </div>
          <div className="nvd-seat-row">
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
          </div>
          <div className="nvd-seat-row">
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
            <div className="nvd-seat nvd-seat-empty">Sürükle</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSeatPreview;
