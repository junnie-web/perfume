/** 평점: 별 대신 동그라미 5개 (포인트 색 민트) */
export default function Rating({ value, small }: { value: number | null | undefined; small?: boolean }) {
  if (!value) return null;
  return (
    <span className={`rating ${small ? "sm" : ""}`} role="img" aria-label={`5점 만점에 ${value}점`}>
      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= value ? "f" : ""} />)}
    </span>
  );
}
