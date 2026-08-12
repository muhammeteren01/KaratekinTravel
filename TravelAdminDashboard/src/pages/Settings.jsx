import React, { useEffect, useState } from 'react';
import './Settings.css';
import { FormField } from '../components';
import ProfilePhotoUploader from '../components/Settings/ProfilePhotoUploader';
import BankInfoNotice from '../components/Settings/Payment/BankInfoNotice';
import PaymentHistory from '../components/Settings/Payment/PaymentHistory';
import PendingPayments from '../components/Settings/Payment/PendingPayments';
import {
  changePasswordApi,
  fetchCompanyByIdApi,
  fetchMeApi,
  updateCompanyApi,
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

const emptyCompanyForm = {
  companyName: '',
  phone: '',
  address: '',
  about: '',
};

/**
 * Not: Form yalnızca API'nin gerçekten kaydettiği alanları içerir.
 * - companyName / address / about → PUT /api/companies/{id} (UpdateCompanyDto)
 * - phone / address → PUT /api/users/{id} (UpdateUserDto)
 * Web sitesi, vergi no ve vergi dairesi alanları kaldırıldı: ne User ne de Company
 * modelinde karşılıkları var, doldurulduğunda sessizce kayboluyorlardı.
 * E-posta salt okunur; UpdateUserDto e-posta alanını yok sayıyor.
 */
const CompanyInfoForm = ({ profile, company, loading, saving, error, success, onSave }) => {
  const [form, setForm] = useState(emptyCompanyForm);

  const buildFormState = () => ({
    companyName: company?.name || profile?.name || '',
    phone: profile?.phone || '',
    address: company?.location || profile?.location || '',
    about: company?.about || '',
  });

  useEffect(() => {
    if (!profile) return;
    setForm(buildFormState());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, company]);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="settings-section">
      {error && <div className="table-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}
      {loading && <div style={{ marginBottom: 12, color: '#718EBF' }}>Profil yükleniyor...</div>}

      <div className="settings-grid">
        <div className="settings-col left">
          <ProfilePhotoUploader
            initialSrc={profile?.avatar || undefined}
            disabledReason="Görsel yükleme ucu henüz hazır değil; seçtiğiniz fotoğraf yalnızca önizlemede görünür."
          />
        </div>
        <div className="settings-col right">
          <div className="settings-form-grid">
            <FormField label="Firma Adı" placeholder="Örn. Karatekin Travel" value={form.companyName} onChange={onChange('companyName')} required />
            <FormField
              label="E-posta"
              type="email"
              value={profile?.email || ''}
              onChange={() => {}}
              disabled
              helperText="E-posta adresi panelden değiştirilemez."
            />
            <FormField label="Telefon" placeholder="(5XX) XXX XX XX" value={form.phone} onChange={onChange('phone')} />
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
        <button className="btn btn-secondary" type="button" onClick={() => setForm(buildFormState())}>İptal</button>
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
  });

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

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

      {/*
        "İki Aşamalı Doğrulama" ve "Giriş Bildirimleri" anahtarları kaldırıldı:
        yalnızca lokal state'i değiştiriyorlardı, hiçbir uca yazılmıyorlardı.
        API bu ayarları desteklediğinde (User modelinde karşılık alanlar + uç)
        geri eklenmeli.
      */}

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
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let alive = true;

    const loadProfile = async () => {
      try {
        const me = await fetchMeApi();
        if (!alive) return;
        setProfile(me);

        if (me?.companyId) {
          // Firma alanları (ad, adres, hakkında) User değil Company kaydında tutuluyor.
          const companyRecord = await fetchCompanyByIdApi(me.companyId).catch(() => null);
          if (alive) setCompany(companyRecord);
        }
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Profil yüklenemedi.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadProfile();

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

      const updatedUser = await updateUserProfileApi(profile.id, {
        name: form.companyName,
        phone: form.phone || null,
        location: form.address || null,
        avatar: profile.avatar || null,
      });
      setProfile((prev) => ({ ...prev, ...updatedUser }));

      // Firma kaydı varsa ad/adres/hakkında oraya da yazılmalı; aksi halde
      // kullanıcı profilinde kalır ve firma profilinde görünmez.
      if (profile.companyId) {
        const updatedCompany = await updateCompanyApi(profile.companyId, {
          name: form.companyName,
          location: form.address || null,
          about: form.about || null,
        });
        setCompany((prev) => ({ ...prev, ...updatedCompany }));
      }

      setSuccess('Firma bilgileri kaydedildi.');
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
            company={company}
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
