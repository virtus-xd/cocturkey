// Discord webhook entegrasyonu — kullanıcının kendi sunucusuna gönderir.
// Webhook URL'i public.users.discordWebhookUrl'de saklanır; user > profil > ayarlar.
//
// Webhook URL biçimi: https://discord.com/api/webhooks/<id>/<token>
// Validasyon: discord.com hostuna ait, /api/webhooks/ path'i.

import { SITE } from "@/lib/constants";

const DISCORD_WEBHOOK_PATTERN =
  /^https:\/\/(?:discord(?:app)?\.com|ptb\.discord\.com|canary\.discord\.com)\/api\/webhooks\/\d+\/[\w-]+$/;

export function isValidDiscordWebhook(url: string | null | undefined): boolean {
  if (!url) return false;
  return DISCORD_WEBHOOK_PATTERN.test(url.trim());
}

type ApplicationArgs = {
  webhookUrl: string;
  clanName: string;
  clanTag: string;
  applicantName: string;
  applicantMessage: string;
};

export async function sendApplicationDiscord(args: ApplicationArgs): Promise<{ ok: boolean }> {
  if (!isValidDiscordWebhook(args.webhookUrl)) return { ok: false };
  const url = `${SITE.url}/klanlar/${encodeURIComponent(args.clanTag)}`;

  const payload = {
    username: SITE.name,
    embeds: [
      {
        title: `Yeni başvuru: ${args.applicantName}`,
        description: args.applicantMessage.slice(0, 1500),
        color: 0xf59e0b,
        url,
        footer: { text: `${args.clanName} (${args.clanTag})` },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(args.webhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: res.ok };
  } catch (e) {
    console.error("[discord-webhook] send failed", e);
    return { ok: false };
  }
}
