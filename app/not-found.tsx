import Link from "next/link";
export default function NotFound() {
  return (
    <div className="center-card">
      <h2>페이지를 찾을 수 없어요</h2>
      <p className="muted" style={{ margin: 0 }}>주소가 바뀌었거나 삭제된 페이지예요.</p>
      <Link className="btn" href="/">홈으로</Link>
    </div>
  );
}
