'use client';

import { useEffect, useState } from 'react';
import { Portfolio } from '@/lib/types';
import { PerformanceChart } from '@/components/PerformanceChart';
import { Leaderboard } from '@/components/Leaderboard';
import { Loader2 } from 'lucide-react';

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

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Value Investing Arena</h1>
          <div className="text-sm text-zinc-500">
            Autonomous AI Value Investors
          </div>
        </div>

        {error ? (
           <div className="bg-red-900/20 border border-red-800 p-6 rounded-lg text-center space-y-2">
             <h3 className="text-red-500 font-semibold text-lg">Connection Error</h3>
             <p className="text-red-400">{error}</p>
             <p className="text-zinc-500 text-sm">
               Make sure you are running the app with <code className="bg-zinc-800 px-1 rounded text-zinc-300">vercel dev</code> to enable Python API routes.
             </p>
           </div>
        ) : loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-zinc-500" />
          </div>
        ) : (
          <>
            <section>
              <PerformanceChart portfolios={portfolios} />
            </section>
            
            <section>
              <Leaderboard portfolios={portfolios} />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
