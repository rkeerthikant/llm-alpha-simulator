import { StockMetrics } from "../types";
import { TrendingUp, Award, ShieldAlert, Cpu } from "lucide-react";

interface HeaderProps {
  currentDay: number;
  date: string;
}

export function Header({ currentDay, date }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-md">
          <Cpu id="header-logo-icon" className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block">Research Simulation v1.2</span>
          <h1 id="app-title" className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            LLM Alpha-Sim <span className="font-light text-slate-500">30-Day Gain Study</span>
            <span className="text-xs bg-indigo-500/10 text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/20 font-sans">
              Research PoC
            </span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium font-sans">
            Comparative analysis of AI buying & selling decisions with paper trading capital
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-right">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Simulation Timeline</div>
          <div className="text-sm font-bold text-slate-200 flex items-center justify-end gap-1.5 font-mono">
            <span>Day {currentDay}/30</span>
            <span className="text-slate-700">|</span>
            <span className="text-indigo-400">{date}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
