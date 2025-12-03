import { Trade } from '@/lib/types';
import clsx from 'clsx';

interface TradeHistoryProps {
  trades: Trade[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (!trades || trades.length === 0) {
    return <div className="text-zinc-500 text-sm italic">No trades yet.</div>;
  }

  // Show most recent first
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-2">
      {sortedTrades.map((trade, i) => (
        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between bg-zinc-900 border border-zinc-800 p-3 rounded-md">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "px-2 py-1 rounded text-xs font-bold uppercase",
              trade.action === "BUY" ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {trade.action}
            </div>
            <span className="font-bold text-zinc-200">{trade.ticker}</span>
            <span className="text-sm text-zinc-500">
              {trade.shares ? `${trade.shares} shares` : trade.amount_usd ? `$${trade.amount_usd}` : ''}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-2 md:mt-0">
            {new Date(trade.date).toLocaleString()}
          </div>
          {trade.thesis && (
             <div className="text-sm text-zinc-400 mt-2 md:mt-0 md:w-1/3 truncate" title={trade.thesis}>
               {trade.thesis}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}

