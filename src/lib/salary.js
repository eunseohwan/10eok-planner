import {
  INSURANCE_2026 as INS,
  EARNED_INCOME_DEDUCTION,
  EARNED_INCOME_DEDUCTION_MAX,
  TAX_BRACKETS,
  BASIC_DEDUCTION,
  STANDARD_TAX_CREDIT,
  LOCAL_TAX_RATIO,
} from '../data/taxRates.js';

const floor10 = (n) => Math.floor(n / 10) * 10; // 10원 미만 버림

// 근로소득공제
function earnedIncomeDeduction(gross) {
  const b = EARNED_INCOME_DEDUCTION.find((x) => gross <= x.upTo);
  return Math.min(b.base + (gross - b.from) * b.rate, EARNED_INCOME_DEDUCTION_MAX);
}

// 과세표준 → 산출세액
function calcTax(taxBase) {
  const b = TAX_BRACKETS.find((x) => taxBase <= x.upTo);
  return Math.max(0, taxBase * b.rate - b.minus);
}

// 근로소득세액공제 (한도 포함)
function earnedIncomeTaxCredit(tax, gross) {
  const credit = tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3;
  let limit;
  if (gross <= 33_000_000) limit = 740_000;
  else if (gross <= 70_000_000) limit = Math.max(660_000, 740_000 - (gross - 33_000_000) * 0.008);
  else if (gross <= 120_000_000) limit = Math.max(500_000, 660_000 - (gross - 70_000_000) * 0.5);
  else limit = Math.max(200_000, 500_000 - (gross - 120_000_000) * 0.5);
  return Math.min(credit, limit);
}

/**
 * 세전 소득 → 월 실수령액
 * 1인 가구, 비과세 소득 없음, 연말정산 기준으로 근사한 값이에요.
 * (회사 간이세액표 원천징수와는 월 몇천~몇만 원 차이가 날 수 있어요.)
 */
export function calcNetPay(incomeType, income) {
  const annualGross = Math.max(0, incomeType === 'annual' ? income ?? 0 : (income ?? 0) * 12);
  const monthlyGross = annualGross / 12;

  // 4대보험 (월)
  const pensionBase = Math.min(Math.max(monthlyGross, INS.pensionBaseMin), INS.pensionBaseMax);
  const pension = monthlyGross > 0 ? floor10(pensionBase * INS.pension) : 0;
  const health = floor10(monthlyGross * INS.health);
  const longTermCare = floor10(health * INS.longTermCare);
  const employment = floor10(monthlyGross * INS.employment);

  // 소득세 (연 → 월)
  const earnedIncome = annualGross - earnedIncomeDeduction(annualGross);
  const insuranceDeduction = (pension + health + longTermCare + employment) * 12;
  const taxBase = Math.max(0, earnedIncome - BASIC_DEDUCTION - insuranceDeduction);
  const rawTax = calcTax(taxBase);
  const annualIncomeTax = Math.max(
    0,
    rawTax - earnedIncomeTaxCredit(rawTax, annualGross) - STANDARD_TAX_CREDIT
  );
  const incomeTax = floor10(annualIncomeTax / 12);
  const localTax = floor10(incomeTax * LOCAL_TAX_RATIO);

  const totalDeduction = pension + health + longTermCare + employment + incomeTax + localTax;

  return {
    annualGross,
    monthlyGross: Math.round(monthlyGross),
    pension, health, longTermCare, employment, incomeTax, localTax,
    totalDeduction,
    net: Math.round(monthlyGross - totalDeduction),
  };
}
