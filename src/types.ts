export interface StockMetrics {
  ticker: string;
  price: number;
  changePercent: number;
  rsi: number;
  sma50: number;
  sma200: number;
  macd: "BULLISH" | "BEARISH" | "NEUTRAL";
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  sentimentScore: number; // 0 (bearish) to 100 (bullish)
}

export interface DayMarketData {
  day: number;
  date: string;
  macroNews: {
    headline: string;
    impact: "BULLISH" | "BEARISH" | "NEUTRAL";
    sentimentDescription: string;
  };
  stocks: { [ticker: string]: StockMetrics };
}

export type LLMId = "gemini" | "gpt4" | "claude" | "llama";

export interface LLMProfile {
  id: LLMId;
  name: string;
  description: string;
  avatarColor: string;
  style: string;
}

export interface TradeDecision {
  ticker: string;
  action: "BUY" | "SELL" | "HOLD";
  amountDollars: number; // For buy decisions or risk limits
  amountPercent: number; // percentage of current holdings to sell, or percentage of cash to buy (0-100)
  reasoning: string;
}

export interface LLMResults {
  [llmId: string]: TradeDecision[];
}

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  avgCost: number;
  currentValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface Portfolio {
  llmId: LLMId;
  cash: number;
  holdings: { [ticker: string]: PortfolioHolding };
  totalValue: number;
  pnlTotal: number;
  pnlPercent: number;
  maxDrawdown: number;
  peakValue: number;
}

export interface TradeLog {
  id: string;
  day: number;
  date: string;
  llmId: LLMId;
  ticker: string;
  action: "BUY" | "SELL" | "STOP_LOSS" | "TAKE_PROFIT";
  shares: number;
  price: number;
  totalAmount: number;
  reasoning: string;
  cashAfter: number;
}

export interface BenchmarkPortfolio {
  cash: number;
  shares: number;
  totalValue: number;
  pnlTotal: number;
  pnlPercent: number;
}

export interface SimulationHistoryPoint {
  day: number;
  date: string;
  spyValue: number;
  geminiValue: number;
  gpt4Value: number;
  claudeValue: number;
  llamaValue: number;
  news: string;
}

export interface SimulationState {
  currentDay: number;
  isRunning: boolean;
  speed: number; // ms per step
  config: {
    startingCapital: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    objectivePrompt: string;
    marketRegime: "baseline" | "bull" | "bear";
  };
  portfolios: { [llmId: string]: Portfolio };
  benchmark: BenchmarkPortfolio;
  tradeLogs: TradeLog[];
  history: SimulationHistoryPoint[];
}
