import React, { useMemo, useRef, useState, useEffect } from 'react';
import './ReviewAnalysisChart.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ReviewAnalysisChart = ({ reviews = [] }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selected, setSelected] = useState('Tüm Turlar');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Buckets roughly aligned to the design labels
  const labels = ['8.5+', '6.5-8.5', '4.5-6.5', '2.5-4.5', '0-2.5'];

  const data = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    // Map 1-5 stars to 0-2.5 .. 8.5+ buckets
    reviews.forEach((r) => {
      const s = r.rating || 0;
      if (s >= 4.5) counts[0] += 1; // 8.5+
      else if (s >= 3.5) counts[1] += 1; // 6.5-8.5
      else if (s >= 2.5) counts[2] += 1; // 4.5-6.5
      else if (s >= 1.5) counts[3] += 1; // 2.5-4.5
      else counts[4] += 1; // 0-2.5
    });
    return counts;
  }, [reviews]);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Yıldız Sayısı',
        data,
        backgroundColor: '#24BAEC',
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 38,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#ffffff',
        titleColor: '#232323',
        bodyColor: '#232323',
        borderColor: '#f3f3f5',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
      title: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#7D8FB3', font: { family: 'Inter', size: 14 } },
      },
      y: {
        title: { display: true, text: 'Yıldız Sayısı', color: '#3B4D71', font: { family: 'Inter', size: 16, weight: '600' } },
        grid: { color: '#EEF2F7' },
        border: { display: false },
        ticks: { color: '#7D8FB3', font: { family: 'Inter', size: 12 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <section className="ra-wrapper">
      <div className="ra-header">
        <h2>Tur Değerlendirme Analizleri</h2>
        <p>Turlarınız için yapılan değerlendirme analizlerini grafiklerden takip edebilirsiniz.</p>
      </div>
      <div className="ra-inner">
        <div className="ra-inner-top" ref={dropdownRef}>
          <div></div>
          <div className="ra-dropdown" onClick={() => setIsDropdownOpen((s) => !s)}>
            <span>{selected}</span>
            <img src="/icons/dropdown-arrow.svg" alt="Açılır" className={isDropdownOpen ? 'open' : ''} />
            {isDropdownOpen && (
              <div className="ra-menu">
                {['Tüm Turlar'].map((opt) => (
                  <div key={opt} className={`ra-item ${selected === opt ? 'active' : ''}`} onClick={() => { setSelected(opt); setIsDropdownOpen(false); }}>
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="ra-chart">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </section>
  );
};

export default ReviewAnalysisChart;
