import React from 'react';
import './RouteStops.css';

const RouteStops = ({
  stops,
  onRemove,
  onMoveUp,
  onMoveDown,
  // Optional drag & drop integration
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  draggedIndex,
  dragOverIndex,
  // touch support (optional)
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  // sub-stop actions removed (Ara Durak feature deprecated)
}) => {
  return (
    <div className="rs-wrap">
      <h3 className="rs-title">Eklenen Duraklar</h3>
      <div className="rs-list">
        {(!stops || stops.length===0) && (
          <div className="rs-card">
            <div className="rs-main"><div className="rs-name" style={{fontWeight:500,color:'#6b7280'}}>Henüz durak eklenmedi. Haritadan veya aramadan ekleyin.</div></div>
          </div>
        )}
        {stops.map((stop, idx) => (
          <div
            key={stop.id}
            className={`rs-card ${draggedIndex === idx ? 'dragging' : ''} ${dragOverIndex === idx ? 'drag-over' : ''}`}
            draggable={typeof onDragStart === 'function'}
            onDragStart={e => onDragStart && onDragStart(e, idx)}
            onDragOver={e => onDragOver && onDragOver(e, idx)}
            onDragLeave={() => onDragLeave && onDragLeave()}
            onDrop={e => onDrop && onDrop(e, idx)}
            onDragEnd={() => onDragEnd && onDragEnd()}
            onTouchStart={e => onTouchStart && onTouchStart(e, idx)}
            onTouchMove={e => onTouchMove && onTouchMove(e)}
            onTouchEnd={e => onTouchEnd && onTouchEnd(e)}
          >
            <div className="rs-header">
              <span className="rs-chip chip-orange">{idx+1}. Durak</span>
              {/* Durağın hangi tur gününe düştüğü; çok günlü turlarda saat
                  tek başına yeterli değildi. */}
              {stop.day > 0 && <span className="rs-chip chip-day">{stop.day}. Gün</span>}
              <div className="rs-actions">
                <button className={`rs-icon circle ${idx===stops.length-1 ? 'disabled' : ''}`} onClick={()=>onMoveDown(idx)} title="Aşağı Taşı" disabled={idx===stops.length-1}>↓</button>
                <button className={`rs-icon circle ${idx===0 ? 'disabled' : ''}`} onClick={()=>onMoveUp(idx)} title="Yukarı Taşı" disabled={idx===0}>↑</button>
                <button className="rs-icon circle danger" onClick={()=>onRemove(stop.id)} title="Sil">🗑</button>
              </div>
            </div>
            <div className="rs-main">
              <div className="rs-name">{stop.name} -</div>
              {stop.time && <div className="rs-time">{stop.time}</div>}
            </div>

            {/* Ara Durak özelliği kaldırıldı */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RouteStops;
