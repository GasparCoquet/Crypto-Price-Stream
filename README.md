Crypto Price Stream

A Node.js real-time crypto data pipeline that connects to Binance WebSocket and REST API, streams live prices (e.g. ETH/BTC), and stores them into a local SQLite database and optional CSV file.

## 🚀 Features

**Backend**
- 🔄 Live WebSocket streaming from Binance (real-time price updates)
- 🌐 REST API integration for historical data and snapshots
- 💾 SQLite database storage with persistent price history
- 📊 CSV logging for easy Excel import and analysis
- 🔔 Alert system with configurable thresholds
- 🧩 Clean modular architecture (easily extendable)

**Frontend Dashboard**
- 📈 Interactive line charts showing recent price movements
- 🔄 Auto-refresh: live page polls the API every 3s over HTTP; historical page every 60s
- 📊 Latest price display with timestamp
- 🎨 Responsive UI built with Next.js and Chart.js
- 📍 See [dashboard/README.md](./dashboard/README.md) for detailed documentation

> **Where the WebSocket is:** the *backend* consumes a Binance WebSocket (`src/services/stream.js`)
> and writes each raw tick to SQLite. The *dashboard* contains no WebSocket code - it polls the
> backend HTTP API every 3 seconds.

## ⚙️ Quick Start

### Installation

```bash
# Install backend dependencies
npm install

# Install dashboard dependencies
cd dashboard && npm install && cd ..
```

### Configuration

Create a `.env` file in the root directory:

```bash
echo PAIR=ethbtc > .env
echo ALERT_THRESHOLD=0.5 >> .env
echo PORT=3000 >> .env
```

Or create manually:

```env
PAIR=ethbtc
ALERT_THRESHOLD=0.5
PORT=3000
TELEGRAM_TOKEN=
TELEGRAM_CHAT_ID=
```

See [.env.example](.env.example) for a template.

### Running the Application

**Terminal 1 - Backend:**

```bash
npm run dev
```

**Terminal 2 - Dashboard (optional):**

```bash
cd dashboard
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) for the dashboard.

## 📁 Project Structure

```
src/
├─ index.js               # Main entry point
├─ config/env.js          # Configuration
├─ services/              # WebSocket, REST, notifications
├─ storage/               # Database (SQLite) & CSV
├─ core/                  # Pipeline & indicators
├─ routes/http.js         # HTTP API endpoints
└─ utils/                 # Logger & time helpers
```

## 🌐 API Endpoints

- `GET /` - App status
- `GET /last?n=50` - Last N price ticks
- `GET /historical?interval=1m&limit=100` - Historical close price data

### Example

```bash
curl http://localhost:3000/last?n=50
```

## 🧰 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run in dev mode (with nodemon) |
| `npm start` | Run once |

## 🔗 Related Documentation

- [Dashboard Documentation](./dashboard/README.md) - Frontend dashboard details
- [Binance API Documentation](https://binance-docs.github.io/apidocs/)

## 🧾 License

MIT License - you can freely use and modify this project.

## 👨‍💻 Author

**Gaspar Coquet**
- Real-time trading data engineer
- Passionate about algorithmic trading, market microstructure, and DeFi systems
