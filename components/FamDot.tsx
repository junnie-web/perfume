import { famColor } from "@/lib/utils";
export default function FamDot({ family }: { family: string }) {
  return <span className="dot" style={{ background: famColor(family) }} aria-hidden="true" />;
}
