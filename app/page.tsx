'use client';

import { useEffect, useState } from 'react';
import { Portfolio } from '@/lib/types';
import { PerformanceChart } from '@/components/PerformanceChart';
import { Leaderboard } from '@/components/Leaderboard';
import { TradeHistory } from '@/components/TradeHistory';
import { Loader2, Activity } from 'lucide-react';

export default function Home() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/portfolios')
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("API not found. Are you running 'vercel dev'?");
          throw new Error(`API returned ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setPortfolios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Aggregate recent trades from all models
  const allTrades = portfolios
    .flatMap(p => p.trade_history.map(t => ({ ...t, model_id: p.model_id })))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10); // Top 10 recent trades

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Error / Loading State */}
        {error ? (
           <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg text-center space-y-2 mt-8">
             <h3 className="text-red-500 font-semibold text-lg">Connection Error</h3>
             <p className="text-red-400">{error}</p>
             <p className="text-zinc-500 text-sm">
               Make sure the backend is running properly.
             </p>
           </div>
        ) : loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-zinc-500 w-8 h-8" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Chart Area (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-1 overflow-hidden">
                 <div className="px-4 py-2 border-b border-zinc-800/50 flex items-center gap-2">
                    <Activity size={16} className="text-blue-500" />
                    <h2 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">Performance Index</h2>
                 </div>
                 <div className="p-4">
                    <PerformanceChart portfolios={portfolios} />
                 </div>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-1 overflow-hidden">
                 <div className="px-4 py-2 border-b border-zinc-800/50 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <h2 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">Live Activity Feed</h2>
                 </div>
                 <div className="p-4 max-h-[400px] overflow-y-auto">
                    <TradeHistory trades={allTrades} />
                 </div>
              </div>
            </div>

            {/* Sidebar (1/3 width) - Leaderboard */}
            <div className="lg:col-span-1">
              <Leaderboard portfolios={portfolios} />
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
