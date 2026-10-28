import { useEffect, useState } from 'react';
import { FUTURE_BANKS, calcBonusRate } from '../data/banks.js';
import { YOUTH_FUTURE } from '../data/youthProducts.js';

// 은행 선택 바텀시트 (선택사항)
// "적용하기"를 눌러야 반영되고, "건너뛰기"를 누르면 기본금리만 써요.
export default function BankSheet({ open, initial, onApply, onSkip }) {
  // 시트 안에서 고르는 동안은 임시 값으로 들고 있어요
  const [bankId, setBankId] = useState(initial.bankId);
  const [bonusIds, setBonusIds] = useState(initial.bonusIds);
  const [customBonus, setCustomBonus] = useState(initial.customBonus ?? 0);

  // 열릴 때마다 현재 값으로 초기화
  useEffect(() => {
    if (open) {
      setBankId(initial.bankId);
      setBonusIds(initial.bonusIds);
      setCustomBonus(initial.customBonus ?? 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Esc 키로 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onSkip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onSkip]);

  if (!open) return null;

  const bank = FUTURE_BANKS.find((b) => b.id === bankId);
  const bonus = calcBonusRate(bankId, bonusIds, customBonus);

  const pickBank = (id) => {
    setBankId(id);
    setBonusIds([]);       // 은행 바꾸면 조건 초기화
    setCustomBonus(0);
  };

  const toggle = (id) =>
    setBonusIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="sheet-backdrop" onClick={onSkip}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-sheet-title"
        onClick={(e) => e.stopPropagation()} // 시트 안을 눌러도 닫히지 않게
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div>
          <h2 id="bank-sheet-title" style={{ margin: 0, fontSize: 19 }}>
            은행 선택 <span className="hint" style={{ fontWeight: 400 }}>선택사항</span>
          </h2>
          <p className="hint" style={{ marginTop: 4 }}>
            은행을 고르고 받을 수 있는 우대 조건을 체크하면 금리에 반영돼요.
          </p>
        </div>

        <div className="bank-grid">
          {FUTURE_BANKS.map((b) => (
            <button
              key={b.id}
              type="button"
              className="bank-btn"
              aria-pressed={bankId === b.id}
              onClick={() => pickBank(b.id)}
            >
              {b.name}
            </button>
          ))}
        </div>

        {bank && bank.conditions && (
          <div className="sheet-box">
            <div className="row">
              <strong>{bank.name} 우대 조건</strong>
              <span className="hint">최대 +{bank.max}%p</span>
            </div>
            {bank.conditions.map((c) => (
              <label key={c.id} className="cond">
                <input type="checkbox" checked={bonusIds.includes(c.id)} onChange={() => toggle(c.id)} />
                <span style={{ flex: 1 }}>{c.label}</span>
                <span className="hint">+{c.rate}%p</span>
              </label>
            ))}
          </div>
        )}

        {bank && !bank.conditions && (
          <div className="sheet-box">
            <label className="field-col">
              받을 수 있는 우대금리 <strong style={{ color: 'var(--text)' }}>+{customBonus}%p</strong>
              <input
                type="range" min="0" max={bank.max} step="0.1"
                value={customBonus}
                onChange={(e) => setCustomBonus(Number(e.target.value))}
              />
            </label>
            <p className="hint">
              이 은행은 세부 조건을 아직 정리하지 못했어요. 은행 앱 상품설명서를 보고 직접 맞춰주세요. (최대 +{bank.max}%p)
            </p>
          </div>
        )}

        <div className="highlight">
          <span>적용 금리</span>
          <strong>
            연 {(YOUTH_FUTURE.baseRate + bonus).toFixed(1)}%
            <span style={{ fontSize: 12, fontWeight: 400 }}> (기본 {YOUTH_FUTURE.baseRate}% + 우대 {bonus}%p)</span>
          </strong>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn-secondary" onClick={onSkip}>건너뛰기</button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onApply({ bankId, bonusIds, customBonus })}
            disabled={!bankId}
          >
            적용하기
          </button>
        </div>
        <p className="hint" style={{ textAlign: 'center' }}>
          건너뛰면 기본금리 {YOUTH_FUTURE.baseRate}%로 계산해요. 은행별 조건은 바뀔 수 있어요.
        </p>
      </div>
    </div>
  );
}
