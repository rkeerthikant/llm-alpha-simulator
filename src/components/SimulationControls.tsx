import { Play, Pause, ChevronRight, RotateCcw, FastForward, Clock, Loader2 } from "lucide-react";

interface SimulationControlsProps {
  currentDay: number;
  isRunning: boolean;
  isProcessing: boolean;
  speed: number;
  onPlayPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  apiUsed: string;
}

export function SimulationControls({
  currentDay,
  isRunning,
  isProcessing,
  speed,
  onPlayPause,
  onStep,
  onReset,
  onSpeedChange,
  apiUsed
}: SimulationControlsProps) {
  const isFinished = currentDay >= 30;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      {/* 1. Left controls buttons */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {isFinished ? (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Experiment
          </button>
        ) : (
          <>
            <button
              onClick={onPlayPause}
              disabled={isProcessing}
              className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold transition-all shadow-md text-sm w-full sm:w-auto cursor-pointer ${
                isRunning
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-705"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              } ${isProcessing ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                  Processing...
                </>
              ) : isRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  Pause Run
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Auto-Play Run
                </>
              )}
            </button>

            <button
              onClick={onStep}
              disabled={isRunning || isProcessing}
              className="flex items-center justify-center gap-1.5 px-4 py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-800 transition-all shadow-sm text-sm w-full sm:w-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Execute next 8:30 AM trade opening"
            >
              <span>Next Trading Day</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* 2. Middle system logs / indicators */}
      <div className="flex-1 text-center md:text-left">
        {isProcessing ? (
          <div className="space-y-1">
            <div className="text-xs font-bold text-indigo-400 flex items-center justify-center md:justify-start gap-1.5 font-mono animate-pulse">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block animate-ping" />
              EXECUTING 8:30 AM MARKET OPEN DECISIONS
            </div>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Synthesizing prompt objective, technical indicators, and news patterns to construct orders...
            </p>
          </div>
        ) : isFinished ? (
          <div>
            <div className="text-xs font-bold text-amber-450 flex items-center justify-center md:justify-start gap-1.5 font-mono">
              ★ 30-DAY RUN COMPLETION SUCCESS
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Analyze cumulative yields, compound drawdown metrics, and LLM behavior summaries below.
            </p>
          </div>
        ) : isRunning ? (
          <div>
            <div className="text-xs font-bold text-emerald-450 flex items-center justify-center md:justify-start gap-1.5 font-mono">
              ● RE-BALANCING ONGOING (SPEED: {speed}ms)
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Currently compiling decisions through {apiUsed === "GEMINI_3.5_FLASH" ? "Gemini 3.5 Server" : "Local Quantitative Engine"}.
            </p>
          </div>
        ) : (
          <div>
            <div className="text-xs font-bold text-slate-400 flex items-center justify-center md:justify-start gap-1.5 font-mono">
              ○ SIMULATION PAUSED & STANDBY
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Click Auto-Play or Next Trading Day to forward timeline, calculate brokerage logs, and graph yield curves.
            </p>
          </div>
        )}
      </div>

      {/* 3. Right Speed controls */}
      {!isFinished && (
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-400 font-medium font-sans">Step Delay:</span>
          <div className="inline-flex bg-slate-950 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => onSpeedChange(2500)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                speed === 2500
                  ? "bg-slate-800 text-slate-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Slow
            </button>
            <button
              onClick={() => onSpeedChange(1500)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                speed === 1500
                  ? "bg-slate-800 text-slate-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Med
            </button>
            <button
              onClick={() => onSpeedChange(800)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                speed === 800
                  ? "bg-slate-800 text-slate-200 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Fast
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
