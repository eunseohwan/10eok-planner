import { formatWon } from '../lib/format.js';

// 한 달 돈 흐름 + "남는 돈도 모으기" 스위치
export default function CashFlowSection({ net, flow, saveLeftover, onToggle, cashRate, onCashRateChange }) {
  const { expenseTotal, savingTotal, left } = flow;

  return (
    <section className="card" style={{ gap: 10 }}>
      <h2 className="card-title" style={{ fontSize: 15 }}>한 달 돈 흐름</h2>
      <div className="row"><span>실수령액</span><span>{formatWon(net)}</span></div>
      <div className="row"><span>− 고정지출</span><span>{formatWon(expenseTotal)}</span></div>
      <div className="row"><span>− 저축 · 투자 · 청년 상품</span><span>{formatWon(savingTotal)}</span></div>
      <div className="row total" style={left < 0 ? { color: 'var(--danger)' } : undefined}>
        <span>남는 돈</span><span>{formatWon(left)}</span>
      </div>

      {left < 0 ? (
        <p className="hint" role="alert" style={{ color: 'var(--danger)' }}>
          실수령액보다 쓰는 돈이 많아요. 지출이나 저축 금액을 줄여주세요. 계산에서는 남는 돈을 0원으로 봐요.
        </p>
      ) : (
        <label className="toggle-row">
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>남는 돈도 모으기</span>
            <span className="hint">
              {saveLeftover
                ? `매달 ${formatWon(left)}을 아래 금리로 모은다고 계산해요.`
                : '끄면 위에 적은 저축·투자 금액만 계산해요.'}
            </span>
          </span>
          <input
            type="checkbox"
            role="switch"
            className="switch"
            checked={saveLeftover}
            onChange={(e) => onToggle(e.target.checked)}
          />
        </label>
      )}

      <label className="field-col">
        모아둔 돈{saveLeftover ? ' · 남는 돈' : ''} 금리 (연) <strong style={{ color: 'var(--text)' }}>{cashRate}%</strong>
        <input
          type="range" min="0" max="6" step="0.1"
          value={cashRate}
          onChange={(e) => onCashRateChange(Number(e.target.value))}
        />
      </label>
      <p className="hint">파킹통장이나 예금에 둔다고 보고, 이자소득세 15.4%를 빼고 계산해요.</p>
    </section>
  );
}
