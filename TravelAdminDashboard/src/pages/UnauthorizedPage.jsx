import React from 'react';
import './UnauthorizedPage.css';
import { DASHBOARD_ROLES } from '../services/adminApi';

const UnauthorizedPage = ({ profile, onLogout }) => (
  <div className="unauth-page">
    <div className="unauth-card">
      <h1 className="unauth-title">Bu hesabın yönetim paneline erişimi yok</h1>
      <p className="unauth-text">
        Panel yalnızca {DASHBOARD_ROLES.join(' ve ')} rolündeki hesaplara açıktır.
        Yetki almak için sistem yöneticinizle iletişime geçin.
      </p>

      <dl className="unauth-details">
        <div>
          <dt>Hesap</dt>
          <dd>{profile?.email || '—'}</dd>
        </div>
        <div>
          <dt>Rol</dt>
          <dd>{profile?.role || '—'}</dd>
        </div>
      </dl>

      <button type="button" className="unauth-button" onClick={onLogout}>
        Çıkış Yap
      </button>
    </div>
  </div>
);

export default UnauthorizedPage;
