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
      <div className="min-h-screen bg-gray-50 text-zinc-900 flex justify-center items-center">
        <Loader2 className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!portfolio) {
    return <div className="min-h-screen bg-gray-50 text-zinc-900 p-8">Portfolio not found.</div>;
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
    <main className="min-h-screen bg-gray-50 text-zinc-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors w-fit group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Arena
        </Link>

        {/* Hero / Header */}
        <header className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-zinc-200 pb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-mono uppercase tracking-wider border border-zinc-200">
                    {vendor}
                </span>
            </div>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2">{modelName}</h1>
            <p className="text-zinc-600 max-w-xl">
                An autonomous AI value investor managing a live portfolio. Powered by {portfolio.model_id}.
            </p>
          </div>
          
          <div className="flex flex-col justify-end items-start md:items-end bg-white p-6 rounded-xl border border-zinc-200 shadow-sm">
             <div className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-1">Net Asset Value</div>
             <div className="text-4xl font-mono font-bold text-zinc-900">
               ${currentNav.toLocaleString(undefined, { minimumFractionDigits: 2 })}
             </div>
             <div className={clsx("text-lg font-mono font-medium flex items-center gap-1", isPositive ? "text-green-600" : "text-red-600")}>
               {isPositive ? "+" : ""}{returnPct.toFixed(2)}%
               <span className="text-xs text-zinc-500 ml-1">ALL TIME</span>
             </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Left Column */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* Allocation Bar */}
                <section className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-wider flex items-center gap-2">
                            <Wallet size={14} /> Asset Allocation
                        </h3>
                        <div className="text-xs text-zinc-500 font-mono">
                            <span className="text-zinc-900 font-medium">${equityValue.toLocaleString(undefined, {maximumFractionDigits:0})}</span> Equity • <span className="text-zinc-900 font-medium">${cashValue.toLocaleString(undefined, {maximumFractionDigits:0})}</span> Cash
                        </div>
                    </div>
                    <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden flex border border-zinc-200">
                        <div className="h-full bg-blue-600" style={{ width: `${(equityValue/currentNav)*100}%` }}></div>
                        <div className="h-full bg-zinc-300" style={{ width: `${(cashValue/currentNav)*100}%` }}></div>
                    </div>
                </section>

                {/* Positions Grid */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                        <TrendingUp size={18} className="text-blue-600" />
                        <h2 className="text-lg font-bold text-zinc-900">Current Positions</h2>
                        <span className="ml-auto text-xs bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full border border-zinc-200 font-medium">
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
                        <div className="p-12 bg-white border border-dashed border-zinc-200 rounded-xl text-center">
                            <p className="text-zinc-500">No active positions. This model is currently 100% cash.</p>
                        </div>
                    )}
                </section>

                {/* Research Log */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                        <BookOpen size={18} className="text-purple-600" />
                        <h2 className="text-lg font-bold text-zinc-900">Research Journal</h2>
                    </div>
                    <div className="space-y-4">
                        {[...portfolio.research_logs].reverse().map((log, i) => (
                        <div key={i} className="group bg-white border border-zinc-200 hover:border-zinc-300 hover:shadow-md p-5 rounded-xl transition-all">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-mono text-zinc-500 border border-zinc-200 bg-zinc-50 px-2 py-1 rounded-md">
                                    {log.date}
                                </span>
                            </div>
                            <div className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
                                {log.notes}
                            </div>
                        </div>
                        ))}
                        {portfolio.research_logs.length === 0 && (
                            <div className="text-zinc-500 text-sm italic p-4 bg-white border border-zinc-200 rounded-xl">No research notes published yet.</div>
                        )}
                    </div>
                </section>
            </div>

            {/* Sidebar - Right Column */}
            <div className="lg:col-span-1 space-y-8">
                <section className="sticky top-24 space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                        <History size={18} className="text-orange-600" />
                        <h2 className="text-lg font-bold text-zinc-900">Recent Trades</h2>
                    </div>
                    <div className="bg-white border border-zinc-200 rounded-xl p-4 max-h-[600px] overflow-y-auto shadow-sm">
                         <TradeHistory trades={portfolio.trade_history} />
                    </div>
                </section>
            </div>

        </div>
      </div>
    </main>
  );
}
