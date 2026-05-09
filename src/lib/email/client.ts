// Resend ile transactional e-posta. RESEND_API_KEY yokken dev'de console.log,
// üretimde sessizce başarısız olur — kritik olmayan işler için yeter (başvuru bildirimi).

import { Resend } from "resend";

import { SITE } from "@/lib/constants";

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

let cached: Resend | null = null;
function getClient(): Resend | null {
  if (cached) return cached;
  if (!process.env.RESEND_API_KEY) return null;
  cached = new Resend(process.env.RESEND_API_KEY);
  return cached;
}

export async function sendEmail({ to, subject, html, text }: SendArgs): Promise<{ ok: boolean }> {
  const client = getClient();
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email:dev]", { to, subject, text: text ?? "(html only)" });
      return { ok: true };
    }
    console.warn("[email] RESEND_API_KEY yok, e-posta gönderilmedi");
    return { ok: false };
  }
  try {
    const from = process.env.EMAIL_FROM ?? `${SITE.name} <noreply@${new URL(SITE.url).host}>`;
    await client.emails.send({ from, to, subject, html, ...(text ? { text } : {}) });
    return { ok: true };
  } catch (e) {
    console.error("[email] send failed", e);
    return { ok: false };
  }
}
