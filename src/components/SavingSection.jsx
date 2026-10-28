import MoneyInput from './MoneyInput.jsx';

// 새 적금 기본값
export function newSaving(n) {
  return { id: Date.now(), name: `적금 ${n}`, monthly: 100_000, rate: 3.5, balance: null, monthsLeft: null };
}

// 적금 하나 입력 카드
function SavingItem({ item, onChange, onRemove }) {
  const set = (patch) => onChange({ ...item, ...patch });

  return (
    <div className="product on" style={{ gap: 10 }}>
      <div className="product-head">
        <input
          className="name-input"
          value={item.name}
          aria-label="적금 이름"
          onChange={(e) => set({ name: e.target.value })}
        />
        <button type="button" className="btn-icon" aria-label={`${item.name} 삭제`} onClick={onRemove}>×</button>
      </div>

      <MoneyInput label="월 납입액" value={item.monthly} onChange={(v) => set({ monthly: v })} />

      <label className="field-col">
        금리 (연) <strong style={{ color: 'var(--text)' }}>{item.rate}%</strong>
        <input
          type="range" min="0" max="8" step="0.1"
          value={item.rate}
          onChange={(e) => set({ rate: Number(e.target.value) })}
        />
      </label>

      <MoneyInput
        label="지금까지 모인 돈 (선택)"
        value={item.balance}
        placeholder="없으면 비우기"
        onChange={(v) => set({ balance: v })}
      />

      <label className="field">
        남은 기간 (선택)
        <span className="input-wrap">
          <input
            className="input" inputMode="numeric" aria-label="남은 기간 (개월)"
            placeholder="계속"
            value={item.monthsLeft ?? ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, '');
              set({ monthsLeft: raw === '' ? null : Math.min(Math.max(Number(raw), 1), 600) });
            }}
          />
          <span className="unit">개월</span>
        </span>
      </label>
      <p className="hint">
        {item.monthsLeft
          ? `${item.monthsLeft}개월 뒤 만기 → 받은 돈과 매달 넣던 돈은 투자로 옮긴다고 계산해요.`
          : '비워두면 만기 없이 계속 넣는다고 계산해요.'}
      </p>
    </div>
  );
}

// ③ 저축·투자: 적금 여러 개 + 투자
export default function SavingSection({ savings, invest, onSavingsChange, onInvestChange }) {
  const update = (id, next) => onSavingsChange(savings.map((s) => (s.id === id ? next : s)));
  const remove = (id) => onSavingsChange(savings.filter((s) => s.id !== id));
  const add = () => onSavingsChange([...savings, newSaving(savings.length + 1)]);

  return (
    <section className="card">
      <h2 className="card-title"><span className="step">3</span>저축 · 투자 (월)</h2>

      {savings.map((s) => (
        <SavingItem key={s.id} item={s} onChange={(next) => update(s.id, next)} onRemove={() => remove(s.id)} />
      ))}
      <button type="button" className="btn-ghost" onClick={add}>+ 적금 추가</button>
      <p className="hint">적금 이자는 이자소득세 15.4%를 빼고 계산해요.</p>

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
