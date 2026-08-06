import React, { useMemo, useState } from 'react';
import downloadIcon from '../../../assets/icons/download-pdf.svg';
import iconCalendar from '../../../assets/icons/header-calendar.svg';
import iconFolder from '../../../assets/icons/header-folder.svg';
import iconChange from '../../../assets/icons/header-change.svg';
import iconInvoice from '../../../assets/icons/header-invoice.svg';

const PaymentHistory = () => {
  // Full dataset (replicated for functional pagination)
  const allRows = useMemo(() => {
    const base = [
      { date: '18.06.2025 - 19:10', amount: '10.000 TL', change: { type: 'positive', value: '+ %100' }, action: true },
      { date: '18.06.2025 - 19:10', amount: '5.000 TL', change: { type: 'negative', value: '- %15' }, action: true },
      { date: '18.06.2025 - 19:10', amount: '5.500 TL', change: { type: 'positive', value: '+ %45' }, action: true },
      { date: '18.06.2025 - 19:10', amount: '3.450 TL', change: { type: 'neutral', value: 'değişim yok' }, action: true },
    ];
    // create 16 rows to have 4 pages
    const out = [];
    for (let i = 0; i < 4; i++) out.push(...base);
    return out;
  }, []);

  const pageSize = 4;
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(allRows.length / pageSize);
  const rows = useMemo(() => allRows.slice((page - 1) * pageSize, page * pageSize), [allRows, page]);

  const getChangeClass = (type) => {
    switch (type) {
      case 'positive': return 'change-positive';
      case 'negative': return 'change-negative';
      case 'neutral': return 'change-neutral';
      default: return '';
    }
  };

  return (
    <div className="pay-card">
      <h3 className="pay-card-title">Ödeme Geçmişi</h3>
      <div className="pay-card-inner">
        <div className="figma-payment-table">
          {/* Date Column */}
          <div className="figma-col-date">
            <div className="figma-header-cell">
              <div className="figma-header-content">
                <div className="figma-icon-heading">
                  <img className="figma-header-icon" src={iconCalendar} alt="takvim" width={20} height={20} />
                  <span>ÖDEME</span>
                </div>
              </div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={`figma-data-cell ${i % 2 ? 'alt' : ''}`}>
                <div className="figma-cell-content">
                  <div className="figma-document">
                    <span>{row.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Amount Column */}
          <div className="figma-col-amount">
            <div className="figma-header-cell">
              <div className="figma-header-content">
                <div className="figma-icon-heading">
                  <img className="figma-header-icon" src={iconFolder} alt="tutar" width={20} height={20} />
                  <span>TUTAR</span>
                </div>
              </div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={`figma-data-cell ${i % 2 ? 'alt' : ''}`}>
                <div className="figma-cell-content">
                  <div className="figma-document">
                    <span>{row.amount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Change Column */}
          <div className="figma-col-change">
            <div className="figma-header-cell">
              <div className="figma-header-content">
                <div className="figma-icon-heading">
                  <img className="figma-header-icon" src={iconChange} alt="değişim" width={18} height={12} />
                  <span>DEĞİŞİM</span>
                </div>
              </div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={`figma-data-cell change-cell ${i % 2 ? 'alt' : ''}`}>
                <div className="figma-single-selector">
                  <div className="figma-multiple-selector">
                    <div className={`figma-change-pill ${getChangeClass(row.change.type)}`}>
                      <span>{row.change.value}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Invoice Column */}
          <div className="figma-col-invoice">
            <div className="figma-header-cell">
              <div className="figma-header-content">
                <div className="figma-icon-heading">
                  <img className="figma-header-icon" src={iconInvoice} alt="fatura" width={12} height={15} />
                  <span>FATURA</span>
                </div>
              </div>
            </div>
            {rows.map((row, i) => (
              <div key={i} className={`figma-data-cell ${i % 2 ? 'alt' : ''}`}>
                <div className="figma-single-selector">
                  <div className="figma-selector" role="button">
                    <div className="figma-selector-text" aria-hidden="true">
                      <span className="line1">İndir</span>
                    </div>
                    <img src={downloadIcon} alt="indir" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="pay-chips" role="navigation" aria-label="Sayfalandırma">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const p = idx + 1;
            const active = p === page;
            return (
              <button
                key={p}
                type="button"
                className={`chip ${active ? 'chip-solid' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
