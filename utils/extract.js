import { pad } from './date';

const DATE_PATTERNS = [
  /(\d{1,2})\s*\/\s*(\d{1,2})/,
  /(\d{1,2})\s*월\s*(\d{1,2})\s*일/,
  /(20\d{2})[.-](\d{1,2})[.-](\d{1,2})/,
];

// "오전 중", "오후까지", "3시까지" 같은 시간 정보만 뽑아 괄호로 남겨둔다.
const TIME_PATTERN = /(오전|오후)\s*(중|까지|이전|이내)?|(\d{1,2}\s*시)\s*(까지|이전|이내)?/;

function buildTimeDetail(m) {
  if (m[1]) {
    const suf = m[2] || '';
    if (!suf) return m[1];
    return suf === '중' ? `${m[1]} ${suf}` : `${m[1]}${suf}`;
  }
  if (m[3]) {
    const suf = m[4] || '';
    const hour = m[3].replace(/\s+/g, '');
    return suf ? `${hour}${suf}` : hour;
  }
  return null;
}

// 날짜/요일/존칭 괄호/시간 표현 등 미사어구를 걷어내고 핵심 업무명(+시간 detail)만 남긴다.
// 예) "기획안 전달(초이블러님) 목 오전 중" -> "기획안 전달(오전 중)"
function cleanTitle(rawLine) {
  let s = rawLine;

  // 날짜 표기 제거
  s = s.replace(/20\d{2}[.-]\d{1,2}[.-]\d{1,2}|\d{1,2}\s*\/\s*\d{1,2}|\d{1,2}\s*월\s*\d{1,2}\s*일/g, '');
  // "님"이 포함된 괄호(존칭/담당자명)나 요일 괄호 "(목)" 제거
  s = s.replace(/\([^)]*님[^)]*\)/g, '');
  s = s.replace(/\([월화수목금토일]\)/g, '');
  s = s.replace(/[월화수목금토일]요일/g, '');
  // 홀로 남은 요일 한 글자 제거 (예: " 목 오전")
  s = s.replace(/(^|\s)[월화수목금토일](?=\s|$)/g, ' ');

  // 시간 표현은 따로 뽑아서 본문에서 제거 후 나중에 괄호로 붙인다
  const timeMatch = s.match(TIME_PATTERN);
  const timeDetail = timeMatch ? buildTimeDetail(timeMatch) : null;
  if (timeMatch) s = s.replace(timeMatch[0], '');

  s = s
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s:,\-·()]+|[\s:,\-·()]+$/g, '')
    .trim();

  if (!s) s = '협찬 일정';
  return timeDetail ? `${s}(${timeDetail})` : s;
}

// 메일/카톡 본문에서 날짜가 포함된 줄을 찾아 일정 초안(title/date/type)으로 변환한다.
// 브랜드/프로젝트 지정은 호출부(App)에서 담당한다.
export function extractEvents(text) {
  const lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  const out = [];
  const today = new Date();
  const year = today.getFullYear();

  for (const line of lines) {
    let dateKey = null;
    for (const p of DATE_PATTERNS) {
      const m = line.match(p);
      if (!m) continue;
      let y, mo, da;
      if (m.length === 4) { y = m[1]; mo = m[2]; da = m[3]; }
      else { y = year; mo = m[1]; da = m[2]; }
      dateKey = `${y}-${pad(mo)}-${pad(da)}`;
      break;
    }
    if (dateKey) {
      out.push({ title: cleanTitle(line), date: dateKey, type: '협찬' });
    }
  }
  return out;
}
