import React, { useMemo } from 'react';
import './NewVehicleDefinition.css';
import { SEAT_TEMPLATES, buildSeatGrid, seatNumbers } from '../utils/seatLayoutTemplates';

/**
 * Seçilen aracın koltuk düzenini gösterir.
 *
 * Önceden burada sabit bir 2+1 çizim vardı: hangi araç seçilirse seçilsin
 * aynı görsel çıkıyor, üstündeki etiket ise "(2+2 Otobüs)" yazabiliyordu.
 * Artık düzen aracın kendi busType ve capacity alanlarından kuruluyor.
 */
const VehicleSeatPreview = ({ vehicle }) => {
  const preview = useMemo(() => {
    const busType = vehicle?.busType || '2+1';
    const capacity = Number(vehicle?.capacity) || 0;

    const template = SEAT_TEMPLATES.find((t) => t.busType === busType) || SEAT_TEMPLATES[0];
    const seatsPerRow = Number(template.seatsLeft) + Number(template.seatsRight);

    // Kapasite bilinmiyorsa şablonun tipik uzunluğunda örnek bir düzen çiz.
    return buildSeatGrid(template, capacity > 0 ? capacity : seatsPerRow * 12);
  }, [vehicle]);

  const numbers = useMemo(() => seatNumbers(preview.grid), [preview]);
  const seatCount = useMemo(
    () => (preview.grid || []).flat().filter((cell) => cell === 'seat').length,
    [preview]
  );

  return (
    <div className="nvd-bus-shell">
      <div className="nvd-bus-cap">Şoför · Kapı</div>
      <div className="nvd-bus-rows" style={{ ['--nvd-cols']: preview.cols }}>
        {(preview.grid || []).map((row, r) => (
          <div className="nvd-bus-row" key={`sp-${r}`}>
            {row.map((cell, c) => {
              if (cell === 'aisle') {
                return <div key={`${r}-${c}`} className="nvd-bus-cell is-aisle" />;
              }
              if (cell === 'door') {
                return <div key={`${r}-${c}`} className="nvd-bus-cell is-door" title="Kapı / merdiven" />;
              }
              return (
                <div
                  key={`${r}-${c}`}
                  className={`nvd-bus-cell ${cell === 'seat' ? 'is-seat' : 'is-empty'}`}
                >
                  {cell === 'seat' ? numbers[r]?.[c] : ''}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="nvd-bus-cap is-rear">
        {vehicle?.capacity ? `Arka · ${seatCount} koltuk` : `Arka · örnek düzen (${seatCount} koltuk)`}
      </div>
    </div>
  );
};

export default VehicleSeatPreview;
