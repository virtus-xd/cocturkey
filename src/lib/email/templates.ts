// E-posta şablonları — minimal HTML. Tasarım gerektiğinde React Email'e geçilir.

import { SITE } from "@/lib/constants";

type ApplicationReceivedArgs = {
  ownerEmail: string;
  ownerName: string;
  clanName: string;
  applicantName: string;
  applicantMessage: string;
  clanTag: string;
};

export function applicationReceivedTemplate(args: ApplicationReceivedArgs) {
  const url = `${SITE.url}/klanlar/${encodeURIComponent(args.clanTag)}`;
  const safe = (s: string) =>
    s.replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
    );
  return {
    subject: `${args.clanName} klanına yeni başvuru: ${args.applicantName}`,
    html: `
<!doctype html>
<html lang="tr"><body style="font-family: system-ui, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #18181b;">
  <h1 style="font-size: 20px; margin-bottom: 8px;">Yeni başvuru</h1>
  <p>Selam ${safe(args.ownerName)},</p>
  <p><strong>${safe(args.applicantName)}</strong>, <strong>${safe(args.clanName)}</strong> klanına başvurdu.</p>
  <blockquote style="border-left: 3px solid #d4d4d8; padding-left: 12px; color: #52525b; margin: 16px 0;">
    ${safe(args.applicantMessage)}
  </blockquote>
  <p>
    <a href="${url}" style="display: inline-block; background: #18181b; color: #fff; padding: 10px 16px; border-radius: 6px; text-decoration: none;">
      İlanını aç
    </a>
  </p>
  <p style="color: #71717a; font-size: 12px; margin-top: 32px;">
    ${SITE.name} — bu e-postayı klan sahibi olduğun için aldın.
  </p>
</body></html>`.trim(),
    text: `${args.applicantName} (${args.clanName} klanına başvuru)\n\n${args.applicantMessage}\n\nİlana git: ${url}`,
  };
}
