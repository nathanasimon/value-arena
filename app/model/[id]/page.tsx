'use client';

import { useEffect, useState, use } from 'react';
import { Portfolio } from '@/lib/types';
import { PositionCard } from '@/components/PositionCard';
import { TradeHistory } from '@/components/TradeHistory';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  // React 19 / Next.js 15 unwraps params as promise in some configs, but usually it's direct in older Next 14. 
  // Assuming Next.js 15 or 14 app dir where params is a promise or object. 
  // I'll use `use` hook if available or await it, but since this is a client component, params are passed as prop.
  // To be safe with new Next.js versions, I'll handle the promise.
  
  const [id, setId] = useState<string | null>(null);
  
  useEffect(() => {
    // Unwrap params
    Promise.resolve(params).then(p => setId(decodeURIComponent(p.id)));
  }, [params]);

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    fetch(`/api/portfolio?id=${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => {
        setPortfolio(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (!id || loading) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex justify-center items-center">
        <Loader2 className="animate-spin text-zinc-500" />
      </div>
    );
  }

  if (!portfolio) {
    return <div className="min-h-screen bg-black text-zinc-100 p-8">Portfolio not found.</div>;
  }

  const currentNav = portfolio.nav_history[portfolio.nav_history.length - 1]?.nav || 10000;
  const returnPct = ((currentNav - 10000) / 10000) * 100;
  const isPositive = returnPct >= 0;

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Arena
        </Link>

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">{portfolio.model_id}</h1>
            <p className="text-zinc-400 mt-1">Starting Capital: ${portfolio.starting_capital.toLocaleString()}</p>
          </div>
          <div className="text-right">
             <div className="text-sm text-zinc-500 uppercase tracking-wider font-medium">Net Asset Value</div>
             <div className="text-3xl font-mono font-medium text-white mt-1">
               ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </div>
             <div className={clsx("text-lg font-mono", isPositive ? "text-green-500" : "text-red-500")}>
               {isPositive ? "+" : ""}{returnPct.toFixed(2)}%
             </div>
          </div>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Current Positions</h2>
          {portfolio.positions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolio.positions.map((pos, i) => (
                <PositionCard key={i} position={pos} />
              ))}
            </div>
          ) : (
            <div className="p-8 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center text-zinc-500">
              No active positions. Cash heavy.
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Trade History</h2>
          <TradeHistory trades={portfolio.trade_history} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-zinc-100">Research Log</h2>
          <div className="space-y-4">
            {[...portfolio.research_logs].reverse().map((log, i) => (
              <div key={i} className="bg-zinc-900/30 border border-zinc-800 p-4 rounded-lg">
                <div className="text-xs text-zinc-500 mb-2">{log.date}</div>
                <div className="text-sm text-zinc-300 whitespace-pre-wrap font-mono">{log.notes}</div>
              </div>
            ))}
            {portfolio.research_logs.length === 0 && (
              <div className="text-zinc-500 text-sm italic">No research notes yet.</div>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

