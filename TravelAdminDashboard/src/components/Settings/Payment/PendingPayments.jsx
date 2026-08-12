import React from 'react';
import downloadIcon from '../../../assets/icons/download-pdf.svg';
import { formatCurrency, formatDisplayDateTime } from '../../../utils/reportDates';

const PendingRow = ({ date, amount, type }) => (
  <div className="pending-row">
    <div className="pending-info">
      <span className="pending-date">{date}</span>
      <span className="pending-type">{type}</span>
    </div>
    <span className="pending-amount">{amount}</span>
    <button type="button" className="pending-download" aria-label="Belgeyi indir">
      <img src={downloadIcon} alt="" />
    </button>
  </div>
);

const PendingPayments = ({ payments = [], loading = false, error = '' }) => {
  const rows = payments.map((payment) => ({
    id: payment.id,
    date: formatDisplayDateTime(payment.createdAt),
    amount: formatCurrency(payment.amount, payment.currency),
    type: payment.method === 'transfer' ? 'Havale' : 'Tur Ücreti',
  }));

  return (
    <div className="pay-card">
      <h3 className="pay-card-title">Bekleyen / Planlanan Ödemeler</h3>
      <div className="pay-card-inner">
        {loading && <p className="pay-empty">Yükleniyor...</p>}
        {!loading && error && <p className="pay-empty pay-empty-error">{error}</p>}
        {!loading && !error && !rows.length && (
          <p className="pay-empty">Bekleyen ödeme bulunmuyor.</p>
        )}
        {rows.map((row) => (
          <div className="pending-wrapper" key={row.id}>
            <PendingRow {...row} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingPayments;
