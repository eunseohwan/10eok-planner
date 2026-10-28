import MoneyInput from './MoneyInput.jsx';
import { formatWon } from '../lib/format.js';

// ② 고정지출: 항목별 입력 + 추가/삭제 + 합계
export default function ExpenseSection({ expenses, onChange }) {
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  const setAmount = (id, amount) =>
    onChange(expenses.map((e) => (e.id === id ? { ...e, amount } : e)));

  const remove = (id) => onChange(expenses.filter((e) => e.id !== id));

  const add = () => {
    const name = window.prompt('항목 이름을 입력하세요 (예: 헬스장)');
    if (!name) return;
    onChange([...expenses, { id: Date.now(), name, amount: 0 }]);
  };

  return (
    <section className="card">
      <h2 className="card-title"><span className="step">2</span>고정지출 (월)</h2>

      {expenses.map((e) => (
        <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ flex: 1 }}>
            <MoneyInput label={e.name} value={e.amount} onChange={(v) => setAmount(e.id, v)} />
          </div>
          <button type="button" className="btn-icon" aria-label={`${e.name} 삭제`} onClick={() => remove(e.id)}>×</button>
        </div>
      ))}

      <button type="button" className="btn-ghost" onClick={add}>+ 항목 추가</button>

      <div className="row total"><span>지출 합계</span><span>{formatWon(total)}</span></div>
    </section>
  );
}
