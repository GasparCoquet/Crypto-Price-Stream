import fs from 'fs';
const FILE = 'data/prices.csv';

export function appendRow({ ts, price }) {
  const header = 'timestamp,price\n';
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, header);
  fs.appendFileSync(FILE, `${ts},${price}\n`);
}
