import { CONFIG } from '../config/env.js';
import { pctChange } from './indicators.js';
import { appendRow } from '../storage/csv.js';
import { notify } from '../services/notifier.js';

const WINDOW_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export function makePipeline() {
  const priceHistory = []; // Array of { ts, price } objects
  
  return function onTick({ ts, price }) {
    appendRow({ ts, price });
    
    // Add current price to history
    priceHistory.push({ ts, price });
    
    // Remove prices older than 5 minutes
    const cutoffTime = ts - WINDOW_MS;
    while (priceHistory.length > 0 && priceHistory[0].ts < cutoffTime) {
      priceHistory.shift();
    }
    
    // Need at least 2 prices to compare (one from 5 min ago, one current)
    if (priceHistory.length < 2) {
      return;
    }
    
    // Get the oldest price in the window (closest to 5 minutes ago)
    const oldestPrice = priceHistory[0].price;
    const change = pctChange(oldestPrice, price);
    
    // Check if threshold is exceeded
    if (Math.abs(change) >= CONFIG.ALERT_THRESHOLD) {
      const direction = change >= 0 ? '↑' : '↓';
      const timeDiff = Math.floor((ts - priceHistory[0].ts) / 1000); // seconds
      notify(`⚠️ ${CONFIG.PAIR.toUpperCase()} moved ${direction}${Math.abs(change).toFixed(3)}% over ${timeDiff}s (from ${oldestPrice.toFixed(8)} to ${price.toFixed(8)})`);
    }
  };
}
