'use client';

import { Portfolio } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

interface PerformanceChartProps {
  portfolios: Portfolio[];
}

const COLORS = [
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#06b6d4', // cyan-500
];

export function PerformanceChart({ portfolios }: PerformanceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-center">
        <div className="text-zinc-500">Loading chart...</div>
      </div>
    );
  }

  // Transform data: Collect all unique dates, then build rows
  const allDates = new Set<string>();
  portfolios.forEach(p => p.nav_history.forEach(n => allDates.add(n.date)));
  
  const sortedDates = Array.from(allDates).sort();
  
  const data = sortedDates.map(date => {
    const row: any = { date };
    portfolios.forEach(p => {
      const point = p.nav_history.find(n => n.date === date);
      // Fill forward logic or null? 
      // If missing, maybe use previous known value or starting capital?
      // For simplicity, we'll find the point or undefined.
      if (point) {
        row[p.model_id] = point.nav;
      } else {
        // Try to find last known value before this date
        const lastKnown = [...p.nav_history]
          .sort((a, b) => a.date.localeCompare(b.date))
          .filter(n => n.date < date)
          .pop();
        row[p.model_id] = lastKnown ? lastKnown.nav : 10000;
      }
    });
    return row;
  });

  return (
    <div className="h-[400px] w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">Total Return Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis 
            dataKey="date" 
            stroke="#71717a" 
            fontSize={12} 
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={12} 
            domain={['auto', 'auto']}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
            itemStyle={{ color: '#e4e4e7' }}
            labelStyle={{ color: '#a1a1aa' }}
          />
          <Legend />
          {portfolios.map((p, i) => (
            <Line
              key={p.model_id}
              type="monotone"
              dataKey={p.model_id}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

