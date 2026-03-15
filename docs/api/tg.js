export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }


  const token = process.env.TELEGRAM_BOT_TOKEN;
  const contentType = req.headers['content-type'] || '';


  try {
    
    if (contentType.includes('multipart/form-data')) {
      const formData = await parseFormData(req);
      
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        body: formData
      });
      
      const data = await tgRes.json();
      return res.status(data.ok ? 200 : 500).json(data);
    } 
    else {
      const { chat_id, text } = req.body;
      
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text })
      });
      
      const data = await tgRes.json();
      return res.status(data.ok ? 200 : 500).json(data);
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
async function parseFormData(req) {
  const formData = new FormData();
 
  return req.body; 
}
