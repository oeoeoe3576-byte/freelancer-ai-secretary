import { pad } from './date';

// 메일/카톡 본문에서 날짜가 포함된 줄을 찾아 일정 초안(title/date/type)으로 변환한다.
// 브랜드/프로젝트 지정은 호출부(App)에서 담당한다.
export function extractEvents(text) {
  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const out = [];
  const today = new Date();
  const year = today.getFullYear();
  const patterns = [
    /(\d{1,2})\s*\/\s*(\d{1,2})/,
    /(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
    /(20\d{2})[.-](\d{1,2})[.-](\d{1,2})/,
  ];
  for (const line of lines) {
    let dateKey = null;
    for (const p of patterns) {
      const m = line.match(p);
      if (!m) continue;
      let y, mo, da;
      if (m.length === 4) { y = m[1]; mo = m[2]; da = m[3]; }
      else { y = year; mo = m[1]; da = m[2]; }
      dateKey = `${y}-${pad(mo)}-${pad(da)}`;
      break;
    }
    if (dateKey) {
      const title = line
        .replace(/20\d{2}[.-]\d{1,2}[.-]\d{1,2}|\d{1,2}\s*\/\s*\d{1,2}|\d{1,2}\s*월\s*\d{1,2}\s*일/g, '')
        .replace(/^[\s:,-]+|[\s:,-]+$/g, '') || '협찬 일정';
      out.push({ title, date: dateKey, type: '협찬' });
    }
  }
  return out;
}
