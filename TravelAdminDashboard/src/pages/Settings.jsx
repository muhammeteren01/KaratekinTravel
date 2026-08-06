import React, { useEffect, useState } from 'react';
import './Settings.css';
import { FormField } from '../components';
import ProfilePhotoUploader from '../components/Settings/ProfilePhotoUploader';
import BankInfoNotice from '../components/Settings/Payment/BankInfoNotice';
import PaymentHistory from '../components/Settings/Payment/PaymentHistory';
import PendingPayments from '../components/Settings/Payment/PendingPayments';
import {
  changePasswordApi,
  fetchMeApi,
  updateUserProfileApi,
} from '../services/adminApi';

const Tabs = {
  COMPANY: 'Firma Bilgileri',
  ACCOUNT: 'Hesap ve Güvenlik',
  PAYMENT: 'Ödeme Bilgileri',
};

const TabNav = ({ active, onChange }) => {
  const tabs = [Tabs.COMPANY, Tabs.ACCOUNT, Tabs.PAYMENT];
  return (
    <div className="settings-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`settings-tab ${active === tab ? 'active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const CompanyInfoForm = ({ profile, loading, saving, error, success, onSave }) => {
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    taxNumber: '',
    taxOffice: '',
    address: '',
    about: '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm((prev) => ({
      ...prev,
      companyName: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      address: profile.location || '',
    }));
  }, [profile]);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="settings-section">
      {error && <div className="table-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}
      {loading && <div style={{ marginBottom: 12, color: '#718EBF' }}>Profil yükleniyor...</div>}

      <div className="settings-grid">
        <div className="settings-col left">
          <ProfilePhotoUploader />
        </div>
        <div className="settings-col right">
          <div className="settings-form-grid">
            <FormField label="Firma Adı" placeholder="Örn. Karatekin Travel" value={form.companyName} onChange={onChange('companyName')} required />
            <FormField label="E-posta" type="email" placeholder="mail@firma.com" value={form.email} onChange={onChange('email')} required />
            <FormField label="Telefon" placeholder="(5XX) XXX XX XX" value={form.phone} onChange={onChange('phone')} />
            <FormField label="Web Sitesi" placeholder="https://" value={form.website} onChange={onChange('website')} />
            <FormField label="Vergi No" placeholder="Vergi numarası" value={form.taxNumber} onChange={onChange('taxNumber')} />
            <FormField label="Vergi Dairesi" placeholder="Vergi dairesi" value={form.taxOffice} onChange={onChange('taxOffice')} />
            <FormField label="Adres" type="textarea" placeholder="Firmanın açık adresi" value={form.address} onChange={onChange('address')} />
            <FormField 
              label="Hakkında" 
              type="textarea" 
              placeholder="Firma hakkında kısa açıklama" 
              value={form.about} 
              onChange={onChange('about')}
              helperText="Bu alan kullanıcılar firmanızın profilini ziyaret ettiğinde görünecektir. Firmanız ile ilgili bilgiler verebilirsiniz."
            />
          </div>
        </div>
      </div>
      <div className="settings-actions">
        <button className="btn btn-secondary" type="button" onClick={() => profile && setForm({
          companyName: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          website: '',
          taxNumber: '',
          taxOffice: '',
          address: profile.location || '',
          about: '',
        })}>İptal</button>
        <button className="btn btn-primary" type="button" disabled={saving || loading || !profile?.id} onClick={() => onSave(form)}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
};

const AccountSecurityForm = ({ profile, loading, saving, error, success, onSavePassword }) => {
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFA: false,
    loginAlerts: false,
  });

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSave = () => {
    if (!form.currentPassword || !form.newPassword) {
      alert('Mevcut ve yeni şifre zorunludur.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor.');
      return;
    }
    onSavePassword({
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });
  };

  return (
    <div className="settings-section">
      {error && <div className="table-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}
      {loading && <div style={{ marginBottom: 12, color: '#718EBF' }}>Hesap bilgileri yükleniyor...</div>}

      <div className="settings-group">
        <h4 className="settings-group-title">Hesap</h4>
        <p className="settings-group-hint">{profile?.email || '—'} · {profile?.role || '—'}</p>
      </div>

      <div className="settings-group">
        <h4 className="settings-group-title">Şifre Değiştir</h4>
        <div className="settings-form-grid three">
          <FormField label="Mevcut Şifre" type="password" placeholder="••••••••" value={form.currentPassword} onChange={onChange('currentPassword')} />
          <FormField label="Yeni Şifre" type="password" placeholder="••••••••" value={form.newPassword} onChange={onChange('newPassword')} />
          <FormField label="Yeni Şifre (Tekrar)" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={onChange('confirmPassword')} />
        </div>
        <p className="settings-group-hint">Güçlü bir şifre en az 8 karakter, bir büyük harf ve bir rakam içermelidir.</p>
      </div>

      <div className="settings-group">
        <h4 className="settings-group-title">Güvenlik</h4>
        <div className="settings-toggle-row">
          <div className="settings-toggle-texts">
            <span className="settings-toggle-title">İki Aşamalı Doğrulama</span>
            <span className="settings-toggle-desc">Hesabınızı ek bir doğrulama yöntemi ile koruyun.</span>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={form.twoFA} onChange={onChange('twoFA')} />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="settings-toggle-row">
          <div className="settings-toggle-texts">
            <span className="settings-toggle-title">Giriş Bildirimleri</span>
            <span className="settings-toggle-desc">Yeni bir cihazdan oturum açıldığında e‑posta gönder.</span>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={form.loginAlerts} onChange={onChange('loginAlerts')} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn btn-secondary" type="button" onClick={() => setForm((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))}>İptal</button>
        <button className="btn btn-primary" type="button" disabled={saving || loading} onClick={handleSave}>
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
};

const PaymentInfoForm = () => {
  return (
    <div className="settings-section">
      <BankInfoNotice />
      <PaymentHistory />
      <PendingPayments />
    </div>
  );
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState(Tabs.COMPANY);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let alive = true;

    fetchMeApi()
      .then((response) => {
        if (alive) setProfile(response);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Profil yüklenemedi.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const handleSaveProfile = async (form) => {
    if (!profile?.id) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const updated = await updateUserProfileApi(profile.id, {
        id: profile.id,
        name: form.companyName,
        email: form.email,
        phone: form.phone || null,
        location: form.address || null,
        avatar: profile.avatar || null,
      });
      setProfile(updated);
      setSuccess('Profil bilgileri kaydedildi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async ({ currentPassword, newPassword }) => {
    if (!profile?.id) return;

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await changePasswordApi(profile.id, { currentPassword, newPassword });
      setSuccess('Şifre başarıyla güncellendi.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre güncellenemedi.');
    } finally {
      setSaving(false);
    }
  };

  const renderActive = () => {
    switch (activeTab) {
      case Tabs.COMPANY:
        return (
          <CompanyInfoForm
            profile={profile}
            loading={loading}
            saving={saving}
            error={error}
            success={success}
            onSave={handleSaveProfile}
          />
        );
      case Tabs.ACCOUNT:
        return (
          <AccountSecurityForm
            profile={profile}
            loading={loading}
            saving={saving}
            error={error}
            success={success}
            onSavePassword={handleSavePassword}
          />
        );
      case Tabs.PAYMENT:
        return <PaymentInfoForm />;
      default:
        return null;
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-card">
        <TabNav active={activeTab} onChange={(tab) => { setActiveTab(tab); setError(''); setSuccess(''); }} />
        <div className="settings-card-body">
          {renderActive()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
