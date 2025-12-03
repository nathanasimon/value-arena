'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';

// Mock models list for UI since we can't import python config directly in client component easily without API
const UI_MODELS = [
    {"id": "openai/gpt-5.1", "display": "GPT 5.1"},
    {"id": "anthropic/claude-opus-4.5", "display": "Claude Opus 4.5"},
    {"id": "google/gemini-3-pro-preview", "display": "Gemini 3 Pro"},
    {"id": "deepseek/deepseek-v3.2", "display": "DeepSeek V3.2"},
    {"id": "x-ai/grok-4.1-fast", "display": "Grok 4.1"},
    {"id": "qwen/qwen3-max", "display": "Qwen 3 Max"},
    {"id": "moonshotai/kimi-k2-thinking", "display": "Kimi k2"}
];

export function Header() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
               <span className="text-lg font-bold tracking-tight text-zinc-900">Value<span className="text-zinc-400">Arena</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/" className={clsx("px-3 py-2 rounded-md text-sm font-medium transition-colors", pathname === "/" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50")}>
                Live
              </Link>
              <Link href="/leaderboard" className={clsx("px-3 py-2 rounded-md text-sm font-medium transition-colors", pathname === "/leaderboard" ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50")}>
                Leaderboard
              </Link>
              
              <div className="group relative px-3 py-2">
                <button className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors">
                  Models <ChevronDown size={14} />
                </button>
                <div className="invisible absolute left-0 top-full z-50 mt-1 w-56 border border-zinc-200 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 group-hover:visible group-hover:opacity-100 overflow-hidden">
                  <div className="py-1">
                    {UI_MODELS.map((model) => (
                      <Link 
                        key={model.id}
                        href={`/model/${encodeURIComponent(model.id)}`}
                        className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                      >
                        {model.display}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side (Actions/Status) */}
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-medium text-zinc-600">Market Open</span>
             </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
