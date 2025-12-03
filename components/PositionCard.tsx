import { Position } from '@/lib/types';
import clsx from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const pnl = position.unrealized_pnl || 0;
  const pnlPct = position.unrealized_pnl_pct || 0;
  const isPositive = pnl >= 0;

  return (
    <div className="group bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-lg p-4 transition-all hover:bg-zinc-900/60">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-white text-black flex items-center justify-center font-bold text-sm">
                {position.ticker.slice(0,2)}
            </div>
            <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                    {position.ticker}
                    {isPositive ? <TrendingUp size={14} className="text-green-500" /> : <TrendingDown size={14} className="text-red-500" />}
                </h3>
                <div className="text-xs text-zinc-500 font-mono">
                    {position.shares} SHARES @ ${(position.entry_price || 0).toFixed(2)}
                </div>
            </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-mono font-medium text-white tracking-tight">
            ${(position.market_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className={clsx("text-xs font-mono font-medium mt-1 inline-block px-1.5 py-0.5 rounded", 
            isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")}>
            {isPositive ? "+" : ""}{pnl.toFixed(2)} ({isPositive ? "+" : ""}{pnlPct.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      {position.thesis && (
        <div className="relative mt-2 pt-3 border-t border-zinc-800/50">
            <div className="absolute top-0 left-0 -mt-2 bg-zinc-900 px-1 text-[9px] text-zinc-600 uppercase tracking-wider font-bold ml-1">
                Investment Thesis
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed font-mono text-opacity-90 line-clamp-4 group-hover:line-clamp-none transition-all">
                {position.thesis}
            </p>
        </div>
      )}
    </div>
  );
}
