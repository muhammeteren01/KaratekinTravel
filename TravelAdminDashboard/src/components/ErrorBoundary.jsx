import React from 'react';
import './ErrorBoundary.css';

/**
 * Tek bir sayfanın render hatası tüm paneli düşürmesin diye kullanılır.
 * resetKey değiştiğinde (ör. sayfa değiştiğinde) hata durumu sıfırlanır,
 * böylece kullanıcı çöken sayfadan çıkınca panele geri dönebilir.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sayfa render edilemedi:', error, errorInfo);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (!error) {
      return this.props.children;
    }

    return (
      <div className="eb-container">
        <div className="eb-card">
          <h2 className="eb-title">Bu sayfa yüklenirken bir hata oluştu</h2>
          <p className="eb-text">
            Sol menüden başka bir sayfaya geçebilir veya sayfayı yenileyebilirsiniz.
            Panelin geri kalanı çalışmaya devam ediyor.
          </p>
          <pre className="eb-detail">{error.message || String(error)}</pre>
          <button type="button" className="eb-button" onClick={this.handleReload}>
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
