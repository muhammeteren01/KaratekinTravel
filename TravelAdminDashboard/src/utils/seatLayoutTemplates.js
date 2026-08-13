/** Shared coach seat templates for VehicleDesign + NewVehicleDefinition. */

export const SEAT_TEMPLATES = [
  {
    id: '2plus1',
    label: '2+1 Standart',
    description: 'Klasik şehirler arası otobüs',
    busType: '2+1',
    seatsLeft: 2,
    seatsRight: 1,
    hint: 'Solda 2, sağda 1 koltuk',
  },
  {
    id: '2plus2',
    label: '2+2 Standart',
    description: 'Geniş koridorlu düzen',
    busType: '2+2',
    seatsLeft: 2,
    seatsRight: 2,
    hint: 'Her iki yanda 2 koltuk',
  },
  {
    id: '1plus1',
    label: '1+1 VIP',
    description: 'Geniş VIP koltuklar',
    busType: '1+1',
    seatsLeft: 1,
    seatsRight: 1,
    hint: 'Dar ama konforlu',
  },
  {
    id: '3plus2',
    label: '3+2 Ekonomik',
    description: 'Yüksek kapasiteli düzen',
    busType: '3+2',
    seatsLeft: 3,
    seatsRight: 2,
    hint: 'Satırda 5 koltuk',
  },
];

export function buildSeatGrid(template, capacity) {
  const seatsLeft = Number(template.seatsLeft || 2);
  const seatsRight = Number(template.seatsRight || 1);
  const seatsPerRow = seatsLeft + seatsRight;
  const cols = seatsPerRow + 1;
  const rows = Math.max(1, Math.ceil(capacity / seatsPerRow));
  const grid = [];
  let remaining = capacity;

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let i = 0; i < seatsLeft; i++) {
      if (remaining > 0) {
        row.push('seat');
        remaining -= 1;
      } else {
        row.push('empty');
      }
    }
    row.push('aisle');
    for (let i = 0; i < seatsRight; i++) {
      if (remaining > 0) {
        row.push('seat');
        remaining -= 1;
      } else {
        row.push('empty');
      }
    }
    grid.push(row);
  }

  return { rows, cols, seatsLeft, seatsRight, grid };
}

/**
 * Hücre tipleri: koltuk, koridor, kapı/merdiven boşluğu, boş.
 *
 * "kapi" tipi sonradan eklendi: orta kapı ve merdiven boşluğu
 * tanımlanamıyordu, düzende o alan da koltukmuş gibi görünüyordu.
 * API'ye Türkçe anahtarlarla gidiyor; eski kayıtlarla uyum için
 * İngilizce karşılıklar da okunuyor.
 */
export const CELL_TYPES = {
  seat: 'koltuk',
  aisle: 'koridor',
  door: 'kapi',
  empty: 'empty',
};

export function encodeCellType(type) {
  return CELL_TYPES[type] || 'empty';
}

export function decodeCellType(raw) {
  switch (raw) {
    case 'koltuk':
    case 'seat':
      return 'seat';
    case 'koridor':
    case 'aisle':
      return 'aisle';
    case 'kapi':
    case 'kapı':
    case 'door':
    case 'merdiven':
      return 'door';
    default:
      return 'empty';
  }
}

export function parseLayoutGrid(layout) {
  if (!layout) return null;
  let seatMap = [];
  try {
    seatMap = JSON.parse(layout.seatMapJson || '[]');
  } catch {
    seatMap = [];
  }

  const seatsLeft = Number(layout.seatsLeft || 2);
  const seatsRight = Number(layout.seatsRight || 1);
  const capacity = Number(layout.totalSeats || layout.capacity || 0);

  if (Array.isArray(seatMap) && seatMap.length && typeof seatMap[0] === 'object' && seatMap[0].type != null) {
    const rows = Number(layout.rows || 1);
    const cols = seatsLeft + seatsRight + 1;
    const grid = Array.from({ length: rows }, () => Array(cols).fill('empty'));
    seatMap.forEach((cell) => {
      const r = Number(cell.row);
      const c = Number(cell.col);
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        grid[r][c] = decodeCellType(cell.type);
      }
    });
    return { rows, cols, seatsLeft, seatsRight, grid, capacity: capacity || grid.flat().filter((x) => x === 'seat').length };
  }

  const built = buildSeatGrid({ seatsLeft, seatsRight }, capacity || seatsLeft + seatsRight);
  return { ...built, capacity: capacity || built.grid.flat().filter((x) => x === 'seat').length };
}

export function countSeats(grid) {
  return (grid || []).flat().filter((c) => c === 'seat').length;
}

export function seatNumbers(grid) {
  const nums = [];
  let n = 1;
  (grid || []).forEach((row) => {
    nums.push(row.map((cell) => (cell === 'seat' ? n++ : null)));
  });
  return nums;
}
