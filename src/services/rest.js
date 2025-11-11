import axios from 'axios';
import { CONFIG } from '../config/env.js';

const BASE_URL = 'https://api.binance.com/api/v3';

export async function getPrice(symbol = CONFIG.PAIR) {
  const res = await axios.get(`${BASE_URL}/ticker/price`, {
    params: { symbol: symbol.toUpperCase() }
  });
  return Number(res.data.price);
}

export async function getCandles(symbol = CONFIG.PAIR, interval = '1m', limit = 50) {
  const res = await axios.get(`${BASE_URL}/klines`, {
    params: { symbol: symbol.toUpperCase(), interval, limit }
  });

  // Simplify candle structure
  return res.data.map(c => ({
    openTime: c[0],
    open: Number(c[1]),
    high: Number(c[2]),
    low: Number(c[3]),
    close: Number(c[4]),
    volume: Number(c[5]),
    closeTime: c[6]
  }));
}
export async function getExchangeInfo() {
  const res = await axios.get(`${BASE_URL}/exchangeInfo`);
  return res.data.symbols.map(s => s.symbol);
}

