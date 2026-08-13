import React, { useMemo, useState } from 'react';
import infoIcon from '../../../assets/icons/help-circle-icon.svg';
import backIcon from '../../../assets/icons/arrow-back-left.svg';
import chevronDown from '../../../assets/icons/chevron-down-icon.svg';
import uploadIcon from '../../../assets/icons/download-cloud-02.svg';
import checkIcon from '../../../assets/icons/check-icon.svg';
import { createBankChangeRequestApi } from '../../../services/adminApi';
import { useFeedback } from '../../feedback/feedbackContext';
import {
  IBAN_DIGIT_COUNT,
  TURKISH_BANKS,
  compactIban,
  formatIban,
  ibanDigitCount,
  validateIban,
} from '../../../utils/iban';
import { TR_PROVINCES, validateTaxNumber } from '../../../utils/taxOffices';

// Belgeler base64 olarak gidiyor; büyük dosya isteği şişiriyor.
const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const emptyForm = {
  bank: '',
  accountHolder: '',
  iban: 'TR',
  taxOffice: '',
  taxNo: '',
  address: '',
  reason: '',
};

const BankChangeRequestForm = ({ onCancel, onSubmitted, defaults = {} }) => {
  const { notify } = useFeedback();
  const [form, setForm] = useState({ ...emptyForm, ...defaults });
  const [files, setFiles] = useState({ iban: null, auth: null, tax: null });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  // IBAN yazılırken anında biçimlenir: TR sabit, yalnızca rakam, dörderli
  // gruplar. Önceden alan sınırsız serbest metin kabul ediyordu.
  const onIbanChange = (event) => update('iban', formatIban(event.target.value));

  const ibanDigits = ibanDigitCount(form.iban);

  const updateFile = async (key, file) => {
    if (!file) {
      setFiles((prev) => ({ ...prev, [key]: null }));
      return;
    }

    if (file.size > MAX_DOCUMENT_BYTES) {
      notify(`"${file.name}" 5MB sınırını aşıyor.`, 'warning');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setFiles((prev) => ({ ...prev, [key]: { name: file.name, dataUrl } }));
    } catch {
      notify('Belge okunamadı.', 'error');
    }
  };

  const validate = () => {
    const next = {};

    if (!form.bank) next.bank = 'Banka seçiniz.';
    if (!form.accountHolder.trim()) next.accountHolder = 'Hesap sahibi zorunludur.';

    const ibanCheck = validateIban(form.iban);
    if (!ibanCheck.valid) next.iban = ibanCheck.message;

    if (!form.taxOffice) next.taxOffice = 'Vergi dairesi seçiniz.';

    const taxCheck = validateTaxNumber(form.taxNo);
    if (!taxCheck.valid) next.taxNo = taxCheck.message;

    if (!form.address.trim()) next.address = 'Fatura adresi zorunludur.';
    if (!files.iban) next.ibanDoc = 'Güncel IBAN belgesi zorunludur.';
    if (!files.auth) next.authDoc = 'Firma yetki belgesi zorunludur.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      notify('Formda eksik ya da hatalı alanlar var.', 'warning');
      return;
    }

    setSaving(true);
    try {
      const created = await createBankChangeRequestApi({
        bankName: form.bank,
        accountHolder: form.accountHolder.trim(),
        iban: compactIban(form.iban),
        taxOffice: form.taxOffice,
        taxNumber: form.taxNo.replace(/\D/g, ''),
        billingAddress: form.address.trim(),
        reason: form.reason.trim() || null,
        ibanDocument: files.iban?.dataUrl || null,
        authorizationDocument: files.auth?.dataUrl || null,
        taxCertificate: files.tax?.dataUrl || null,
      });

      notify('Değişiklik talebiniz alındı; admin onayı bekleniyor.', 'success');
      onSubmitted?.(created);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Talep gönderilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const uploadLabel = (file, fallback) => (file ? file.name : fallback);

  const bankOptions = useMemo(() => TURKISH_BANKS, []);

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

        <form onSubmit={handleSubmit} className="bank-form" noValidate>
          <div className="form-grid two">
            <div className="form-field">
              <label htmlFor="bcr-bank">Banka Adı</label>
              <div className="select-wrap">
                <select id="bcr-bank" value={form.bank} onChange={(e) => update('bank', e.target.value)}>
                  <option value="">Banka seçiniz</option>
                  {bankOptions.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
                <img src={chevronDown} alt="" />
              </div>
              {errors.bank && <p className="field-error">{errors.bank}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="bcr-holder">Hesap Sahibi</label>
              <input
                id="bcr-holder"
                type="text"
                placeholder="Firma ya da kişi adı"
                value={form.accountHolder}
                onChange={(e) => update('accountHolder', e.target.value)}
              />
              {errors.accountHolder && <p className="field-error">{errors.accountHolder}</p>}
            </div>
          </div>

          <div className="form-grid two">
            <div className="form-field">
              <label htmlFor="bcr-iban">IBAN No</label>
              <input
                id="bcr-iban"
                className="iban-full"
                inputMode="numeric"
                autoComplete="off"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
                value={form.iban}
                onChange={onIbanChange}
              />
              <p className={`hint ${ibanDigits === IBAN_DIGIT_COUNT ? 'hint-ok' : ''}`}>
                {ibanDigits} / {IBAN_DIGIT_COUNT} hane
              </p>
              {errors.iban && <p className="field-error">{errors.iban}</p>}
            </div>
          </div>

          <div className="form-grid two">
            <div className="form-field">
              <label htmlFor="bcr-taxoffice">Vergi Dairesi (İl)</label>
              <div className="select-wrap">
                <select id="bcr-taxoffice" value={form.taxOffice} onChange={(e) => update('taxOffice', e.target.value)}>
                  <option value="">İl seçiniz</option>
                  {TR_PROVINCES.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                <img src={chevronDown} alt="" />
              </div>
              {errors.taxOffice && <p className="field-error">{errors.taxOffice}</p>}
            </div>
            <div className="form-field">
              <label htmlFor="bcr-taxno">Vergi Numarası</label>
              <input
                id="bcr-taxno"
                type="text"
                inputMode="numeric"
                placeholder="10 haneli vergi no ya da 11 haneli TC"
                value={form.taxNo}
                onChange={(e) => update('taxNo', e.target.value.replace(/\D/g, '').slice(0, 11))}
              />
              {errors.taxNo && <p className="field-error">{errors.taxNo}</p>}
            </div>
          </div>

          <div className="form-grid one">
            <div className="form-field">
              <label htmlFor="bcr-address">Fatura Adresi</label>
              <textarea
                id="bcr-address"
                rows={3}
                placeholder="Vergi levhasındaki adres"
                value={form.address}
                onChange={(e) => update('address', e.target.value)}
              />
              {errors.address && <p className="field-error">{errors.address}</p>}
            </div>
          </div>

          <div className="form-grid three">
            <div className="form-field">
              <label>Güncel IBAN Belgesi</label>
              <p className="hint">Bankadan alınmış, hesap sahibinin adını ve IBAN’ı gösteren belge (PDF veya resim).</p>
              <label className="upload-card">
                <input type="file" accept=".pdf,image/*" onChange={(e) => updateFile('iban', e.target.files?.[0] || null)} />
                <img src={uploadIcon} alt="" />
                <span className="upload-name">{uploadLabel(files.iban, 'Dosya seçilmedi')}</span>
              </label>
              {errors.ibanDoc && <p className="field-error">{errors.ibanDoc}</p>}
            </div>
            <div className="form-field">
              <label>Firma Yetki Belgesi</label>
              <p className="hint">Hesap değişikliğini talep eden kişinin firmayı temsile yetkili olduğunu gösterir resmi belge.</p>
              <label className="upload-card">
                <input type="file" accept=".pdf,image/*" onChange={(e) => updateFile('auth', e.target.files?.[0] || null)} />
                <img src={uploadIcon} alt="" />
                <span className="upload-name">{uploadLabel(files.auth, 'Dosya seçilmedi')}</span>
              </label>
              {errors.authDoc && <p className="field-error">{errors.authDoc}</p>}
            </div>
            <div className="form-field">
              <label>Vergi Levhası</label>
              <p className="hint">Güncel vergi levhası (hesap sahibi ile firma bilgilerinin eşleşmesi için).</p>
              <label className="upload-card">
                <input type="file" accept=".pdf,image/*" onChange={(e) => updateFile('tax', e.target.files?.[0] || null)} />
                <img src={uploadIcon} alt="" />
                <span className="upload-name">{uploadLabel(files.tax, 'Dosya seçilmedi')}</span>
              </label>
            </div>
          </div>

          <div className="form-grid one">
            <div className="form-field">
              <label htmlFor="bcr-reason">Talep Nedeni</label>
              <textarea
                id="bcr-reason"
                rows={3}
                placeholder="Değişikliğin sebebini kısaca yazın"
                value={form.reason}
                onChange={(e) => update('reason', e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-save" disabled={saving}>
              <span>{saving ? 'Gönderiliyor...' : 'Talebi Kaydet'}</span>
              <img src={checkIcon} alt="" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankChangeRequestForm;
