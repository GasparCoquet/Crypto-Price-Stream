import { createPriceStream } from './services/stream.js';
import { makePipeline } from './core/pipeline.js';
import { startHttp } from './routes/http.js'; // optional
import { initDB, insertTick } from './storage/db.js';
import { CONFIG } from './config/env.js';
import { logger } from './utils/logger.js';

logger.info('Starting Crypto Price Stream application...');
const db = await initDB(); // <-- creates data/ and crypto.db if missing
logger.info('Database initialized successfully');
const pipeline = makePipeline();
logger.info(`Pipeline created for pair: ${CONFIG.PAIR.toUpperCase()}`);

createPriceStream(async ({ ts, price }) => {
  // run pipeline logic
  pipeline({ ts, price });

  // log tick to DB
  await insertTick(db, { ts, pair: CONFIG.PAIR, price });
});

startHttp();
