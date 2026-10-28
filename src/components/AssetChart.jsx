import { useEffect, useRef, useState } from 'react';
import { formatWon } from '../lib/format.js';

// 축 눈금용 짧은 금액: 150000000 → "1.5억", 30000000 → "3,000만"
function shortWon(won) {
  if (won >= 100_000_000) {
    const eok = won / 100_000_000;
    return `${Number.isInteger(eok) ? eok : eok.toFixed(1)}억`;
  }
  if (won === 0) return '0';
  return `${Math.round(won / 10_000).toLocaleString('ko-KR')}만`;
}

// 보기 좋은 눈금 간격 (1, 2, 5 × 10ⁿ)
function niceStep(max, count = 4) {
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow;
}

/**
 * 연도별 총자산 선 그래프
 * - 점선: 목표 금액
 * - 세로 점선: 청년 상품 만기 시점
 * - 마우스를 올리거나 누르면 그 해의 자산을 보여줘요
 */
export default function AssetChart({ yearly, goal, maturities }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(340);
  const [hover, setHover] = useState(null); // 선택한 점의 index

  // 화면 폭에 맞춰 그래프 폭 바꾸기
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.max(260, entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!yearly.length) return null;

  const height = 220;
  const pad = { top: 22, right: 12, bottom: 28, left: 46 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const lastYear = yearly[yearly.length - 1].year;
  const maxYear = Math.max(lastYear, 1);
  const step = niceStep(Math.max(goal, ...yearly.map((d) => d.total)));
  const maxY = Math.ceil(Math.max(goal, ...yearly.map((d) => d.total)) / step) * step;

  const x = (year) => pad.left + (year / maxYear) * innerW;
  const y = (won) => pad.top + innerH - (won / maxY) * innerH;

  const path = yearly.map((d, i) => `${i ? 'L' : 'M'}${x(d.year).toFixed(1)},${y(d.total).toFixed(1)}`).join(' ');

  const yTicks = [];
  for (let v = 0; v <= maxY + 1; v += step) yTicks.push(v);

  const xEvery = Math.max(1, Math.ceil(maxYear / 6));
  const xTicks = [];
  for (let yr = 0; yr <= maxYear; yr += xEvery) xTicks.push(yr);

  // 마우스/손가락 위치 → 가장 가까운 점
  const pick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const year = ((e.clientX - rect.left - pad.left) / innerW) * maxYear;
    let best = 0;
    yearly.forEach((d, i) => {
      if (Math.abs(d.year - year) < Math.abs(yearly[best].year - year)) best = i;
    });
    setHover(best);
  };

  const h = hover !== null ? yearly[hover] : null;
  const summary = `0년차 ${formatWon(yearly[0].total)}에서 ${lastYear.toFixed(lastYear % 1 ? 1 : 0)}년차 ${formatWon(yearly[yearly.length - 1].total)}까지 늘어나는 그래프. 목표 ${formatWon(goal)}.`;

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={summary}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setHover(null)}
        style={{ display: 'block', touchAction: 'pan-y' }}
      >
        {/* 가로 눈금선 + y축 라벨 */}
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={pad.left} x2={width - pad.right} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeWidth="1" />
            <text x={pad.left - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="var(--text-sub)">{shortWon(v)}</text>
          </g>
        ))}

        {/* x축 라벨 */}
        {xTicks.map((yr) => (
          <text key={yr} x={x(yr)} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--text-sub)">
            {yr === 0 ? '지금' : `${yr}년`}
          </text>
        ))}

        {/* 청년 상품 만기 */}
        {maturities.map((m) => (
          <g key={m.name}>
            <line x1={x(m.month / 12)} x2={x(m.month / 12)} y1={pad.top} y2={pad.top + innerH}
              stroke="var(--text-sub)" strokeWidth="1" strokeDasharray="2 3" />
            <text x={x(m.month / 12) + 4} y={pad.top + innerH - 6} fontSize="10" fill="var(--text-sub)">
              {m.name.replace('청년', '')} 만기
            </text>
          </g>
        ))}

        {/* 목표선 */}
        <line x1={pad.left} x2={width - pad.right} y1={y(goal)} y2={y(goal)}
          stroke="var(--text)" strokeWidth="1.5" strokeDasharray="6 4" />
        <text x={pad.left + 4} y={y(goal) - 6} textAnchor="start" fontSize="11" fontWeight="700" fill="var(--text)">
          목표 {shortWon(goal)}
        </text>

        {/* 총자산 선 */}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {/* 선택한 점 */}
        {h && (
          <g>
            <line x1={x(h.year)} x2={x(h.year)} y1={pad.top} y2={pad.top + innerH} stroke="var(--text-sub)" strokeWidth="1" />
            <circle cx={x(h.year)} cy={y(h.total)} r="5" fill="var(--accent)" stroke="var(--card)" strokeWidth="2" />
          </g>
        )}
      </svg>

      {h && (
        <div
          className="chart-tip"
          style={{ left: Math.min(Math.max(x(h.year) - 85, 0), width - 170), top: 0 }}
        >
          <strong>{h.year === 0 ? '지금' : `${Number.isInteger(h.year) ? h.year : h.year.toFixed(1)}년차`}</strong>
          <span>총자산 {formatWon(h.total)}</span>
          <span className="hint">원금 {formatWon(h.start + h.paidIn)}</span>
        </div>
      )}
    </div>
  );
}
