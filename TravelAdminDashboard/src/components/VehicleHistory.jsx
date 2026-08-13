import React, { useState, useEffect, useMemo } from 'react';
import './VehicleHistory.css';
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

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import arrowLineDownIcon from '../assets/icons/arrow-line-down.svg';
import magnifyingGlassIcon from '../assets/icons/magnifying-glass-search.svg';
import calendarIcon from '../assets/icons/calendar-icon.svg';
import arrowBackIcon from '../assets/icons/arrow-back-left.svg';
import arrowForwardIcon from '../assets/icons/arrow-forward-right.svg';
import { fetchMeApi, fetchVehicleOperationsApi, fetchVehiclesApi } from '../services/adminApi';
import { useFeedback } from './feedback/feedbackContext';

const MONTHS_TR = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

/** "21 Oca, 14.30" (tablo) veya "17/05/2025" (kart) biçimi. */
function formatOperationDate(value, variant = 'long') {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n) => String(n).padStart(2, '0');
  if (variant === 'short') {
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]}, ${pad(d.getHours())}.${pad(d.getMinutes())}`;
}

// Özel Tarih Seçici Bileşeni
const DatePicker = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return null;
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // value prop'u değiştiğinde selectedDate'i güncelle
  useEffect(() => {
    if (value) {
      // Timezone sorununu önlemek için local tarih oluştur
      const [year, month, day] = value.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setSelectedDate(localDate);
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const weekdays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const formatDate = (date) => {
    if (!date) return '';
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return date.toLocaleDateString('tr-TR', options);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Pazartesi = 0

    const days = [];

    // Önceki ayın günleri
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Bu ayın günleri
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString()
      });
    }

    // Sonraki ayın günleri (42 güne tamamla)
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      // Timezone sorununu çözmek için local tarih kullan
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange(formattedDate);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    if (value) {
      const [year, month, day] = value.split('-');
      const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      setSelectedDate(localDate);
    } else {
      setSelectedDate(null);
    }
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <>
      {isOpen && <div className="vh-calendar-overlay" onClick={() => setIsOpen(false)} />}
      <div className={`vh-date-picker ${isOpen ? 'active' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        <img src={calendarIcon} alt="Takvim" />
        <span className={`vh-date-display ${!value ? 'placeholder' : ''}`}>
          {value && selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        
        {isOpen && (
          <div className="vh-calendar-popup" onClick={(e) => e.stopPropagation()}>
            <div className="vh-calendar-header">
              <button className="vh-calendar-nav" onClick={(e) => {
                e.stopPropagation();
                navigateMonth(-1);
              }}>
                <svg viewBox="0 0 24 24">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <span className="vh-calendar-title">
                {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button className="vh-calendar-nav" onClick={(e) => {
                e.stopPropagation();
                navigateMonth(1);
              }}>
                <svg viewBox="0 0 24 24">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>
            
            <div className="vh-calendar-weekdays">
              {weekdays.map(day => (
                <div key={day} className="vh-calendar-weekday">{day}</div>
              ))}
            </div>
            
            <div className="vh-calendar-days">
              {days.map((day, index) => (
                <button
                  key={index}
                  className={`vh-calendar-day ${
                    !day.isCurrentMonth ? 'other-month' : ''
                  } ${
                    day.isToday ? 'today' : ''
                  } ${
                    selectedDate && day.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDateSelect(day.date);
                  }}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
            
            <div className="vh-calendar-actions">
              <button className="vh-calendar-btn cancel" onClick={(e) => {
                e.stopPropagation();
                handleCancel();
              }}>
                İptal
              </button>
              <button className="vh-calendar-btn confirm" onClick={(e) => {
                e.stopPropagation();
                handleConfirm();
              }}>
                Seç
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const VehicleHistory = () => {
  const { notify } = useFeedback();
  // API verisi
  const [operations, setOperations] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State yönetimi
  const [selectedPeriod, setSelectedPeriod] = useState('Yıllık');
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [operationCurrentPage, setOperationCurrentPage] = useState(1);
  // Bu ekranda filtre/sıralama arayüzü hiç bağlanmadı: aşağıdaki değerleri
  // değiştiren bir kontrol yok, bu yüzden state yerine sabit tutuluyorlar.
  // Filtre UI'ı eklenirken tekrar useState'e çevrilmeli.
  const sortBy = 'date';
  const sortOrder = 'desc';
  const filters = {
    startDate: '',
    endDate: '',
    driverName: '',
    plateNumber: '',
    operationType: ''
  };

  // Sayfa başına kayıt sayısı
  const ITEMS_PER_PAGE = 4;
  const OPERATIONS_PER_PAGE = 9;

  // Dönem seçenekleri
  const periodOptions = ['Günlük', 'Haftalık', 'Aylık', 'Yıllık'];

  // Veriyi API'den yükle: araçlar durum kartları için, işlemler geçmiş tablosu için.
  useEffect(() => {
    let alive = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');

        const me = await fetchMeApi();
        const companyId = me?.companyId || null;

        const [vehicleList, operationList] = await Promise.all([
          fetchVehiclesApi(companyId),
          fetchVehicleOperationsApi({ companyId }),
        ]);

        if (!alive) return;
        setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
        setOperations(Array.isArray(operationList) ? operationList : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Araç işlem geçmişi yüklenemedi.');
        setVehicles([]);
        setOperations([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();

    return () => {
      alive = false;
    };
  }, []);

  // Araç kayıtlarını durum kartı biçimine çevir. Renkler status alanından geliyor.
  const vehicleStatusData = useMemo(() => {
    const styleByStatus = {
      maintenance: { status: 'Bakımda', statusColor: '#FFBB38', bgColor: '#FFF5D9', iconType: 'maintenance' },
      'on-trip': { status: 'Seferde', statusColor: '#FF3939', bgColor: '#FFE7E7', iconType: 'trip' },
      active: { status: 'Müsait', statusColor: '#16DBCC', bgColor: '#DCFAF8', iconType: 'available' },
    };

    return vehicles.map((vehicle) => {
      const style = styleByStatus[vehicle.status] || styleByStatus.active;
      const lastOperation = operations.find((op) => String(op.vehicleId) === String(vehicle.id));

      return {
        plate: vehicle.plate,
        updateDate: formatOperationDate(lastOperation?.occurredAt || vehicle.createdAt, 'short'),
        ...style,
      };
    });
  }, [vehicles, operations]);

  // Tablo satırları: API alan adlarını ekranın beklediği isimlere eşle.
  const operationRows = useMemo(
    () =>
      operations.map((op) => ({
        id: op.id,
        driverName: op.driverName || '—',
        date: formatOperationDate(op.occurredAt),
        operationType: op.operationType,
        plate: op.plate || '—',
      })),
    [operations],
  );

  // Filtrelenmiş araç durumu verisi
  const getFilteredVehicleData = () => {
    let filtered = [...vehicleStatusData];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(vehicle => 
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Filtrelenmiş ve sıralanmış işlem geçmişi verisi
  const getFilteredOperationData = () => {
    let filtered = [...operationRows];

    // Filtreleme
    if (filters.driverName) {
      filtered = filtered.filter(op => 
        op.driverName.toLowerCase().includes(filters.driverName.toLowerCase())
      );
    }

    if (filters.plateNumber) {
      filtered = filtered.filter(op => 
        op.plate.toLowerCase().includes(filters.plateNumber.toLowerCase())
      );
    }

    if (filters.operationType) {
      filtered = filtered.filter(op => 
        op.operationType.toLowerCase() === filters.operationType.toLowerCase()
      );
    }

    // Tarih filtreleme
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(op => {
        // Tarihi parse et (örnek: "21 Oca, 14.30" -> Date)
        const opDateStr = op.date;
        
        // Basit tarih karşılaştırması için string manipulation
        if (filters.startDate) {
          const startDate = new Date(filters.startDate);
          const startDay = startDate.getDate();
          const startMonth = startDate.getMonth();
          
          // Ay isimlerini çevir
          const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                             'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
          const startMonthName = monthNames[startMonth];
          
          // Eğer seçilen tarih işlem tarihinden sonraysa filtrele
          if (!opDateStr.includes(startMonthName) || 
              parseInt(opDateStr.split(' ')[0]) < startDay) {
            return false;
          }
        }
        
        if (filters.endDate) {
          const endDate = new Date(filters.endDate);
          const endDay = endDate.getDate();
          const endMonth = endDate.getMonth();
          
          const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 
                             'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
          const endMonthName = monthNames[endMonth];
          
          // Eğer seçilen tarih işlem tarihinden önceyse filtrele
          if (!opDateStr.includes(endMonthName) || 
              parseInt(opDateStr.split(' ')[0]) > endDay) {
            return false;
          }
        }
        
        return true;
      });
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'driver':
          aValue = a.driverName;
          bValue = b.driverName;
          break;
        case 'plate':
          aValue = a.plate;
          bValue = b.plate;
          break;
        case 'operation':
          aValue = a.operationType;
          bValue = b.operationType;
          break;
        case 'date':
        default:
          aValue = a.date;
          bValue = b.date;
          break;
      }

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

    return filtered;
  };

  // Sayfalama hesaplamaları
  const filteredVehicleData = getFilteredVehicleData();
  const totalVehiclePages = Math.ceil(filteredVehicleData.length / ITEMS_PER_PAGE);
  const paginatedVehicleData = filteredVehicleData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const filteredOperationData = getFilteredOperationData();
  const totalOperationPages = Math.ceil(filteredOperationData.length / OPERATIONS_PER_PAGE);
  const paginatedOperationData = filteredOperationData.slice(
    (operationCurrentPage - 1) * OPERATIONS_PER_PAGE,
    operationCurrentPage * OPERATIONS_PER_PAGE
  );

  // Event handler'lar
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setIsPeriodDropdownOpen(false);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Arama sonrası ilk sayfaya dön
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalVehiclePages) {
      setCurrentPage(page);
    }
  };

  const handleOperationPageChange = (page) => {
    if (page >= 1 && page <= totalOperationPages) {
      setOperationCurrentPage(page);
    }
  };

  const downloadDocument = (operation) => {
    // Gerçek uygulamada dosya indirme işlemi yapılır
    notify(`${operation.driverName} - ${operation.operationType} belgesi indiriliyor...`, 'error');
  };

  // Sayfa numaralarını oluştur
  const generatePageNumbers = (currentPage, totalPages) => {
    const pages = [];
    const maxVisible = 4;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, 3, 4);
      } else if (currentPage >= totalPages - 1) {
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(currentPage - 1, currentPage, currentPage + 1, currentPage + 2);
      }
    }
    
    return pages;
  };

  const vehiclePageNumbers = generatePageNumbers(currentPage, totalVehiclePages);
  const operationPageNumbers = generatePageNumbers(operationCurrentPage, totalOperationPages);

  // Chart data
  const chartData = {
    labels: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Çalışma Süresi',
        data: [300, 225, 350, 400, 250, 325, 375],
        backgroundColor: '#24BAEC',
        borderRadius: 30,
        barThickness: 15,
        maxBarThickness: 15,
      },
      {
        label: 'Yatış Süresi',
        data: [150, 125, 200, 175, 225, 125, 250],
        backgroundColor: '#FF7029',
        borderRadius: 30,
        barThickness: 15,
        maxBarThickness: 15,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
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
            size: 13,
            weight: 400,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 500,
        grid: {
          color: '#F3F3F5',
          drawBorder: false,
        },
        border: {
          display: false,
        },
        ticks: {
          stepSize: 100,
          color: '#718EBF',
          font: {
            family: 'Inter',
            size: 13,
            weight: 400,
          },
          callback: function(value) {
            return value;
          },
        },
        position: 'left',
      },
    },
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 20,
        bottom: 0,
      },
    },
    elements: {
      bar: {
        borderSkipped: false,
      },
    },
  };

  return (
    <div className="vh-container">
      {/* Üst Kartlar Container */}
      <div className="vh-top-cards">
        {/* Sol Kart - Araç Çalışma Geçmişi */}
        <div className="vh-work-history-card">
          <div className="vh-work-header">
            <div className="vh-work-title-row">
              <h2>Araç Çalışma Geçmişi</h2>
              <div className="vh-work-controls">
                <div className="vh-period-dropdown">
                  <button 
                    className="vh-period-btn"
                    onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                  >
                    <span>{selectedPeriod}</span>
                    <img src={arrowLineDownIcon} alt="dropdown" />
                  </button>
                  {isPeriodDropdownOpen && (
                    <div className="vh-period-options">
                      {periodOptions.map(option => (
                        <button
                          key={option}
                          className={`vh-period-option ${selectedPeriod === option ? 'active' : ''}`}
                          onClick={() => handlePeriodChange(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="vh-search-container">
                  <img src={magnifyingGlassIcon} alt="search" className="vh-search-icon" />
                  <input 
                    type="text" 
                    placeholder="Plaka Arayın"
                    className="vh-search-input"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
            
            {/* Grafik Alanı */}
            <div className="vh-chart-container">
              <div className="vh-chart-wrapper">
                <Bar data={chartData} options={chartOptions} />
              </div>
              
              {/* Grafik Açıklaması - Alt Kısımda */}
              <div className="vh-chart-legend">
                <div className="vh-legend-item">
                  <div className="vh-legend-color" style={{backgroundColor: '#24BAEC'}}></div>
                  <span>Çalışma Süresi</span>
                </div>
                <div className="vh-legend-item">
                  <div className="vh-legend-color" style={{backgroundColor: '#FF7029'}}></div>
                  <span>Yatış Süresi</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Kart - Araç Durumu */}
        <div className="vh-status-card">
          <div className="vh-status-header">
            <h2>Araç Durumu</h2>
          </div>
          
          <div className="vh-status-list">
            {loading && <div className="vh-empty">Araçlar yükleniyor...</div>}
            {!loading && error && <div className="vh-empty vh-empty-error">{error}</div>}
            {!loading && !error && !paginatedVehicleData.length && (
              <div className="vh-empty">Kayıtlı araç bulunmuyor.</div>
            )}
            {paginatedVehicleData.map((vehicle, index) => (
              <div key={index} className="vh-status-item">
                <div className="vh-status-icon-container">
                  <div 
                    className="vh-status-icon"
                    style={{
                      backgroundColor: vehicle.bgColor,
                      color: vehicle.statusColor
                    }}
                  >
                    {vehicle.iconType === 'maintenance' && '🔧'}
                    {vehicle.iconType === 'trip' && '🚌'}
                    {vehicle.iconType === 'available' && '✓'}
                  </div>
                </div>
                <div className="vh-status-info">
                  <div className="vh-status-main">
                    <span className="vh-plate">{vehicle.plate}</span>
                    <span className="vh-status" style={{color: vehicle.statusColor}}>
                      {vehicle.status}
                    </span>
                  </div>
                  <span className="vh-update-date">Güncelleme: {vehicle.updateDate}</span>
                </div>
              </div>
            ))}
            
            {/* Sayfalama */}
            <div className="vh-pagination">
              <button 
                className="vh-page-btn vh-prev-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <img src={arrowBackIcon} alt="previous" />
                <span>Geri</span>
              </button>
              <div className="vh-page-numbers">
                {vehiclePageNumbers.map(pageNum => (
                  <button 
                    key={pageNum}
                    className={`vh-page-number ${currentPage === pageNum ? 'vh-active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button 
                className="vh-page-btn vh-next-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalVehiclePages}
              >
                <span>İleri</span>
                <img src={arrowForwardIcon} alt="next" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Bölüm - Araç İşlem Geçmişi */}
      <div className="vh-operation-section">
        <div className="vh-operation-header">
          <div className="vh-operation-title">
            <h2>Araç İşlem Geçmişi</h2>
          </div>
        </div>
        
    {/* Tablo */}
    <div className="vh-table-container">
            <div className="vh-table-header">
      <span>ŞÖFÖR ADI</span>
      <span>ARAÇ PLAKASI</span>
      <span>İŞLEM TİPİ</span>
      <span>TARİH</span>
      <span>DÖKÜMAN</span>
            </div>
            
            <div className="vh-table-body">
              {loading && <div className="vh-empty">İşlem geçmişi yükleniyor...</div>}
              {!loading && error && <div className="vh-empty vh-empty-error">{error}</div>}
              {!loading && !error && !paginatedOperationData.length && (
                <div className="vh-empty">Henüz işlem kaydı yok.</div>
              )}
              {paginatedOperationData.map((operation, index) => (
                <div key={index} className="vh-table-row">
                  <span className="vh-driver-name">{operation.driverName}</span>
                  <span className="vh-plate-number">{operation.plate}</span>
                  <span className="vh-operation-type">{operation.operationType}</span>
                  <span className="vh-operation-date">{operation.date}</span>
                  <button 
                    className="vh-download-btn"
                    onClick={() => downloadDocument(operation)}
                  >
                    İndir
                  </button>
                </div>
              ))}
            </div>
    </div>
        
        {/* Alt Sayfalama */}
        <div className="vh-bottom-pagination">
          <button 
            className="vh-page-btn"
            onClick={() => handleOperationPageChange(operationCurrentPage - 1)}
            disabled={operationCurrentPage === 1}
          >
            <img src={arrowBackIcon} alt="previous" />
            <span>Önceki</span>
          </button>
          <div className="vh-page-numbers">
            {operationPageNumbers.map(pageNum => (
              <button 
                key={pageNum}
                className={`vh-page-number ${operationCurrentPage === pageNum ? 'vh-active' : ''}`}
                onClick={() => handleOperationPageChange(pageNum)}
              >
                {pageNum}
              </button>
            ))}
          </div>
          <button 
            className="vh-page-btn"
            onClick={() => handleOperationPageChange(operationCurrentPage + 1)}
            disabled={operationCurrentPage === totalOperationPages}
          >
            <span>Sonraki</span>
            <img src={arrowForwardIcon} alt="next" />
          </button>
        </div>
        
        {/* Sonuçları göster */}
        <div className="vh-results-info">
          <span>
            Toplam {filteredOperationData.length} kayıt bulundu. 
            Sayfa {operationCurrentPage} / {totalOperationPages}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VehicleHistory; 