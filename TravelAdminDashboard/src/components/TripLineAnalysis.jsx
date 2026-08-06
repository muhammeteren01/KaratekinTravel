import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import './TripLineAnalysis.css';
import searchIcon from '../assets/icons/search-outlined.svg';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TripLineAnalysis = ({ trips = [] }) => {
  const [searchValue, setSearchValue] = useState('');

  const filteredTrips = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return trips;
    return trips.filter((trip) => String(trip.title || '').toLowerCase().includes(query));
  }, [trips, searchValue]);

  const chartLabels = filteredTrips.length
    ? filteredTrips.map((trip) => (trip.title || 'Tur').slice(0, 12))
    : ['Veri yok'];

  const participantValues = filteredTrips.length
    ? filteredTrips.map((trip) => Number(trip.participants || 0))
    : [0];

  const ratingValues = filteredTrips.length
    ? filteredTrips.map((trip) => Number(trip.rating || 0))
    : [0];

  const maxParticipants = Math.max(...participantValues, 10);
  const maxRating = Math.max(...ratingValues, 5);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Katılımcı Sayısı',
        data: participantValues,
        borderColor: '#7987FF',
        backgroundColor: 'rgba(121, 135, 255, 0.1)',
        pointBackgroundColor: 'transparent',
        pointBorderColor: '#7987FF',
        pointBorderWidth: 1,
        pointRadius: 3.34,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Puan',
        data: ratingValues,
        borderColor: '#E697FF',
        backgroundColor: 'rgba(230, 151, 255, 0.1)',
        pointBackgroundColor: 'transparent',
        pointBorderColor: '#E697FF',
        pointBorderWidth: 1,
        pointRadius: 3.34,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#ccc',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: '#F1F1F1',
          drawBorder: false,
          lineWidth: 1,
          drawTicks: false,
        },
        ticks: {
          color: '#000000',
          font: {
            family: 'Inter',
            size: 10,
            weight: 400,
          },
          padding: 8,
        },
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        min: 0,
        max: maxParticipants,
        ticks: {
          color: '#000000',
          font: {
            family: 'Inter',
            size: 12,
            weight: 400,
          },
          padding: 8,
        },
        grid: {
          display: true,
          color: '#F1F1F1',
          drawBorder: false,
          lineWidth: 1,
          drawTicks: false,
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        min: 0,
        max: Math.max(maxRating, 5),
        ticks: {
          color: '#000000',
          font: {
            family: 'Inter',
            size: 12,
            weight: 400,
          },
          padding: 8,
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 6,
      },
    },
  };

  const renderLegend = () => (
    <div className="trip-line-analysis__legend">
      <div className="trip-line-analysis__legend-item">
        <div className="trip-line-analysis__legend-dot" style={{ backgroundColor: '#7987FF' }}></div>
        <span className="trip-line-analysis__legend-label">Katılımcı Sayısı</span>
      </div>
      <div className="trip-line-analysis__legend-item">
        <div className="trip-line-analysis__legend-dot" style={{ backgroundColor: '#E697FF' }}></div>
        <span className="trip-line-analysis__legend-label">Puan</span>
      </div>
    </div>
  );

  return (
    <div className="trip-line-analysis">
      <div className="trip-line-analysis__container">
        <div className="trip-line-analysis__header">
          <h2 className="trip-line-analysis__title">Tur Analizi</h2>
          <p className="trip-line-analysis__subtitle">
            Turlarınızın Katılımcı sayısı ve Puan durumu grafiği aşağıdaki gibidir.
          </p>
        </div>

        <div className="trip-line-analysis__search">
          <div className="trip-line-analysis__search-container">
            <img 
              src={searchIcon} 
              alt="Search" 
              className="trip-line-analysis__search-icon"
            />
            <input
              type="text"
              placeholder="Tur ID veya Tur Adına Göre Ara"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="trip-line-analysis__search-input"
            />
          </div>
        </div>

        <div className="trip-line-analysis__chart-section">
          <div className="trip-line-analysis__chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>
          {renderLegend()}
        </div>
      </div>
    </div>
  );
};

export default TripLineAnalysis;
