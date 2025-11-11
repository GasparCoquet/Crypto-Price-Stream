import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
  PAIR: (process.env.PAIR || 'ethbtc').toLowerCase(),
  ALERT_THRESHOLD: Number(process.env.ALERT_THRESHOLD || 0.5),
  PORT: Number(process.env.PORT || 3000),
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || ''
};
