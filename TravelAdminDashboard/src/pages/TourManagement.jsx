import React, { useEffect, useMemo, useState } from 'react';
import './TourManagement.css';
import DownloadIcon from '../assets/icons/download-cloud-02.svg';
import DeleteIcon from '../assets/icons/delete-icon.svg';
import { deleteTripApi, fetchManagedTripsApi } from '../services/adminApi';
import { formatTurkishDate, normalizeSelectedTour } from '../utils/tripPayload';
import { setSelectedTour } from '../utils/selectionStorage';
import { useFeedback } from '../components/feedback/feedbackContext';
import { downloadCsv, formatPrice, sortRows } from '../utils/format';
import { matchesSearch } from '../utils/text';

const STATUS_LABELS = {
  active: 'Yayında',
  inactive: 'Pasif',
  processing: 'Taslak',
};

// Sütun başlıkları: etiket + hangi alana göre nasıl sıralanacağı.
const COLUMNS = [
  { key: 'code', label: 'Tur Kodu', type: 'text' },
  { key: 'name', label: 'Tur Adı', type: 'text' },
  { key: 'date', label: 'Oluşturulma Tarihi', type: 'date' },
  { key: 'priceValue', label: 'Fiyat', type: 'number' },
  { key: 'status', label: 'Durum', type: 'text' },
];

