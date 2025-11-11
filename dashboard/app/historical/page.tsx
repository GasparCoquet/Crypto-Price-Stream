'use client';

import useSWR from 'swr';
import Link from 'next/link';
import {
  Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, TimeSeriesScale, Tooltip, Legend,
  type ChartOptions, type TooltipItem
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  TimeSeriesScale,
  Tooltip,
  Legend
);

interface ErrorResponse {
  error?: string;
  message?: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    let body: ErrorResponse | null = null;
    try { body = await res.json(); } catch {}
    const msg = body?.error || body?.message || res.statusText || 'Request failed';
    throw new Error(msg);
  }
  return res.json();
};

interface HistoricalDataPoint {
  openTime: number;
  close: number;
}

interface PricePoint {
  x: number;
  close: number;
}

export default function HistoricalPage() {
  const { data, error, isLoading } = useSWR<HistoricalDataPoint[]>('/api/historical?interval=1m&limit=100', fetcher, { refreshInterval: 60000 });
  
  const prices: PricePoint[] = Array.isArray(data) ? data.map((c: HistoricalDataPoint) => ({
    x: c.openTime,
    close: c.close,
  })) : [];
  
  if (isLoading) return <div className="p-6">Loading historical data…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {(error as Error).message}</div>;

  const chartData = {
    datasets: [{
      label: 'Close Price',
      data: prices.map((p: PricePoint) => ({ x: p.x, y: p.close })),
      borderColor: '#26a69a',
      backgroundColor: 'rgba(38,166,154,0.1)',
      borderWidth: 2,
      showLine: true,
      tension: 0.3,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 5,
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
        display: false,
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
          title: (items: TooltipItem<'line'>[]) => items.map((i: TooltipItem<'line'>) => new Date(i.parsed.x).toLocaleTimeString()),
        },
        backgroundColor: '#fff',
        titleColor: '#26a69a',
        bodyColor: '#111827',
        borderColor: '#26a69a',
        borderWidth: 1,
        displayColors: false,
      },
    },
    scales: {
      x: {
        type: 'timeseries',
        time: {
          unit: 'minute',
          displayFormats: { minute: 'HH:mm' },
        },
        ticks: {
          stepSize: 5,
        },
        title: {
          display: true,
          text: 'Time',
          font: { size: 14 },
        },
        grid: { color: '#e5e7eb' },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Price',
          font: { size: 14 },
        },
        grid: { color: '#e5e7eb' },
      },
    },
  };

  const lastPrice = prices[prices.length - 1];
  
  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Historical Price Chart (REST API)</h1>
        <Link 
          href="/" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          ← Live Price Chart
        </Link>
      </div>
      <div className="text-sm text-gray-600">
        Last close: <b>{lastPrice?.close}</b> • {lastPrice?.x ? new Date(lastPrice.x).toLocaleString() : '—'}
      </div>
      <div className="bg-white rounded-xl p-4 shadow" style={{ height: 480 }}>
        {prices.length === 0 ? (
          <div className="text-gray-600">No historical data available. Loading from Binance REST API…</div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        📊 <b>Note:</b> This chart uses REST API calls to fetch historical close price data from Binance. 
        Updates every 60 seconds.
      </div>
    </main>
  );
}


