import crypto from 'node:crypto';

export type SignedToken = { email: string; ts: number };

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}

function fromB64url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function signUnsubscribeToken(email: string, secret: string, now = Date.now()): string {
  const normalized = email.trim().toLowerCase();
  const ts = Math.floor(now / 1000);
  const payload = `${normalized}.${ts}`;
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return `${b64url(normalized)}.${ts}.${sig}`;
}

export function verifyUnsubscribeToken(token: string, secret: string): SignedToken | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [emailEncoded, tsStr, sig] = parts;
  const email = fromB64url(emailEncoded);
  const ts = Number(tsStr);
  if (!email || !Number.isFinite(ts)) return null;
  const expected = crypto.createHmac('sha256', secret).update(`${email}.${ts}`).digest('hex');
  const a = Buffer.from(sig, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(a, b)) return null;
  return { email, ts };
}
