export interface Position {
  ticker: string;
  shares: number;
  entry_price?: number;
  entry_date?: string;
  thesis?: string;
  market_value?: number;
  unrealized_pnl?: number;
  unrealized_pnl_pct?: number;
}

export interface Trade {
  date: string;
  action: "BUY" | "SELL";
  ticker: string;
  shares?: number;
  price?: number;
  amount_usd?: number;
  thesis?: string;
  result?: string;
}

export interface ResearchLog {
  date: string;
  notes: string;
}

export interface NavPoint {
  date: string;
  nav: number;
}

export interface Portfolio {
  model_id: string;
  starting_capital: number;
  positions: Position[];
  trade_history: Trade[];
  research_logs: ResearchLog[];
  nav_history: NavPoint[];
}

