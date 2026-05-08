import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const KEY        = process.env.OKX_KEY;
  const SECRET     = process.env.OKX_SECRET;
  const PASSPHRASE = process.env.OKX_PASSPHRASE;
  const path       = req.query.path || '/api/v5/account/positions';

  const ts  = new Date().toISOString();
  const msg = ts + 'GET' + path;
  const sig = crypto.createHmac('sha256', SECRET).update(msg).digest('base64');

  try {
    const response = await fetch(`https://www.okx.com${path}`, {
      headers: {
        'OK-ACCESS-KEY':        KEY,
        'OK-ACCESS-SIGN':       sig,
        'OK-ACCESS-TIMESTAMP':  ts,
        'OK-ACCESS-PASSPHRASE': PASSPHRASE,
        'x-simulated-trading':  '0',
      }
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
