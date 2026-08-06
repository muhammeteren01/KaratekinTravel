import React, { useState } from 'react';
import { loginApi, registerApi, setAdminToken } from '../services/adminApi';
import './LoginPage.css';

const emptyForm = {
  name: '',
  companyName: '',
  email: '',
  phone: '',
  password: '',
};

function LoginPage({ onAuthenticated }) {
  const [authMode, setAuthMode] = useState('admin');
  const [view, setView] = useState('login');
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = view === 'register'
        ? await registerApi({
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            accountType: authMode === 'company' ? 'company' : 'admin',
            companyName: authMode === 'company' ? form.companyName : undefined,
          })
        : await loginApi(form.email, form.password);

      const token = response?.token || response?.accessToken || response?.data?.token || response?.access_token;

      if (!token) {
        throw new Error('Sunucudan token dönmedi.');
      }

      setAdminToken(token);

      if (authMode === 'company') {
        try {
          localStorage.setItem('travelAdminDashboard.authMode', 'company');
          localStorage.setItem('travelAdminDashboard.companyName', form.companyName || form.name || '');
        } catch {
          // Ignore storage issues in restricted environments.
        }
      } else {
        try {
          localStorage.setItem('travelAdminDashboard.authMode', 'admin');
        } catch {
          // Ignore storage issues in restricted environments.
        }
      }

      if (view === 'register') {
        setSuccess('Kayıt başarılı. Oturum açıldı.');
      }

      onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İşlem başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const title = authMode === 'company' ? 'İşletme / Şirket Girişi' : 'Admin Girişi';
  const subtitle = authMode === 'company'
    ? 'Şirket hesabınızla giriş yapın veya işletme kaydı oluşturun.'
    : 'Yönetim paneline erişmek için giriş yapın.';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="auth-mode-switcher" role="tablist" aria-label="Hesap türü seçimi">
          <button
            type="button"
            className={`auth-mode-button ${authMode === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('admin');
              setError('');
              setSuccess('');
            }}
          >
            Admin
          </button>
          <button
            type="button"
            className={`auth-mode-button ${authMode === 'company' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('company');
              setError('');
              setSuccess('');
            }}
          >
            İşletme / Şirket
          </button>
        </div>

        <h1>{title}</h1>
        <p>{subtitle}</p>

        <div className="auth-toggle-row">
          <button
            type="button"
            className={`auth-toggle ${view === 'login' ? 'active' : ''}`}
            onClick={() => {
              setView('login');
              setError('');
              setSuccess('');
            }}
          >
            Giriş Yap
          </button>
          <button
            type="button"
            className={`auth-toggle ${view === 'register' ? 'active' : ''}`}
            onClick={() => {
              setView('register');
              setError('');
              setSuccess('');
            }}
          >
            Kayıt Ol
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {view === 'register' && authMode === 'company' && (
            <>
              <label className="login-label" htmlFor="companyName">
                Şirket Adı
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Ör. Turizm Yolu A.Ş."
                required
              />
            </>
          )}

          {view === 'register' && (
            <>
              <label className="login-label" htmlFor="name">
                {authMode === 'company' ? 'İletişim Adı' : 'Ad Soyad'}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder={authMode === 'company' ? 'Yetkili kişi adı' : 'Ahmet Yılmaz'}
                required
              />
            </>
          )}

          <label className="login-label" htmlFor="email">
            E-posta
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder={authMode === 'company' ? 'isletme@example.com' : 'admin@example.com'}
            required
          />

          <label className="login-label" htmlFor="phone">
            Telefon (İsteğe bağlı)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="05xx xxx xx xx"
          />

          <label className="login-label" htmlFor="password">
            Şifre
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <button type="submit" disabled={loading}>
            {loading ? (view === 'register' ? 'Kayıt yapılıyor...' : 'Giriş yapılıyor...') : (view === 'register' ? 'Kayıt Ol' : 'Giriş Yap')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
