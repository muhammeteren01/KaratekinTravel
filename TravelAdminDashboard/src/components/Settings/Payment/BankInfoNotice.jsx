import React, { useCallback, useEffect, useState } from 'react';
import infoIcon from '../../../assets/icons/help-circle-icon.svg';
import exchangeIcon from '../../../assets/icons/code-comparison.svg';
import BankChangeRequestForm from './BankChangeRequestForm';
import { fetchBankChangeRequestsApi, fetchCompanyBankInfoApi } from '../../../services/adminApi';

const STATUS_LABELS = {
  pending: 'İnceleniyor',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

const formatDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('tr-TR');
};

/**
 * Firmanın yürürlükteki banka bilgileri.
 *
 * Önceden buradaki dört satır koda gömülüydü (sabit bir banka, kişi adı,
 * vergi numarası ve adres). Hangi hesapla girilirse girilsin aynı bilgiler
 * görünüyordu. Artık veriler /api/bank-change-requests/current ucundan,
 * maskeli olarak geliyor.
 */
const BankInfoNotice = () => {
  const [openForm, setOpenForm] = useState(false);
  const [info, setInfo] = useState(null);
  const [lastRequest, setLastRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [current, requests] = await Promise.all([
        fetchCompanyBankInfoApi(),
        fetchBankChangeRequestsApi().catch(() => []),
      ]);

      setInfo(current);
      setLastRequest(Array.isArray(requests) && requests.length ? requests[0] : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Banka bilgileri yüklenemedi.');
      setInfo(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (openForm) {
    return (
      <BankChangeRequestForm
        onCancel={() => setOpenForm(false)}
        onSubmitted={() => {
          setOpenForm(false);
          load();
        }}
        defaults={{
          bank: info?.bankName || '',
          accountHolder: info?.accountHolder || '',
          taxOffice: info?.taxOffice || '',
          address: info?.billingAddress || '',
        }}
      />
    );
  }

  const rows = [
    ['Banka Adı', info?.bankName],
    ['Hesap Sahibi', info?.accountHolder],
    ['IBAN', info?.ibanMasked],
    ['Vergi Dairesi', info?.taxOffice],
    ['Vergi Numarası', info?.taxNumberMasked],
    ['Fatura Adresi', info?.billingAddress],
  ];

  const hasAnyInfo = rows.some(([, value]) => Boolean(value));
  const pending = info?.hasPendingRequest;

  return (
    <div className="pay-card">
      <h3 className="pay-card-title">Banka / Tahsilat Bilgileri</h3>
      <div className="pay-card-body">
        <div className="pay-info-note">
          <img src={infoIcon} alt="" />
          <p>Banka / Tahsilat bilgilerinizi değiştirmek için değişiklik talebi oluşturmanız gerekmektedir.</p>
        </div>

        {loading && <p className="pay-empty">Banka bilgileri yükleniyor...</p>}
        {!loading && error && <p className="pay-empty pay-empty-error">{error}</p>}

        {!loading && !error && (
          <div className="pay-info-panel">
            <div className="bank-info-list">
              {!hasAnyInfo && (
                <p className="pay-empty">
                  Henüz banka bilgisi tanımlanmamış. Tahsilat yapılabilmesi için
                  aşağıdaki düğmeden bilgilerinizi bildirin.
                </p>
              )}

              {hasAnyInfo && rows.map(([label, value]) => (
                <div className="bank-info-row" key={label}>
                  <span className="bank-info-label">{label}:</span>
                  <span className="bank-info-value">{value || '—'}</span>
                </div>
              ))}

              {lastRequest && (
                <div className={`bank-request-status is-${lastRequest.status}`}>
                  <strong>Son talep:</strong>{' '}
                  {STATUS_LABELS[lastRequest.status] || lastRequest.status}
                  {formatDate(lastRequest.createdAt) && ` · ${formatDate(lastRequest.createdAt)}`}
                  {lastRequest.reviewNote && <p className="bank-request-note">{lastRequest.reviewNote}</p>}
                </div>
              )}
            </div>

            <button
              type="button"
              className="bank-action"
              onClick={() => setOpenForm(true)}
              disabled={pending}
              title={pending ? 'Bekleyen bir talebiniz var; sonuçlanmadan yeni talep açılamaz.' : undefined}
            >
              <span>{pending ? 'Talebiniz İnceleniyor' : 'Değişiklik Talep Et'}</span>
              <img src={exchangeIcon} alt="" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankInfoNotice;
