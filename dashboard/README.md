📊 Crypto Price Stream - Dashboard

Next.js web dashboard for visualizing real-time cryptocurrency price data from the backend API.

## 🎯 Overview

This dashboard provides real-time visualization of crypto prices streamed from Binance via the backend service. It features two views: a live WebSocket price chart and a REST API chart displaying close prices.

## ✨ Features

- 📈 **Live Price Chart (WebSocket)** - Interactive line chart showing last 5 minutes of price data
- 📊 **REST API Chart** - Historical close price visualization as a line chart
- 🔄 **Auto-Refresh** - WebSocket updates every 5s, REST API updates every 60s
- 📊 **Real-time Display** - Shows current pair, price, and timestamp
- 🎨 **Modern UI** - Built with Next.js 15, Chart.js, and Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 20
- Backend API running (see main [README.md](../README.md))

### Installation

```bash
# Navigate to dashboard directory
cd dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📁 Dashboard Structure

```
dashboard/
├─ app/
│  ├─ page.tsx              # Main dashboard (live price chart - WebSocket)
│  ├─ historical/
│  │  └─ page.tsx           # REST API chart (historical close price)
│  ├─ api/
│  │  ├─ last/
│  │  │  └─ route.ts        # Proxy to backend /last endpoint
│  │  └─ historical/
│  │     └─ route.ts        # Proxy to backend /historical endpoint
│  └─ layout.tsx            # Root layout
├─ package.json
└─ README.md                # This file
```

## 🔌 API Endpoints

The dashboard uses Next.js API routes as a proxy to the backend:

### `/api/last`

Fetches the last N price ticks from the backend.

- **Query Parameters:**
  - `n` (optional): Number of recent prices to fetch (default: 200)
- **Example:** `/api/last?n=100`
- **Response:** Array of `{ts, pair, price}` objects

### `/api/historical`

Fetches historical close price data from the backend (REST API).

- **Query Parameters:**
  - `interval` (optional): Time interval (default: '1m')
  - `limit` (optional): Number of data points (default: 100)
  - `symbol` (optional): Trading pair (e.g., 'ethbtc')
- **Example:** `/api/historical?interval=1m&limit=100&symbol=ethbtc`
- **Response:** Array of objects with `openTime` and `close` price

## 🛠️ Development

### Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Charts:** Chart.js + react-chartjs-2
- **Data Fetching:** SWR (stale-while-revalidate)
- **Financial Charts:** chartjs-chart-financial

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Variables

Create a `.env.local` file in the `dashboard/` directory:

```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

This tells the dashboard where to find the backend API. The default is `http://localhost:3000`.

## 📊 How It Works

1. **Backend streams data** → Prices are stored in SQLite database
2. **Dashboard fetches data** → API routes fetch from backend via HTTP
3. **Charts update** → SWR auto-refreshes every 3 seconds
4. **User sees live data** → Charts display with smooth animations

### Data Flow

```
Binance → Backend (stream.js) → SQLite DB → HTTP API → Dashboard (Next.js) → Charts
```

## 🎨 Customization

### Change Update Interval

Edit `app/page.tsx` line 27:

```typescript
const { data } = useSWR('/api/last?n=1200', fetcher, { refreshInterval: 3000 }); // 3 seconds
```

### Modify Chart Time Window

Edit `app/page.tsx` line 32:

```typescript
const windowMs = 5 * 60 * 1000; // 5 minutes
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm start
```





