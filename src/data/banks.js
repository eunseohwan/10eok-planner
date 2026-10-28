// 청년미래적금 은행별 우대금리 조건 (2026년 6월 출시 기사 기준)
// ⚠️ 은행이 조건을 바꿀 수 있어요. 가입 전 은행 앱의 상품설명서가 정답이에요.
// 출처: 파이낸셜뉴스 2026-06-22, 위키트리 청년미래적금 은행별 우대금리 총정리
//
// 각 조건의 rate는 %p. 합계가 max를 넘으면 max까지만 적용해요.
// 세부 조건을 모두 확인한 은행만 넣었어요.
// (우체국·카카오뱅크·수협·iM·부산·경남·광주·전북: 조건 세부 미확인 / 토스뱅크: 12월 출시 예정, 금리 미공시)
//
// auto: 앞에서 입력한 값으로 판단할 수 있는 조건. 만족하면 자동 체크돼요.
//   'income'    → 총급여(연봉) 3,600만 원 이하
//   'preferred' → 청년미래적금 우대형 선택 (= 중소기업 재직)

export const FUTURE_BANKS = [
  {
    id: 'kb', name: 'KB국민', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여이체', rate: 1.0 },
      { id: 'withdraw', label: '출금 실적', rate: 0.8 },
      { id: 'thanks', label: '거래 감사', rate: 0.5 },
      { id: 'income', label: '소득 요건 (총급여 3,600만 원 이하)', rate: 0.5, auto: 'income' },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  {
    id: 'shinhan', name: '신한', max: 3.0,
    conditions: [
      { id: 'income', label: '소득 요건 (총급여 3,600만 원 이하)', rate: 0.5, auto: 'income' },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
      { id: 'salary', label: '급여이체 (18개월 이상)', rate: 0.3 },
      { id: 'card', label: '신한카드 이용 (18개월 이상)', rate: 0.2 },
      { id: 'first', label: '첫 적금 또는 청년도약계좌 연계 가입', rate: 0.3 },
      { id: 'stock', label: '신한투자증권 거래 (3개월 이상)', rate: 0.5 },
      { id: 'special', label: '[특별] 도약계좌에서 연계 가입 (8/7까지 가입자)', rate: 1.0 },
    ],
  },
  {
    id: 'hana', name: '하나', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여 또는 가맹점대금 이체', rate: 1.2 },
      { id: 'card', label: '하나카드 결제 실적', rate: 0.6 },
      { id: 'cheer', label: '목돈 마련 응원', rate: 0.5 },
      { id: 'income', label: '소득 플러스 (총급여 3,600만 원 이하)', rate: 0.5, auto: 'income' },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  {
    id: 'woori', name: '우리', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여 또는 가맹점대금 입금', rate: 1.5 },
      { id: 'first', label: '예·적금 미보유 또는 도약계좌 연계 가입', rate: 0.5 },
      { id: 'autopay', label: '카드·통신비·보험료 자동이체', rate: 0.5 },
      { id: 'launch', label: '[특별] 출시 기념 가입', rate: 0.3 },
      { id: 'income', label: '소득 요건 (총급여 3,600만 원 이하)', rate: 0.5, auto: 'income' },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  {
    id: 'nh', name: 'NH농협', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여 또는 가맹점대금 입금', rate: 1.0 },
      { id: 'card', label: 'NH카드 이용', rate: 0.7 },
      { id: 'first', label: '예·적금 미보유 또는 도약계좌 연계 가입', rate: 0.3 },
      { id: 'mydata', label: 'NH 마이데이터 이용', rate: 0.3 },
      { id: 'income', label: '소득 요건 (총급여 3,600만 원 이하)', rate: 0.5, auto: 'income' },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  {
    id: 'ibk', name: 'IBK기업', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여이체', rate: 1.0 },
      { id: 'card', label: '카드 이용', rate: 0.5 },
      { id: 'housing', label: '주택청약종합저축 보유', rate: 0.5 },
      { id: 'sme', label: '중소기업 재직', rate: 0.3, auto: 'preferred' },
      { id: 'first', label: '도약계좌 연계 가입 또는 최초 고객', rate: 0.5 },
      { id: 'income', label: '소득 요건 (총급여 3,600만 원 이하)', rate: 0.5, auto: 'income' },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
];

const INCOME_LIMIT = 36_000_000; // 소득 요건: 총급여 3,600만 원 이하

/** 입력값으로 자동 충족되는 조건 id 목록
 *  ctx = { annualGross, futureType }
 */
export function autoBonusIds(bankId, ctx = {}) {
  const bank = FUTURE_BANKS.find((b) => b.id === bankId);
  if (!bank) return [];
  return bank.conditions
    .filter((c) =>
      (c.auto === 'income' && ctx.annualGross > 0 && ctx.annualGross <= INCOME_LIMIT) ||
      (c.auto === 'preferred' && ctx.futureType === 'preferred'))
    .map((c) => c.id);
}

/** 선택한 은행 + 직접 체크한 조건 + 자동 충족 조건 → 우대금리(%p) */
export function calcBonusRate(bankId, bonusIds = [], ctx = {}) {
  const bank = FUTURE_BANKS.find((b) => b.id === bankId);
  if (!bank) return 0; // 은행 선택 안 함 → 기본금리만
  const checked = new Set([...bonusIds, ...autoBonusIds(bankId, ctx)]);
  const sum = bank.conditions.filter((c) => checked.has(c.id)).reduce((s, c) => s + c.rate, 0);
  return Math.min(Math.round(sum * 10) / 10, bank.max);
}
