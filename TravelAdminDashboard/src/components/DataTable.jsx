import React from 'react';
import './DataTable.css';

const DataTable = ({ rows = [] }) => {
  const data = rows.length ? rows : [
    { id: '—', name: 'Veri yok', price: '—', return: '—', isPositive: true },
  ];

  return (
    <div 
      className="interesting-trips-table"
      style={{ 
        background: '#FAF9FF',
        borderRadius: '16px',
        padding: '24px 14px',
        width: '100%',
        minWidth: '350px',
        height: '369px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <h3 
        className="interesting-trips-title"
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: '600',
          fontSize: '20px',
          color: '#333B69',
          margin: '0 0 20px 0'
        }}
      >
        İlgi Çeken Gezilerim
      </h3>
      
      <div 
        className="interesting-trips-container"
        style={{ 
          background: 'white',
          borderRadius: '25px',
          padding: '24px 26px',
          height: 'calc(100% - 60px)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <div className="interesting-trips-header">
          <div className="trips-header-cell">SL No</div>
          <div className="trips-header-cell">Tur Adı</div>
          <div className="trips-header-cell">Tahmini Ciro</div>
          <div className="trips-header-cell">Puan</div>
        </div>
        
        <div className="interesting-trips-divider"></div>
        
        <div className="interesting-trips-body">
          {data.map((item, index) => (
            <div key={index} className="interesting-trips-row">
              <div className="trips-table-cell">{item.id}</div>
              <div className="trips-table-cell">{item.name}</div>
              <div className="trips-table-cell">{item.price}</div>
              <div className={`trips-table-cell trips-return-cell ${item.isPositive ? 'positive' : 'negative'}`}>
                {item.return}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataTable; 