import React, { useEffect, useMemo, useState } from 'react';
import './Finance.css';
import moneyBagIcon from '../assets/icons/money-bag.svg';
import keyboardReturnNewIcon from '../assets/icons/keyboard-return-new.svg';
import attachMoneyNewIcon from '../assets/icons/attach-money-new.svg';
import searchIcon from '../assets/icons/search-icon.svg';
import arrowDownIcon from '../assets/icons/arrow-down.svg';
import { fetchFinanceReportApi } from '../services/adminApi';
// removed unused download icon

const Finance = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterPeriod, setFilterPeriod] = useState('Aylık');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportError, setReportError] = useState('');
  const itemsPerPage = 10;

  // Filter options
  const filterOptions = ['Günlük', 'Haftalık', 'Aylık', 'Yıllık'];

  // Mock statistics data based on filter period
  const getStatisticsData = (period) => {
    const statisticsData = {
      'Günlük': {
        totalRevenue: '$5,200',
        refundAmount: '$320',
        netProfit: '$4,880'
      },
      'Haftalık': {
        totalRevenue: '$35,500',
        refundAmount: '$2,100',
        netProfit: '$33,400'
      },
      'Aylık': {
        totalRevenue: '$150,000',
        refundAmount: '$10,000',
        netProfit: '$140,000'
      },
      'Yıllık': {
        totalRevenue: '$1,800,000',
        refundAmount: '$120,000',
        netProfit: '$1,680,000'
      }
    };
    return statisticsData[period] || statisticsData['Aylık'];
  };

  useEffect(() => {
    let alive = true;

    const startPeriod = new Date();
    const endPeriod = new Date();

    if (filterPeriod === 'Günlük') {
      startPeriod.setDate(endPeriod.getDate() - 1);
    } else if (filterPeriod === 'Haftalık') {
      startPeriod.setDate(endPeriod.getDate() - 7);
    } else if (filterPeriod === 'Aylık') {
      startPeriod.setMonth(endPeriod.getMonth() - 1);
    } else {
      startPeriod.setFullYear(endPeriod.getFullYear() - 1);
    }

    const toIso = (date) => date.toISOString();

    const loadReport = async () => {
      try {
        setLoading(true);
        setReportError('');
        const result = await fetchFinanceReportApi(toIso(startPeriod), toIso(endPeriod));
        if (!alive) return;
        setReport(result);
      } catch (err) {
        if (!alive) return;
        setReportError(err instanceof Error ? err.message : 'Finans raporu yüklenemedi.');
        setReport(null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadReport();

    return () => {
      alive = false;
    };
  }, [filterPeriod]);

  const currentStats = useMemo(() => {
    if (!report) return getStatisticsData(filterPeriod);

    return {
      totalRevenue: `${Number(report.totalRevenue || 0).toLocaleString('tr-TR')} TL`,
      refundAmount: `${Number(report.refundAmount || 0).toLocaleString('tr-TR')} TL`,
      netProfit: `${Number(report.netProfit || 0).toLocaleString('tr-TR')} TL`,
    };
  }, [report, filterPeriod]);

  const completedTours = useMemo(() => {
    if (!report?.completedTripEarnings?.length) return [];
    return report.completedTripEarnings.map((item, index) => ({
      id: `${item.tourCode}-${index}`,
      tourCode: item.tourCode,
      tourName: item.tourName,
      tourDate: item.tourDate ? new Date(item.tourDate).toLocaleString('tr-TR') : '-',
      netEarning: `${Number(item.netEarning || 0).toLocaleString('tr-TR')} TL`,
    }));
  }, [report]);

  // Turkish character normalization for search
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c');
  };

  // Filter tours based on search term
  const filteredTours = completedTours.filter(tour => {
    const normalizedSearch = normalizeText(searchTerm);
    return normalizeText(tour.tourCode).includes(normalizedSearch) ||
           normalizeText(tour.tourName).includes(normalizedSearch) ||
           normalizeText(tour.tourDate).includes(normalizedSearch) ||
           normalizeText(tour.netEarning).includes(normalizedSearch);
  });

  // Calculate pagination
  const totalItems = filteredTours.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentTours = filteredTours.slice(startIndex, endIndex);

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Selection removed: no checkbox interactions

  // Pagination functions
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // removed details handler as buttons are removed

  // Handle filter dropdown
  const handleFilterToggle = () => {
    setIsFilterDropdownOpen(!isFilterDropdownOpen);
  };

  const handleFilterSelect = (option) => {
    setFilterPeriod(option);
    setIsFilterDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.finance-new-filter-dropdown-container')) {
      setIsFilterDropdownOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="finance-new-container">
      {reportError && <div className="table-error">{reportError}</div>}
      {/* Statistics Section */}
      <div className="finance-new-stats-section">
        {/* Filter Header */}
        <div className="finance-new-header">
          <span className="finance-new-filter-label">Filtrele:</span>
          <div className="finance-new-filter-dropdown-container">
            <div 
              className="finance-new-filter-dropdown"
              onClick={handleFilterToggle}
            >
              <span>{filterPeriod}</span>
              <img 
                src={arrowDownIcon} 
                alt="dropdown" 
                className={isFilterDropdownOpen ? 'rotated' : ''}
              />
            </div>
            {isFilterDropdownOpen && (
              <div className="finance-new-filter-options">
                {filterOptions.map((option) => (
                  <div
                    key={option}
                    className={`finance-new-filter-option ${option === filterPeriod ? 'active' : ''}`}
                    onClick={() => handleFilterSelect(option)}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="finance-new-stats-cards">
          <div className="finance-new-stat-card">
            <div className="finance-new-stat-content">
              <div className="finance-new-stat-text">
                <div className="finance-new-stat-value">{loading ? 'Yükleniyor...' : currentStats.totalRevenue}</div>
                <div className="finance-new-stat-label">Toplam Gelir</div>
              </div>
              <div className="finance-new-stat-icon orange">
                <img src={moneyBagIcon} alt="Toplam Gelir" />
              </div>
            </div>
          </div>

          <div className="finance-new-stat-card">
            <div className="finance-new-stat-content">
              <div className="finance-new-stat-text">
                <div className="finance-new-stat-value">{loading ? 'Yükleniyor...' : currentStats.refundAmount}</div>
                <div className="finance-new-stat-label">İade Edilen Tutar</div>
              </div>
              <div className="finance-new-stat-icon pink">
                <img src={keyboardReturnNewIcon} alt="İade Edilen Tutar" />
              </div>
            </div>
          </div>

          <div className="finance-new-stat-card">
            <div className="finance-new-stat-content">
              <div className="finance-new-stat-text">
                <div className="finance-new-stat-value">{loading ? 'Yükleniyor...' : currentStats.netProfit}</div>
                <div className="finance-new-stat-label">Kazanç</div>
              </div>
              <div className="finance-new-stat-icon teal">
                <img src={attachMoneyNewIcon} alt="Kazanç" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="finance-table-section">
        <div className="finance-table-header-new">
          <div className="finance-table-title-new">
            <h2>Gerçekleşen Tur Listesi</h2>
            <div className="finance-table-badge-new">
              Son Güncelleme: 17.05.2025
            </div>
          </div>
          <div className="finance-table-controls-new">
            <div className="finance-sort-button">
              <span>Fiyata Göre Sırala</span>
              <img src={arrowDownIcon} alt="dropdown" />
            </div>
            <div className="finance-sort-button">
              <span>Tarihe Göre Sırala</span>
              <img src={arrowDownIcon} alt="dropdown" />
            </div>
            <div className="finance-search-button">
              <img src={searchIcon} alt="arama" className="finance-search-icon-new" />
              <input
                type="text"
                placeholder="Tur İsmi İle Arayın"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="finance-search-input-new"
              />
            </div>
          </div>
        </div>

        <div className="finance-table-container">
          <table className="finance-table">
            <thead>
              <tr>
                {/* Checkbox column removed */}
                <th>
                  <div className="finance-header-content">
                    <span className="finance-col-ucase">TUR KODU</span>
                    <img src={arrowDownIcon} alt="sırala" className="finance-sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="finance-header-content">
                    <span className="finance-col-ucase">TUR ADI</span>
                    <img src={arrowDownIcon} alt="sırala" className="finance-sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="finance-header-content">
                    <span className="finance-col-ucase">TUR TARİHİ</span>
                    <img src={arrowDownIcon} alt="sırala" className="finance-sort-icon" />
                  </div>
                </th>
                <th>
                  <div className="finance-header-content">
                    <span className="finance-col-ucase">KAZANÇ</span>
                    <img src={arrowDownIcon} alt="sırala" className="finance-sort-icon" />
                  </div>
                </th>
                <th>
                  <span className="finance-col-ucase">İŞLEMLER</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>Finans raporu yükleniyor...</td>
                </tr>
              ) : currentTours.map((tour) => (
                <tr key={tour.id}>
                  {/* Checkbox cell removed */}
                  <td className="finance-tour-code">{tour.tourCode}</td>
                  <td className="finance-tour-name">{tour.tourName}</td>
                  <td className="finance-tour-date">{tour.tourDate}</td>
                  <td className="finance-tour-earning">{tour.netEarning}</td>
                  <td className="finance-actions">
                    <div className="finance-actions-content">
                      <img 
                        src="/icons/finance-action-vector.svg" 
                        alt="indir" 
                        className="finance-download-icon"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="finance-pagination">
          <div className="finance-pagination-info">
            <button 
              className="finance-page-number" 
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              <span>Önceki</span>
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                className={`finance-page-number ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button 
              className="finance-page-number" 
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <span>Sonraki</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Finance; 