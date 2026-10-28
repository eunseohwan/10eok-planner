import { useEffect, useState } from 'react';
import { FUTURE_BANKS, calcBonusRate, autoBonusIds } from '../data/banks.js';
import { YOUTH_FUTURE } from '../data/youthProducts.js';

// 은행 선택 바텀시트 (선택사항)
// "적용하기"를 눌러야 반영되고, "건너뛰기"를 누르면 기본금리만 써요.
// ctx = { annualGross, futureType } → 앞에서 입력한 값으로 충족되는 조건은 자동 체크
export default function BankSheet({ open, initial, ctx, onApply, onSkip }) {
  // 시트 안에서 고르는 동안은 임시 값으로 들고 있어요
  const [bankId, setBankId] = useState(initial.bankId);
  const [bonusIds, setBonusIds] = useState(initial.bonusIds);

  // 열릴 때마다 현재 값으로 초기화
  useEffect(() => {
    if (open) {
      setBankId(initial.bankId);
      setBonusIds(initial.bonusIds);
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
  const autoIds = autoBonusIds(bankId, ctx);       // 입력값으로 이미 충족된 조건
  const bonus = calcBonusRate(bankId, bonusIds, ctx);

  const pickBank = (id) => {
    setBankId(id);
    setBonusIds([]); // 은행 바꾸면 직접 체크한 조건 초기화 (자동 조건은 그대로 계산돼요)
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

        {bank && (
          <div className="sheet-box">
            <div className="row">
              <strong>{bank.name} 우대 조건</strong>
              <span className="hint">최대 +{bank.max}%p</span>
            </div>
            {bank.conditions.map((c) => {
              const isAuto = autoIds.includes(c.id);
              return (
                <label key={c.id} className="cond" style={isAuto ? { cursor: 'default' } : undefined}>
                  <input
                    type="checkbox"
                    checked={isAuto || bonusIds.includes(c.id)}
                    aria-disabled={isAuto}
                    onChange={() => !isAuto && toggle(c.id)} // 자동 충족 조건은 해제 불가
                  />
                  <span style={{ flex: 1 }}>
                    {c.label}
                    {isAuto && <span className="auto-tag">입력값으로 자동 충족</span>}
                  </span>
                  <span className="hint">+{c.rate}%p</span>
                </label>
              );
            })}
          </div>
        )}

        <p className="hint">
          지금 목록은 우대 조건을 모두 확인한 은행만 보여줘요. 우체국·카카오뱅크·지방은행 등은 조건이 확인되면 추가할게요.
        </p>

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
            onClick={() => onApply({ bankId, bonusIds })}
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
