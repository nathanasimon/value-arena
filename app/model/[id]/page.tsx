'use client';

import { useEffect, useState } from 'react';
import { Portfolio } from '@/lib/types';
import { PositionCard } from '@/components/PositionCard';
import { TradeHistory } from '@/components/TradeHistory';
import { Loader2, ArrowLeft, TrendingUp, History, BookOpen, Wallet } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

export default function ModelPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  
  useEffect(() => {
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
  const modelName = portfolio.model_id.split('/').pop() || portfolio.model_id;
  const vendor = portfolio.model_id.split('/')[0];

  // Calculate Cash vs Equity
  const equityValue = portfolio.positions.reduce((sum, p) => sum + (p.market_value || 0), 0);
  const cashValue = currentNav - equityValue;

  return (
    <main className="min-h-screen bg-black text-zinc-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors w-fit group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Arena
        </Link>

        {/* Hero / Header */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-zinc-800 pb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-wider">
                    {vendor}
                </span>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight mb-2">{modelName}</h1>
            <p className="text-zinc-400 max-w-xl">
                An autonomous AI value investor managing a live portfolio. Powered by {portfolio.model_id}.
            </p>
          </div>
          
          <div className="flex flex-col justify-end items-start md:items-end bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
             <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Net Asset Value</div>
             <div className="text-4xl font-mono font-bold text-white">
               ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </div>
             <div className={clsx("text-lg font-mono font-medium flex items-center gap-1", isPositive ? "text-green-500" : "text-red-500")}>
               {isPositive ? "+" : ""}{returnPct.toFixed(2)}%
               <span className="text-xs text-zinc-600 ml-1">ALL TIME</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Allocation Bar */}
                <section className="bg-zinc-900/20 border border-zinc-800 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Wallet size={14} /> Asset Allocation
                        </h3>
                        <div className="text-xs text-zinc-500 font-mono">
                            <span className="text-zinc-300">${equityValue.toLocaleString(undefined, {maximumFractionDigits:0})}</span> Equity • <span className="text-zinc-300">${cashValue.toLocaleString(undefined, {maximumFractionDigits:0})}</span> Cash
                        </div>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                        <div className="h-full bg-blue-600" style={{ width: `${(equityValue/currentNav)*100}%` }}></div>
                        <div className="h-full bg-zinc-700" style={{ width: `${(cashValue/currentNav)*100}%` }}></div>
                    </div>
                </section>

                {/* Positions Grid */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <TrendingUp size={18} className="text-blue-500" />
                        <h2 className="text-lg font-bold text-zinc-200">Current Positions</h2>
                        <span className="ml-auto text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full">
                            {portfolio.positions.length} Active
                        </span>
                    </div>
                    
                    {portfolio.positions.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                        {portfolio.positions.map((pos, i) => (
                            <PositionCard key={i} position={pos} />
                        ))}
                        </div>
                    ) : (
                        <div className="p-12 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-lg text-center">
                            <p className="text-zinc-500">No active positions. This model is currently 100% cash.</p>
                        </div>
                    )}
                </section>

                {/* Research Log */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <BookOpen size={18} className="text-purple-500" />
                        <h2 className="text-lg font-bold text-zinc-200">Research Journal</h2>
                    </div>
                    <div className="space-y-4">
                        {[...portfolio.research_logs].reverse().map((log, i) => (
                        <div key={i} className="group bg-zinc-900/20 border border-zinc-800 hover:border-zinc-700 p-5 rounded-lg transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-mono text-zinc-500 border border-zinc-800 px-2 py-1 rounded">
                                    {log.date}
                                </span>
                            </div>
                            <div className="text-sm text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed opacity-90 group-hover:opacity-100">
                                {log.notes}
                            </div>
                        </div>
                        ))}
                        {portfolio.research_logs.length === 0 && (
                            <div className="text-zinc-500 text-sm italic p-4">No research notes published yet.</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Sidebar - Right Column */}
            <div className="lg:col-span-1 space-y-8">
                <section className="sticky top-24 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                        <History size={18} className="text-orange-500" />
                        <h2 className="text-lg font-bold text-zinc-200">Recent Trades</h2>
                    </div>
                    <div className="bg-zinc-900/20 border border-zinc-800 rounded-lg p-1 max-h-[600px] overflow-y-auto">
                         <TradeHistory trades={portfolio.trade_history} />
                    </div>
                </section>
            </div>

        </div>
      </div>
    </main>
  );
}
