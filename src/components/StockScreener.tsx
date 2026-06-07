import { DayMarketData } from "../types";
import { Newspaper, AlertCircle, ArrowUpRight, ArrowDownRight, TrendingUp, Compass } from "lucide-react";

interface StockScreenerProps {
  dayData: DayMarketData;
}

export function StockScreener({ dayData }: StockScreenerProps) {
  const getImpactColor = (impact: "BULLISH" | "BEARISH" | "NEUTRAL") => {
    switch (impact) {
      case "BULLISH":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "BEARISH":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-950 text-slate-400 border-slate-800";
    }
  };

  const getRsiColor = (rsi: number) => {
    if (rsi >= 70) return "text-amber-450 bg-amber-500/10 border-amber-500/20";
    if (rsi <= 40) return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    return "text-slate-300 bg-slate-950 border-slate-800";
  };

  return (
    <div className="space-y-6">
      {/* 1. Macro News Banner */}
      <div className="bg-slate-900/50 border border-slate-800 text-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Newspaper className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 block">
            Pre-Market Macro feed & Sentiment (8:30 AM Central)
          </span>
        </div>

        <div className="border-l-4 border-indigo-500/40 pl-4 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-white line-clamp-2 md:line-clamp-none">
              {dayData.macroNews.headline}
            </h3>
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getImpactColor(
                dayData.macroNews.impact
              )}`}
            >
              {dayData.macroNews.impact}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            {dayData.macroNews.sentimentDescription}
          </p>
        </div>
      </div>

      {/* 2. Stock Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.keys(dayData.stocks).map((ticker) => {
          const s = dayData.stocks[ticker];
          const isUp = s.changePercent >= 0;
          const isSPY = ticker === "SPY";

          return (
            <div
              key={ticker}
              className={`bg-slate-900/40 border rounded-xl p-4 shadow-sm hover:translate-y-[-2px] transition-all ${
                isSPY
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-slate-900"
                  : "border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5">
                  <span className={`text-sm font-bold ${isSPY ? "text-amber-400" : "text-white"}`}>
                    {ticker}
                  </span>
                  {isSPY && (
                    <span className="text-[8px] bg-amber-500/15 border border-amber-500/30 text-amber-400 px-1.5 py-0.2 rounded font-bold scale-90">
                      BENCHMARK
                    </span>
                  )}
                </span>
                <span
                  className={`text-xs font-semibold flex items-center font-mono ${
                    isUp ? "text-emerald-450" : "text-rose-450"
                  }`}
                >
                  {isUp ? "+" : ""}
                  {s.changePercent}%
                  {isUp ? (
                    <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 ml-0.5 text-rose-400" />
                  )}
                </span>
              </div>

              <div className="text-xl font-black text-white font-mono tracking-tight">
                ${s.price.toFixed(2)}
              </div>

              <div className="mt-3.5 space-y-2 pt-3 border-t border-slate-800/60 text-[11px]">
                {/* RSI Display */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium font-sans">RSI(14)</span>
                  <span className={`px-1.5 py-0.2 rounded font-bold font-mono text-[10px] border ${getRsiColor(s.rsi)}`}>
                    {s.rsi}
                  </span>
                </div>

                {/* MACD or SMA Status */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium font-sans mb-0.5">MACD</span>
                  <span
                    className={`font-bold uppercase tracking-tight text-[10px] ${
                      s.macd === "BULLISH"
                        ? "text-emerald-450"
                        : s.macd === "BEARISH"
                        ? "text-rose-450"
                        : "text-slate-400"
                    }`}
                  >
                    {s.macd}
                  </span>
                </div>

                {/* SMA 50 comparison */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium font-sans">SMA(50)</span>
                  <span className="text-slate-350 font-semibold font-mono">${s.sma50}</span>
                </div>

                {/* Public Sentiment Meter */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium font-sans">Social Value</span>
                    <span
                      className={`font-bold font-mono ${
                        s.sentimentScore > 60
                          ? "text-emerald-450"
                          : s.sentimentScore < 40
                          ? "text-rose-450"
                          : "text-slate-400"
                      }`}
                    >
                      {s.sentimentScore}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all ${
                        s.sentimentScore > 60
                          ? "bg-emerald-500"
                          : s.sentimentScore < 40
                          ? "bg-rose-500"
                          : "bg-slate-400"
                      }`}
                      style={{ width: `${s.sentimentScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
