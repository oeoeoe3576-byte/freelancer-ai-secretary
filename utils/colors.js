// 브랜드 컬러 팔레트 및 관련 헬퍼
export const COLOR_PALETTE = [
  { name: '블루', hex: '#3B82F6' },
  { name: '핑크', hex: '#EC4899' },
  { name: '옐로우', hex: '#F59E0B' },
  { name: '민트', hex: '#10B981' },
  { name: '퍼플', hex: '#8B5CF6' },
  { name: '스카이블루', hex: '#0EA5E9' },
  { name: '코랄', hex: '#FB7185' },
  { name: '그린', hex: '#65A30D' },
];

export const DEFAULT_BRAND_COLOR = COLOR_PALETTE[0].hex;

// 기존 브랜드와 겹치지 않는 색을 우선 배정, 다 쓰였으면 전체에서 랜덤
export function pickBrandColor(existingBrands = []) {
  const used = new Set(existingBrands.map(b => (b.color || '').toLowerCase()));
  const unused = COLOR_PALETTE.filter(c => !used.has(c.hex.toLowerCase()));
  const pool = unused.length ? unused : COLOR_PALETTE;
  return pool[Math.floor(Math.random() * pool.length)].hex;
}

export function isValidHex(hex) {
  return /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/.test((hex || '').trim());
}

export function normalizeHex(hex) {
  const h = (hex || '').trim();
  if (!isValidHex(h)) return null;
  if (h.length === 4) {
    return '#' + h.slice(1).split('').map(c => c + c).join('');
  }
  return h;
}

export function hexToRgba(hex, alpha = 1) {
  const clean = normalizeHex(hex) || DEFAULT_BRAND_COLOR;
  const n = parseInt(clean.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
