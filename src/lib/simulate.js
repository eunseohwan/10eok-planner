import { YOUTH_FUTURE, YOUTH_LEAP, YOUTH_TOMORROW } from '../data/youthProducts.js';
import { INTEREST_TAX } from '../data/taxRates.js';
import { calcBonusRate } from '../data/banks.js';

const MAX_MONTHS = 100 * 12; // 100년까지만 계산

// 청년도약계좌 월 정부 기여금 (총급여 구간별)
export function leapContribution(monthly, annualGross) {
  const b = YOUTH_LEAP.contributionBrackets.find((x) => annualGross <= x.maxIncome);
  if (!b) return 0; // 6,000만 원 초과: 기여금 없음
  const base = Math.min(monthly, b.baseLimit) * b.baseRatio;
  const extra = Math.max(0, Math.min(monthly, YOUTH_LEAP.maxMonthly) - b.baseLimit) * YOUTH_LEAP.extraRatio;
  return Math.floor(base + extra);
}

// 청년 상품 하나를 "통장" 객체로 만들어요.
// 매달 납입 → 단리 이자 쌓임 → 정부 기여금 쌓임 → 만기에 전부 투자로 옮김
function makeProduct({ monthly, months, rate, govMonthly, principal = 0, gov = 0 }) {
  return { monthly, monthsLeft: months, rate, govMonthly, principal, interest: 0, gov, done: months <= 0 };
}
const productTotal = (p) => p.principal + p.interest + p.gov;

/**
 * 목표 금액까지 몇 달 걸리는지 한 달씩 계산해요.
 * - 시작 자산: 일반 적금 금리(세후)로 불어난다고 가정
 * - 일반 적금: 세후 금리로 월복리 근사
 * - 투자: 예상 수익률로 월복리 (세금 미반영)
 * - 청년 상품: 만기 때 받은 돈은 투자로 옮기고, 그 뒤 월 납입액도 투자로 돌려요
 */
export function simulate(inputs, annualGross) {
  const { saving, invest, youth, goal, startAsset } = inputs;

  // 목표 금액이 비어 있으면 계산하지 않아요
  if (!goal || goal <= 0) return { months: 0, reached: false, noGoal: true, yearly: [], paidIn: 0 };

  const savingRate = ((saving.rate ?? 0) / 100) * (1 - INTEREST_TAX) / 12;
  const investRate = ((invest.rate ?? 0) / 100) / 12;

  let savingBal = startAsset ?? 0;
  let investBal = 0;
  let savingMonthly = saving.monthly ?? 0;
  let investMonthly = invest.monthly ?? 0;

  const products = [];

  if (youth.future.enabled) {
    const m = youth.future.monthly ?? 0;
    const ratio = YOUTH_FUTURE.contribution[youth.future.type];
    products.push(makeProduct({
      monthly: m,
      months: YOUTH_FUTURE.months,
      // 기본금리 + 은행 우대금리, 비과세
      rate: (YOUTH_FUTURE.baseRate + calcBonusRate(youth.future.bankId, youth.future.bonusIds, { annualGross, futureType: youth.future.type })) / 100,
      govMonthly: Math.floor(m * ratio),
    }));
  }

  if (youth.leap.enabled) {
    const m = youth.leap.monthly ?? 0;
    const elapsed = youth.leap.monthsElapsed ?? 0;
    const govMonthly = leapContribution(m, annualGross);
    products.push(makeProduct({
      monthly: m,
      months: YOUTH_LEAP.months - elapsed,
      rate: (youth.leap.rate ?? YOUTH_LEAP.rateRange[0]) / 100,
      govMonthly,
      principal: youth.leap.balance ?? m * elapsed,  // 비우면 "월 납입 × 개월 수"로 추정
      gov: govMonthly * elapsed,                      // 그동안 쌓인 기여금 추정
    }));
  }

  if (youth.tomorrow.enabled) {
    products.push(makeProduct({
      monthly: YOUTH_TOMORROW.selfMonthly,
      months: YOUTH_TOMORROW.months,
      rate: 0, // 이자는 작아서 생략
      govMonthly: YOUTH_TOMORROW.govMonthly,
    }));
  }

  // 이미 만기인 상품(도약계좌 60개월차 등)은 바로 투자로 옮기기
  for (const p of products) {
    if (p.done) {
      investBal += productTotal(p);
      investMonthly += p.monthly;
      p.principal = p.interest = p.gov = 0;
    }
  }

  const total = () => savingBal + investBal + products.reduce((s, p) => s + productTotal(p), 0);

  const yearly = [{ year: 0, total: total() }];
  let paidIn = startAsset ?? 0; // 내가 직접 넣은 돈 누계

  if (total() >= goal) return { months: 0, reached: true, yearly, paidIn };

  for (let month = 1; month <= MAX_MONTHS; month++) {
    // 일반 적금·투자: 기존 잔액 이자 → 이번 달 납입
    savingBal = savingBal * (1 + savingRate) + savingMonthly;
    investBal = investBal * (1 + investRate) + investMonthly;
    paidIn += savingMonthly + investMonthly;

    for (const p of products) {
      if (p.done) continue;
      p.principal += p.monthly;
      p.interest += (p.principal * p.rate) / 12; // 단리
      p.gov += p.govMonthly;
      paidIn += p.monthly;
      p.monthsLeft -= 1;

      if (p.monthsLeft <= 0) {
        // 만기: 전부 투자로 옮기고, 다음 달부터 이 납입액도 투자로
        investBal += productTotal(p);
        investMonthly += p.monthly;
        p.principal = p.interest = p.gov = 0;
        p.done = true;
      }
    }

    const now = total();
    if (month % 12 === 0) yearly.push({ year: month / 12, total: now });
    if (now >= goal) {
      if (month % 12 !== 0) yearly.push({ year: month / 12, total: now });
      return { months: month, reached: true, yearly, paidIn };
    }
  }

  return { months: MAX_MONTHS, reached: false, yearly, paidIn };
}

// 34 → "2년 10개월"
export function formatMonths(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}개월`;
  return m === 0 ? `${y}년` : `${y}년 ${m}개월`;
}
