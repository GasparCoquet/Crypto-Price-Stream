import { CONFIG } from '../config/env.js';
import axios from 'axios';
import { logger } from '../utils/logger.js';

export async function notify(msg) {
  logger.info(msg);

  if (!CONFIG.TELEGRAM_TOKEN || !CONFIG.TELEGRAM_CHAT_ID) return;

  const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_TOKEN}/sendMessage`;
  try {
    await axios.post(url, {
      chat_id: CONFIG.TELEGRAM_CHAT_ID,
      text: msg
    });
    logger.info('Telegram notification sent successfully');
  } catch (e) {
    logger.error('Telegram error:', e?.response?.data || e.message);
  }
}
