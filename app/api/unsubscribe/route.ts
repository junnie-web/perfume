import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f-]{36}$/i;

// 구독 취소 (메일 앱의 "구독 취소" 버튼과 사이트의 버튼이 모두 여기로 POST 해요)
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (UUID.test(token)) {
    await createAdminClient()
      .from("subscribers")
      .update({ unsubscribed_at: new Date().toISOString(), confirmed: false })
      .eq("token", token);
  }
  const accept = req.headers.get("accept") ?? "";
  if (accept.includes("text/html")) return NextResponse.redirect(new URL("/newsletter/unsubscribe?done=1", req.url), 303);
  return new NextResponse(null, { status: 200 });
}