const TourManagement = ({ isSidebarCollapsed, goToTourDetails }) => {
  const { notify, confirm } = useFeedback();
  const [selectedTours, setSelectedTours] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState({ key: 'date', direction: 'desc' });
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
        const result = await fetchManagedTripsApi();
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

  // Tur kodu turun kendi kimliğinden türetiliyor. Önceden filtrelenmiş
  // listedeki sıra numarası kullanılıyordu; arama kutusuna bir şey yazıldığında
  // aynı turun kodu değişiyor, kod bir tanımlayıcı olmaktan çıkıyordu.
  const allTours = useMemo(() => {
    const toStatus = (item) => {
      if (item?.isDeleted) return 'inactive';
      if (item?.isPublished === false) return 'processing';
      return 'active';
    };

    return tours.map((tour) => {
      const rawPrice = tour.price ?? tour.pricing?.basePrice ?? null;
      const currency = tour.currency || tour.pricing?.currency || 'TRY';

      return {
        id: tour.id,
        code: `TR-${String(tour.id ?? '').replace(/-/g, '').slice(0, 6).toUpperCase() || '------'}`,
        name: tour.title || 'İsimsiz tur',
        date: formatTurkishDate(tour.createdAt || tour.CreatedAt),
        price: formatPrice(rawPrice, currency),
        priceValue: rawPrice,
        status: toStatus(tour),
        raw: tour,
      };
    });
  }, [tours]);

  const mappedTours = useMemo(() => {
    const filtered = allTours.filter((tour) =>
      matchesSearch(searchTerm, tour.name, tour.code, tour.raw?.location, tour.raw?.city, tour.raw?.region)
    );

    const column = COLUMNS.find((c) => c.key === sort.key);
    return sortRows(filtered, { key: sort.key, direction: sort.direction, type: column?.type || 'text' });
  }, [allTours, searchTerm, sort]);

  const toggleSort = (key) => {
    setSort((prev) => (
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: key === 'date' ? 'desc' : 'asc' }
    ));
    setCurrentPage(1);
    setSelectedTours([]);
  };

  const exportRows = (rows) => {
    if (!rows.length) {
      notify('Dışa aktarılacak tur bulunamadı.', 'warning');
      return;
    }

    downloadCsv(
      `turlar-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Tur Kodu', 'Tur Adı', 'Oluşturulma Tarihi', 'Fiyat', 'Durum'],
      rows.map((tour) => [tour.code, tour.name, tour.date, tour.price, STATUS_LABELS[tour.status] || tour.status])
    );
  };

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

  const handleDeleteSelected = async () => {
    if (selectedTours.length === 0) return;

    const ok = await confirm({
      title: 'Seçili turlar silinsin mi?',
      message: `${selectedTours.length} tur kalıcı olarak silinecek.`,
      confirmLabel: 'Evet, sil',
      danger: true,
    });
    if (!ok) return;

    try {
      await Promise.all(selectedTours.map((tourId) => deleteTripApi(tourId)));
      setTours((prev) => prev.filter((tour) => !selectedTours.includes(tour.id)));
      setSelectedTours([]);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Silme işlemi başarısız oldu.', 'error');
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

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  // Arama sonucu sayfa sayısını düşürdüğünde kullanıcı boş bir sayfada
  // kalıyordu; her zaman geçerli bir sayfaya çek.
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

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
                <button
                  type="button"
                  className={`filter-btn ${sort.key === 'priceValue' ? 'active' : ''}`}
                  onClick={() => toggleSort('priceValue')}
                  aria-pressed={sort.key === 'priceValue'}
                >
                  <span>Fiyata Göre Sırala</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ transform: sort.key === 'priceValue' && sort.direction === 'asc' ? 'rotate(180deg)' : 'none' }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <button
                  type="button"
                  className={`filter-btn ${sort.key === 'date' ? 'active' : ''}`}
                  onClick={() => toggleSort('date')}
                  aria-pressed={sort.key === 'date'}
                >
                  <span>Tarihe Göre Sırala</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                    style={{ transform: sort.key === 'date' && sort.direction === 'asc' ? 'rotate(180deg)' : 'none' }}>
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
              <div className="search-box">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
                  <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="search"
                  aria-label="Tur ismi ile arayın"
                  placeholder="Tur İsmi İle Arayın"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                    setSelectedTours([]);
                  }}
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
                <button
                  type="button"
                  className="action-btn excel-btn"
                  onClick={() => exportRows(selectedTours.length
                    ? mappedTours.filter((tour) => selectedTours.includes(tour.id))
                    : mappedTours)}
                  disabled={loading || mappedTours.length === 0}
                  title={selectedTours.length ? 'Seçili turları indir' : 'Listedeki tüm turları indir'}
                >
                  <img src={DownloadIcon} alt="" width="20" height="20" />
                  {selectedTours.length ? `Seçilenleri İndir (${selectedTours.length})` : 'Listeyi İndir'}
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
                          checked={currentTours.length > 0 && selectedTours.length === currentTours.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                        <label htmlFor="select-all">Tümü</label>
                      </div>
                    </th>
                    {COLUMNS.map((column) => (
                      <th
                        key={column.key}
                        aria-sort={sort.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                      >
                        <button
                          type="button"
                          className={`header-cell ${sort.key === column.key ? 'sorted' : ''}`}
                          onClick={() => toggleSort(column.key)}
                          title={`${column.label} sütununa göre sırala`}
                        >
                          <span>{column.label}</span>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                            style={{ transform: sort.key === column.key && sort.direction === 'asc' ? 'rotate(180deg)' : 'none' }}>
                            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </th>
                    ))}
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
                           tour.status === 'inactive' ? 'Pasif' : 'Taslak'}
                        </span>
                      </td>
                      <td>
                        <button className="details-btn" onClick={() => {
                          const normalized = normalizeSelectedTour(tour);
                          setSelectedTour(normalized);
                          if (typeof goToTourDetails === 'function') goToTourDetails();
                          else window.location.hash = encodeURIComponent('Tur Detayları');
                        }}>
                          Detaylar
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="download-btn"
                          onClick={() => exportRows([tour])}
                          aria-label={`${tour.name} turunu indir`}
                          title="Bu turu CSV olarak indir"
                        >
                          <img src={DownloadIcon} alt="" width="16" height="16" />
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
                    {tour.status === 'active' ? 'Yayında' : tour.status === 'inactive' ? 'Pasif' : 'Taslak'}
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
                    setSelectedTour(normalized);
                    if (typeof goToTourDetails === 'function') goToTourDetails();
                    else window.location.hash = encodeURIComponent('Tur Detayları');
                  }}
                >
                  Detaylar
                </button>
                <button
                  type="button"
                  className="download-btn"
                  onClick={() => exportRows([tour])}
                  aria-label={`${tour.name} turunu indir`}
                >
                  <img src={DownloadIcon} alt="" width="16" height="16" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination">
          <button
            type="button"
            className="next-btn"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
              <path d="M5 1L1 6L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Önceki</span>
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                type="button"
                key={index + 1}
                className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                onClick={() => handlePageChange(index + 1)}
                aria-current={currentPage === index + 1 ? 'page' : undefined}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
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