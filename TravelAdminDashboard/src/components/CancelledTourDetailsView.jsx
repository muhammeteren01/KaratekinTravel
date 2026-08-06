import React, { useMemo, useState } from 'react';
import './CancelledTourDetailsView.css';

const InfoCard = ({ icon, title, value, tone = 'blue' }) => {
  return (
    <div className={`ctd-info-card ctd-tone-${tone}`}>
      <div className="ctd-info-icon">
        <img src={icon} alt="icon" />
      </div>
      <div className="ctd-info-content">
        <div className="ctd-info-title">{title}</div>
        <div className="ctd-info-value">{value}</div>
      </div>
    </div>
  );
};

const ParticipantsTable = ({ rows = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, currentPage]);

  return (
    <div className="cancellation-table-container">
      <div className="table-wrapper">
        <table className="cancellation-table">
          <thead>
            <tr>
              <th className="table-header first-col">Adı</th>
              <th className="table-header">Soyadı</th>
              <th className="table-header">Koltuk No</th>
              <th className="table-header">Tutar</th>
              <th className="table-header last-col">Tutar Açıklama</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={`${r.name}-${r.seat}-${i}`} className={i % 2 === 0 ? 'row-even' : 'row-odd'}>
                <td className="table-cell first-col">{r.name}</td>
                <td className="table-cell">{r.surname}</td>
                <td className="table-cell">{r.seat}</td>
                <td className="table-cell">{r.amount}</td>
                <td className="table-cell last-col">{r.note || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <div className="pagination-info">
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 4).map((p) => (
            <button key={p} className={`pagination-btn ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>
              {p}
            </button>
          ))}
        </div>
        <div className="pagination-controls">
          <button className="pagination-nav" onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>
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

const CancelledTourDetailsView = ({ tour, onBack }) => {
  const info = useMemo(() => {
    const tourDate = tour?.cancellationDate?.split(' ')[0] || '';
    return {
      id: tour?.tourId || '-',
      name: tour?.tourName || '-',
      date: tourDate,
      reason: tour?.cancellationReason || '-',
      reasonDate: tourDate
    };
  }, [tour]);

  const participants = useMemo(() => (
    [
      { name: 'Ferhat', surname: 'ÇAKMAKOĞLU', seat: 16, amount: '7.500 TL', note: '-' },
      { name: 'Ferhat', surname: 'ÇAKMAKOĞLU', seat: 17, amount: '7.500 TL', note: '-' },
      { name: 'Şakir', surname: 'AYITKI', seat: 18, amount: '5.500 TL', note: 'Öğrenci İndirimi' },
      { name: 'Şakir', surname: 'AYITKI', seat: 19, amount: '1.250 TL', note: '0-7 Yaş' },
      { name: 'Tunahan', surname: 'KORKMAZ', seat: 20, amount: '-', note: 'Bebek' },
      { name: 'Tunahan', surname: 'KORKMAZ', seat: 21, amount: '7.500 TL', note: '-' },
      { name: 'Zeynep', surname: 'ÖZTÜRK', seat: 22, amount: '7.500 TL', note: '-' },
      { name: 'Ali', surname: 'VELİ', seat: 23, amount: '7.500 TL', note: '-' },
    ]
  ), []);

  return (
    <div className="cancelled-details-container">
      <div className="ctd-back" onClick={onBack} role="button" tabIndex={0}>
        <img src="/icons/arrow-back-left.svg" alt="Geri" />
        <span>Geri</span>
      </div>

    <div className="ctd-section ctd-info">
        <div className="ctd-section-title">İptal Edilen Tur Bilgileri</div>
        <div className="ctd-info-cards">
      <InfoCard icon="/icons/td-bus.svg" title="Tur ID" value={info.id} tone="blue" />
      <InfoCard icon="/icons/td-card-travel.svg" title="Tur Adı / Tarihi" value={`${info.name} / ${info.date}`} tone="yellow" />
          <InfoCard icon="/icons/ctd-cancel.svg" title="İptal Sebebi ve Tarihi" value={`${info.reason} / ${info.reasonDate}`} tone="red" />
        </div>
      </div>

      <div className="ctd-section">
        <div className="ctd-section-title">Katılımcılara Gönderilen Bildirim Mesajı</div>
        <div className="ctd-message-card">Katılımcılara gönderilmiş olan mesaj bu alanda olacak.</div>
      </div>

      <div className="ctd-section">
        <div className="ctd-section-title">Katılımcılar</div>
        <ParticipantsTable rows={participants} />
      </div>
    </div>
  );
};

export default CancelledTourDetailsView;
