import React, { useMemo, useState } from 'react';
import downloadIcon from '../../../assets/icons/download-pdf.svg';
import iconCalendar from '../../../assets/icons/header-calendar.svg';
import iconFolder from '../../../assets/icons/header-folder.svg';
import iconChange from '../../../assets/icons/header-change.svg';
import iconInvoice from '../../../assets/icons/header-invoice.svg';
import { formatCurrency, formatDisplayDateTime } from '../../../utils/reportDates';

const STATUS_LABELS = {
  completed: { text: 'Tamamlandı', cls: 'change-positive' },
  pending: { text: 'Bekliyor', cls: 'change-neutral' },
  failed: { text: 'Başarısız', cls: 'change-negative' },
  refunded: { text: 'İade edildi', cls: 'change-negative' },
};

/**
 * Not: Bu tabloda önceden "DEĞİŞİM" diye bir yüzde sütunu vardı (+%100, -%15).
 * Ödeme kaydında böyle bir alan yok, değerler uydurmaydı; yerine gerçekten
 * tutulan ödeme durumu gösteriliyor.
 */
const PaymentHistory = ({ payments = [], loading = false, error = '' }) => {
  const [page, setPage] = useState(1);
  const pageSize = 4;

  const allRows = useMemo(
    () =>
      payments.map((payment) => ({
        id: payment.id,
        date: formatDisplayDateTime(payment.paidAt || payment.createdAt),
        amount: formatCurrency(payment.amount, payment.currency),
        status: STATUS_LABELS[payment.status] || { text: payment.status || '—', cls: 'change-neutral' },
      })),
    [payments],
  );

  const totalPages = Math.max(1, Math.ceil(allRows.length / pageSize));
  const rows = useMemo(
    () => allRows.slice((page - 1) * pageSize, page * pageSize),
    [allRows, page],
  );

  return (
    <div className="pay-card">
      <h3 className="pay-card-title">Ödeme Geçmişi</h3>
      <div className="pay-card-inner">
        {loading && <p className="pay-empty">Yükleniyor...</p>}
        {!loading && error && <p className="pay-empty pay-empty-error">{error}</p>}
        {!loading && !error && !allRows.length && (
          <p className="pay-empty">Henüz ödeme kaydı yok.</p>
        )}
        {!loading && !error && allRows.length > 0 && (
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
              <div key={row.id} className={`figma-data-cell ${i % 2 ? 'alt' : ''}`}>
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
              <div key={row.id} className={`figma-data-cell ${i % 2 ? 'alt' : ''}`}>
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
                  <span>DURUM</span>
                </div>
              </div>
            </div>
            {rows.map((row, i) => (
              <div key={row.id} className={`figma-data-cell change-cell ${i % 2 ? 'alt' : ''}`}>
                <div className="figma-single-selector">
                  <div className="figma-multiple-selector">
                    <div className={`figma-change-pill ${row.status.cls}`}>
                      <span>{row.status.text}</span>
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
              <div key={row.id} className={`figma-data-cell ${i % 2 ? 'alt' : ''}`}>
                <div className="figma-single-selector">
                  {/* Fatura ucu API'de yok; tıklanabilir görünmemeli. */}
                  <div className="figma-selector figma-selector-disabled" title="Fatura indirme henüz hazır değil; API'de belge ucu yok.">
                    <div className="figma-selector-text" aria-hidden="true">
                      <span className="line1">İndir</span>
                    </div>
                    <img src={downloadIcon} alt="" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
        {allRows.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
