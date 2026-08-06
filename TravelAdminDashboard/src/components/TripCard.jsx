import React from 'react';
import './TripCard.css';

const TripCard = ({ title, trips }) => {
  return (
    <div className="trip-card">
      <h3 className="trip-card-title">{title}</h3>
      <div className="trips-list">
        {trips.map((trip, index) => (
          <div key={index} className="trip-item">
            <div className="trip-icon-container" style={{ backgroundColor: trip.iconBg }}>
              <img src={trip.icon} alt={trip.name} className="trip-icon" />
            </div>
            <div className="trip-details">
              <div className="trip-detail">
                <span className="trip-label">Gezi Adı</span>
                <span className="trip-value">{trip.name}</span>
              </div>
              <div className="trip-detail">
                <span className="trip-label">Toplam Ciro</span>
                <span className="trip-value">{trip.revenue}</span>
              </div>
              <div className="trip-detail">
                <span className="trip-label">Katılımcı Oranı</span>
                <span className="trip-value participation-rate">{trip.participation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TripCard; 