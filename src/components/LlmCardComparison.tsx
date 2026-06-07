import { LLM_PROFILES } from "../mockData";
import { Portfolio, PortfolioHolding, LLMId } from "../types";
import { Circle, User, DollarSign, Briefcase, ChevronRight, HelpCircle } from "lucide-react";

interface LlmCardComparisonProps {
  portfolios: { [llmId: string]: Portfolio };
  activeTab: LLMId;
  setActiveTab: (tab: LLMId) => void;
  dailyReasoning: { [llmId: string]: { ticker: string; action: string; reasoning: string; amountPercent: number }[] };
}

export function LlmCardComparison({
  portfolios,
  activeTab,
  setActiveTab,
  dailyReasoning
}: LlmCardComparisonProps) {
  const activePortfolio = portfolios[activeTab];
  const activeProfile = LLM_PROFILES.find((p) => p.id === activeTab);

  // Helper for color classification
  const getPnlColor = (val: number) => {
    if (val > 0) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (val < 0) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    return "text-slate-300 bg-slate-950 border-slate-800";
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
      case "SELL":
        return "bg-rose-500/15 text-rose-450 border-rose-500/20";
      default:
        return "bg-slate-950 text-slate-400 border-slate-800";
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" />
          <h2 className="text-md font-semibold text-white font-sans">Algorithms & Portfolio Structures</h2>
        </div>

        {/* 1. Interactive Model Selection Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
          {LLM_PROFILES.map((p) => {
            const port = portfolios[p.id];
            const isSelected = p.id === activeTab;
            const isProfit = port.pnlTotal >= 0;

            return (
              <button
                key={p.id}
                onClick={() => setActiveTab(p.id as LLMId)}
                className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-slate-800 text-indigo-450 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{p.name.split(" ")[0]}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    isProfit ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {isProfit ? "+" : ""}
                  {port.pnlPercent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeProfile && activePortfolio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card left: Agent Details and Cash breakdown */}
          <div className="lg:col-span-1 space-y-5 bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${activeProfile.avatarColor}`} />
                <h3 className="text-sm font-bold text-white">{activeProfile.name}</h3>
              </div>
              <p className="text-xs text-slate-400 font-bold uppercase font-sans">
                {activeProfile.description}
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {activeProfile.style}
              </p>
            </div>

            <div className="h-px bg-slate-800/60" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Equity Valuation</div>
                <div className="text-lg font-black text-white font-mono tracking-tight mt-0.5">
                  ${activePortfolio.totalValue.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Unused Cash</div>
                <div className="text-lg font-black text-slate-300 font-mono mt-0.5">
                  ${activePortfolio.cash.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Original Capital</span>
                <span className="text-slate-350 font-bold font-mono">$1,000.00</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Aggregate Return</span>
                <span className={`font-black font-mono ${activePortfolio.pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {activePortfolio.pnlTotal >= 0 ? "+" : ""}${activePortfolio.pnlTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Card right: Active Positions (Fractional shares!) */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>Active Holdings Account ({Object.values(activePortfolio.holdings).filter(h => h.shares > 0).length})</span>
                <span className="text-[10px] bg-slate-950 border border-slate-800 text-indigo-400 px-2 py-0.5 rounded font-normal normal-case">
                  Fractional Shares Allowed
                </span>
              </h4>

              {Object.values(activePortfolio.holdings).filter((h) => h.shares > 0).length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-xl py-12 text-center text-xs text-slate-500 font-sans italic">
                  No active stock positions. Portfolio is currently 100% in cash.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(activePortfolio.holdings)
                    .filter((h) => h.shares > 0)
                    .map((h: PortfolioHolding) => (
                      <div key={h.ticker} className="border border-slate-800 bg-slate-950/20 hover:border-slate-700/60 p-4 rounded-xl flex flex-col justify-between space-y-3 transition-all">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{h.ticker}</span>
                          <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full border ${getPnlColor(h.unrealizedPnLPercent)}`}>
                            {h.unrealizedPnLPercent >= 0 ? "+" : ""}
                            {h.unrealizedPnLPercent}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                          <div>
                            <span className="text-slate-500 font-medium font-sans block">Size</span>
                            <span className="text-slate-300 font-semibold">{parseFloat(h.shares.toFixed(4))} shares</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium font-sans block">Valuation</span>
                            <span className="text-slate-200 font-bold">${h.currentValue.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium font-sans block">Avg Cost</span>
                            <span className="text-slate-350">${h.avgCost.toFixed(2)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 font-medium font-sans block">P&L ($)</span>
                            <span className={`font-bold ${h.unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                              {h.unrealizedPnL >= 0 ? "+" : ""}${h.unrealizedPnL.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Daily Reasoning panel */}
            <div className="border-t border-slate-800/80 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Today's Decision Log & Qualitative Reasoning
              </h4>
              <div className="space-y-2.5">
                {dailyReasoning[activeTab] && dailyReasoning[activeTab].length > 0 ? (
                  dailyReasoning[activeTab].map((dec, idx) => (
                    <div key={idx} className="bg-slate-955/30 hover:bg-slate-950 border border-slate-850 rounded-xl p-3.5 space-y-1.5 transition-all text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-slate-250 flex items-center gap-1.5">
                          {dec.ticker}
                          <span className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border uppercase ${getActionBadge(dec.action)}`}>
                            {dec.action} {dec.action === "BUY" ? `(${dec.amountPercent}% Cash)` : dec.action === "SELL" ? `(${dec.amountPercent}% Shares)` : ""}
                          </span>
                        </span>
                      </div>
                      <p className="text-slate-400 font-sans italic leading-relaxed pl-3 border-l-2 border-indigo-500/60">
                        "{dec.reasoning}"
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 font-sans italic">
                    Press Play or Step to review decision reasoning transcripts.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
