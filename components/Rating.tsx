import { ratingText } from "@/lib/utils";

/** 별 대신 숫자로: 4.0 / 5 */
export default function Rating({ value, small }: { value: number | null | undefined; small?: boolean }) {
  if (!value) return null;
  return (
    <span className={`rating ${small ? "sm" : ""}`} aria-label={`5점 만점에 ${value}점`}>
      <b>{ratingText(value)}</b><span>/5</span>
    </span>
  );
}
