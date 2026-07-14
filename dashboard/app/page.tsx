'use client';

import useSWR from 'swr';
import { Line } from 'react-chartjs-2';
import Link from 'next/link';
import {
  Chart as ChartJS, LineElement, PointElement, LinearScale, TimeSeriesScale, Tooltip, Legend,
  type ChartOptions, type TooltipItem, type Scale
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';

ChartJS.register(LineElement, PointElement, LinearScale, TimeSeriesScale, Tooltip, Legend, ChartDataLabels);

interface ErrorResponse {
  error?: string;
  message?: string;
}

interface DataPoint {
  ts: number;
  pair: string;
  price: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    let body: ErrorResponse | null = null;
    try { body = await res.json(); } catch {}
    const msg = body?.error || body?.message || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return res.json() as Promise<DataPoint[]>;
};

interface FilledPoint {
  ts: number;
  pair: string;
  price: number;
  x: Date;
}

export default function Home() {
  const { data, error, isLoading } = useSWR<DataPoint[]>('/api/last?n=1200', fetcher, { refreshInterval: 3000 });
  
  // Compute derived values
  const now = Date.now();
  const windowMs = 5 * 60 * 1000;
  const startTime = now - windowMs;
  const arr = Array.isArray(data) ? data : [];
  
  // Raw trade ticks as stored by the backend (no server-side aggregation)
  const rawPoints = arr
    .slice()
    .reverse() // oldest → newest
    .map((d: DataPoint) => ({
      ts: typeof d.ts === 'number' ? d.ts : Number(d.ts), // Ensure ts is a number
      pair: d.pair,
      price: typeof d.price === 'number' ? d.price : Number(d.price), // Ensure price is a number
      x: new Date(typeof d.ts === 'number' ? d.ts : Number(d.ts))
    }))
    .filter((d) => d.ts >= startTime && d.ts <= now);
  
  // Aggregate data into 5-second intervals (client-side) and fill gaps
  const INTERVAL_MS = 5000; // 5 seconds
  const filledPoints: FilledPoint[] = [];
  
  if (rawPoints.length > 0) {
    const firstDataTime = rawPoints[0].ts;
    // Round startTime and firstDataTime down to the nearest 5-second interval
    const roundedStartTime = Math.floor(startTime / INTERVAL_MS) * INTERVAL_MS;
    const roundedFirstDataTime = Math.floor(firstDataTime / INTERVAL_MS) * INTERVAL_MS;
    const actualStartTime = Math.max(roundedStartTime, roundedFirstDataTime);
    const numIntervals = Math.floor((now - actualStartTime) / INTERVAL_MS);
    
    // Group data points by 5-second intervals and calculate average price
    const intervalMap = new Map<number, { prices: number[], pair: string }>();
    rawPoints.forEach(p => {
      const intervalKey = Math.floor(p.ts / INTERVAL_MS) * INTERVAL_MS;
      const existing = intervalMap.get(intervalKey);
      if (existing) {
        existing.prices.push(p.price);
      } else {
        intervalMap.set(intervalKey, {
          prices: [p.price],
          pair: p.pair
        });
      }
    });
    
    let lastKnownPrice = rawPoints[0].price;
    let lastKnownPair = rawPoints[0].pair;
    
    for (let i = 0; i <= numIntervals; i++) {
      const targetTime = actualStartTime + (i * INTERVAL_MS);
      // Ensure targetTime is aligned to 5-second intervals
      const alignedTime = Math.floor(targetTime / INTERVAL_MS) * INTERVAL_MS;
      
      // Check if we have data for this interval
      const intervalData = intervalMap.get(alignedTime);
      if (intervalData) {
        // Round all prices to 5 decimal places first to normalize them
        const roundedPrices = intervalData.prices.map(p => Math.round(p * 100000) / 100000);
        // Calculate average of rounded prices
        const avgPrice = roundedPrices.reduce((sum, p) => sum + p, 0) / roundedPrices.length;
        // Round the average to ensure consistent precision
        const roundedPrice = Math.round(avgPrice * 100000) / 100000;
        lastKnownPrice = roundedPrice;
        lastKnownPair = intervalData.pair;
        filledPoints.push({
          ts: alignedTime,
          pair: intervalData.pair,
          price: roundedPrice,
          x: new Date(alignedTime)
        });
      } else {
        // No data for this interval, use last known price (also rounded)
        const roundedPrice = Math.round(lastKnownPrice * 100000) / 100000;
        filledPoints.push({
          ts: alignedTime,
          pair: lastKnownPair,
          price: roundedPrice,
          x: new Date(alignedTime)
        });
      }
    }
  }
  
  const points = filledPoints.length > 0 ? filledPoints : rawPoints;
  
  if (isLoading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {(error as Error).message}</div>;

  const prices = points.map((p: FilledPoint) => p.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 1;
  const priceRange = maxPrice - minPrice;
  const margin = priceRange > 0.00001 ? priceRange * 0.1 : 0.0001;
  const yMin = minPrice - margin;
  const yMax = maxPrice + margin;

  // Rest of the component logic
  const chartData = {
    datasets: [{
      label: 'Price',
      data: points.map((d: FilledPoint) => ({ x: new Date(d.ts), y: d.price })),
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37,99,235,0.1)',
      borderWidth: 2,
      showLine: true,
      pointRadius: 2,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: true,
      spanGaps: true,
    }]
  };
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false as const,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      datalabels: {
        display: false, // Disable data labels on points
      },
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14 },
        },
      },
          tooltip: {
            callbacks: {
              label: (ctx: TooltipItem<'line'>) => `Price: ${ctx.parsed.y}`,
              title: (items: TooltipItem<'line'>[]) => items.map((i: TooltipItem<'line'>) => `Time: ${new Date(i.parsed.x).toLocaleTimeString()}`),
            },
            backgroundColor: '#fff',
            titleColor: '#2563eb',
            bodyColor: '#111827',
            borderColor: '#2563eb',
            borderWidth: 1,
          },
    },
    scales: {
      x: {
        type: 'timeseries',
        time: {
          unit: 'second',
          displayFormats: { second: 'HH:mm:ss' },
          tooltipFormat: 'HH:mm:ss',
        },
        min: startTime,
        max: now,
        ticks: {
          stepSize: 15, // Show tick marks every 15 seconds
          maxTicksLimit: 20,
          autoSkip: false, // show all scheduled ticks
          maxRotation: 0,
          minRotation: 0,
          font: { size: 11 },
          source: 'auto',
        },
        title: {
          display: true,
          text: 'Time (last 5 min)',
          font: { size: 14 },
        },
        grid: { color: '#e5e7eb' },
      },
      y: {
        beginAtZero: false,
        min: points.length > 0 ? yMin : undefined,
        max: points.length > 0 ? yMax : undefined,
        ticks: {
          precision: 5, // Show 5 decimal places for better precision
          stepSize: priceRange > 0.00001 ? Math.max(priceRange / 8, 0.00001) : 0.00001, // Ensure minimum step size
          maxTicksLimit: 10, // Limit number of ticks to avoid duplicates
          callback: function(tickValue: number | string) {
            // Format tick value to 5 decimal places and ensure uniqueness
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            return value.toFixed(5);
          },
        },
        afterBuildTicks: (axis: Scale) => {
          // Remove duplicate tick values
          const uniqueTicks: Array<{ value: number }> = [];
          const seen = new Set<string>();
          axis.ticks.forEach((tick: { value: number }) => {
            const value = tick.value.toFixed(5);
            if (!seen.has(value)) {
              seen.add(value);
              uniqueTicks.push(tick);
            }
          });
          axis.ticks = uniqueTicks;
        },
        title: {
          display: true,
          text: 'Price',
          font: { size: 14 },
        },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  const last = points.at(-1);
  
  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Crypto Price Stream</h1>
        <Link 
          href="/historical" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          View Historical Prices (REST API) →
        </Link>
      </div>
      <div className="text-sm text-gray-600">
  Pair: <b>{last?.pair?.toUpperCase()}</b> • Last: <b>{last?.price}</b> • {last?.ts ? new Date(last.ts).toLocaleString() : '—'}
      </div>
      <div className="bg-white rounded-xl p-4 shadow" style={{ height: 360 }}>
        {points.length === 0 ? (
          <div className="text-gray-600">No data in the last 5 minutes. Waiting for new ticks…</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        🔄 <b>Note:</b> The backend consumes a Binance WebSocket and stores every raw tick in SQLite.
        This page does not use WebSockets: it polls the API (<code>/api/last</code>) every 3s over HTTP,
        and the 5-second averaging shown above is computed in the browser.
      </div>
    </main>
  );
}
