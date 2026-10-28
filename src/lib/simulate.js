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
function makeProduct({ name, monthly, months, rate, govMonthly, principal = 0, gov = 0 }) {
  return { name, monthly, monthsLeft: months, rate, govMonthly, principal, interest: 0, gov, done: months <= 0 };
}
const productTotal = (p) => p.principal + p.interest + p.gov;

/**
 * 목표 금액까지 몇 달 걸리는지 한 달씩 계산해요.
 * - 모아둔 돈 + 남는 돈(leftover): "현금" 통장, cashRate(세후)로 월복리
 * - 적금(여러 개): 각자 금리(세후)로 월복리 근사, 남은 기간이 있으면 만기 후 투자로
 * - 투자: 예상 수익률로 월복리 (세금 미반영)
 * - 청년 상품: 만기 때 받은 돈은 투자로 옮기고, 그 뒤 월 납입액도 투자로 돌려요
 */
export function simulate(inputs, annualGross, leftover = 0) {
  const { savings, invest, youth, goal, startAsset } = inputs;

  // 목표 금액이 비어 있으면 계산하지 않아요
  if (!goal || goal <= 0) return { months: 0, reached: false, noGoal: true, yearly: [], maturities: [], breakdown: null };

  const afterTax = (rate) => ((rate ?? 0) / 100) * (1 - INTEREST_TAX) / 12; // 연% → 세후 월 이율
  const investRate = ((invest.rate ?? 0) / 100) / 12;

  // 현금 통장: 모아둔 돈 + 매달 남는 돈
  const cashRate = afterTax(inputs.cashRate);
  let cashBal = startAsset ?? 0;
  const cashMonthly = leftover;

  // 적금 여러 개: 통장마다 따로 불어나요
  const accounts = savings.map((x) => ({
    name: x.name || '적금',
    bal: x.balance ?? 0,
    monthly: x.monthly ?? 0,
    rate: afterTax(x.rate),
    monthsLeft: x.monthsLeft ?? Infinity, // 비우면 만기 없음
    done: false,
  }));

  let investBal = 0;
  let investMonthly = invest.monthly ?? 0;

  const products = [];

  if (youth.future.enabled) {
    const m = youth.future.monthly ?? 0;
    const ratio = YOUTH_FUTURE.contribution[youth.future.type];
    products.push(makeProduct({
      name: YOUTH_FUTURE.name,
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
      name: YOUTH_LEAP.name,
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
      name: YOUTH_TOMORROW.name,
      monthly: YOUTH_TOMORROW.selfMonthly,
      months: YOUTH_TOMORROW.months,
      rate: 0, // 이자는 작아서 생략
      govMonthly: YOUTH_TOMORROW.govMonthly,
    }));
  }

  // 시작 자산 = 모아둔 돈 + 적금·도약계좌에 이미 모인 원금
  // (도약계좌에 이미 쌓인 기여금은 "정부 기여금"으로 셈해요)
  let start = (startAsset ?? 0) + accounts.reduce((s, a) => s + a.bal, 0);
  let paidIn = 0;  // 지금부터 내가 넣는 돈
  let govIn = 0;   // 정부 기여금 누계
  for (const p of products) { start += p.principal; govIn += p.gov; }

  const maturities = []; // 만기 시점 (그래프 표시용)

  // 이미 만기인 상품(도약계좌 60개월차 등)은 바로 투자로 옮기기
  for (const p of products) {
    if (p.done) {
      investBal += productTotal(p);
      investMonthly += p.monthly;
      p.principal = p.interest = p.gov = 0;
    }
  }

  const total = () =>
    cashBal + investBal +
    accounts.reduce((s, a) => s + a.bal, 0) +
    products.reduce((s, p) => s + productTotal(p), 0);

  // 지금 자산을 "시작 자산 / 내가 넣은 돈 / 정부 기여금 / 이자·수익"으로 나눠요
  // 이자·수익 = 총자산 − 나머지 셋 (적금 이자, 청년 상품 이자, 투자 수익을 합친 값)
  const snapshot = (month) => {
    const t = total();
    return { month, year: month / 12, total: t, start, paidIn, govIn, gain: t - start - paidIn - govIn };
  };

  const yearly = [snapshot(0)];
  const done = (month, reached) => {
    const last = snapshot(month);
    if (month % 12 !== 0) yearly.push(last);
    return { months: month, reached, yearly, maturities, breakdown: last };
  };

  if (total() >= goal) return done(0, true);

  for (let month = 1; month <= MAX_MONTHS; month++) {
    // 현금·투자: 기존 잔액 이자 → 이번 달 납입
    cashBal = cashBal * (1 + cashRate) + cashMonthly;
    investBal = investBal * (1 + investRate) + investMonthly;
    paidIn += cashMonthly + investMonthly;

    // 적금: 통장마다 이자 → 납입 → 만기면 투자로
    for (const a of accounts) {
      if (a.done) continue;
      a.bal = a.bal * (1 + a.rate) + a.monthly;
      paidIn += a.monthly;
      a.monthsLeft -= 1;
      if (a.monthsLeft <= 0) {
        maturities.push({ name: a.name, month, amount: a.bal });
        investBal += a.bal;
        investMonthly += a.monthly;
        a.bal = 0;
        a.done = true;
      }
    }

    for (const p of products) {
      if (p.done) continue;
      p.principal += p.monthly;
      p.interest += (p.principal * p.rate) / 12; // 단리
      p.gov += p.govMonthly;
      paidIn += p.monthly;
      govIn += p.govMonthly;
      p.monthsLeft -= 1;

      if (p.monthsLeft <= 0) {
        // 만기: 전부 투자로 옮기고, 다음 달부터 이 납입액도 투자로
        maturities.push({ name: p.name, month, amount: productTotal(p) });
        investBal += productTotal(p);
        investMonthly += p.monthly;
        p.principal = p.interest = p.gov = 0;
        p.done = true;
      }
    }

    if (month % 12 === 0) yearly.push(snapshot(month));
    if (total() >= goal) return done(month, true);
  }

  return done(MAX_MONTHS, false);
}

// 34 → "2년 10개월"
export function formatMonths(months) {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m}개월`;
  return m === 0 ? `${y}년` : `${y}년 ${m}개월`;
}
