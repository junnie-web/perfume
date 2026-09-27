import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const UUID = /^[0-9a-f-]{36}$/i;

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const url = new URL("/newsletter", req.url);
  if (!UUID.test(token)) { url.searchParams.set("confirmed", "0"); return NextResponse.redirect(url); }
  const { data } = await createAdminClient()
    .from("subscribers")
    .update({ confirmed: true, confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("token", token)
    .select("id");
  url.searchParams.set("confirmed", data?.length ? "1" : "0");
  return NextResponse.redirect(url);
}
