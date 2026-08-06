import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import './TripCategoryAnalysis.css';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Custom plugin to display text outside the pie slices
const dataLabelsPlugin = {
  id: 'dataLabels',
  afterDatasetsDraw(chart, args, options) {
    const { ctx } = chart;
    const meta = chart.getDatasetMeta(0);
    
    meta.data.forEach((element, index) => {
      const { x, y } = element.getCenterPoint();
      const dataset = chart.data.datasets[0];
      const data = dataset.data[index];
      
      // Calculate percentage for category chart or show actual value for participant chart
      let displayText;
      const total = dataset.data.reduce((a, b) => a + b, 0);
      
      if (chart.canvas.closest('.trip-category-analysis__chart-group').querySelector('.trip-category-analysis__chart-title').textContent === 'Kategori Seçimi') {
        const percentage = Math.round((data / total) * 100);
        displayText = `${percentage}%`;
      } else {
        displayText = data.toString();
      }
      
      // Calculate angle for positioning outside the chart
      const startAngle = element.startAngle;
      const endAngle = element.endAngle;
      const midAngle = (startAngle + endAngle) / 2;
      
      // Position text outside the chart
      const outerRadius = element.outerRadius;
      const textX = x + Math.cos(midAngle) * (outerRadius + 15);
      const textY = y + Math.sin(midAngle) * (outerRadius + 15);
      
      ctx.save();
      ctx.font = '600 11px Inter';
      ctx.fillStyle = '#343C6A';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      ctx.fillText(displayText, textX, textY);
      ctx.restore();
    });
  }
};

const CHART_COLORS = ['#7987FF', '#FFA5CB', '#F765A3', '#24BAEC', '#FF7029', '#B5B807'];

const TripCategoryAnalysis = ({ labels = ['Veri yok'], tripCounts = [1], participantCounts = [0] }) => {
  const categorySelectionData = {
    labels,
    datasets: [
      {
        data: tripCounts,
        backgroundColor: labels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
        borderWidth: 0,
        cutout: '0%',
      }
    ]
  };

  const participantData = {
    labels,
    datasets: [
      {
        data: participantCounts,
        backgroundColor: labels.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
        borderWidth: 0,
        cutout: '0%',
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // We'll create custom legend
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      },
      dataLabels: true
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  };

  // Chart options for participant chart (shows actual values)
  const participantChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        enabled: true,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            return `${label}: ${value}`;
          }
        }
      },
      dataLabels: true
    }
  };

  const renderLegend = () => (
    <div className="trip-category-analysis__legend">
      {labels.map((label, index) => (
        <div className="trip-category-analysis__legend-item" key={label}>
          <div 
            className="trip-category-analysis__legend-dot"
            style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
          ></div>
          <span className="trip-category-analysis__legend-label">{label}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="trip-category-analysis">
      <div className="trip-category-analysis__container">
        <div className="trip-category-analysis__header">
          <h2 className="trip-category-analysis__title">Tur Kategori Analizi</h2>
          <p className="trip-category-analysis__subtitle">
            Tercih edilen tur kategorisi analizini aşağıdaki gibidir.
          </p>
        </div>

        <div className="trip-category-analysis__content">
          <div className="trip-category-analysis__charts-row">
            <div className="trip-category-analysis__chart-group">
              <h3 className="trip-category-analysis__chart-title">Kategori Seçimi</h3>
              <div className="trip-category-analysis__chart-wrapper">
                <Doughnut 
                  data={categorySelectionData} 
                  options={chartOptions}
                  plugins={[dataLabelsPlugin]}
                />
              </div>
            </div>

            <div className="trip-category-analysis__chart-group">
              <h3 className="trip-category-analysis__chart-title">Katılımcı</h3>
              <div className="trip-category-analysis__chart-wrapper">
                <Doughnut 
                  data={participantData} 
                  options={participantChartOptions}
                  plugins={[dataLabelsPlugin]}
                />
              </div>
            </div>
          </div>

          {renderLegend()}
        </div>
      </div>
    </div>
  );
};

export default TripCategoryAnalysis; 