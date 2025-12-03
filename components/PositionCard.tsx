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
    <div className="group bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-200/50 rounded-xl p-5 transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {position.ticker.slice(0,2)}
            </div>
            <div>
                <h3 className="text-lg font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                    {position.ticker}
                </h3>
                <div className="text-xs text-zinc-500 font-medium mt-0.5">
                    {position.shares} SHARES @ ${(position.entry_price || 0).toFixed(2)}
                </div>
            </div>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-mono font-bold text-zinc-900 tracking-tight">
            ${(position.market_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className={clsx("text-xs font-mono font-bold mt-1 inline-flex items-center gap-1 px-2 py-1 rounded-md", 
            isPositive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700")}>
            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {isPositive ? "+" : ""}{pnl.toFixed(2)} ({isPositive ? "+" : ""}{pnlPct.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      {position.thesis && (
        <div className="relative mt-4 pt-4 border-t border-zinc-100">
            <span className="absolute -top-2.5 left-0 bg-white pr-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Investment Thesis
            </span>
            <p className="text-sm text-zinc-600 leading-relaxed text-opacity-90">
                {position.thesis}
            </p>
        </div>
      )}
    </div>
  );
}
