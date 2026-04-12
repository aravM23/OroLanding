import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SHEETS_WEBHOOK_URL = process.env.GOOGLE_SHEETS_WEBHOOK_URL;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, consent, consent_timestamp } = req.body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  const { error: dbError } = await supabase
    .from('waitlist')
    .insert([{
      email: cleanEmail,
      consent: consent ?? true,
      consent_email_marketing: true,
      consent_timestamp: consent_timestamp || new Date().toISOString(),
    }]);

  if (dbError) {
    if (dbError.code === '23505') {
      return res.status(409).json({ code: 'already_registered' });
    }
    console.error('Supabase insert error:', dbError);
    return res.status(500).json({ error: 'Failed to join waitlist' });
  }

  if (SHEETS_WEBHOOK_URL) {
    try {
      await fetch(SHEETS_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          consent: true,
          consent_email_marketing: true,
          consent_timestamp: consent_timestamp || new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Sheets webhook error:', err);
    }
  }

  return res.status(201).json({ success: true });
}
