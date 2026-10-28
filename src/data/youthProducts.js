// 청년 상품 조건 (2026년 10월 조사 기준)
// ⚠️ 정책은 바뀔 수 있어요. 값을 바꿀 땐 이 파일만 고치면 돼요.
// 확인처: 서민금융진흥원(청년미래적금·청년도약계좌), 복지로(청년내일저축계좌)

export const YOUTH_FUTURE = {
  name: '청년미래적금',
  months: 36,                    // 3년 만기
  maxMonthly: 500_000,           // 월 최대 50만 원
  baseRate: 5.0,                 // 기본금리 연 5% (전 취급기관 동일, 3년 고정)
  maxBonusRate: 3.0,             // 은행별 우대금리 최대 +3%p (은행마다 다름)
  contribution: {                // 정부 기여금 = 납입액 × 비율
    general: 0.06,               // 일반형 6%
    preferred: 0.12,             // 우대형 12%
  },
  taxFree: true,                 // 이자 비과세
  ageRange: [19, 34],            // 병역 기간만큼 연장, 최대 만 40세
  generalCondition: '개인 연소득 6,000만 원 이하 + 가구소득 중위 200% 이하',
  preferredCondition: '중소기업 재직 + 연소득 3,600만 원 이하 + 가구소득 중위 150% 이하',
};

export const YOUTH_LEAP = {
  name: '청년도약계좌',
  months: 60,                    // 5년 만기
  maxMonthly: 700_000,           // 월 최대 70만 원
  rateRange: [4.5, 6.0],         // 금리 연 4.5~6.0% (은행·우대 조건에 따라)
  taxFree: true,
  newSignup: false,              // 2025-12-31 신규 가입 종료 → 기존 가입자만
  // 정부 기여금: 총급여 구간별 (2025년 1월부터 확대 기준)
  // 기본 매칭 한도까지는 base 비율, 그 위 ~70만 원까지는 3%
  // ⚠️ base 비율·한도는 코딩 전 서민금융진흥원 공식 표로 재확인 필요
  contributionBrackets: [
    { maxIncome: 24_000_000, baseLimit: 400_000, baseRatio: 0.06 },
    { maxIncome: 36_000_000, baseLimit: 500_000, baseRatio: 0.046 },
    { maxIncome: 48_000_000, baseLimit: 600_000, baseRatio: 0.037 },
    { maxIncome: 60_000_000, baseLimit: 700_000, baseRatio: 0.03 },
    // 6,000만~7,500만 원: 기여금 없음, 비과세만
  ],
  extraRatio: 0.03,
};

export const YOUTH_TOMORROW = {
  name: '청년내일저축계좌',
  months: 36,                    // 3년
  selfMonthly: 100_000,          // 본인 월 10만 원
  govMonthly: 300_000,           // 정부 월 30만 원 (2026년 신규: 중위 50% 이하 대상)
  condition: '가구 중위소득 50% 이하 근로 청년 대상 (2026년 신규 기준)',
};
