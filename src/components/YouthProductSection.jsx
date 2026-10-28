import { useState } from 'react';
import MoneyInput from './MoneyInput.jsx';
import BankSheet from './BankSheet.jsx';
import { YOUTH_FUTURE, YOUTH_LEAP, YOUTH_TOMORROW } from '../data/youthProducts.js';
import { FUTURE_BANKS, calcBonusRate } from '../data/banks.js';

// ④ 청년 상품 (모두 선택 입력)
export default function YouthProductSection({ youth, onChange }) {
  const { future, leap, tomorrow } = youth;
  const [sheetOpen, setSheetOpen] = useState(false);

  const futureBank = FUTURE_BANKS.find((b) => b.id === future.bankId);
  const futureBonus = calcBonusRate(future.bankId, future.bonusIds, future.customBonus);

  // youth 안의 상품 하나만 바꿀 때: setProduct('future', { monthly: 300000 })
  const setProduct = (key, patch) => onChange({ ...youth, [key]: { ...youth[key], ...patch } });

  // 납입 한도를 넘지 않게 자르기
  const clamp = (v, max) => (v === null ? null : Math.min(v, max));

  const bothOn = future.enabled && leap.enabled; // 중복 가입 불가 경고용

  return (
    <section className="card">
      <h2 className="card-title">
        <span className="step">4</span>청년 상품<span className="badge">선택 입력</span>
      </h2>

      {/* 청년미래적금 */}
      <div className={future.enabled ? 'product on' : 'product'}>
        <label className="product-head">
          {YOUTH_FUTURE.name}
          <input type="checkbox" checked={future.enabled} onChange={(e) => setProduct('future', { enabled: e.target.checked })} />
        </label>
        {future.enabled && (
          <>
            <MoneyInput
              label={`월 납입 (최대 ${YOUTH_FUTURE.maxMonthly / 10_000}만)`}
              value={future.monthly}
              onChange={(v) => setProduct('future', { monthly: clamp(v, YOUTH_FUTURE.maxMonthly) })}
            />
            <div className="segment" role="group" aria-label="청년미래적금 유형">
              <button type="button" aria-pressed={future.type === 'general'} onClick={() => setProduct('future', { type: 'general' })}>
                일반형 · 기여금 {YOUTH_FUTURE.contribution.general * 100}%
              </button>
              <button type="button" aria-pressed={future.type === 'preferred'} onClick={() => setProduct('future', { type: 'preferred' })}>
                우대형 · 기여금 {YOUTH_FUTURE.contribution.preferred * 100}%
              </button>
            </div>
            <p className="hint">우대형: {YOUTH_FUTURE.preferredCondition}</p>
            <button type="button" className="link-row" onClick={() => setSheetOpen(true)}>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>
                  {futureBank ? `${futureBank.name} · 연 ${(YOUTH_FUTURE.baseRate + futureBonus).toFixed(1)}%` : '은행 선택하고 우대금리 받기'}
                </span>
                <span className="hint">
                  {futureBank ? `우대 +${futureBonus}%p 적용 중 · 눌러서 변경` : `건너뛰면 기본금리 ${YOUTH_FUTURE.baseRate}% 적용`}
                </span>
              </span>
              <span aria-hidden="true">›</span>
            </button>
          </>
        )}
      </div>

      {/* 청년도약계좌 (기존 가입자) */}
      <div className={leap.enabled ? 'product on' : 'product'}>
        <label className="product-head">
          <span>{YOUTH_LEAP.name} <span className="hint" style={{ fontWeight: 400 }}>이미 가입한 분만</span></span>
          <input type="checkbox" checked={leap.enabled} onChange={(e) => setProduct('leap', { enabled: e.target.checked })} />
        </label>
        {leap.enabled && (
          <>
            <label className="field">
              가입 몇 개월차? (1~{YOUTH_LEAP.months})
              <span className="input-wrap">
                <input
                  className="input" inputMode="numeric" aria-label="가입 개월 수"
                  value={leap.monthsElapsed}
                  onChange={(e) => {
                    const n = Number(e.target.value.replace(/[^0-9]/g, '')) || 1;
                    setProduct('leap', { monthsElapsed: Math.min(Math.max(n, 1), YOUTH_LEAP.months) });
                  }}
                />
                <span className="unit">개월</span>
              </span>
            </label>
            <MoneyInput
              label="현재 적립액 (선택)"
              value={leap.balance}
              placeholder="비우면 추정"
              onChange={(v) => setProduct('leap', { balance: v })}
            />
            <MoneyInput
              label={`월 납입 (최대 ${YOUTH_LEAP.maxMonthly / 10_000}만)`}
              value={leap.monthly}
              onChange={(v) => setProduct('leap', { monthly: clamp(v, YOUTH_LEAP.maxMonthly) })}
            />
            <label className="field-col">
              내 도약계좌 금리 (연) <strong style={{ color: 'var(--text)' }}>{leap.rate}%</strong>
              <input
                type="range" min={YOUTH_LEAP.rateRange[0]} max={YOUTH_LEAP.rateRange[1]} step="0.1"
                value={leap.rate}
                onChange={(e) => setProduct('leap', { rate: Number(e.target.value) })}
              />
            </label>
            <p className="hint">
              이미 가입해서 금리가 정해져 있으니 은행 앱에서 확인한 금리로 맞춰주세요. 모르면 그대로 두면 돼요({YOUTH_LEAP.rateRange[0]}%).
              정부 기여금은 입력한 연봉으로 소득 구간을 자동 판단해요.
            </p>
          </>
        )}
      </div>

      {bothOn && (
        <div className="warn" role="alert">
          청년미래적금과 청년도약계좌는 함께 가입할 수 없어요. 하나만 선택해 주세요.
        </div>
      )}

      {/* 청년내일저축계좌 */}
      <div className={tomorrow.enabled ? 'product on' : 'product'}>
        <label className="product-head">
          {YOUTH_TOMORROW.name}
          <input type="checkbox" checked={tomorrow.enabled} onChange={(e) => setProduct('tomorrow', { enabled: e.target.checked })} />
        </label>
        <p className="hint">
          본인 월 {YOUTH_TOMORROW.selfMonthly / 10_000}만 원 + 정부 월 {YOUTH_TOMORROW.govMonthly / 10_000}만 원, {YOUTH_TOMORROW.months / 12}년<br />
          {YOUTH_TOMORROW.condition}
        </p>
      </div>

      <BankSheet
        open={sheetOpen}
        initial={{ bankId: future.bankId, bonusIds: future.bonusIds, customBonus: future.customBonus }}
        onApply={(v) => { setProduct('future', v); setSheetOpen(false); }}
        onSkip={() => setSheetOpen(false)}
      />
    </section>
  );
}
