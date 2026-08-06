import React from 'react';
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

const CouponBarChart = ({ title = 'Kupon Kullanımı', items = [], color = '#24BAEC', height = 260 }) => {
  const labels = items.map(i => i.code);
  const values = items.map(i => i.used || 0);

  const data = {
    labels,
    datasets: [
      {
        label: title,
        data: values,
        backgroundColor: color + '66',
        borderColor: color,
        borderWidth: 2,
        borderRadius: 8,
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
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#718EBF', font: { family: 'Inter', size: 12 } },
        border: { display: false },
      },
      y: {
        grid: { color: '#F3F3F5' },
        ticks: { color: '#718EBF', font: { family: 'Inter', size: 12 }, precision: 0 },
        border: { display: false },
      },
    },
  };

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default CouponBarChart;
