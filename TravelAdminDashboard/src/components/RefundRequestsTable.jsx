import React, { useEffect, useMemo, useState } from 'react';
import './CancellationTable.css';
import searchIcon from '../assets/icons/search-outline.svg';
import arrowDownIcon from '../assets/icons/arrow-down.svg';
import { fetchRefundsApi, updateRefundStatusApi } from '../services/adminApi';
import { normalizeText, sortByDate } from '../utils/sorting';

const RefundRequestsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  // 'desc' = yeniden eskiye; düğme her tıklamada yön değiştirir.
  const [sortDirection, setSortDirection] = useState('desc');
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 5;

  useEffect(() => {
    let alive = true;

    const loadRefunds = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchRefundsApi();
        if (!alive) return;
        setRefunds(Array.isArray(response) ? response : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'İade talepleri yüklenemedi.');
        setRefunds([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadRefunds();

    return () => {
      alive = false;
    };
  }, []);

  // Search term değiştiğinde sayfa numarasını resetle
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filtreleme - Tüm alanlarda arama
  const normalizedRefunds = useMemo(() => refunds.map((item) => ({
    id: item.id,
    requestId: `IA-${String(item.id).slice(0, 4).toUpperCase()}`,
    participant: item.userId,
    tourName: item.reservationId,
    requestDate: item.createdAt ? new Date(item.createdAt).toLocaleString('tr-TR') : '-',
    amount: `${Number(item.amount || 0).toLocaleString('tr-TR')} ${item.currency || 'TRY'}`,
    status: item.status,
    adminNote: item.adminNote,
    reason: item.reason,
    raw: item,
  })), [refunds]);

  const filteredData = normalizedRefunds.filter(item => {
    const normalizedSearchTerm = normalizeText(searchTerm);
    return (
      normalizeText(item.requestId).includes(normalizedSearchTerm) ||
      normalizeText(item.participant).includes(normalizedSearchTerm) ||
      normalizeText(item.tourName).includes(normalizedSearchTerm) ||
      normalizeText(item.requestDate).includes(normalizedSearchTerm) ||
      normalizeText(item.amount).includes(normalizedSearchTerm)
    );
  });

  // Sayfalama
  // Sıralama filtrelemeden sonra, sayfalamadan önce uygulanır.
  const sortedData = sortByDate(filteredData, 'requestDate', sortDirection);

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

  const handleApprove = (item) => {
    const adminNote = window.prompt('Onay notu (isteğe bağlı)', '');
    updateRefundStatusApi(item.id, { status: 'approved', adminNote: adminNote || undefined })
      .then(() => setRefunds((prev) => prev.map((row) => (row.id === item.id ? { ...row, status: 'approved', adminNote: adminNote || undefined } : row))))
      .catch((err) => alert(err instanceof Error ? err.message : 'İade onaylanamadı.'));
  };

  const handleReject = (item) => {
    const adminNote = window.prompt('Ret notu (isteğe bağlı)', '');
    updateRefundStatusApi(item.id, { status: 'rejected', adminNote: adminNote || undefined })
      .then(() => setRefunds((prev) => prev.map((row) => (row.id === item.id ? { ...row, status: 'rejected', adminNote: adminNote || undefined } : row))))
      .catch((err) => alert(err instanceof Error ? err.message : 'İade reddedilemedi.'));
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
    <div className="cancellation-table-container refund-requests-table">
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
      {error && <div className="table-error">{error}</div>}
      <div className="table-wrapper">
        <table className="cancellation-table">
          <thead>
            <tr>
              <th className="table-header first-col">Talep ID</th>
              <th className="table-header">Katılımcı</th>
              <th className="table-header">Tur Adı</th>
              <th className="table-header">Talep Tarihi</th>
              <th className="table-header">Tutar</th>
              <th className="table-header last-col">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="table-cell" colSpan="6" style={{ textAlign: 'center' }}>
                  İade talepleri yükleniyor...
                </td>
              </tr>
            ) : currentData.length > 0 ? (
              currentData.map((item, index) => (
                <tr key={item.id} className={index % 2 === 0 ? 'row-even' : 'row-odd'}>
                  <td className="table-cell first-col">{item.requestId}</td>
                  <td className="table-cell">{item.participant}</td>
                  <td className="table-cell">{item.tourName}</td>
                  <td className="table-cell">{item.requestDate}</td>
                  <td className="table-cell">{item.amount}</td>
                  <td className="table-cell last-col">
                    <div className="action-buttons-container">
                      <button 
                        className="approve-action-btn"
                        onClick={() => handleApprove(item)}
                        disabled={item.status === 'approved'}
                      >
                        Onayla
                      </button>
                      <button 
                        className="reject-action-btn"
                        onClick={() => handleReject(item)}
                        disabled={item.status === 'rejected'}
                      >
                        Reddet
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="table-cell" colSpan="6" style={{ textAlign: 'center', color: '#757D8A', fontStyle: 'italic' }}>
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

export default RefundRequestsTable; 