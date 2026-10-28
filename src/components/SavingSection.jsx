import MoneyInput from './MoneyInput.jsx';

// ③ 저축·투자: 일반 적금 + 투자
export default function SavingSection({ saving, invest, onSavingChange, onInvestChange }) {
  return (
    <section className="card">
      <h2 className="card-title"><span className="step">3</span>저축 · 투자 (월)</h2>

      <MoneyInput label="일반 적금" value={saving.monthly} onChange={(v) => onSavingChange({ ...saving, monthly: v })} />
      <label className="field-col">
        적금 금리 (연) <strong style={{ color: 'var(--text)' }}>{saving.rate}%</strong>
        <input
          type="range" min="0" max="8" step="0.1"
          value={saving.rate}
          onChange={(e) => onSavingChange({ ...saving, rate: Number(e.target.value) })}
        />
      </label>
      <p className="hint">이자 세금 15.4%를 빼고 계산해요.</p>

      <div className="divider" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <MoneyInput label="투자" value={invest.monthly} onChange={(v) => onInvestChange({ ...invest, monthly: v })} />
        <label className="field-col">
          예상 연 수익률 <strong style={{ color: 'var(--text)' }}>{invest.rate}%</strong>
          <input
            type="range" min="0" max="12" step="0.5"
            value={invest.rate}
            onChange={(e) => onInvestChange({ ...invest, rate: Number(e.target.value) })}
          />
        </label>
        <p className="hint">투자 수익률은 보장되지 않아요. 예상치로만 계산해요.</p>
      </div>
    </section>
  );
}
