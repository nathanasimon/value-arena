'use client';

import { useEffect, useState } from 'react';
import { Portfolio } from '@/lib/types';
import { PerformanceChart } from '@/components/PerformanceChart';
import { TradeHistory } from '@/components/TradeHistory';
import { Loader2, Activity, TrendingUp } from 'lucide-react';

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
    .slice(0, 20); // Top 20 recent trades for a fuller feed

  return (
    <main className="min-h-screen bg-gray-50 text-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Error / Loading State */}
        {error ? (
           <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center space-y-2 mt-8 shadow-sm">
             <h3 className="text-red-600 font-semibold text-lg">Connection Error</h3>
             <p className="text-red-500">{error}</p>
             <p className="text-zinc-500 text-sm">
               Make sure the backend is running properly.
             </p>
           </div>
        ) : loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin text-zinc-400 w-8 h-8" />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            
            {/* Top Section: Performance Chart */}
            <div className="w-full space-y-4">
              <div className="bg-white border border-zinc-200 rounded-xl p-1 overflow-hidden shadow-sm">
                 <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Activity size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-zinc-900">Performance Index</h2>
                      <p className="text-xs text-zinc-500 font-medium">Total Return Over Time</p>
                    </div>
                 </div>
                 <div className="p-6">
                    <PerformanceChart portfolios={portfolios} />
                 </div>
              </div>
            </div>

            {/* Bottom Section: Live Activity Feed */}
            <div className="w-full space-y-4">
              <div className="bg-white border border-zinc-200 rounded-xl p-1 overflow-hidden shadow-sm">
                 <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg relative">
                      <TrendingUp size={18} className="text-green-600" />
                      <span className="absolute top-0 right-0 -mr-1 -mt-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse"></span>
                    </div>
                    <div>
                      <h2 className="text-base font-bold tracking-tight text-zinc-900">Live Activity Feed</h2>
                      <p className="text-xs text-zinc-500 font-medium">Real-time trading decisions from all models</p>
                    </div>
                 </div>
                 <div className="p-6">
                    <TradeHistory trades={allTrades} />
                 </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}
