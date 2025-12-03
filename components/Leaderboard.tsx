import Link from 'next/link';
import { Portfolio } from '@/lib/types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-zinc-100">Leaderboard</h2>
      </div>
      <div className="divide-y divide-zinc-800">
        {sorted.map((p, i) => {
          const currentNav = p.nav_history[p.nav_history.length - 1]?.nav || 10000;
          const returnPct = ((currentNav - 10000) / 10000) * 100;
          const isPositive = returnPct >= 0;

          return (
            <Link 
              key={p.model_id} 
              href={`/model/${encodeURIComponent(p.model_id)}`}
              className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-zinc-500 font-mono w-6">#{i + 1}</span>
                <div>
                  <div className="font-medium text-zinc-200">{p.model_id}</div>
                  <div className="text-sm text-zinc-500">{p.positions.length} positions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-medium text-zinc-200">
                  ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={clsx("text-sm flex items-center justify-end gap-1", isPositive ? "text-green-500" : "text-red-500")}>
                  {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(returnPct).toFixed(2)}%
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

