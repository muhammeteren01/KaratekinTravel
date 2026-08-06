import React, { useEffect, useMemo, useState } from 'react';
import './TourManagement.css';
import DownloadIcon from '../assets/icons/download-cloud-02.svg';
import DeleteIcon from '../assets/icons/delete-icon.svg';
import { deleteTripApi, fetchTripsApi } from '../services/adminApi';
import { formatTurkishDate, normalizeSelectedTour } from '../utils/tripPayload';

const TourManagement = ({ isSidebarCollapsed, goToTourDetails }) => {
  const [selectedTours, setSelectedTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const toursPerPage = 7;

  useEffect(() => {
    let alive = true;

    const loadTrips = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await fetchTripsApi();
        if (!alive) return;
        setTours(Array.isArray(result) ? result : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Turlar yüklenemedi.');
        setTours([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadTrips();

    return () => {
      alive = false;
    };
  }, []);

  const mappedTours = useMemo(() => {
    const toStatus = (item) => {
      if (item?.isDeleted) return 'inactive';
      if (item?.isPublished === false) return 'processing';
      return 'active';
    };

    return tours
      .filter((tour) => {
        const term = searchTerm.trim().toLowerCase();
        if (!term) return true;
        return [tour.title, tour.location, tour.city, tour.region]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      })
      .map((tour, index) => ({
        id: tour.id,
        code: `TR-${String(index + 1).padStart(4, '0')}`,
        name: tour.title,
        date: formatTurkishDate(tour.createdAt || tour.CreatedAt),
        price: tour.price || (tour.pricing?.basePrice ? `${tour.pricing.basePrice} ${tour.pricing.currency || 'TRY'}` : '0 TRY'),
        status: toStatus(tour),
        raw: tour,
      }));
  }, [tours, searchTerm]);

  const lastUpdatedLabel = useMemo(() => {
    const stamps = tours
      .map((t) => t.updatedAt || t.createdAt)
      .filter(Boolean)
      .map((v) => new Date(v).getTime())
      .filter((n) => !Number.isNaN(n));
    if (!stamps.length) return null;
    return formatTurkishDate(new Date(Math.max(...stamps)));
  }, [tours]);

  // Calculate pagination
  const totalPages = Math.max(1, Math.ceil(mappedTours.length / toursPerPage));
  const startIndex = (currentPage - 1) * toursPerPage;
  const endIndex = startIndex + toursPerPage;
  const currentTours = mappedTours.slice(startIndex, endIndex);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTours(currentTours.map(tour => tour.id));
    } else {
      setSelectedTours([]);
    }
  };

  const handleSelectTour = (tourId, checked) => {
    if (checked) {
      setSelectedTours([...selectedTours, tourId]);
    } else {
      setSelectedTours(selectedTours.filter(id => id !== tourId));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedTours.length > 0) {
      const ok = window.confirm('Seçili turlar silinecek. Devam etmek istiyor musunuz?');
      if (!ok) return;

      Promise.all(selectedTours.map((tourId) => deleteTripApi(tourId)))
        .then(() => {
          setTours((prev) => prev.filter((tour) => !selectedTours.includes(tour.id)));
          setSelectedTours([]);
        })
        .catch((err) => {
          alert(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.');
        });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedTours([]); // Clear selections when changing page
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className={`tour-management ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>        
      <div className="tour-management-content">
        <div className="tours-section">
          {error && <div className="table-error">{error}</div>}
          {/* Header */}
          <div className="section-header">
            <h2 className="section-title">Mevcut Turlar</h2>
            <div className="header-actions">
              <div className="filter-group">
                <button className="filter-btn">
                  <span>Fiyata Göre Sırala</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button className="filter-btn">
                  <span>Tarihe Göre Sırala</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="search-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
                  <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input 
                  type="text" 
                  placeholder="Tur İsmi İle Arayın"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="table-container">
            {/* Table Header */}
            <div className="table-header">
              <div className="table-title-section">
                <div className="table-title-row">
                  <h3 className="table-title">Tur Listesi</h3>
                  <span className="update-badge">
                    Son Güncelleme: {lastUpdatedLabel || '-'}
                  </span>
                </div>
              </div>
              <div className="table-actions">
                <button 
                  className="action-btn delete-btn"
                  onClick={handleDeleteSelected}
                  disabled={selectedTours.length === 0}
                >
                  <img src={DeleteIcon} alt="Delete" width="20" height="20" />
                  Sil
                </button>
                <button className="action-btn excel-btn">
                  <img src={DownloadIcon} alt="Download" width="20" height="20" />
                  Excell İndir
                  <svg width="12" height="6" viewBox="0 0 12 6" fill="none" className="dropdown-arrow">
                    <path d="M1 1L6 5L11 1" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th className="checkbox-column">
                      <div className="checkbox-container">
                        <input 
                          type="checkbox" 
                          id="select-all"
                          checked={selectedTours.length === currentTours.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label htmlFor="select-all">Tümü</label>
                      </div>
                    </th>
                    <th>
                      <div className="header-cell">
                        <span>Tur Kodu</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th>
                      <div className="header-cell">
                        <span>Tur Adı</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th>
                      <div className="header-cell">
                        <span>Oluşturulma Tarihi</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th>
                      <div className="header-cell">
                        <span>Fiyat</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th>
                      <div className="header-cell">
                        <span>Durum</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8">Turlar yükleniyor...</td>
                    </tr>
                  ) : currentTours.length === 0 ? (
                    <tr>
                      <td colSpan="8">Gösterilecek tur bulunamadı.</td>
                    </tr>
                  ) : currentTours.map((tour) => (
                    <tr key={tour.id}>
                      <td className="checkbox-column">
                        <div className="checkbox-container">
                          <input
                            type="checkbox"
                            checked={selectedTours.includes(tour.id)}
                            onChange={(e) => handleSelectTour(tour.id, e.target.checked)}
                          />
                        </div>
                      </td>
                      <td>{tour.code}</td>
                      <td>{tour.name}</td>
                      <td>{tour.date}</td>
                      <td>{tour.price}</td>
                      <td>
                        <span className={`status-badge ${tour.status}`}>
                          {tour.status === 'active' ? 'Yayında' : 
                           tour.status === 'inactive' ? 'Pasif' : 'İşleniyor'}
                        </span>
                      </td>
                      <td>
                        <button className="details-btn" onClick={() => {
                          const normalized = normalizeSelectedTour(tour);
                          try { localStorage.setItem('selectedTour', JSON.stringify(normalized)); } catch {}
                          if (typeof goToTourDetails === 'function') goToTourDetails();
                          else window.location.hash = encodeURIComponent('Tur Detayları');
                        }}>
                          Detaylar
                        </button>
                      </td>
                      <td>
                        <button className="download-btn">
                          <img src={DownloadIcon} alt="Download" width="16" height="16" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* Mobile Card Layout (outside hidden table container) */}
        <div className="mobile-tour-list">
          <div className="mobile-header">
            <div className="mobile-header-content">
              <span className="update-badge">
                Son Güncelleme: {lastUpdatedLabel || '-'}
              </span>
              <div className="mobile-select-all">
                <div className="checkbox-container">
                  <input
                    type="checkbox"
                    id="tm-mobile-select-all"
                    checked={selectedTours.length === currentTours.length && currentTours.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <label htmlFor="tm-mobile-select-all">Tümü</label>
                </div>
              </div>
            </div>
          </div>
          {!loading && currentTours.map((tour) => (
            <div key={tour.id} className="mobile-tour-card">
              <div className="mobile-card-header">
                <h3 className="mobile-card-title">{tour.code} – {tour.name}</h3>
                <div className="mobile-card-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTours.includes(tour.id)}
                    onChange={(e) => handleSelectTour(tour.id, e.target.checked)}
                  />
                </div>
              </div>
              <div className="mobile-card-info">
                <div className="mobile-info-row">
                  <span className="mobile-info-label">Fiyat:</span>
                  <span className="mobile-info-value">{tour.price}</span>
                </div>
                <div className="mobile-info-row">
                  <span className="mobile-info-label">Durum:</span>
                  <span className={`status-badge ${tour.status}`}>
                    {tour.status === 'active' ? 'Yayında' : tour.status === 'inactive' ? 'Pasif' : 'İşleniyor'}
                  </span>
                </div>
                <div className="mobile-info-row">
                  <span className="mobile-info-label">Tarih:</span>
                  <span className="mobile-info-value">{tour.date}</span>
                </div>
              </div>
              <div className="mobile-card-actions">
                <button
                  className="details-btn"
                  onClick={() => {
                    const normalized = normalizeSelectedTour(tour);
                    try { localStorage.setItem('selectedTour', JSON.stringify(normalized)); } catch {}
                    if (typeof goToTourDetails === 'function') goToTourDetails();
                    else window.location.hash = encodeURIComponent('Tur Detayları');
                  }}
                >
                  Detaylar
                </button>
                <button className="download-btn" aria-label="İndir">
                  <img src={DownloadIcon} alt="Download" width="16" height="16" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => (
              <button 
                key={index + 1}
                className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`} 
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button 
            className="next-btn" 
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <span>Sonraki</span>
            <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
              <path d="M1 1L5 6L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TourManagement;