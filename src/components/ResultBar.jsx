import { formatMonths } from '../lib/simulate.js';

// 화면 아래에 고정되는 결과 바
export default function ResultBar({ result }) {
  return (
    <footer className="result-bar" aria-live="polite">
      <span>목표까지</span>
      <strong>
        {result.noGoal
          ? '목표 금액을 입력해 주세요'
          : result.reached
            ? formatMonths(result.months)
            : '100년 넘게 걸려요'}
      </strong>
    </footer>
  );
}
