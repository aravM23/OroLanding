// Manual smoke test:
//   GET  https://buildingoro.ca/api/unsubscribe?token=<signed-token>  → 200 HTML
//   POST https://buildingoro.ca/api/unsubscribe?token=<signed-token>  → 200 {"ok":true}
//   GET  https://buildingoro.ca/api/unsubscribe?token=bad             → 400 HTML
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribeToken } from './_lib/unsubscribe-token';

const SUCCESS_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Unsubscribed — Oro Insiders</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; max-width: 480px; margin: 80px auto; padding: 24px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 28px; font-weight: 500; letter-spacing: -0.01em; margin-bottom: 16px; }
    p { color: #4a4a4a; font-size: 17px; }
    .meta { font-size: 12px; color: #8a8a8a; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 32px; font-family: -apple-system, sans-serif; }
    a { color: #1a1a1a; }
  </style>
</head>
<body>
  <div class="meta">Oro Insiders</div>
  <h1>You're unsubscribed.</h1>
  <p>You won't receive any more issues of Oro Insiders. If this was a mistake, reply to any past issue and we'll add you back.</p>
  <p>The Oro app waitlist is separate. Visit <a href="https://buildingoro.ca">buildingoro.ca</a> if you want to manage that.</p>
</body>
</html>`;

const ERROR_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Invalid link</title>
<style>body{font-family:Georgia,serif;max-width:480px;margin:80px auto;padding:24px;color:#1a1a1a;line-height:1.6}h1{font-weight:500}p{color:#4a4a4a}</style>
</head><body><h1>This unsubscribe link is invalid or expired.</h1><p>If you keep getting Oro Insiders, reply to the latest issue and we'll remove you manually.</p></body></html>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).end();
  }

  const token = typeof req.query.token === 'string' ? req.query.token : '';
  const secret = process.env.UNSUBSCRIBE_SECRET ?? '';
  if (!secret) {
    return res.status(500).send('Server misconfigured.');
  }

  const verified = verifyUnsubscribeToken(token, secret);
  if (!verified) {
    if (req.method === 'POST') return res.status(400).json({ ok: false, error: 'Invalid token' });
    return res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8').send(ERROR_HTML);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    { auth: { persistSession: false } },
  );

  const source = req.method === 'POST' ? 'one_click' : 'email_link';
  const { error } = await supabase
    .from('waitlist')
    .update({ unsubscribed_at: new Date().toISOString(), unsubscribe_source: source })
    .eq('email', verified.email)
    .is('unsubscribed_at', null);

  if (error) {
    console.error('unsubscribe error', error);
    if (req.method === 'POST') return res.status(500).json({ ok: false, error: 'DB error' });
    return res.status(500).send('Could not process unsubscribe. Reply to the email and we will remove you manually.');
  }

  if (req.method === 'POST') return res.status(200).json({ ok: true });
  return res.status(200).setHeader('Content-Type', 'text/html; charset=utf-8').send(SUCCESS_HTML);
}
