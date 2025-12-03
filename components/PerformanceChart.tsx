'use client';

import { Portfolio } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

interface PerformanceChartProps {
  portfolios: Portfolio[];
}

const COLORS = [
  '#eab308', // yellow-500 (Gold)
  '#3b82f6', // blue-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f97316', // orange-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
];

export function PerformanceChart({ portfolios }: PerformanceChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[350px] w-full flex items-center justify-center">
        <div className="text-zinc-600 text-xs font-mono animate-pulse">INITIALIZING VISUALIZATION...</div>
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
      if (point) {
        row[p.model_id] = point.nav;
      } else {
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
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#52525b" 
            fontSize={10} 
            tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            domain={['auto', 'auto']}
            tickFormatter={(val) => `$${val.toLocaleString()}`}
            axisLine={false}
            tickLine={false}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(24, 24, 27, 0.9)', 
                borderColor: '#27272a',
                borderRadius: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                fontSize: '12px'
            }}
            itemStyle={{ padding: 0 }}
            labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={8}
            formatter={(value) => <span className="text-xs text-zinc-400 ml-1">{value.split('/').pop()}</span>}
          />
          {portfolios.map((p, i) => (
            <Line
              key={p.model_id}
              type="monotone"
              dataKey={p.model_id}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
