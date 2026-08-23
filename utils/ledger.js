// 가계부(정산 관리) 계산 로직. 금액은 프로젝트 1개당 1개로 관리한다.
function monthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function isThisMonth(dateKey, ref = new Date()) {
  return !!dateKey && dateKey.slice(0, 7) === monthKey(ref);
}

// 정산 안 된 프로젝트인데 이번 달에 '정산' 유형 일정이 잡혀 있으면 "이번 달 정산 예정"으로 본다.
export function hasSettlementEventThisMonth(projectId, events) {
  return events.some(e => e.projectId === projectId && e.type === '정산' && isThisMonth(e.date));
}

export function formatWon(n) {
  const num = Number(n) || 0;
  return `${num.toLocaleString('ko-KR')}원`;
}

// 홈 화면 요약 타일용: 이번 달 정산 예정/완료 총액
export function computeLedgerSummary(projects, events) {
  let pendingThisMonth = 0;
  let settledThisMonth = 0;
  for (const p of projects) {
    const amount = Number(p.amount) || 0;
    if (!amount) continue;
    if (p.settled) {
      if (isThisMonth(p.settledAt)) settledThisMonth += amount;
    } else if (hasSettlementEventThisMonth(p.id, events)) {
      pendingThisMonth += amount;
    }
  }
  return { pendingThisMonth, settledThisMonth };
}
