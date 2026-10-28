import { formatWon } from '../lib/format.js';
import { YOUTH_TOMORROW } from '../data/youthProducts.js';

// 한 달 돈 흐름: 실수령액 − 고정지출 − 저축·투자 = 남는 돈
export default function CashFlowSection({ inputs, net }) {
  const expenseTotal = inputs.expenses.reduce((s, e) => s + (e.amount ?? 0), 0);

  const { future, leap, tomorrow } = inputs.youth;
  const savingTotal =
    (inputs.saving.monthly ?? 0) +
    (inputs.invest.monthly ?? 0) +
    (future.enabled ? future.monthly ?? 0 : 0) +
    (leap.enabled ? leap.monthly ?? 0 : 0) +
    (tomorrow.enabled ? YOUTH_TOMORROW.selfMonthly : 0);

  const left = net - expenseTotal - savingTotal;

  return (
    <section className="card" style={{ gap: 10 }}>
      <h2 className="card-title" style={{ fontSize: 15 }}>한 달 돈 흐름</h2>
      <div className="row"><span>실수령액</span><span>{formatWon(net)}</span></div>
      <div className="row"><span>− 고정지출</span><span>{formatWon(expenseTotal)}</span></div>
      <div className="row"><span>− 저축 · 투자 · 청년 상품</span><span>{formatWon(savingTotal)}</span></div>
      <div className="row total" style={left < 0 ? { color: 'var(--danger)' } : undefined}>
        <span>남는 돈</span><span>{formatWon(left)}</span>
      </div>
      {left < 0 && (
        <p className="hint" role="alert" style={{ color: 'var(--danger)' }}>
          실수령액보다 쓰는 돈이 많아요. 지출이나 저축 금액을 줄여주세요.
        </p>
      )}
    </section>
  );
}
