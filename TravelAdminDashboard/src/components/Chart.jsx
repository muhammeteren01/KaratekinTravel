import React, { useState, useEffect, useRef } from 'react';
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
import { Line } from 'react-chartjs-2';
import './Chart.css';
import dropdownArrow from '../assets/icons/dropdown-arrow.svg';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ title, data, color, height = 300 }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('Yıllık');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Generate dynamic title based on selected period
  const getDynamicTitle = () => {
    if (title === 'Aylık Gelir') {
      switch (selectedPeriod) {
        case 'Günlük':
          return 'Günlük Gelir';
        case 'Haftalık':
          return 'Haftalık Gelir';
        case 'Aylık':
          return 'Aylık Gelir';
        case 'Yıllık':
          return 'Yıllık Gelir';
        default:
          return title;
      }
    } else if (title === 'Profil Ziyaretleri') {
      switch (selectedPeriod) {
        case 'Günlük':
          return 'Günlük Profil Ziyaretleri';
        case 'Haftalık':
          return 'Haftalık Profil Ziyaretleri';
        case 'Aylık':
          return 'Aylık Profil Ziyaretleri';
        case 'Yıllık':
          return 'Yıllık Profil Ziyaretleri';
        default:
          return title;
      }
    }
    return title;
  };

  const periodOptions = [
    { value: 'Günlük', label: 'Günlük' },
    { value: 'Haftalık', label: 'Haftalık' },
    { value: 'Aylık', label: 'Aylık' },
    { value: 'Yıllık', label: 'Yıllık' }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Generate different data based on selected period
  const getDataForPeriod = () => {
    const isProfileVisits = title === 'Profil Ziyaretleri';
    
    switch (selectedPeriod) {
      case 'Günlük':
        return isProfileVisits ? [
          { month: 'Pzt', value: 180 },
          { month: 'Sal', value: 220 },
          { month: 'Çar', value: 195 },
          { month: 'Per', value: 240 },
          { month: 'Cum', value: 280 },
          { month: 'Cmt', value: 320 },
          { month: 'Paz', value: 250 }
        ] : [
          { month: 'Pzt', value: 15000 },
          { month: 'Sal', value: 18000 },
          { month: 'Çar', value: 22000 },
          { month: 'Per', value: 19000 },
          { month: 'Cum', value: 25000 },
          { month: 'Cmt', value: 28000 },
          { month: 'Paz', value: 24000 }
        ];
      case 'Haftalık':
        return isProfileVisits ? [
          { month: 'Hafta 1', value: 1200 },
          { month: 'Hafta 2', value: 1500 },
          { month: 'Hafta 3', value: 1350 },
          { month: 'Hafta 4', value: 1800 }
        ] : [
          { month: 'Hafta 1', value: 45000 },
          { month: 'Hafta 2', value: 52000 },
          { month: 'Hafta 3', value: 48000 },
          { month: 'Hafta 4', value: 58000 }
        ];
      case 'Aylık':
        return data; // Use original monthly data
      case 'Yıllık':
        return isProfileVisits ? [
          { month: '2020', value: 18000 },
          { month: '2021', value: 22000 },
          { month: '2022', value: 28000 },
          { month: '2023', value: 32000 },
          { month: '2024', value: 38000 }
        ] : [
          { month: '2020', value: 180000 },
          { month: '2021', value: 220000 },
          { month: '2022', value: 280000 },
          { month: '2023', value: 320000 },
          { month: '2024', value: 380000 }
        ];
      default:
        return data;
    }
  };

  const currentData = getDataForPeriod();
  const dynamicTitle = getDynamicTitle();

  const chartData = {
    labels: currentData.map(item => item.month),
    datasets: [
      {
        label: dynamicTitle,
        data: currentData.map(item => item.value),
        borderColor: color,
        backgroundColor: color + '20', // Add transparency
        borderWidth: 3,
        pointBackgroundColor: color,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4, // Smooth curves
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#232323',
        bodyColor: '#232323',
        borderColor: '#f3f3f5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            // Profil ziyaretleri için para birimi kullanma
            if (title === 'Profil Ziyaretleri') {
              return `${dynamicTitle}: ${context.parsed.y.toLocaleString()}`;
            }
            return `${dynamicTitle}: ₺${context.parsed.y.toLocaleString()}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#718EBF',
          font: {
            family: 'Inter',
            size: 12,
          },
        },
      },
      y: {
        grid: {
          color: '#F3F3F5',
          borderDash: [0],
        },
        border: {
          display: false,
        },
        ticks: {
          color: '#718EBF',
          font: {
            family: 'Inter',
            size: 12,
          },
          callback: function(value) {
            // Profil ziyaretleri için para birimi kullanma
            if (title === 'Profil Ziyaretleri') {
              return (value / 1000) + 'k';
            }
            return '₺' + (value / 1000) + 'k';
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    elements: {
      point: {
        hoverBackgroundColor: color,
      },
    },
  };

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{dynamicTitle}</h3>
        <div className="chart-dropdown-container" ref={dropdownRef}>
          <div className="chart-dropdown" onClick={toggleDropdown}>
            <span>{selectedPeriod}</span>
            <img 
              src={dropdownArrow} 
              alt="Dropdown" 
              className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`} 
            />
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {periodOptions.map((option) => (
                <div
                  key={option.value}
                  className={`dropdown-item ${selectedPeriod === option.value ? 'active' : ''}`}
                  onClick={() => handlePeriodChange(option.value)}
                >
                  {option.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="chart-content">
        <Line data={chartData} options={options} height={height - 80} />
      </div>
    </div>
  );
};

export default Chart; 