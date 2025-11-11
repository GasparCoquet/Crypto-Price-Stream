import WebSocket from 'ws';
import { CONFIG } from '../config/env.js';
import { tsToIso } from '../utils/time.js';
import { logger } from '../utils/logger.js';

export function createPriceStream(onTick) {
  const url = `wss://stream.binance.com:9443/ws/${CONFIG.PAIR}@trade`;
  const ws = new WebSocket(url);

  ws.on('open', () => logger.info(`✅ Connected to ${CONFIG.PAIR.toUpperCase()} stream`));
  ws.on('message', (msg) => { 
    const data = JSON.parse(msg);
    const price = Number(data.p);
    const date = tsToIso(Date.now());

    logger.info(`${date} — ${CONFIG.PAIR.toUpperCase()} : ${price}`);
    onTick({ ts: Date.now(), price });
  });
  ws.on('close', () => logger.warn('❌ Disconnected'));
  ws.on('error', (err) => logger.error('WebSocket error:', err.message));
}
