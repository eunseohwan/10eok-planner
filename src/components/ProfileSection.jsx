import MoneyInput from './MoneyInput.jsx';
import { formatWon } from '../lib/format.js';

// ① 내 정보: 소득, 시작 자산, 목표 금액
export default function ProfileSection({ inputs, update, pay }) {
  const isAnnual = inputs.incomeType === 'annual';

  return (
    <section className="card">
      <h2 className="card-title"><span className="step">1</span>내 정보</h2>

      <div className="segment" role="group" aria-label="소득 입력 방식">
        <button type="button" aria-pressed={isAnnual} onClick={() => update('incomeType', 'annual')}>연봉</button>
        <button type="button" aria-pressed={!isAnnual} onClick={() => update('incomeType', 'monthly')}>월급</button>
      </div>

      <MoneyInput
        wide
        label={isAnnual ? '연봉 (세전)' : '월급 (세전)'}
        value={inputs.income}
        onChange={(v) => update('income', v)}
      />

      <div className="highlight">
        <span>월 실수령액 (자동 계산)</span>
        <strong>{formatWon(pay.net)}</strong>
      </div>

      <details className="hint">
        <summary style={{ cursor: 'pointer' }}>공제 내역 보기 (월 {formatWon(pay.totalDeduction)})</summary>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
          <div className="row"><span>국민연금</span><span>{pay.pension.toLocaleString()}원</span></div>
          <div className="row"><span>건강보험</span><span>{pay.health.toLocaleString()}원</span></div>
          <div className="row"><span>장기요양</span><span>{pay.longTermCare.toLocaleString()}원</span></div>
          <div className="row"><span>고용보험</span><span>{pay.employment.toLocaleString()}원</span></div>
          <div className="row"><span>소득세</span><span>{pay.incomeTax.toLocaleString()}원</span></div>
          <div className="row"><span>지방소득세</span><span>{pay.localTax.toLocaleString()}원</span></div>
          <p className="hint">1인 가구, 비과세 없음, 연말정산 기준 추정치예요. 회사 원천징수액과 조금 다를 수 있어요.</p>
        </div>
      </details>

      <MoneyInput wide label="지금 모아둔 돈" value={inputs.startAsset} onChange={(v) => update('startAsset', v)} />
      <p className="hint" style={{ marginTop: -8 }}>적금·청년 상품에 이미 모인 돈은 빼고 적어주세요. 그건 각 상품에 따로 입력해요.</p>
      <MoneyInput
        wide
        label="목표 금액"
        unit="억 원"
        scale={100_000_000}
        value={inputs.goal}
        onChange={(v) => update('goal', v)}
      />
    </section>
  );
}
