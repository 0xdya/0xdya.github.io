// api/send-message.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  
    const { name, message } = req.body;
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = "5962064921";
  
    const text = `📩 new message from \n\n👤 name: ${name || "anonymous"}\n\n💬 message:\n${message}`;
  
    try {
      const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text })
      });
  
      const data = await telegramRes.json();
      if (data.ok) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(500).json({ error: 'Telegram API error' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }