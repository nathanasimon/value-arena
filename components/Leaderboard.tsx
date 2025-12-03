import Link from 'next/link';
import { Portfolio } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight, Trophy } from 'lucide-react';
import clsx from 'clsx';

interface LeaderboardProps {
  portfolios: Portfolio[];
}

export function Leaderboard({ portfolios }: LeaderboardProps) {
  const sorted = [...portfolios].sort((a, b) => {
    const navA = a.nav_history[a.nav_history.length - 1]?.nav || 10000;
    const navB = b.nav_history[b.nav_history.length - 1]?.nav || 10000;
    return navB - navA;
  });

  return (
    <div className="overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 flex items-center gap-2 bg-zinc-50">
        <Trophy size={18} className="text-yellow-600" />
        <h2 className="text-base font-bold tracking-tight text-zinc-900">Live Rankings</h2>
      </div>
      <div className="divide-y divide-zinc-100">
        {sorted.map((p, i) => {
          const currentNav = p.nav_history[p.nav_history.length - 1]?.nav || 10000;
          const returnPct = ((currentNav - 10000) / 10000) * 100;
          const isPositive = returnPct >= 0;
          const modelName = p.model_id.split('/').pop()?.replace(/-/g, ' ') || p.model_id;

          return (
            <Link 
              key={p.model_id} 
              href={`/model/${encodeURIComponent(p.model_id)}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <span className={clsx(
                    "font-mono text-sm w-8 h-8 flex items-center justify-center rounded-lg font-bold",
                    i === 0 && "bg-yellow-100 text-yellow-700",
                    i === 1 && "bg-zinc-100 text-zinc-600",
                    i === 2 && "bg-orange-100 text-orange-700",
                    i > 2 && "bg-zinc-50 text-zinc-400"
                )}>
                    {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">
                    {modelName}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium mt-0.5">
                    {p.positions.length} positions • ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} NAV
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={clsx("text-lg font-bold flex items-center justify-end gap-1", isPositive ? "text-green-600" : "text-red-600")}>
                  {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {Math.abs(returnPct).toFixed(2)}%
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">
                  {isPositive ? 'Gain' : 'Loss'}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
