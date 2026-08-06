import React, { useState } from 'react';
import infoIcon from '../../../assets/icons/help-circle-icon.svg';
import backIcon from '../../../assets/icons/arrow-back-left.svg';
import chevronDown from '../../../assets/icons/chevron-down-icon.svg';
import uploadIcon from '../../../assets/icons/download-cloud-02.svg';
import checkIcon from '../../../assets/icons/check-icon.svg';

const BankChangeRequestForm = ({ onCancel, onSubmit }) => {
  const [form, setForm] = useState({
    bank: 'Ziraat Bankası',
    accountHolder: 'Tunahan KORKMAZ',
    ibanCountry: 'TR',
    iban: '',
    taxOffice: '',
    taxNo: '',
    address: '',
    reason: '',
    files: { iban: null, auth: null, tax: null },
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const updateFile = (k, file) => setForm(prev => ({ ...prev, files: { ...prev.files, [k]: file } }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(form);
  };

  return (
    <div className="bank-form-wrapper">
      <div className="bank-form-header">
        <button type="button" className="bank-back" onClick={onCancel} aria-label="Geri">
          <img src={backIcon} alt="geri" />
        </button>
        <h3 className="bank-form-title">Banka / Tahsilat Bilgileri Değişiklik Talebi</h3>
      </div>

      <div className="bank-form-inner">
        <div className="bank-form-note">
          <img src={infoIcon} alt="info" />
          <div>
            <p>Banka veya tahsilat bilgilerinizi değiştirmek için bu formu doldurun. Talebiniz, güvenlik amacıyla sistem yöneticisi tarafından incelenecek ve onaylandığında geçerli olacaktır.</p>
            <p className="muted"><strong>Tahmini onay süresi: 1–3 iş günü.</strong></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bank-form">
          <div className="form-grid two">
            <div className="form-field">
              <label>Banka Adı</label>
              <div className="select-wrap">
                <select value={form.bank} onChange={e => update('bank', e.target.value)}>
                  <option>Ziraat Bankası</option>
                  <option>İş Bankası</option>
                  <option>Garanti BBVA</option>
                </select>
                <img src={chevronDown} alt="aç" />
              </div>
            </div>
            <div className="form-field">
              <label>Hesap Sahibi</label>
              <input type="text" value={form.accountHolder} onChange={e => update('accountHolder', e.target.value)} />
            </div>
          </div>

          <div className="form-grid two">
            <div className="form-field">
              <label>IBAN No</label>
              <div className="iban-group">
                <input className="iban-country" value={form.ibanCountry} disabled readOnly />
                <input className="iban" placeholder="IBAN" value={form.iban} onChange={e => update('iban', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="form-grid two">
            <div className="form-field">
              <label>Vergi Dairesi</label>
              <div className="select-wrap">
                <select value={form.taxOffice} onChange={e => update('taxOffice', e.target.value)}>
                  <option value="">Daire</option>
                  <option>Ankara</option>
                  <option>İstanbul</option>
                </select>
                <img src={chevronDown} alt="aç" />
              </div>
            </div>
            <div className="form-field">
              <label>Vergi Numarası</label>
              <input type="text" placeholder="12465764" value={form.taxNo} onChange={e => update('taxNo', e.target.value)} />
            </div>
          </div>

          <div className="form-grid one">
            <div className="form-field">
              <label>Fatura Adresi</label>
              <textarea rows={3} placeholder="" value={form.address} onChange={e => update('address', e.target.value)} />
            </div>
          </div>

          <div className="form-grid three">
            <div className="form-field">
              <label>Güncel IBAN Belgesi</label>
              <p className="hint">Bankadan alınmış, hesap sahibinin adını ve IBAN’ı gösteren belge (PDF veya resim).</p>
              <label className="upload-card">
                <input type="file" accept=".pdf,image/*" onChange={e => updateFile('iban', e.target.files?.[0] || null)} />
                <img src={uploadIcon} alt="yükle" />
              </label>
            </div>
            <div className="form-field">
              <label>Firma Yetki Belgesi</label>
              <p className="hint">Hesap değişikliğini talep eden kişinin firmayı temsile yetkili olduğunu gösterir resmi belge.</p>
              <label className="upload-card">
                <input type="file" accept=".pdf,image/*" onChange={e => updateFile('auth', e.target.files?.[0] || null)} />
                <img src={uploadIcon} alt="yükle" />
              </label>
            </div>
            <div className="form-field">
              <label>Vergi Levhası</label>
              <p className="hint">Güncel vergi levhası (hesap sahibi ile firma bilgilerinin eşleşmesi için).</p>
              <label className="upload-card">
                <input type="file" accept=".pdf,image/*" onChange={e => updateFile('tax', e.target.files?.[0] || null)} />
                <img src={uploadIcon} alt="yükle" />
              </label>
            </div>
          </div>

          <div className="form-grid one">
            <div className="form-field">
              <label>Talep Nedeni</label>
              <textarea rows={3} value={form.reason} onChange={e => update('reason', e.target.value)} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save">
              <span>Talebi Kaydet</span>
              <img src={checkIcon} alt="kaydet" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankChangeRequestForm;
