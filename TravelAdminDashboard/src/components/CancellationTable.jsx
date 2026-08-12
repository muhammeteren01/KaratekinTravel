import React, { useState } from 'react';
import './CancellationTable.css';
import searchIcon from '../assets/icons/search-outline.svg';
import arrowDownIcon from '../assets/icons/arrow-down.svg';

const CancellationTable = ({ data = [], onDetailsClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 5;

  // Search term değiştiğinde sayfa numarasını resetle
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Türkçe karakter normalize fonksiyonu
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

  // Filtreleme - Tüm alanlarda arama
  const filteredData = data.filter(item => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    return (
      normalizeText(item.tourId).includes(normalizedSearchTerm) ||
      normalizeText(item.tourName).includes(normalizedSearchTerm) ||
      normalizeText(item.cancellationDate).includes(normalizedSearchTerm) ||
      normalizeText(item.cancellationReason).includes(normalizedSearchTerm)
    );
  });

  // Sayfalama
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

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

  return (
    <div className="cancellation-table-container">
      {/* Arama ve Filtreleme */}
      <div className="table-controls">
        <div className="filter-section">
          <div className="sort-dropdown">
            <button className="sort-button">
              <span>Tarihe Göre Sırala</span>
              <img 
                src={arrowDownIcon} 
                alt="Arrow Down" 
                width="16"
                height="16"
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
              placeholder="Tur Ara"
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
              <th className="table-header first-col">Tur ID</th>
              <th className="table-header">Tur Adı</th>
              <th className="table-header">İptal Tarihi</th>
              <th className="table-header">İptal Nedeni</th>
              <th className="table-header last-col">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="table-cell first-col">{item.tourId}</td>
                  <td className="table-cell">{item.tourName}</td>
                  <td className="table-cell">{item.cancellationDate}</td>
                  <td className="table-cell">{item.cancellationReason}</td>
                  <td className="table-cell last-col">
                    <button 
                      className="details-button"
                      onClick={() => onDetailsClick && onDetailsClick(item)}
                    >
                      Detaylar
                    </button>
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

export default CancellationTable; 