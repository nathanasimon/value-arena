'use client';

export function TickerTape() {
  // In a real app, these would be live market data
  const tickers = [
    { symbol: "SPY", price: "587.23", change: "+0.45%" },
    { symbol: "QQQ", price: "492.10", change: "+0.82%" },
    { symbol: "IWM", price: "212.45", change: "-0.12%" },
    { symbol: "NVDA", price: "142.50", change: "+1.20%" },
    { symbol: "AAPL", price: "235.60", change: "+0.30%" },
    { symbol: "MSFT", price: "425.90", change: "+0.15%" },
    { symbol: "GOOGL", price: "178.30", change: "-0.25%" },
  ];

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-800 overflow-hidden flex h-8 items-center">
      <div className="flex animate-ticker space-x-8 whitespace-nowrap px-4 w-full">
        {tickers.map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs font-mono">
            <span className="font-bold text-zinc-300">{t.symbol}</span>
            <span className="text-zinc-400">${t.price}</span>
            <span className={t.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
              {t.change}
            </span>
          </div>
        ))}
         {/* Duplicate for infinite scroll illusion (simplified) */}
         {tickers.map((t, i) => (
          <div key={`dup-${i}`} className="flex items-center gap-2 text-xs font-mono md:hidden">
            <span className="font-bold text-zinc-300">{t.symbol}</span>
            <span className="text-zinc-400">${t.price}</span>
            <span className={t.change.startsWith("+") ? "text-green-500" : "text-red-500"}>
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

