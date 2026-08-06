import React from 'react';
import badgeIcon from '../../../assets/icons/pending-badge.svg';
import liraIcon from '../../../assets/icons/icon-lira.svg';
import downloadIcon from '../../../assets/icons/download-pdf.svg';

const PendingRow = ({ date, amount, type }) => (
  <div className="pending-card">
    <div className="pending-left">
      <img src={badgeIcon} alt="pending" className="pending-badge" />
      <div className="pending-info">
        <div className="pending-label">Planlanan Ödeme Tarihi</div>
        <div className="pending-date">{date}</div>
      </div>
      <div className="pending-info">
        <div className="pending-label">Toplam Tutar</div>
        <div className="pending-amount"><img src={liraIcon} alt="₺"/>{amount}</div>
      </div>
      <div className="pending-info">
        <div className="pending-label">Ödeme Türü</div>
        <div className="pending-type">{type}</div>
      </div>
    </div>
    <button className="pending-download">
      <span>PDF İndir</span>
      <img src={downloadIcon} alt="indir" />
    </button>
  </div>
);

const PendingPayments = () => {
  const rows = [
    { date: '08.09.2025', amount: '12.685', type: 'Tur Ücreti' },
    { date: '07.09.2025', amount: '12.685', type: 'Tur Ücreti' },
  ];

  return (
    <div className="pay-card">
      <h3 className="pay-card-title">Bekleyen / Planlanan Ödemeler</h3>
      <div className="pay-card-inner">
        {rows.map((r, i) => (
          <div className="pending-wrapper" key={i}>
            <PendingRow {...r} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingPayments;
