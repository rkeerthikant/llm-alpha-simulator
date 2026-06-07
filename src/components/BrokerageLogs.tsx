import { useState } from "react";
import { TradeLog, LLMId } from "../types";
import { LLM_PROFILES } from "../mockData";
import { Database, Search, Filter, ShieldAlert, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface BrokerageLogsProps {
  logs: TradeLog[];
}

export function BrokerageLogs({ logs }: BrokerageLogsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [llmFilter, setLlmFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const getLlmBadgeColor = (llmId: LLMId) => {
    switch (llmId) {
      case "gemini":
        return "bg-blue-500/15 text-blue-400 border-blue-500/20";
      case "gpt4":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
      case "claude":
        return "bg-orange-500/15 text-orange-400 border-orange-500/20";
      case "llama":
        return "bg-purple-500/15 text-purple-400 border-purple-500/20";
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "BUY":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
      case "SELL":
        return "bg-slate-950 text-slate-450 border-slate-800";
      case "STOP_LOSS":
        return "bg-rose-500/20 text-rose-455 border-rose-500/30 font-bold animate-pulse";
      case "TAKE_PROFIT":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold";
      default:
        return "bg-slate-950 text-slate-500 border-slate-800";
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.reasoning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLlm = llmFilter === "all" || log.llmId === llmFilter;
    const matchesType =
      typeFilter === "all" ||
      log.action === typeFilter ||
      (typeFilter === "RISK" && (log.action === "STOP_LOSS" || log.action === "TAKE_PROFIT"));

    return matchesSearch && matchesLlm && matchesType;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/55 pb-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-indigo-400" />
          <h2 className="text-md font-semibold text-white font-sans">Mock Brokerage Trade Ledger</h2>
        </div>
        <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">
          Total Logs: {logs.length}
        </span>
      </div>

      {/* 2. Filters & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
          <input
            type="text"
            placeholder="Search by ticker or LLM justification reasoning..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300 placeholder:text-slate-550"
          />
        </div>

        {/* LLM Entity Filter */}
        <div className="relative">
          <select
            value={llmFilter}
            onChange={(e) => setLlmFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300 font-semibold cursor-pointer"
          >
            <option value="all">Compare All LLMs</option>
            {LLM_PROFILES.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Order Type Filter */}
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-300 font-semibold cursor-pointer"
          >
            <option value="all">All Order Types</option>
            <option value="BUY">BUY Orders</option>
            <option value="SELL">Standard SELL</option>
            <option value="RISK">Risk Protection Triggers</option>
            <option value="STOP_LOSS">STOP_LOSS Only</option>
            <option value="TAKE_PROFIT">TAKE_PROFIT Only</option>
          </select>
        </div>
      </div>

      {/* 3. Log Table ledger */}
      {filteredLogs.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-xl py-12 text-center text-xs text-slate-500 font-sans italic">
          No executed brokerage logs detected with current search metrics.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-800 rounded-xl text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[9.5px]">
                <th className="p-3">Timeline</th>
                <th className="p-3">LLM Entity</th>
                <th className="p-3">Ticker</th>
                <th className="p-3">Order Action</th>
                <th className="p-3 text-right">Shares Transacted</th>
                <th className="p-3 text-right">Execution Price</th>
                <th className="p-3 text-right">Settled Amount</th>
                <th className="p-3 text-right">Reserves Left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-medium text-slate-300">
              {filteredLogs.map((log) => {
                const profile = LLM_PROFILES.find((p) => p.id === log.llmId);
                const isRisk = log.action === "STOP_LOSS" || log.action === "TAKE_PROFIT";

                return (
                  <tr key={log.id} className={`hover:bg-slate-800/20 ${isRisk ? "bg-rose-500/5 text-rose-300" : ""}`}>
                    <td className="p-3 font-mono text-[10.5px]">
                      <span className="text-slate-200 font-bold">D{log.day}</span>{" "}
                      <span className="text-slate-500">({log.date})</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${getLlmBadgeColor(log.llmId)}`}>
                        {profile?.name.split(" ")[0]}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{log.ticker}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full border text-[9.5px] uppercase font-bold tracking-tight ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">
                      {log.shares >= 0.0001 ? log.shares.toFixed(4) : log.shares.toString()}
                    </td>
                    <td className="p-3 text-right font-mono text-slate-400">${log.price.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-white font-semibold">${log.totalAmount.toFixed(2)}</td>
                    <td className="p-3 text-right font-mono text-slate-550">${log.cashAfter.toFixed(2)}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Info badge */}
      <div className="flex gap-2.5 bg-slate-950 border border-slate-800 p-4 rounded-xl text-[10.5px] text-slate-400 leading-normal font-sans">
        <ArrowDownCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <p>
          <strong>Brokerage API Simulation Log:</strong> Every record lists transactions completed synchronously at **8:30 AM Central Time** through the sandbox brokerage, deducting cash and calculating weighted cost averages inside isolated portfolios. Non-standard values of shares (decimals) demonstrate active fractional shares routing.
        </p>
      </div>
    </div>
  );
}
