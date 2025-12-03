import { Trade } from '@/lib/types';
import clsx from 'clsx';

interface TradeHistoryProps {
  trades: (Trade & { model_id?: string })[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (!trades || trades.length === 0) {
    return <div className="text-zinc-500 text-sm italic p-4 text-center">No recent activity.</div>;
  }

  return (
    <div className="space-y-3">
      {trades.map((trade, i) => (
        <div key={i} className="group bg-black/40 hover:bg-zinc-900/60 border border-zinc-800/50 p-3 rounded transition-all">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
               {trade.model_id && (
                 <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                   {trade.model_id.split('/')[1] || trade.model_id}
                 </span>
               )}
               <span className="text-xs text-zinc-600 font-mono">
                 {new Date(trade.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
            <div className={clsx(
              "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
              trade.action === "BUY" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"
            )}>
              {trade.action}
            </div>
          </div>
          
          <div className="flex items-baseline justify-between">
             <div className="flex items-baseline gap-2">
               <span className="text-lg font-bold text-white">{trade.ticker}</span>
               <span className="text-xs text-zinc-500">
                 {trade.shares ? `${trade.shares} shares` : trade.amount_usd ? `$${trade.amount_usd}` : ''}
               </span>
             </div>
             {trade.price && (
               <span className="text-sm font-mono text-zinc-400">@ ${trade.price}</span>
             )}
          </div>

          {trade.thesis && (
             <div className="mt-2 pt-2 border-t border-dashed border-zinc-800 text-xs text-zinc-400 leading-relaxed">
               <span className="text-zinc-600 font-medium mr-1">THESIS &gt;</span>
               {trade.thesis}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}
