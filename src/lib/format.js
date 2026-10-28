// 원 단위 숫자를 "1,234만 원" 같은 읽기 쉬운 글자로 바꿔요.
export function formatWon(won) {
  if (won === null || won === undefined || Number.isNaN(won)) return '-';
  const sign = won < 0 ? '-' : '';
  const abs = Math.abs(won);

  if (abs >= 100_000_000) {
    const eok = Math.floor(abs / 100_000_000);
    const man = Math.round((abs % 100_000_000) / 10_000);
    return `${sign}${eok}억${man ? ` ${man.toLocaleString('ko-KR')}만` : ''} 원`;
  }
  if (abs >= 10_000) return `${sign}${Math.round(abs / 10_000).toLocaleString('ko-KR')}만 원`;
  return `${sign}${abs.toLocaleString('ko-KR')}원`;
}
