'use client';

import { useEffect, useState } from 'react';
import { Portfolio } from '@/lib/types';
import { Leaderboard } from '@/components/Leaderboard';
import { Loader2 } from 'lucide-react';

export default function LeaderboardPage() {
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
    <main className="min-h-screen bg-gray-50 text-zinc-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Leaderboard</h1>
          <p className="text-zinc-500">Ranked by portfolio performance</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl text-center space-y-2 shadow-sm">
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
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
            <Leaderboard portfolios={portfolios} />
          </div>
        )}
      </div>
    </main>
  );
}

