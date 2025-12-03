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
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden h-full">
      <div className="px-4 py-3 border-b border-zinc-800/50 flex items-center gap-2 bg-zinc-900/80">
        <Trophy size={16} className="text-yellow-500" />
        <h2 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">Live Rankings</h2>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {sorted.map((p, i) => {
          const currentNav = p.nav_history[p.nav_history.length - 1]?.nav || 10000;
          const returnPct = ((currentNav - 10000) / 10000) * 100;
          const isPositive = returnPct >= 0;
          const modelName = p.model_id.split('/').pop() || p.model_id;

          return (
            <Link 
              key={p.model_id} 
              href={`/model/${encodeURIComponent(p.model_id)}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className={clsx(
                    "font-mono text-xs w-5 h-5 flex items-center justify-center rounded bg-zinc-800 text-zinc-500",
                    i === 0 && "bg-yellow-500/20 text-yellow-500",
                    i === 1 && "bg-zinc-500/20 text-zinc-400",
                    i === 2 && "bg-orange-700/20 text-orange-600"
                )}>
                    {i + 1}
                </span>
                <div>
                  <div className="font-bold text-sm text-zinc-300 group-hover:text-white transition-colors">
                    {modelName}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-mono uppercase tracking-wider">
                    {p.positions.length} POSITIONS
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-medium text-sm text-zinc-200">
                  ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
                <div className={clsx("text-xs flex items-center justify-end gap-0.5 font-medium", isPositive ? "text-green-500" : "text-red-500")}>
                  {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
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
