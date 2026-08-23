export const WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export const pad = n => String(n).padStart(2, '0');
export const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseKey = k => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const startOfWeek = d => addDays(d, -d.getDay());
export const monthLabel = d => `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
export const dayLabel = d => `${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEK[d.getDay()]}요일`;
export const shortDayLabel = d => `${d.getMonth() + 1}.${d.getDate()} (${WEEK[d.getDay()]})`;
export const daysBetween = (a, b) => Math.ceil((parseKey(b) - parseKey(a)) / 86400000);
export const isValidDateKey = k => /^\d{4}-\d{2}-\d{2}$/.test(k);
