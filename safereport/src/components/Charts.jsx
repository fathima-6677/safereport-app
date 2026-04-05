import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Shared chart defaults
const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#111318',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      titleFont: { family: 'DM Sans', size: 12 },
      bodyFont: { family: 'DM Sans', size: 11 },
      padding: 10,
      cornerRadius: 8,
    },
  },
};

/**
 * Horizontal bar chart for incidents by type/area
 */
export function BarChart({ data, label = 'Count', color = '#e8547a' }) {
  if (!data || data.length === 0) {
    return <div className="h-[200px] flex items-center justify-center text-txt-3 text-[13px]">No data</div>;
  }

  const labels = data.map(([name]) => name);
  const values = data.map(([, count]) => count);

  return (
    <div className="h-[200px]">
      <Bar
        data={{
          labels,
          datasets: [{
            label,
            data: values,
            backgroundColor: color + '33',
            borderColor: color,
            borderWidth: 1,
            borderRadius: 4,
            barThickness: 20,
          }],
        }}
        options={{
          ...chartDefaults,
          indexAxis: 'y',
          scales: {
            x: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#555b6a', font: { family: 'DM Sans', size: 10 } },
            },
            y: {
              grid: { display: false },
              ticks: { color: '#8b909e', font: { family: 'DM Sans', size: 11 } },
            },
          },
        }}
      />
    </div>
  );
}

/**
 * Severity doughnut chart — uses actual stats.high / stats.medium / stats.low
 */
export function SeverityDoughnut({ stats }) {
  const highVal = stats.high || 0;
  const mediumVal = stats.medium || 0;
  const lowVal = stats.low || 0;

  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [{
      data: [highVal, mediumVal, lowVal],
      backgroundColor: ['#f8717133', '#fb923c33', '#60a5fa33'],
      borderColor: ['#f87171', '#fb923c', '#60a5fa'],
      borderWidth: 2,
      cutout: '70%',
    }],
  };

  return (
    <div className="flex items-center gap-6">
      <div className="w-[120px] h-[120px]">
        <Doughnut data={data} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } }} />
      </div>
      <div className="flex-1 space-y-2">
        {[
          { label: 'High', color: '#f87171', value: highVal },
          { label: 'Medium', color: '#fb923c', value: mediumVal },
          { label: 'Low', color: '#60a5fa', value: lowVal },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-[12px] text-txt-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }}></div>
            {item.label} — {item.value}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Hour heatmap grid
 */
export function HourGrid({ byHour }) {
  if (!byHour || byHour.length === 0) {
    return <div className="text-txt-3 text-[13px]">No data</div>;
  }

  const max = Math.max(...byHour, 1);
  return (
    <div>
      <div className="grid grid-cols-[repeat(24,1fr)] gap-[3px]">
        {byHour.map((count, i) => {
          const intensity = count / max;
          const bg = intensity > 0.7 ? '#f87171' : intensity > 0.4 ? '#fb923c' : intensity > 0 ? '#60a5fa' : '#191c23';
          return (
            <div
              key={i}
              className="h-9 rounded-[3px] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: bg, opacity: 0.3 + intensity * 0.7 }}
              title={`${i}:00 — ${count} incidents`}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-[repeat(24,1fr)] gap-[3px] mt-1">
        {byHour.map((_, i) => (
          <span key={i} className="text-[9px] text-txt-3 text-center">
            {i % 6 === 0 ? `${i}h` : ''}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * 7-day trend bar chart
 */
export function TrendChart({ byDay }) {
  if (!byDay || byDay.length === 0) {
    return <div className="h-[120px] flex items-center justify-center text-txt-3 text-[13px]">No data</div>;
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return (
    <div className="h-[120px]">
      <Bar
        data={{
          labels: days,
          datasets: [{
            data: byDay,
            backgroundColor: '#e8547a33',
            borderColor: '#e8547a',
            borderWidth: 1,
            borderRadius: 4,
          }],
        }}
        options={{
          ...chartDefaults,
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#8b909e', font: { family: 'DM Sans', size: 10 } },
            },
            y: {
              grid: { color: 'rgba(255,255,255,0.05)' },
              ticks: { color: '#555b6a', font: { family: 'DM Sans', size: 10 } },
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
}
