export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const chatId = 5962064921;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  try {
    const contentType = req.headers['content-type'] || '';

    if (contentType.startsWith('multipart/form-data')) {
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
        method: 'POST',
        headers: {},
        body: req,   
      });

      const data = await tgRes.json();
      if (data.ok) return res.status(200).json({ success: true });
      return res.status(500).json({ error: 'Telegram API error', data });
    } else {
      const { username, message, ipAddress } = req.body;
      const caption = `usr: ${username}\nmsg: ${message}\nIP Address: ${ipAddress}`;

      const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: caption }),
      });

      const data = await tgRes.json();
      if (data.ok) return res.status(200).json({ success: true });
      return res.status(500).json({ error: 'Telegram API error', data });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
