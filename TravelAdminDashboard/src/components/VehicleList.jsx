import React, { useEffect, useMemo, useState } from 'react';
import './VehicleList.css';
import editButtonIcon from '../assets/icons/edit-button-icon.svg';
import { deleteVehicleApi, fetchVehiclesApi } from '../services/adminApi';
import { useFeedback } from './feedback/feedbackContext';
import { downloadCsv } from '../utils/format';

const VehicleList = () => {
  const { notify, confirm } = useFeedback();
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('plate');
  const [currentPage, setCurrentPage] = useState(1);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const itemsPerPage = 15;

  useEffect(() => {
    let alive = true;

    const loadVehicles = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await fetchVehiclesApi();
        if (!alive) return;
        setVehicles(Array.isArray(response) ? response : []);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Araçlar yüklenemedi.');
        setVehicles([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadVehicles();

    return () => {
      alive = false;
    };
  }, []);

  // Filtreleme ve sıralama işlevi
  const filteredAndSortedVehicles = useMemo(() => {
    const filtered = vehicles
      .map((vehicle) => ({
        id: vehicle.id,
        plate: vehicle.plate,
        design: vehicle.model || `${vehicle.busType} Araç Tasarımı`,
        date: vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleString('tr-TR') : '-',
        dateSort: vehicle.createdAt ? new Date(vehicle.createdAt) : new Date(0),
        type: vehicle.busType,
        raw: vehicle,
      }))
      .filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
      );

    // Sıralama
    switch (sortBy) {
      case 'plate':
        filtered.sort((a, b) => a.plate.localeCompare(b.plate));
        break;
      case 'type':
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case 'design':
        filtered.sort((a, b) => a.design.localeCompare(b.design));
        break;
      default:
        break;
    }

    return filtered;
  }, [vehicles, searchTerm, sortBy]);

  // Pagination için gerekli hesaplamalar
  const totalPages = Math.ceil(filteredAndSortedVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentVehicles = filteredAndSortedVehicles.slice(startIndex, endIndex);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedVehicles(currentVehicles.map(v => v.id));
    } else {
      setSelectedVehicles([]);
    }
  };

  const handleSelectVehicle = (id, checked) => {
    if (checked) {
      setSelectedVehicles([...selectedVehicles, id]);
    } else {
      setSelectedVehicles(selectedVehicles.filter(vId => vId !== id));
    }
  };

  const handleEdit = (id) => {
    const vehicle = vehicles.find(v => v.id === id);
    if (vehicle) {
      const editPayload = {
        id: vehicle.id,
        companyId: vehicle.companyId || '',
        vehiclePlate: vehicle.plate || '',
        vehicleModel: vehicle.model || '',
        passengerCapacity: vehicle.capacity ? String(vehicle.capacity) : '',
        wifi: vehicle.hasWifi === true ? 'var' : vehicle.hasWifi === false ? 'yok' : '',
        busType: vehicle.busType || '',
        airCondition: vehicle.hasAirCondition === true ? 'var' : vehicle.hasAirCondition === false ? 'yok' : '',
        powerOutlet: vehicle.hasPowerOutlet === true ? 'var' : vehicle.hasPowerOutlet === false ? 'yok' : '',
        vehicleDesign: vehicle.busType || '',
        coverImage: vehicle.coverImage ? { name: 'Mevcut görsel', preview: vehicle.coverImage } : null,
        additionalImages: []
      };
      try {
        localStorage.setItem('nvdMode', 'edit');
        localStorage.setItem('nvdData', JSON.stringify(editPayload));
      } catch (e) {
        console.warn('LocalStorage set failed:', e);
      }
      window.location.hash = encodeURIComponent('Yeni Araç Tanımla');
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Araç silinsin mi?',
      message: 'Bu aracı silmek istediğinize emin misiniz?',
      confirmLabel: 'Evet, sil',
      danger: true,
    });
    if (!ok) return;

    deleteVehicleApi(id)
      .then(() => setVehicles((prev) => prev.filter((vehicle) => vehicle.id !== id)))
      .catch((err) => notify(err instanceof Error ? err.message : 'Araç silinemedi.', 'error'));
  };

  const handleDeleteSelected = async () => {
    if (selectedVehicles.length === 0) return;
    const ok = await confirm({
      title: 'Seçili araçlar silinsin mi?',
      message: `${selectedVehicles.length} araç kalıcı olarak silinecek.`,
      confirmLabel: 'Evet, sil',
      danger: true,
    });
    if (!ok) return;

    Promise.all(selectedVehicles.map((id) => deleteVehicleApi(id)))
      .then(() => {
        setVehicles((prev) => prev.filter((vehicle) => !selectedVehicles.includes(vehicle.id)));
        setSelectedVehicles([]);
      })
      .catch((err) => notify(err instanceof Error ? err.message : 'Seçili araçlar silinemedi.', 'error'));
  };

  /**
   * Araç listesini CSV olarak indirir.
   *
   * Düğme "PDF dışa aktarma henüz hazır değil" uyarısı veriyordu, yani
   * hiçbir şey yapmıyordu. Tarayıcıda PDF üretmek ek bağımlılık gerektiriyor;
   * CSV hem Excel'de hem de tabloya aktarmada doğrudan açılıyor.
   */
  const handleDownloadAll = () => {
    const rows = selectedVehicles.length
      ? filteredAndSortedVehicles.filter((v) => selectedVehicles.includes(v.id))
      : filteredAndSortedVehicles;

    if (!rows.length) {
      notify('Dışa aktarılacak araç bulunamadı.', 'warning');
      return;
    }

    downloadCsv(
      `araclar-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Plaka', 'Tasarım', 'Düzen', 'Kapasite', 'Kayıt Tarihi'],
      rows.map((v) => [v.plate, v.design, v.type, v.raw?.capacity ?? '', v.date]),
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedVehicles([]); // Sayfa değiştiğinde seçimleri temizle
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  return (
    <div className="vl-vehicle-list">
      {error && <div className="table-error">{error}</div>}
      <div className="vl-vehicle-list-header">
        <h1 className="vl-vehicle-list-title">Mevcut Araçlar</h1>
        <div className="vl-header-right">
          <div className="vl-vehicle-list-filters">
            <div className="vl-sort-dropdown">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="vl-sort-select"
              >
                <option value="plate">Plakaya Göre Sırala</option>
                <option value="type">Tipe Göre Sırala</option>
                <option value="design">Tasarıma Göre Sırala</option>
              </select>
              <svg className="vl-sort-arrow" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4.38 6.88L10 12.5L15.62 6.88" stroke="#24BAEC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="vl-search-box">
              <img src={'/icons/search-icon.svg'} alt="Search" className="vl-search-icon" />
              <input
                type="text"
                placeholder="Plakaya Göre Ara"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="vl-search-input"
              />
            </div>
          </div>
          <div className="vl-bulk-actions">
          <button className="vl-delete-selected" onClick={handleDeleteSelected}>
            <img src="/icons/delete-icon.svg" alt="Sil" />
            <span>Seçilenleri Sil</span>
          </button>
          <button type="button" className="vl-download-all" onClick={handleDownloadAll}>
            <img src="/icons/download-cloud-02.svg" alt="" />
            <span>{selectedVehicles.length ? `Seçilenleri İndir (${selectedVehicles.length})` : 'Listeyi İndir'}</span>
          </button>
          </div>
        </div>
      </div>

      <div className="vl-vehicle-table-container">
        <div className="vl-table-header-badge">
          <span className="vl-last-update">Son Güncelleme: 17.05.2025</span>
        </div>
        
        <table className="vl-vehicle-table">
          <thead>
            <tr>
              <th className="vl-checkbox-column">
                <div className="vl-checkbox-container">
                  <input
                    type="checkbox"
                    id="select-all"
                    checked={selectedVehicles.length === currentVehicles.length && currentVehicles.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <label htmlFor="select-all" className="vl-checkbox-text">Tümü</label>
                </div>
              </th>
              <th className="vl-sortable-column vl-plate-column">
                <div className="vl-column-header">
                  <span>Araç Plakası</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#667085" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </th>
              <th className="vl-sortable-column vl-design-column">
                <div className="vl-column-header">
                  <span>Araç Tasarımı</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#667085" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </th>
              <th className="vl-sortable-column vl-date-column">
                <div className="vl-column-header">
                  <span>Eklenme Tarihi</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#667085" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </th>

              <th className="vl-sortable-column vl-type-column">
                <div className="vl-column-header">
                  <span>Otobüs Tipi</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6L8 10L12 6" stroke="#667085" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </th>
              <th className="vl-actions-column"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>Araçlar yükleniyor...</td>
              </tr>
            ) : currentVehicles.map((vehicle) => (
              <tr key={vehicle.id}>
                <td className="vl-checkbox-cell">
                  <div className="vl-checkbox-container">
                    <input
                      type="checkbox"
                      checked={selectedVehicles.includes(vehicle.id)}
                      onChange={(e) => handleSelectVehicle(vehicle.id, e.target.checked)}
                    />
                  </div>
                </td>
                <td className="vl-plate-cell">
                  <div className="vl-cell-content">{vehicle.plate}</div>
                </td>
                <td className="vl-design-cell">
                  <div className="vl-cell-content">{vehicle.design}</div>
                </td>
                <td className="vl-date-cell">
                  <div className="vl-cell-content">{vehicle.date}</div>
                </td>
                <td className="vl-type-cell">
                  <div className="vl-cell-content">
                    <span className={`vl-type-chip ${vehicle.type === '2+1' ? 'vl-type-chip--21' : 'vl-type-chip--22'}`}>{vehicle.type}</span>
                  </div>
                </td>
                <td className="vl-actions-cell">
                  <div className="vl-action-buttons">
                    <button className="vl-icon-btn" onClick={() => handleDelete(vehicle.id)} aria-label="Sil">
                      <img src="/icons/delete-icon.svg" alt="Delete" width="16" height="16" />
                    </button>
                    <button className="vl-edit-btn" onClick={() => handleEdit(vehicle.id)}>
                      <span>Düzenle</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="vl-pagination">
          <div className="vl-pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <span
                  key={pageNumber}
                  className={`vl-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </span>
              );
            })}
          </div>
          {currentPage < totalPages && (
            <div className="vl-pagination-next" onClick={handleNextPage}>
              <span>Sonraki</span>
              <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
                <path d="M1 1L5 6L1 11" stroke="#FF7029" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="vl-mobile-vehicle-list">
        <div className="vl-mobile-header">
          <div className="vl-mobile-header-content">
            <span className="vl-last-update">Son Güncelleme: 17.05.2025</span>
            <div className="vl-mobile-select-all">
              <div className="vl-checkbox-container">
                <input
                  type="checkbox"
                  id="mobile-select-all"
                  checked={selectedVehicles.length === currentVehicles.length && currentVehicles.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
                <label htmlFor="mobile-select-all" className="vl-checkbox-text">Tümü</label>
              </div>
            </div>
          </div>
        </div>
        
        {currentVehicles.map((vehicle) => (
          <div key={vehicle.id} className="vl-mobile-vehicle-card">
            <div className="vl-mobile-card-header">
              <h3 className="vl-mobile-card-title">{vehicle.plate}</h3>
              <div className="vl-mobile-card-checkbox">
                <input
                  type="checkbox"
                  checked={selectedVehicles.includes(vehicle.id)}
                  onChange={(e) => handleSelectVehicle(vehicle.id, e.target.checked)}
                />
              </div>
            </div>
            
            <div className="vl-mobile-card-info">
              <div className="vl-mobile-info-row">
                <span className="vl-mobile-info-label">Araç Tasarımı:</span>
                <span className="vl-mobile-info-value">{vehicle.design}</span>
              </div>
              
              <div className="vl-mobile-info-row">
                <span className="vl-mobile-info-label">Otobüs Tipi:</span>
                <span className="vl-mobile-info-value">{vehicle.type}</span>
              </div>
              
              <div className="vl-mobile-info-row">
                <span className="vl-mobile-info-label">Oluşturulma Tarihi:</span>
                <span className="vl-mobile-info-value">{vehicle.date}</span>
              </div>
            </div>
            
            <div className="vl-mobile-card-actions">
              <button 
                className="vl-mobile-delete-btn"
                onClick={() => handleDelete(vehicle.id)}
              >
                <img src={'/icons/delete-icon.svg'} alt="Delete" width="10" height="10" />
                <span>Sil</span>
              </button>
              <button 
                className="vl-mobile-edit-btn"
                onClick={() => handleEdit(vehicle.id)}
              >
                <img src={editButtonIcon} alt="Edit" width="10" height="10" />
                <span>Düzenle</span>
              </button>
            </div>
          </div>
        ))}
        
        <div className="vl-pagination">
          <div className="vl-pagination-numbers">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <span
                  key={pageNumber}
                  className={`vl-page-number ${currentPage === pageNumber ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </span>
              );
            })}
          </div>
          {currentPage < totalPages && (
            <div className="vl-pagination-next" onClick={handleNextPage}>
              <span>Sonraki</span>
              <svg width="6" height="12" viewBox="0 0 6 12" fill="none">
                <path d="M1 1L5 6L1 11" stroke="#FF7029" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleList; 