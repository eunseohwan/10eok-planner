// 맨 아래 안내 + 개인정보처리방침 링크
export default function Footer() {
  return (
    <footer className="site-footer">
      <p>계산 결과는 참고용이며, 투자 수익과 정책 조건은 바뀔 수 있어요.</p>
      <p>
        <a href="/privacy.html">개인정보처리방침</a>
        <span aria-hidden="true"> · </span>
        <span>© 2026 10억 플래너</span>
      </p>
    </footer>
  );
}
