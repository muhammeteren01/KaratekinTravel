import React, { useState } from 'react';
import { normalizeText, sortByDate } from '../utils/sorting';
import './CancellationTable.css';
import searchIcon from '../assets/icons/search-outline.svg';
import arrowDownIcon from '../assets/icons/arrow-down.svg';

const CancelledTicketsTable = ({ data = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // 'desc' = yeniden eskiye; düğme her tıklamada yön değiştirir.
  const [sortDirection, setSortDirection] = useState('desc');
  const itemsPerPage = 5;

  // Search term değiştiğinde sayfa numarasını resetle
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtreleme - Tüm alanlarda arama
  const filteredData = data.filter(item => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    return (
      normalizeText(item.participantName).includes(normalizedSearchTerm) ||
      normalizeText(item.tourName).includes(normalizedSearchTerm) ||
  (item.plate && normalizeText(item.plate).includes(normalizedSearchTerm)) ||
  (item.seat && normalizeText(String(item.seat)).includes(normalizedSearchTerm)) ||
      normalizeText(item.cancellationDate).includes(normalizedSearchTerm) ||
      normalizeText(item.amount.toString()).includes(normalizedSearchTerm)
    );
  });

  // Sayfalama
  // Sıralama filtrelemeden sonra, sayfalamadan önce uygulanır.
  const sortedData = sortByDate(filteredData, 'cancellationDate', sortDirection);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (page) => {
    setCurrentPage(page);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 4;
    
    for (let i = 1; i <= Math.min(totalPages, maxVisiblePages); i++) {
      buttons.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageClick(i)}
        >
          {i}
        </button>
      );
    }
    
    return buttons;
  };

  // Helpers for Figma-like content formatting
  const formatName = (fullName) => {
    if (!fullName) return '-';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    const last = parts.pop();
    const first = parts.join(' ');
    return `${first} ${last.toUpperCase()}`;
  };

  const formatDate = (val) => {
    if (!val) return '-';
    // Expecting formats like '19/05/2025 - 19:30' or '19/05/2025'
    const datePart = String(val).split('-')[0].trim();
    return datePart.replaceAll('/', '.');
  };

  const formatAmount = (amt) => {
    if (amt === undefined || amt === null || amt === '-') return '-';
    const num = Number(amt);
    if (Number.isNaN(num)) return `${amt} TL`;
    return `${num.toLocaleString('tr-TR')} TL`;
  };

  return (
    <div className="cancellation-table-container">
      {/* Arama ve Filtreleme */}
      <div className="table-controls">
        <div className="filter-section">
          <div className="sort-dropdown">
            <button
              className="sort-button"
              type="button"
              onClick={() => {
                setSortDirection((prev) => (prev === 'desc' ? 'asc' : 'desc'));
                setCurrentPage(1);
              }}
              title={sortDirection === 'desc' ? 'Yeniden eskiye' : 'Eskiden yeniye'}
            >
              <span>Tarihe Göre Sırala ({sortDirection === 'desc' ? 'yeni → eski' : 'eski → yeni'})</span>
              <img 
                src={arrowDownIcon}
                alt=""
                width="16"
                height="16"
                style={{ transform: sortDirection === 'asc' ? 'rotate(180deg)' : 'none' }}
              />
            </button>
          </div>
        </div>
        
        <div className="search-box">
          <div className="search-input-container">
            <img 
              src={searchIcon} 
              alt="Search" 
              className="search-icon"
              width="24"
              height="24"
            />
            <input
              type="text"
              placeholder="Katılımcı veya Tur Adına Göre Ara"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {/* Tablo */}
      <div className="table-wrapper">
        <table className="cancellation-table">
          <thead>
            <tr>
              <th className="table-header first-col">Katılımcı</th>
              <th className="table-header">Tur Bilgisi</th>
              <th className="table-header">Plaka – Koltuk</th>
              <th className="table-header">İptal Tarihi</th>
              <th className="table-header last-col">Tutar</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="table-cell first-col">{formatName(item.participantName)}</td>
                  <td className="table-cell">{`${item.tourName} / ${formatDate(item.cancellationDate)}`}</td>
                  <td className="table-cell">{item.plate && item.seat ? `${item.plate} – ${item.seat}` : '-'}</td>
                  <td className="table-cell">{formatDate(item.cancellationDate)}</td>
                  <td className="table-cell last-col">
                    <div>{formatAmount(item.amount)}</div>
                    {item.note && <div className="amount-note">{`(${item.note})`}</div>}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="table-cell" colSpan="5" style={{ textAlign: 'center', color: '#757D8A', fontStyle: 'italic' }}>
                  {searchTerm ? 'Arama kriterlerinize uygun sonuç bulunamadı.' : 'Henüz veri bulunmamaktadır.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Sayfalama */}
      <div className="pagination">
        <div className="pagination-info">
          {renderPaginationButtons()}
        </div>
        <div className="pagination-controls">
          <button
            className="pagination-nav"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
              <path d="M5 1L1 6L5 11" stroke="#FF7029" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Önceki</span>
          </button>
          <button 
            className="pagination-nav"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <span>Sonraki</span>
            <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
              <path d="M1 1L5 6L1 11" stroke="#FF7029" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelledTicketsTable; 