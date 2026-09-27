import { redirect } from "next/navigation";
import { getViewer } from "@/lib/auth";
import NameForm from "@/components/NameForm";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const { user, profile, isAdmin } = await getViewer();
  if (!user) redirect("/login?next=/me");
  return (
    <div className="center-card">
      <h2>내 정보</h2>
      <p className="muted" style={{ margin: 0 }}>{user.email}{isAdmin ? " · 관리자" : ""}</p>
      <NameForm current={profile?.display_name ?? ""} />
    </div>
  );
}
