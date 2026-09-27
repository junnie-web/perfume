import "server-only";
import { Resend } from "resend";
import type { Newsletter } from "./types";
import { vol2 } from "./utils";

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
const from = () => process.env.NEWSLETTER_FROM ?? "향기록 <onboarding@resend.dev>";

function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 환경 변수가 없어요.");
  return new Resend(key);
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function frame(inner: string, footer: string) {
  return `<div style="background:#F2F0F4;padding:32px 16px;font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#FBFAFC;border:1px solid #DAD4E0;border-radius:14px;padding:32px 28px">
    ${inner}
    <hr style="border:0;border-top:1px solid #DAD4E0;margin:28px 0 16px">
    <p style="margin:0;font-size:12px;line-height:1.7;color:#6B6476">${footer}</p>
  </div></div>`;
}

export async function sendConfirmEmail(email: string, token: string) {
  const link = `${siteUrl()}/newsletter/confirm?token=${token}`;
  const { error } = await resend().emails.send({
    from: from(),
    to: [email],
    subject: "[향기록] 뉴스레터 구독을 확인해 주세요",
    html: frame(
      `<div style="font-size:12px;letter-spacing:2px;color:#6B6476">향기록 레터</div>
       <h1 style="font-family:Georgia,serif;font-size:24px;margin:10px 0 16px;color:#221E2B">구독 확인</h1>
       <p style="font-size:15px;line-height:1.8;color:#221E2B">아래 버튼을 누르면 향기록 뉴스레터 구독이 완료돼요.</p>
       <p style="margin:24px 0"><a href="${link}" style="background:#6B2A4A;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:15px">구독 확인하기</a></p>`,
      "직접 신청하지 않았다면 이 메일을 무시하세요. 확인하지 않으면 메일이 가지 않아요."
    ),
    text: `아래 링크를 열면 향기록 뉴스레터 구독이 완료돼요.\n${link}\n\n직접 신청하지 않았다면 이 메일을 무시하세요.`,
  });
  if (error) throw new Error(error.message);
}

/** 구독자마다 개인 구독취소 링크를 넣어 100명씩 나눠 보내요. 보낸 수를 돌려줘요. */
export async function sendNewsletterEmails(n: Newsletter, subs: { email: string; token: string }[]) {
  const r = resend();
  const paras = n.body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 18px;font-size:16px;line-height:1.85;color:#221E2B">${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
  const webLink = `${siteUrl()}/newsletter/${n.vol}`;
  const subject = `[향기록 레터 Vol. ${vol2(n.vol)}] ${n.title}`;
  let sent = 0;
  for (let i = 0; i < subs.length; i += 100) {
    const batch = subs.slice(i, i + 100).map((s) => {
      const unsub = `${siteUrl()}/newsletter/unsubscribe?token=${s.token}`;
      return {
        from: from(),
        to: [s.email],
        subject,
        headers: {
          "List-Unsubscribe": `<${unsub}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        html: frame(
          `<div style="font-size:12px;letter-spacing:2px;color:#6B6476">향기록 레터 · VOL. ${vol2(n.vol)}</div>
           <h1 style="font-family:Georgia,'AppleMyungjo',serif;font-size:26px;line-height:1.35;margin:10px 0 24px;color:#221E2B">${esc(n.title)}</h1>
           ${paras}
           <p style="margin:8px 0 0;font-size:13px"><a href="${webLink}" style="color:#6B2A4A">웹에서 보기</a></p>`,
          `향기록 뉴스레터를 구독해 주셔서 감사해요.<br><a href="${unsub}" style="color:#6B6476">구독 취소</a>`
        ),
        text: `향기록 레터 Vol. ${vol2(n.vol)}\n\n${n.title}\n\n${n.body}\n\n웹에서 보기: ${webLink}\n구독 취소: ${unsub}`,
      };
    });
    const { error } = await r.batch.send(batch);
    if (error) {
      if (sent === 0) throw new Error(error.message);
      break;
    }
    sent += batch.length;
  }
  return sent;
}
