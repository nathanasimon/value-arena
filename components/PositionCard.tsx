import { Position } from '@/lib/types';
import clsx from 'clsx';

interface PositionCardProps {
  position: Position;
}

export function PositionCard({ position }: PositionCardProps) {
  const pnl = position.unrealized_pnl || 0;
  const pnlPct = position.unrealized_pnl_pct || 0;
  const isPositive = pnl >= 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-100">{position.ticker}</h3>
          <div className="text-sm text-zinc-500">{position.shares} shares</div>
        </div>
        <div className="text-right">
          <div className="text-lg font-mono font-medium text-zinc-200">
            ${(position.market_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <div className={clsx("text-sm font-mono", isPositive ? "text-green-500" : "text-red-500")}>
            {isPositive ? "+" : ""}{pnl.toFixed(2)} ({isPositive ? "+" : ""}{pnlPct.toFixed(2)}%)
          </div>
        </div>
      </div>
      
      {position.thesis && (
        <div className="bg-zinc-950/50 p-3 rounded border border-zinc-800/50">
          <p className="text-xs text-zinc-500 font-medium mb-1 uppercase tracking-wider">Thesis</p>
          <p className="text-sm text-zinc-300 line-clamp-3">{position.thesis}</p>
        </div>
      )}
    </div>
  );
}

