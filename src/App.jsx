import { useMemo, useState } from 'react';
import { calcNetPay } from './lib/salary.js';
import { simulate } from './lib/simulate.js';
import { calcCashFlow } from './lib/cashflow.js';
import Header from './components/Header.jsx';
import ProfileSection from './components/ProfileSection.jsx';
import ExpenseSection from './components/ExpenseSection.jsx';
import SavingSection from './components/SavingSection.jsx';
import YouthProductSection from './components/YouthProductSection.jsx';
import CashFlowSection from './components/CashFlowSection.jsx';
import ResultBar from './components/ResultBar.jsx';
import ResultPage from './components/ResultPage.jsx';

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

  savings: [                                 // 적금 여러 개
    // balance: 지금까지 모인 돈(없으면 null), monthsLeft: 남은 개월(없으면 계속)
    { id: 1, name: '일반 적금', monthly: 300_000, rate: 3.5, balance: null, monthsLeft: null },
  ],
  saveLeftover: true,                        // 남는 돈도 모으기
  cashDeposit: false,                        // 모아둔 돈을 예금통장에 넣어두기 (끄면 입출금 통장 = 0%)
  cashRate: 3.0,                             // 예금통장 금리 (연 %, 세전)
  invest: { monthly: 300_000, rate: 6 },     // 투자 (예상 연 수익률 %)

  youth: {
    future: {                    // 청년미래적금
      enabled: false,
      monthly: 500_000,
      type: 'general',           // 'general'(일반형) | 'preferred'(우대형)
      bankId: null,              // 은행 선택 안 하면 null → 기본금리만
      bonusIds: [],              // 직접 체크한 우대 조건 (입력값으로 충족되는 건 자동 계산)
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
  const [view, setView] = useState('input'); // 'input'(입력) | 'result'(결과)

  // 최상위 값 하나를 바꿀 때: update('income', 40000000)
  const update = (key, value) => setInputs((prev) => ({ ...prev, [key]: value }));

  // 입력값이 바뀔 때마다 다시 계산 (useMemo: 입력이 같으면 이전 결과 재사용)
  const pay = useMemo(() => calcNetPay(inputs.incomeType, inputs.income), [inputs.incomeType, inputs.income]);
  const flow = useMemo(() => calcCashFlow(inputs, pay.net), [inputs, pay.net]);
  const result = useMemo(
    () => simulate(inputs, pay.annualGross, flow.leftoverSaved),
    [inputs, pay.annualGross, flow.leftoverSaved]
  );

  // 화면을 바꿀 때 맨 위로 스크롤
  const go = (next) => {
    setView(next);
    window.scrollTo(0, 0);
  };

  if (view === 'result') {
    return <ResultPage result={result} inputs={inputs} update={update} onBack={() => go('input')} />;
  }

  return (
    <div className="app">
      <Header />
      <main className="main">
        <ProfileSection inputs={inputs} update={update} pay={pay} />
        <ExpenseSection expenses={inputs.expenses} onChange={(v) => update('expenses', v)} />
        <SavingSection
          savings={inputs.savings}
          invest={inputs.invest}
          onSavingsChange={(v) => update('savings', v)}
          onInvestChange={(v) => update('invest', v)}
        />
        <YouthProductSection youth={inputs.youth} onChange={(v) => update('youth', v)} annualGross={pay.annualGross} />
        <CashFlowSection
          net={pay.net}
          flow={flow}
          saveLeftover={inputs.saveLeftover}
          onToggle={(v) => update('saveLeftover', v)}
          cashDeposit={inputs.cashDeposit}
          onCashDepositChange={(v) => update('cashDeposit', v)}
          cashRate={inputs.cashRate}
          onCashRateChange={(v) => update('cashRate', v)}
        />
      </main>
      <ResultBar result={result} onOpen={() => go('result')} />
    </div>
  );
}
