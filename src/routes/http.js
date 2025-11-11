
import http from 'http';
import url from 'url';
import { CONFIG } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { initDB } from '../storage/db.js';
import { getCandles } from '../services/rest.js';

let dbInstance = null;

export async function startHttp() {
  if (!dbInstance) dbInstance = await initDB();
  const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/last') {
      const n = parseInt(parsedUrl.query.n) || 200;
      try {
        const rows = await dbInstance.all(
          'SELECT ts, datetime, pair, price FROM prices ORDER BY ts DESC LIMIT ?',
          n
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'DB error', details: e.message }));
      }
      return;
    }
    if (parsedUrl.pathname === '/historical') {
      const interval = parsedUrl.query.interval || '1m';
      const limit = parseInt(parsedUrl.query.limit) || 300;
      const symbol = (parsedUrl.query.symbol || CONFIG.PAIR).toString();
      try {
        const rows = await getCandles(symbol, interval, limit);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(rows));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Upstream error', details: e.message }));
      }
      return;
    }
    // Default: status
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', pair: CONFIG.PAIR }));
  });
  server.listen(CONFIG.PORT, () =>
    logger.info(`🌐 HTTP server running on http://localhost:${CONFIG.PORT}`)
  );
}
