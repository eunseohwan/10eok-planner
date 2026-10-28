// 2026년 근로자 부담 4대보험 요율과 소득세 기준
// ⚠️ 매년 바뀌어요. 바뀌면 이 파일만 고치면 돼요.
// 확인처: 국민연금공단, 국민건강보험공단, 근로복지공단, 국세청

export const INSURANCE_2026 = {
  pension: 0.0475,               // 국민연금 9.5% 중 근로자 4.75%
  pensionBaseMin: 410_000,       // 기준소득월액 하한 (2026.7~)
  pensionBaseMax: 6_590_000,     // 기준소득월액 상한 (2026.7~)
  health: 0.03595,               // 건강보험 7.19% 중 근로자 3.595%
  longTermCare: 0.1314,          // 장기요양 = 건강보험료 × 13.14%
  employment: 0.009,             // 고용보험 근로자 0.9%
};

// 근로소득공제: 총급여 구간별
export const EARNED_INCOME_DEDUCTION = [
  { upTo: 5_000_000, base: 0, rate: 0.7, from: 0 },
  { upTo: 15_000_000, base: 3_500_000, rate: 0.4, from: 5_000_000 },
  { upTo: 45_000_000, base: 7_500_000, rate: 0.15, from: 15_000_000 },
  { upTo: 100_000_000, base: 12_000_000, rate: 0.05, from: 45_000_000 },
  { upTo: Infinity, base: 14_750_000, rate: 0.02, from: 100_000_000 },
];
export const EARNED_INCOME_DEDUCTION_MAX = 20_000_000;

// 종합소득세 세율 (과세표준 구간, 누진공제)
export const TAX_BRACKETS = [
  { upTo: 14_000_000, rate: 0.06, minus: 0 },
  { upTo: 50_000_000, rate: 0.15, minus: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, minus: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, minus: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, minus: 19_940_000 },
  { upTo: 500_000_000, rate: 0.4, minus: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, minus: 35_940_000 },
  { upTo: Infinity, rate: 0.45, minus: 65_940_000 },
];

export const BASIC_DEDUCTION = 1_500_000;    // 본인 기본공제
export const STANDARD_TAX_CREDIT = 130_000;  // 표준세액공제
export const LOCAL_TAX_RATIO = 0.1;          // 지방소득세 = 소득세 × 10%
export const INTEREST_TAX = 0.154;           // 이자소득세 15.4%
