import { formatMonths } from '../lib/simulate.js';
import { goalHeading } from '../lib/greeting.js';

// 화면 아래에 고정되는 결과 바 + 결과 화면으로 가는 버튼
export default function ResultBar({ result, name, goal, onOpen }) {
  return (
    <footer className="result-bar">
      <div className="result-bar-row" aria-live="polite">
        <span>{result.noGoal ? '목표까지' : goalHeading(name, goal)}</span>
        <strong>
          {result.noGoal
            ? '목표 금액을 입력해 주세요'
            : result.reached
              ? formatMonths(result.months)
              : '100년 넘게 걸려요'}
        </strong>
      </div>
      <button type="button" className="btn-primary" onClick={onOpen} disabled={result.noGoal}>
        자세한 결과 보기
      </button>
    </footer>
  );
}
