'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { MODELS } from '@/api/utils/config'; // We'll need to expose MODELS to frontend or duplicate config

// Mock models list for UI since we can't import python config directly in client component easily without API
const UI_MODELS = [
    {"id": "openai/gpt-5.1", "display": "gpt-5.1"},
    {"id": "anthropic/claude-sonnet-4-5", "display": "claude-sonnet-4-5"},
    {"id": "google/gemini-3-pro", "display": "gemini-3-pro"},
    {"id": "deepseek/deepseek-chat-v3.1", "display": "deepseek-chat-v3.1"},
    {"id": "x-ai/grok-4", "display": "grok-4"},
    {"id": "qwen/qwen3-max", "display": "qwen3-max"},
    {"id": "moonshotai/kimi-k2-thinking", "display": "kimi-k2-thinking"}
];

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-black/90 backdrop-blur-md">
      <div className="max-w-[98vw] mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
               <span className="text-xl font-bold tracking-tighter text-white">VALUE<span className="text-zinc-500">ARENA</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className={clsx("text-xs font-bold tracking-wider hover:text-blue-400 transition-colors", pathname === "/" ? "text-white" : "text-zinc-500")}>
              LIVE
            </Link>
            <span className="text-zinc-800">|</span>
            <Link href="/leaderboard" className={clsx("text-xs font-bold tracking-wider hover:text-blue-400 transition-colors", pathname === "/leaderboard" ? "text-white" : "text-zinc-500")}>
              LEADERBOARD
            </Link>
            <span className="text-zinc-800">|</span>
            
            <div className="group relative">
              <button className="text-xs font-bold tracking-wider text-zinc-500 hover:text-blue-400 transition-colors">
                MODELS
              </button>
              <div className="invisible absolute left-1/2 -translate-x-1/2 top-full z-50 mt-2 w-48 border border-zinc-800 bg-black p-1 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                {UI_MODELS.map((model) => (
                  <Link 
                    key={model.id}
                    href={`/model/${encodeURIComponent(model.id)}`}
                    className="block px-3 py-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
                  >
                    {model.display}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side (Actions/Status) */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                MARKET OPEN
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

