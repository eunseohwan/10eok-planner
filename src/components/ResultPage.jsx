import { useState } from 'react';
import AssetChart from './AssetChart.jsx';
import MoneyInput from './MoneyInput.jsx';
import { formatWon } from '../lib/format.js';
import { formatMonths } from '../lib/simulate.js';
import { goalHeading, ageAt } from '../lib/greeting.js';

// 오늘부터 N개월 뒤 → "2058년 11월"
function targetDate(months) {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

// 비율 표시: 0보다 크지만 1% 안 되면 "1% 미만"
function sharePct(value, total) {
  const pct = (Math.max(0, value) / total) * 100;
  if (pct > 0 && pct < 1) return '1% 미만';
  return `${Math.round(pct)}%`;
}

// ③ 결과 화면
export default function ResultPage({ result, inputs, update, onBack }) {
  // 결과 화면에 들어온 순간의 결과를 기준으로, 슬라이더로 바꾼 만큼 비교해요
  const [baseline] = useState(result);
  const [showAllYears, setShowAllYears] = useState(false);

  const goalText = formatWon(inputs.goal);

  if (result.noGoal) {
    return (
      <div className="app">
        <ResultHeader onBack={onBack} />
        <main className="main"><p className="card">목표 금액을 먼저 입력해 주세요.</p></main>
      </div>
    );
  }

  const diff = baseline.reached && result.reached ? baseline.months - result.months : 0;
  const b = result.breakdown;
  const parts = [
    { label: '시작 자산', value: b.start },
    { label: '내가 넣은 돈', value: b.paidIn },
    { label: '정부 기여금', value: b.govIn },
    { label: '이자 · 투자 수익', value: b.gain },
  ];
  const partsTotal = parts.reduce((s, p) => s + Math.max(0, p.value), 0) || 1;

  // 연도별 표: 기본은 1·2·3·5년, 5년 단위, 마지막 해만
  const rows = result.yearly.filter((d) => d.year > 0);
  const lastRow = rows[rows.length - 1];
  const shownRows = showAllYears
    ? rows
    : rows.filter((d) => [1, 2, 3, 5].includes(d.year) || d.year % 5 === 0 || d === lastRow);

  return (
    <div className="app">
      <ResultHeader onBack={onBack} />
      <main className="main">

        <section className="hero" aria-live="polite">
          <p className="hero-sub">{goalHeading(inputs.name, inputs.goal)}</p>
          <p className="hero-num">{result.reached ? formatMonths(result.months) : '100년 넘게'}</p>
          {result.reached && (
            <p className="hero-sub">
              {targetDate(result.months)}
              {ageAt(inputs.age, result.months) !== null && `, 만 ${ageAt(inputs.age, result.months)}세`}에 달성
            </p>
          )}
          {diff !== 0 && (
            <span className="hero-chip">
              처음 결과보다 {formatMonths(Math.abs(diff))} {diff > 0 ? '빨라졌어요' : '늦어졌어요'}
            </span>
          )}
        </section>

        <section className="card">
          <h2 className="card-title" style={{ fontSize: 16 }}>연도별 자산</h2>
          <AssetChart yearly={result.yearly} goal={inputs.goal} maturities={result.maturities} />
          <p className="hint">그래프를 누르거나 마우스를 올리면 그 해의 자산이 보여요.</p>
        </section>

        <section className="card">
          <h2 className="card-title" style={{ fontSize: 16 }}>바로 바꿔보기</h2>
          <MoneyInput
            label="월 투자 금액"
            value={inputs.invest.monthly}
            onChange={(v) => update('invest', { ...inputs.invest, monthly: v })}
          />
          <label className="field-col">
            예상 연 수익률 <strong style={{ color: 'var(--text)' }}>{inputs.invest.rate}%</strong>
            <input
              type="range" min="0" max="12" step="0.5"
              value={inputs.invest.rate}
              onChange={(e) => update('invest', { ...inputs.invest, rate: Number(e.target.value) })}
            />
          </label>
          <p className="hint">바꾸면 위 결과가 바로 다시 계산돼요. 입력 화면에도 똑같이 반영돼요.</p>
        </section>

        <section className="card">
          <h2 className="card-title" style={{ fontSize: 16 }}>
            {result.reached ? `${goalText}은 이렇게 모여요` : '100년 뒤 자산 구성'}
          </h2>
          {parts.map((p) => (
            <div key={p.label} className="part">
              <div className="row">
                <span>{p.label}</span>
                <span>{formatWon(p.value)} <span className="hint">({sharePct(p.value, partsTotal)})</span></span>
              </div>
              <div className="part-track" aria-hidden="true">
                <div className="part-bar" style={{ width: `${(Math.max(0, p.value) / partsTotal) * 100}%` }} />
              </div>
            </div>
          ))}
          <div className="row total"><span>합계</span><span>{formatWon(b.total)}</span></div>
        </section>

        <section className="card" style={{ gap: 8 }}>
          <h2 className="card-title" style={{ fontSize: 16 }}>연도별 표</h2>
          <table className="year-table">
            <thead>
              <tr><th scope="col">연차</th><th scope="col">원금 누계</th><th scope="col">총자산</th></tr>
            </thead>
            <tbody>
              {shownRows.map((d) => (
                <tr key={d.month}>
                  <td>{Number.isInteger(d.year) ? `${d.year}년` : formatMonths(d.month)}</td>
                  <td>{formatWon(d.start + d.paidIn)}</td>
                  <td>{formatWon(d.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > shownRows.length || showAllYears ? (
            <button type="button" className="btn-ghost" onClick={() => setShowAllYears((v) => !v)}>
              {showAllYears ? '간단히 보기' : '전체 연도 보기'}
            </button>
          ) : null}
        </section>

        <section className="notice">
          <strong>계산 기준</strong>
          <ul>
            <li>실수령액은 1인 가구, 비과세 소득 없음, 연말정산 기준 추정치예요.</li>
            <li>
              지금 모아둔 돈{inputs.saveLeftover ? '과 남는 돈' : ''}은{' '}
              {inputs.cashDeposit ? `예금통장 연 ${inputs.cashRate}%(세후)로 불어난다고` : '입출금 통장에 있다고 보고 이자 없이'} 계산했어요.
            </li>
            <li>적금은 각자 금리에서 이자소득세 15.4%를 뺀 금리로 계산했어요. 만기가 있으면 만기 후 투자로 옮겨요.</li>
            <li>투자 수익률은 예상치이고 보장되지 않아요. 세금은 반영하지 않았어요.</li>
            <li>청년 상품이 만기되면 받은 돈과 그 뒤 매달 넣던 돈은 투자로 옮긴다고 가정했어요.</li>
            <li>연봉 인상과 물가 상승은 반영하지 않았어요.</li>
            <li>청년 상품의 금리·기여금·가입 조건은 바뀔 수 있어요. 서민금융진흥원과 복지로에서 꼭 확인하세요.</li>
          </ul>
        </section>
      </main>
    </div>
  );
}

function ResultHeader({ onBack }) {
  return (
    <header className="result-header">
      <button type="button" className="back-btn" onClick={onBack} aria-label="입력 화면으로 돌아가기">‹</button>
      <h1>결과</h1>
    </header>
  );
}
