import fs from 'fs';
import path from 'path';

const logFile = 'logs/app.log';

function writeToFile(message) {
  const dir = path.dirname(logFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(logFile, message + '\n');
}

function format(level, msg) {
  const time = new Date().toISOString();
  return `[${time}] [${level.toUpperCase()}] ${msg}`;
}

export const logger = {
  info: (msg) => {
    const line = format('info', msg);
    console.log(line);
    writeToFile(line);
  },
  warn: (msg) => {
    const line = format('warn', `⚠️ ${msg}`);
    console.warn(line);
    writeToFile(line);
  },
  error: (msg, err = '') => {
    const line = format('error', `❌ ${msg} ${err}`);
    console.error(line);
    writeToFile(line);
  }
};
