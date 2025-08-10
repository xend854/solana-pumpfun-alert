import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

let alertsEnabled = true;

bot.onText(/\/alerts (on|off)/, (msg, match) => {
  const chatId = msg.chat.id;
  alertsEnabled = match![1] === 'on';
  bot.sendMessage(chatId, `Alerts turned ${alertsEnabled ? 'ON' : 'OFF'}`);
});

async function fetchNewTokens() {
  if (!alertsEnabled) return;
  try {
    const res = await axios.get('https://api.pump.fun/new/tokens'); // Pump.fun new tokens API endpoint (check docs)
    const tokens = res.data.tokens; // adjust according to real API response

    for (const token of tokens) {
      const msg = `
🚀 New Token: ${token.name}
🆔 Mint: ${token.mint}
💰 Price: ${token.price}
📊 Liquidity: ${token.liquidity}
⚠️ Risk Score: ${token.riskScore}
🖼️ Image: ${token.imageUrl}
      `;
      await bot.sendMessage(CHAT_ID, msg);
    }
  } catch (error) {
    console.error('Error fetching tokens:', error);
  }
}

setInterval(fetchNewTokens, 30_000);

app.get('/', (req, res) => {
  res.send('Pump.fun Telegram Alert Backend running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
