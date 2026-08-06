import React, { useState } from 'react';
import infoIcon from '../../../assets/icons/help-circle-icon.svg';
import exchangeIcon from '../../../assets/icons/code-comparison.svg';
import BankChangeRequestForm from './BankChangeRequestForm';

const BankInfoNotice = () => {
  const [openForm, setOpenForm] = useState(false);

  if (openForm) {
    return (
      <BankChangeRequestForm onCancel={() => setOpenForm(false)} onSubmit={() => setOpenForm(false)} />
    );
  }

  return (
    <div className="pay-card">
      <h3 className="pay-card-title">Banka / Tahsilat Bilgileri</h3>
      <div className="pay-card-body">
        <div className="pay-info-note">
          <img src={infoIcon} alt="info" />
          <p>Banka / Tahsilat bilgilerinizi değiştirmek için değişiklik talebi oluşturmanız gerekmektedir.</p>
        </div>

        <div className="pay-info-panel">
          <div className="bank-info-list">
            <div className="bank-info-row">
              <span className="bank-info-label">Banka Adı:</span>
              <span className="bank-info-value">Ziraat Bankası</span>
            </div>
            <div className="bank-info-row">
              <span className="bank-info-label">Hesap Sahibi:</span>
              <span className="bank-info-value">Tunahan KORKMAZ</span>
            </div>
            <div className="bank-info-row">
              <span className="bank-info-label">Vergi Numarası:</span>
              <span className="bank-info-value">124******125</span>
            </div>
            <div className="bank-info-row">
              <span className="bank-info-label">Fatura Adresi:</span>
              <span className="bank-info-value">X Mahallesi Y Caddesi 18100 Merkez/Çankırı</span>
            </div>
          </div>
          <button type="button" className="bank-action" onClick={() => setOpenForm(true)}>
            <span>Değişiklik Talep Et</span>
            <img src={exchangeIcon} alt="değişiklik talebi" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BankInfoNotice;
