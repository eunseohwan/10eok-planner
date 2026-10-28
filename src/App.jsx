import { useMemo, useState } from 'react';
import { calcNetPay } from './lib/salary.js';
import { simulate } from './lib/simulate.js';
import Header from './components/Header.jsx';
import ProfileSection from './components/ProfileSection.jsx';
import ExpenseSection from './components/ExpenseSection.jsx';
import SavingSection from './components/SavingSection.jsx';
import YouthProductSection from './components/YouthProductSection.jsx';
import CashFlowSection from './components/CashFlowSection.jsx';
import ResultBar from './components/ResultBar.jsx';

// 앱 전체 입력값의 기본값. 금액은 모두 "원" 단위로 저장해요.
const DEFAULT_INPUTS = {
  incomeType: 'annual',          // 'annual'(연봉) | 'monthly'(월급)
  income: 36_000_000,            // 세전 연봉 또는 세전 월급
  startAsset: 5_000_000,         // 지금 모아둔 돈
  goal: 1_000_000_000,           // 목표 금액 (기본 10억)

  expenses: [                    // 월 고정지출 항목
    { id: 1, name: '월세', amount: 500_000 },
    { id: 2, name: '관리비 · 공과금', amount: 100_000 },
    { id: 3, name: '통신비', amount: 60_000 },
    { id: 4, name: '교통비', amount: 70_000 },
    { id: 5, name: '식비', amount: 400_000 },
    { id: 6, name: '보험 · 구독', amount: 80_000 },
  ],

  saving: { monthly: 300_000, rate: 3.5 },   // 일반 적금 (연 %)
  invest: { monthly: 300_000, rate: 6 },     // 투자 (예상 연 수익률 %)

  youth: {
    future: {                    // 청년미래적금
      enabled: false,
      monthly: 500_000,
      type: 'general',           // 'general'(일반형) | 'preferred'(우대형)
      bankId: null,              // 은행 선택 안 하면 null → 기본금리만
      bonusIds: [],              // 체크한 우대 조건
      customBonus: 0,            // 조건 정보가 없는 은행: 직접 고른 우대금리(%p)
    },
    leap: {                      // 청년도약계좌 (기존 가입자만)
      enabled: false,
      monthsElapsed: 1,
      balance: null,             // 비우면 자동 추정
      monthly: 400_000,
      rate: 4.5,                 // 이미 정해진 내 금리 (4.5~6.0%)
    },
    tomorrow: { enabled: false }, // 청년내일저축계좌
  },
};

export default function App() {
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);

  // 최상위 값 하나를 바꿀 때: update('income', 40000000)
  const update = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

  // 입력값이 바뀔 때마다 다시 계산 (useMemo: 입력이 같으면 이전 결과 재사용)
  const pay = useMemo(() => calcNetPay(inputs.incomeType, inputs.income), [inputs.incomeType, inputs.income]);
  const result = useMemo(() => simulate(inputs, pay.annualGross), [inputs, pay.annualGross]);

  return (
    <div className="app">
      <Header />
      <main className="main">
        <ProfileSection inputs={inputs} update={update} pay={pay} />
        <ExpenseSection expenses={inputs.expenses} onChange={(v) => update('expenses', v)} />
        <SavingSection
          saving={inputs.saving}
          invest={inputs.invest}
          onSavingChange={(v) => update('saving', v)}
          onInvestChange={(v) => update('invest', v)}
        />
        <YouthProductSection youth={inputs.youth} onChange={(v) => update('youth', v)} />
        <CashFlowSection inputs={inputs} net={pay.net} />
      </main>
      <ResultBar result={result} />
    </div>
  );
}
