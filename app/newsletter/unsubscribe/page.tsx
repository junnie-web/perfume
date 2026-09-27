export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const { token = "", done } = await searchParams;
  if (done)
    return (
      <div className="center-card">
        <h2>구독을 취소했어요</h2>
        <p className="muted" style={{ margin: 0 }}>더 이상 Parfumoir Letter를 메일로 보내지 않아요. 지난 호는 사이트 뉴스레터 탭에서 언제든 볼 수 있어요.</p>
        <a className="btn" href="/newsletter">뉴스레터 보러 가기</a>
      </div>
    );
  return (
    <div className="center-card">
      <h2>뉴스레터 구독 취소</h2>
      <p className="muted" style={{ margin: 0 }}>아래 버튼을 누르면 Parfumoir Letter 메일이 더 이상 오지 않아요.</p>
      <form action={`/api/unsubscribe?token=${encodeURIComponent(token)}`} method="post">
        <button className="btn primary" type="submit">구독 취소하기</button>
      </form>
    </div>
  );
}
