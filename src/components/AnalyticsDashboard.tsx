import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { SimulationHistoryPoint, Portfolio, BenchmarkPortfolio } from "../types";
import { TrendingUp, Percent, DollarSign, Activity, AlertTriangle, HelpCircle } from "lucide-react";

interface AnalyticsDashboardProps {
  history: SimulationHistoryPoint[];
  portfolios: { [llmId: string]: Portfolio };
  benchmark: BenchmarkPortfolio;
  startingCapital: number;
}

export function AnalyticsDashboard({
  history,
  portfolios,
  benchmark,
  startingCapital
}: AnalyticsDashboardProps) {
  // Safe helper to calculate percent returns
  const getReturnPercent = (current: number, base: number) => {
    return parseFloat((((current - base) / base) * 100).toFixed(2));
  };

  // Safe checks for empty or short history lists
  const chartData = history.length > 0 
    ? history 
    : [{ day: 1, date: "2024-10-02", spyValue: startingCapital, geminiValue: startingCapital, gpt4Value: startingCapital, claudeValue: startingCapital, llamaValue: startingCapital, news: "" }];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2 border-b border-slate-800/50 pb-4">
        <TrendingUp id="trending-up-analysis" className="w-5 h-5 text-indigo-400" />
        <h2 className="text-md font-semibold text-white font-sans">Performance & Benchmarking Arena</h2>
      </div>

      {/* 1. Primary Chart Canvas */}
      <div className="w-full h-[320px] bg-slate-950/40 rounded-xl p-4 border border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="day"
              tickFormatter={(val) => `Day ${val}`}
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={["auto", "auto"]}
              tickFormatter={(val) => `$${Math.round(val)}`}
            />
            <Tooltip
              contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "8px", color: "#f8fafc", fontSize: "11px" }}
              labelFormatter={(label) => `Trading Day ${label}`}
              formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`]}
            />
            <Legend verticalAlign="top" iconType="circle" height={36} wrapperStyle={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8" }} />
            
            {/* S&P 500 ETF Benchmark Index path */}
            <Line
              type="monotone"
              dataKey="spyValue"
              name="S&P 500 (SPY)"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
              strokeDasharray="4 4"
            />
            
            {/* Gemini 3.5 Flash path */}
            <Line
              type="monotone"
              dataKey="geminiValue"
              name="Gemini 3.5 Flash"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
            />

            {/* GPT-4o path */}
            <Line
              type="monotone"
              dataKey="gpt4Value"
              name="GPT-4o"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={false}
            />

            {/* Claude 3.5 path */}
            <Line
              type="monotone"
              dataKey="claudeValue"
              name="Claude 3.5"
              stroke="#f97316"
              strokeWidth={2.5}
              dot={false}
            />

            {/* Llama 3 path */}
            <Line
              type="monotone"
              dataKey="llamaValue"
              name="Llama 3 70B"
              stroke="#a855f7"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 2. Numerical stats breakdown card deck */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-3">Trading Entity</th>
              <th className="p-3 text-right">Ending Equity</th>
              <th className="p-3 text-right">Net Profit ($)</th>
              <th className="p-3 text-right">Total Yield (%)</th>
              <th className="p-3 text-right">Max Drawdown</th>
              <th className="p-3 text-right">Outperformance vs SPY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
            {/* Gemini 3.5 row */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block animate-pulse" />
                <span className="text-white font-semibold font-sans">Gemini 3.5 Flash</span>
              </td>
              <td className="p-3 text-right font-mono text-slate-200">${portfolios.gemini.totalValue.toFixed(2)}</td>
              <td className={`p-3 text-right font-mono ${portfolios.gemini.pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {portfolios.gemini.pnlTotal >= 0 ? "+" : ""}${portfolios.gemini.pnlTotal.toFixed(2)}
              </td>
              <td className={`p-3 text-right font-mono ${portfolios.gemini.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-bold">
                  {portfolios.gemini.pnlPercent >= 0 ? "+" : ""}{portfolios.gemini.pnlPercent}%
                </span>
              </td>
              <td className="p-3 text-right font-mono text-rose-455 font-semibold">-{portfolios.gemini.maxDrawdown.toFixed(1)}%</td>
              <td className={`p-3 text-right font-mono font-bold ${getReturnPercent(portfolios.gemini.totalValue, benchmark.totalValue) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {getReturnPercent(portfolios.gemini.totalValue, benchmark.totalValue) >= 0 ? "+" : ""}
                {getReturnPercent(portfolios.gemini.totalValue, benchmark.totalValue)}%
              </td>
            </tr>

            {/* GPT-4 row */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-pulse" />
                <span className="text-white font-semibold font-sans">GPT-4o</span>
              </td>
              <td className="p-3 text-right font-mono text-slate-200">${portfolios.gpt4.totalValue.toFixed(2)}</td>
              <td className={`p-3 text-right font-mono ${portfolios.gpt4.pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {portfolios.gpt4.pnlTotal >= 0 ? "+" : ""}${portfolios.gpt4.pnlTotal.toFixed(2)}
              </td>
              <td className={`p-3 text-right font-mono ${portfolios.gpt4.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-bold">
                  {portfolios.gpt4.pnlPercent >= 0 ? "+" : ""}{portfolios.gpt4.pnlPercent}%
                </span>
              </td>
              <td className="p-3 text-right font-mono text-rose-455 font-semibold">-{portfolios.gpt4.maxDrawdown.toFixed(1)}%</td>
              <td className={`p-3 text-right font-mono font-bold ${getReturnPercent(portfolios.gpt4.totalValue, benchmark.totalValue) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {getReturnPercent(portfolios.gpt4.totalValue, benchmark.totalValue) >= 0 ? "+" : ""}
                {getReturnPercent(portfolios.gpt4.totalValue, benchmark.totalValue)}%
              </td>
            </tr>

            {/* Claude 3.5 row */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 block animate-pulse" />
                <span className="text-white font-semibold font-sans">Claude 3.5 Sonnet</span>
              </td>
              <td className="p-3 text-right font-mono text-slate-200">${portfolios.claude.totalValue.toFixed(2)}</td>
              <td className={`p-3 text-right font-mono ${portfolios.claude.pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {portfolios.claude.pnlTotal >= 0 ? "+" : ""}${portfolios.claude.pnlTotal.toFixed(2)}
              </td>
              <td className={`p-3 text-right font-mono ${portfolios.claude.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-bold">
                  {portfolios.claude.pnlPercent >= 0 ? "+" : ""}{portfolios.claude.pnlPercent}%
                </span>
              </td>
              <td className="p-3 text-right font-mono text-rose-455 font-semibold">-{portfolios.claude.maxDrawdown.toFixed(1)}%</td>
              <td className={`p-3 text-right font-mono font-bold ${getReturnPercent(portfolios.claude.totalValue, benchmark.totalValue) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {getReturnPercent(portfolios.claude.totalValue, benchmark.totalValue) >= 0 ? "+" : ""}
                {getReturnPercent(portfolios.claude.totalValue, benchmark.totalValue)}%
              </td>
            </tr>

            {/* Llama 3 row */}
            <tr className="hover:bg-slate-800/20">
              <td className="p-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 block animate-pulse" />
                <span className="text-white font-semibold font-sans">Llama 3 70B</span>
              </td>
              <td className="p-3 text-right font-mono text-slate-200">${portfolios.llama.totalValue.toFixed(2)}</td>
              <td className={`p-3 text-right font-mono ${portfolios.llama.pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {portfolios.llama.pnlTotal >= 0 ? "+" : ""}${portfolios.llama.pnlTotal.toFixed(2)}
              </td>
              <td className={`p-3 text-right font-mono ${portfolios.llama.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <span className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-bold">
                  {portfolios.llama.pnlPercent >= 0 ? "+" : ""}{portfolios.llama.pnlPercent}%
                </span>
              </td>
              <td className="p-3 text-right font-mono text-rose-455 font-semibold">-{portfolios.llama.maxDrawdown.toFixed(1)}%</td>
              <td className={`p-3 text-right font-mono font-bold ${getReturnPercent(portfolios.llama.totalValue, benchmark.totalValue) >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {getReturnPercent(portfolios.llama.totalValue, benchmark.totalValue) >= 0 ? "+" : ""}
                {getReturnPercent(portfolios.llama.totalValue, benchmark.totalValue)}%
              </td>
            </tr>

            {/* SPY Benchmark row */}
            <tr className="bg-slate-950/40 hover:bg-slate-800/10">
              <td className="p-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-500 block" strokeDasharray="4 4" />
                <span className="text-slate-400 font-bold font-sans">S&P 500 (SPY)*</span>
              </td>
              <td className="p-3 text-right font-mono text-slate-350">${benchmark.totalValue.toFixed(2)}</td>
              <td className={`p-3 text-right font-mono ${benchmark.pnlTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {benchmark.pnlTotal >= 0 ? "+" : ""}${benchmark.pnlTotal.toFixed(2)}
              </td>
              <td className={`p-3 text-right font-mono ${benchmark.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                <span className="bg-slate-950 border border-slate-850 text-slate-400 rounded px-1.5 py-0.5 font-bold">
                  {benchmark.pnlPercent >= 0 ? "+" : ""}{benchmark.pnlPercent}%
                </span>
              </td>
              <td className="p-3 text-right font-mono text-slate-500">-</td>
              <td className="p-3 text-right font-mono text-slate-500 font-bold">0.00%</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex gap-2.5 bg-slate-950 border border-slate-800/80 p-4 rounded-xl text-[10.5px] text-slate-400 leading-relaxed font-sans">
        <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0" />
        <p>
          *<strong>Comparative Benchmarking Explanation:</strong> S&P 500 (SPY) uses a passive Buy-and-Hold strategy. The initial $1000 is fully committed into SPY on Day 1, simulating how a retail index investor performs over the same 30-day time window. Max Drawdown measures the maximum observed peak-to-trough drop before a new peak is attained, a critical metric for paper volatility evaluation.
        </p>
      </div>
    </div>
  );
}
