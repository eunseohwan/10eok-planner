// 금액 입력칸. 화면에는 unit 단위로 보이고, 저장은 "원" 단위로 해요.
// 기본은 "만 원" (scale 10,000). 예: 50 입력 → onChange(500000)
// 억 단위는 unit="억 원", scale={100_000_000}. 예: 10 입력 → onChange(1000000000)
export default function MoneyInput({ label, value, onChange, unit = '만 원', scale = 10_000, wide = false, placeholder }) {
  const shown = value === null || value === undefined ? '' : value / scale;

  const handle = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, ''); // 숫자와 점만 남기기
    onChange(raw === '' ? null : Math.round(Number(raw) * scale));
  };

  const input = (
    <span className="input-wrap">
      <input
        className={wide ? 'input wide' : 'input'}
        inputMode="decimal"
        value={shown}
        placeholder={placeholder}
        onChange={handle}
        aria-label={label}
      />
      <span className="unit">{unit}</span>
    </span>
  );

  return wide ? (
    <label className="field-col">{label}{input}</label>
  ) : (
    <label className="field">{label}{input}</label>
  );
}
