import { Sliders, HelpCircle, RefreshCw } from "lucide-react";

interface ConfigPanelProps {
  config: {
    startingCapital: number;
    stopLossPercent: number;
    takeProfitPercent: number;
    objectivePrompt: string;
    marketRegime: "baseline" | "bull" | "bear";
  };
  onChange: (key: string, value: any) => void;
  disabled: boolean;
  onReset: () => void;
}

export function ConfigPanel({ config, onChange, disabled, onReset }: ConfigPanelProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between border-b border-slate-800/50 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-indigo-400" />
          <h2 className="text-md font-semibold text-white">Research & Parameter Setup</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-350 font-medium cursor-pointer transition-colors"
          title="Reset Simulation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Run
        </button>
      </div>

      <div className="space-y-6">
        {/* Market Regime Selecion */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Market Regime (Environmental Testbed)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onChange("marketRegime", "baseline")}
              disabled={disabled}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                config.marketRegime === "baseline"
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Baseline
            </button>
            <button
              onClick={() => onChange("marketRegime", "bull")}
              disabled={disabled}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                config.marketRegime === "bull"
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 shadow-sm animate-pulse"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Hyper Bull
            </button>
            <button
              onClick={() => onChange("marketRegime", "bear")}
              disabled={disabled}
              className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                config.marketRegime === "bear"
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-sm"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              Deep Bear
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 font-sans leading-relaxed">
            Sets the market backdrop for the 30-day run. Emulates realistic structural trends.
          </p>
        </div>

        {/* Paper Capital Range */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Starting Paper Money
            </label>
            <span className="text-sm font-bold font-mono text-indigo-400">
              ${config.startingCapital.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={config.startingCapital}
            disabled={disabled}
            onChange={(e) => onChange("startingCapital", parseInt(e.target.value))}
            className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
            <span>$100</span>
            <span>$5,000</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Risk Limits sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Stop Loss Limit
              </label>
              <span className="text-xs font-bold font-mono text-rose-400">-{config.stopLossPercent}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              step="1"
              value={config.stopLossPercent}
              disabled={disabled}
              onChange={(e) => onChange("stopLossPercent", parseInt(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Triggers complete auto liquidation</span>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Take Profit Target
              </label>
              <span className="text-xs font-bold font-mono text-emerald-400">+{config.takeProfitPercent}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={config.takeProfitPercent}
              disabled={disabled}
              onChange={(e) => onChange("takeProfitPercent", parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <span className="text-[10px] text-slate-500 block mt-1">Safely closes technical gains</span>
          </div>
        </div>

        {/* Dynamic Promt Guidelines */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>LLM Prompt Objective (Goal Rulebook)</span>
            <span className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2.5 bg-slate-800 text-[11px] text-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none font-normal leading-normal">
                This objective guides the server-side Gemini decision logic. Instruct the models how to manage trades.
              </div>
            </span>
          </label>
          <textarea
            value={config.objectivePrompt}
            onChange={(e) => onChange("objectivePrompt", e.target.value)}
            disabled={disabled}
            rows={3}
            placeholder="E.g., Maximize capital growth aggressively. Focus on Nvidia during sentiment runs."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-slate-950 disabled:text-slate-500 resize-none font-sans"
          />
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            <button
              onClick={() => onChange("objectivePrompt", "Steady capital accumulation with strict downside preservation. Prioritize large cap stability.")}
              disabled={disabled}
              className="px-2 py-1 text-[10px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-750 rounded border border-slate-700/50 cursor-pointer transition-colors"
            >
              Defensive
            </button>
            <button
              onClick={() => onChange("objectivePrompt", "Focus on technical breakouts. Seek maximum momentum in high beta names AAPL and NVDA.")}
              disabled={disabled}
              className="px-2 py-1 text-[10px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-750 rounded border border-slate-700/50 cursor-pointer transition-colors"
            >
              Breakout Chaser
            </button>
            <button
              onClick={() => onChange("objectivePrompt", "Optimize for dollar-cost averaging in oversold Tech stocks. Keep high cash reserves.")}
              disabled={disabled}
              className="px-2 py-1 text-[10px] font-semibold bg-slate-800 text-slate-300 hover:bg-slate-750 rounded border border-slate-700/50 cursor-pointer transition-colors"
            >
              Value DCA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
