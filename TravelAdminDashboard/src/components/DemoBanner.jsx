import React from 'react';
import './DemoBanner.css';
import { DEMO_MODE } from '../services/adminApi';
import { resetDemoDatabase } from '../services/demoServer';

/**
 * Demo modunda ekranda kalıcı bir uyarı: gösterilen verinin gerçek olmadığı
 * hiçbir zaman belirsiz kalmasın.
 */
const DemoBanner = () => {
  if (!DEMO_MODE) return null;

  const handleReset = () => {
    if (!window.confirm('Demo verileri başlangıç durumuna dönecek. Devam edilsin mi?')) return;
    resetDemoDatabase();
    window.location.reload();
  };

  return (
    <div className="demo-banner" role="status">
      <span className="demo-banner-dot" />
      <span>
        <strong>Demo modu.</strong> Backend bağlı değil; veriler tarayıcınızda saklanıyor.
      </span>
      <button type="button" className="demo-banner-reset" onClick={handleReset}>
        Verileri sıfırla
      </button>
    </div>
  );
};

export default DemoBanner;
