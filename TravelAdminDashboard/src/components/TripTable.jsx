import React, { useState } from 'react';
import './TripTable.css';
import arrowDownIcon from '../assets/icons/arrow-down.svg';
import searchIcon from '../assets/icons/search.svg';
import arrowRightIcon from '../assets/icons/arrow-right.svg';
import arrowLeftIcon from '../assets/icons/arrow-prev.svg';

const TripTable = ({ rows = [], loading = false }) => {
  const [selectedAll, setSelectedAll] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  const allTripData = rows;

  const sortOptions = [
    { label: 'Puana Göre Sırala', value: 'rating' },
    { label: 'Tarihe Göre Sırala', value: 'date' },
    { label: 'Katılımcıya Göre Sırala', value: 'participants' }
  ];

  const filteredData = allTripData.filter(trip => 
    trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (sortField === 'rating' || sortField === 'participants') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (sortField === 'date') {
      aValue = new Date(String(aValue).split(' - ')[0].split('.').reverse().join('-'));
      bValue = new Date(String(bValue).split(' - ')[0].split('.').reverse().join('-'));
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const totalPages = Math.max(1, Math.ceil(sortedData.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handleSelectAll = () => {
    if (selectedAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentData.map(item => item.id));
    }
    setSelectedAll(!selectedAll);
  };

  const handleRowSelect = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleSort = (field) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setSelectedAll(false);
    setSelectedRows([]);
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

  const renderPaginationNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <span
          key={i}
          className={`trip-table__page-number ${currentPage === i ? 'trip-table__page-number--active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </span>
      );
    }
    return pages;
  };

  return (
    <div className="trip-table">
      <div className="trip-table__header">
        <div className="trip-table__header-left">
          <h2 className="trip-table__title">Tur Analizleri</h2>
        </div>
        <div className="trip-table__header-right">
          {sortOptions.map((option, index) => (
            <button
              key={index}
              className={`trip-table__sort-button ${sortField === option.value ? 'trip-table__sort-button--active' : ''}`}
              onClick={() => handleSort(option.value)}
            >
              <span>{option.label}</span>
              <img 
                src={arrowDownIcon} 
                alt="Sort" 
                className={`trip-table__sort-icon ${sortField === option.value && sortDirection === 'desc' ? 'trip-table__sort-icon--desc' : ''}`} 
              />
            </button>
          ))}
          <div className="trip-table__search-container">
            <img src={searchIcon} alt="Search" className="trip-table__search-icon" />
            <input
              type="text"
              placeholder="Tur İsmi İle Arayın"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="trip-table__search-input"
            />
          </div>
        </div>
      </div>

      <div className="trip-table__container">
        <div className="trip-table__badge">
          <span className="trip-table__badge-text">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')} | 
            Toplam {sortedData.length} kayıt, 
            Sayfa {currentPage}/{totalPages}
          </span>
        </div>

        <table className="trip-table__table">
          <thead className="trip-table__thead">
            <tr className="trip-table__header-row">
              <th className="trip-table__header-cell trip-table__header-cell--checkbox">
                <div className="trip-table__checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectedAll}
                    onChange={handleSelectAll}
                    className="trip-table__checkbox"
                  />
                  <span className="trip-table__checkbox-label">Tümü</span>
                </div>
              </th>
              <th className="trip-table__header-cell">
                <div className="trip-table__header-content" onClick={() => handleSort('code')}>
                  <span>Tur Kodu</span>
                  <img 
                    src={arrowDownIcon} 
                    alt="Sort" 
                    className={`trip-table__header-sort ${sortField === 'code' && sortDirection === 'desc' ? 'trip-table__header-sort--desc' : ''}`} 
                  />
                </div>
              </th>
              <th className="trip-table__header-cell">
                <div className="trip-table__header-content" onClick={() => handleSort('name')}>
                  <span>Tur Adı</span>
                  <img 
                    src={arrowDownIcon} 
                    alt="Sort" 
                    className={`trip-table__header-sort ${sortField === 'name' && sortDirection === 'desc' ? 'trip-table__header-sort--desc' : ''}`} 
                  />
                </div>
              </th>
              <th className="trip-table__header-cell">
                <div className="trip-table__header-content" onClick={() => handleSort('category')}>
                  <span>Kategori</span>
                  <img 
                    src={arrowDownIcon} 
                    alt="Sort" 
                    className={`trip-table__header-sort ${sortField === 'category' && sortDirection === 'desc' ? 'trip-table__header-sort--desc' : ''}`} 
                  />
                </div>
              </th>
              <th className="trip-table__header-cell">
                <div className="trip-table__header-content" onClick={() => handleSort('date')}>
                  <span>Tur Tarihi</span>
                  <img 
                    src={arrowDownIcon} 
                    alt="Sort" 
                    className={`trip-table__header-sort ${sortField === 'date' && sortDirection === 'desc' ? 'trip-table__header-sort--desc' : ''}`} 
                  />
                </div>
              </th>
              <th className="trip-table__header-cell">
                <div className="trip-table__header-content" onClick={() => handleSort('participants')}>
                  <span>Katılımcı</span>
                  <img 
                    src={arrowDownIcon} 
                    alt="Sort" 
                    className={`trip-table__header-sort ${sortField === 'participants' && sortDirection === 'desc' ? 'trip-table__header-sort--desc' : ''}`} 
                  />
                </div>
              </th>
              <th className="trip-table__header-cell">
                <div className="trip-table__header-content" onClick={() => handleSort('rating')}>
                  <span>Puan</span>
                  <img 
                    src={arrowDownIcon} 
                    alt="Sort" 
                    className={`trip-table__header-sort ${sortField === 'rating' && sortDirection === 'desc' ? 'trip-table__header-sort--desc' : ''}`} 
                  />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="trip-table__tbody">
            {loading ? (
              <tr>
                <td colSpan="7" className="trip-table__cell" style={{ textAlign: 'center' }}>
                  Turlar yükleniyor...
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td colSpan="7" className="trip-table__cell" style={{ textAlign: 'center' }}>
                  Gösterilecek tur bulunamadı.
                </td>
              </tr>
            ) : currentData.map((trip) => (
              <tr key={trip.id} className="trip-table__row">
                <td className="trip-table__cell trip-table__cell--checkbox">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(trip.id)}
                    onChange={() => handleRowSelect(trip.id)}
                    className="trip-table__checkbox"
                  />
                </td>
                <td className="trip-table__cell trip-table__cell--bold">{trip.code}</td>
                <td className="trip-table__cell">{trip.name}</td>
                <td className="trip-table__cell">{trip.category}</td>
                <td className="trip-table__cell">{trip.date}</td>
                <td className="trip-table__cell">{trip.participants}</td>
                <td className="trip-table__cell">{trip.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="trip-table__pagination">
          {/* Sayfalamada yalnızca "Sonraki" vardı; geri gitmek için numaralara
              tıklamak gerekiyordu. */}
          <button
            type="button"
            className={`trip-table__pagination-next ${currentPage <= 1 ? 'trip-table__pagination-next--disabled' : ''}`}
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <img src={arrowLeftIcon} alt="" className="trip-table__next-icon" />
            <span>Önceki</span>
          </button>
          <div className="trip-table__pagination-numbers">
            {renderPaginationNumbers()}
          </div>
          <button 
            className={`trip-table__pagination-next ${currentPage >= totalPages ? 'trip-table__pagination-next--disabled' : ''}`}
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <span>Sonraki</span>
            <img src={arrowRightIcon} alt="Next" className="trip-table__next-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripTable;
