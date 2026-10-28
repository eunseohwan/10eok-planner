import MoneyInput from './MoneyInput.jsx';
import { YOUTH_FUTURE, YOUTH_LEAP, YOUTH_TOMORROW } from '../data/youthProducts.js';

// ④ 청년 상품 (모두 선택 입력)
export default function YouthProductSection({ youth, onChange }) {
  const { future, leap, tomorrow } = youth;

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
            <button type="button" className="btn-ghost" disabled>은행 선택하고 우대금리 받기 (다음 단계에서 연결)</button>
            <p className="hint">건너뛰면 기본금리 {YOUTH_FUTURE.baseRate}% 적용</p>
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
            <p className="hint">정부 기여금은 입력한 연봉으로 소득 구간을 자동 판단해요.</p>
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
    </section>
  );
}
