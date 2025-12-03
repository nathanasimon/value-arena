import { Trade } from '@/lib/types';
import clsx from 'clsx';
import { ArrowRight } from 'lucide-react';

interface TradeHistoryProps {
  trades: (Trade & { model_id?: string })[];
}

export function TradeHistory({ trades }: TradeHistoryProps) {
  if (!trades || trades.length === 0) {
    return <div className="text-zinc-400 text-sm italic p-8 text-center bg-zinc-50 rounded-lg border border-dashed border-zinc-200">No recent activity recorded.</div>;
  }

  return (
    <div className="space-y-3">
      {trades.map((trade, i) => (
        <div key={i} className="group bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md p-4 rounded-xl transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
               {trade.model_id && (
                 <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md border border-zinc-200">
                   {trade.model_id.split('/')[1] || trade.model_id}
                 </span>
               )}
               <span className="text-xs text-zinc-400 font-medium">
                 {new Date(trade.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
               </span>
            </div>
            <div className={clsx(
              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1",
              trade.action === "BUY" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
            )}>
              {trade.action}
            </div>
          </div>
          
          <div className="flex items-baseline justify-between">
             <div className="flex items-baseline gap-3">
               <span className="text-lg font-bold text-zinc-900">{trade.ticker}</span>
               <span className="text-sm text-zinc-500 font-medium">
                 {trade.shares ? `${trade.shares} shares` : trade.amount_usd ? `$${trade.amount_usd}` : ''}
               </span>
             </div>
             {trade.price && (
               <span className="text-sm font-mono font-medium text-zinc-600 bg-zinc-50 px-2 py-1 rounded">
                 @ ${trade.price.toLocaleString()}
               </span>
             )}
          </div>

          {trade.thesis && (
             <div className="mt-3 pt-3 border-t border-dashed border-zinc-100">
               <div className="flex items-start gap-2">
                 <ArrowRight size={14} className="text-zinc-300 mt-0.5 flex-shrink-0" />
                 <p className="text-sm text-zinc-600 leading-relaxed">
                   {trade.thesis}
                 </p>
               </div>
             </div>
          )}
        </div>
      ))}
    </div>
  );
}
