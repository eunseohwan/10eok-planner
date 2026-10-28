// 청년미래적금 은행별 우대금리 조건 (2026년 6월 출시 기사 기준)
// ⚠️ 은행이 조건을 바꿀 수 있어요. 가입 전 은행 앱의 상품설명서가 정답이에요.
// 출처: 파이낸셜뉴스 2026-06-22, 위키트리 청년미래적금 은행별 우대금리 총정리
//
// 각 조건의 rate는 %p. 합계가 max를 넘으면 max까지만 적용해요.
// 세부 조건을 못 찾은 은행은 conditions 없이 max만 두고, 슬라이더로 직접 고르게 해요.

export const FUTURE_BANKS = [
  {
    id: 'kb', name: 'KB국민', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여이체', rate: 1.0 },
      { id: 'withdraw', label: '출금 실적', rate: 0.8 },
      { id: 'thanks', label: '거래 감사', rate: 0.5 },
      { id: 'income', label: '소득 요건 (총급여 3,600만 원 이하 등)', rate: 0.5 },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  {
    id: 'shinhan', name: '신한', max: 3.0,
    conditions: [
      { id: 'income', label: '소득 요건', rate: 0.5 },
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
      { id: 'income', label: '소득 플러스 (소득 요건)', rate: 0.5 },
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
      { id: 'income', label: '소득 요건', rate: 0.5 },
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
      { id: 'income', label: '소득 요건', rate: 0.5 },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  {
    id: 'ibk', name: 'IBK기업', max: 3.0,
    conditions: [
      { id: 'salary', label: '급여이체', rate: 1.0 },
      { id: 'card', label: '카드 이용', rate: 0.5 },
      { id: 'housing', label: '주택청약종합저축 보유', rate: 0.5 },
      { id: 'sme', label: '중소기업 재직', rate: 0.3 },
      { id: 'first', label: '도약계좌 연계 가입 또는 최초 고객', rate: 0.5 },
      { id: 'income', label: '소득 요건', rate: 0.5 },
      { id: 'consult', label: '청년 재무상담 이수', rate: 0.2 },
    ],
  },
  // 세부 조건을 못 찾은 은행: 최고 우대금리만 알고 있어서 슬라이더로 직접 입력
  { id: 'post', name: '우체국', max: 3.0, conditions: null },
  { id: 'kakao', name: '카카오뱅크', max: 2.0, conditions: null },
  { id: 'local', name: '그 외 은행', max: 2.0, conditions: null }, // 수협·iM·부산·경남·광주·전북
];

/** 선택한 은행과 조건 → 우대금리(%p) */
export function calcBonusRate(bankId, bonusIds = [], customBonus = 0) {
  const bank = FUTURE_BANKS.find((b) => b.id === bankId);
  if (!bank) return 0; // 은행 선택 안 함 → 기본금리만
  if (!bank.conditions) return Math.min(customBonus ?? 0, bank.max);
  const sum = bank.conditions
    .filter((c) => bonusIds.includes(c.id))
    .reduce((s, c) => s + c.rate, 0);
  return Math.min(Math.round(sum * 10) / 10, bank.max);
}
