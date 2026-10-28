import { formatWon } from './format.js';

// "10억 원" → "10억", "1억 5,000만 원" → "1억 5,000만"
export function goalShort(goal) {
  return formatWon(goal).replace(/ ?원$/, '');
}

// 이름이 있으면 "○○님, 10억까지", 없으면 "목표까지"
export function goalHeading(name, goal) {
  const n = (name ?? '').trim();
  return n ? `${n}님, ${goalShort(goal)}까지` : '목표까지';
}

// 지금 나이 + 걸리는 개월 수 → 달성할 때 만 나이 (나이를 안 적었으면 null)
export function ageAt(age, months) {
  if (age === null || age === undefined) return null;
  return Math.floor(age + months / 12);
}
