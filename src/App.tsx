import { useState, useEffect, useRef } from "react";
import { generate30DaysMarketData, LLM_PROFILES, INITIAL_CASH } from "./mockData";
import { SimulationState, Portfolio, PortfolioHolding, TradeLog, LLMId, SimulationHistoryPoint } from "./types";
import { Header } from "./components/Header";
import { ConfigPanel } from "./components/ConfigPanel";
import { StockScreener } from "./components/StockScreener";
import { SimulationControls } from "./components/SimulationControls";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { LlmCardComparison } from "./components/LlmCardComparison";
import { BrokerageLogs } from "./components/BrokerageLogs";
import { AlertCircle, Play, HelpCircle, ArrowUpRight, Award, Trophy } from "lucide-react";

export default function App() {
  // 1. Core State
  const [marketRegime, setMarketRegime] = useState<"baseline" | "bull" | "bear">("baseline");
  const [startingCapital, setStartingCapital] = useState(1000);
  const [stopLossPercent, setStopLossPercent] = useState(8);
  const [takeProfitPercent, setTakeProfitPercent] = useState(25);
  const [objectivePrompt, setObjectivePrompt] = useState(
    "Steady capital accumulation with strict downside preservation. Prioritize large cap stability."
  );

  // Loaded 30-day chronological dataset based on the active regime
  const [marketData, setMarketData] = useState(() => generate30DaysMarketData("baseline"));

  // Main simulation dashboard state
  const [currentDay, setCurrentDay] = useState(0); // 0 = Standby. 1 to 30 = simulated timeline days
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speed, setSpeed] = useState(1500); // speed step in ms
  const [apiUsed, setApiUsed] = useState("LOCAL_QUANT_ENGINE");
  
  // Portfolios
  const [portfolios, setPortfolios] = useState<{ [llmId: string]: Portfolio }>(() => 
    initializePortfolios(INITIAL_CASH)
  );

  // SPY Index Benchmark
  const [benchmark, setBenchmark] = useState({
    cash: INITIAL_CASH,
    shares: 0,
    totalValue: INITIAL_CASH,
    pnlTotal: 0,
    pnlPercent: 0
  });

  // Logs & History coordinates
  const [tradeLogs, setTradeLogs] = useState<TradeLog[]>([]);
  const [history, setHistory] = useState<SimulationHistoryPoint[]>([]);

  // UI Selection states
  const [activeLlmTab, setActiveLlmTab] = useState<LLMId>("gemini");
  const [showResearchInfo, setShowResearchInfo] = useState(true);

  // Timers
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 2. Synchronize market data paths when market regime changes
  useEffect(() => {
    if (currentDay === 0) {
      setMarketData(generate30DaysMarketData(marketRegime));
    }
  }, [marketRegime, currentDay]);

  // Handle active playback loop
  useEffect(() => {
    if (isRunning && !isProcessing && currentDay < 30) {
      timerRef.current = setTimeout(() => {
        handleDaySimulationStep();
      }, speed);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, isProcessing, currentDay, speed]);

  // Initializing portfolios
  function initializePortfolios(capital: number): { [llmId: string]: Portfolio } {
    const ids: LLMId[] = ["gemini", "gpt4", "claude", "llama"];
    const out: { [llmId: string]: Portfolio } = {};
    for (const id of ids) {
      out[id] = {
        llmId: id,
        cash: capital,
        holdings: {
          AAPL: { ticker: "AAPL", shares: 0, avgCost: 0, currentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0 },
          MSFT: { ticker: "MSFT", shares: 0, avgCost: 0, currentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0 },
          NVDA: { ticker: "NVDA", shares: 0, avgCost: 0, currentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0 },
          TSLA: { ticker: "TSLA", shares: 0, avgCost: 0, currentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0 }
        },
        totalValue: capital,
        pnlTotal: 0,
        pnlPercent: 0,
        maxDrawdown: 0,
        peakValue: capital
      };
    }
    return out;
  }

  // Manage setup parameter changes securely (only allowed before simulation starts)
  const handleConfigChange = (key: string, value: any) => {
    if (currentDay > 0) return; // locked
    switch (key) {
      case "startingCapital":
        setStartingCapital(value);
        setPortfolios(initializePortfolios(value));
        setBenchmark({
          cash: value,
          shares: 0,
          totalValue: value,
          pnlTotal: 0,
          pnlPercent: 0
        });
        break;
      case "stopLossPercent":
        setStopLossPercent(value);
        break;
      case "takeProfitPercent":
        setTakeProfitPercent(value);
        break;
      case "objectivePrompt":
        setObjectivePrompt(value);
        break;
      case "marketRegime":
        setMarketRegime(value);
        break;
    }
  };

  // Reset complete simulation run
  const handleReset = () => {
    setIsRunning(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentDay(0);
    setApiUsed("LOCAL_QUANT_ENGINE");
    setPortfolios(initializePortfolios(startingCapital));
    setBenchmark({
      cash: startingCapital,
      shares: 0,
      totalValue: startingCapital,
      pnlTotal: 0,
      pnlPercent: 0
    });
    setTradeLogs([]);
    setHistory([]);
    setMarketData(generate30DaysMarketData(marketRegime));
  };

  // 3. Execution of the Daily trading step at 8:30 AM
  const handleDaySimulationStep = async () => {
    if (currentDay >= 30) {
      setIsRunning(false);
      return;
    }

    setIsProcessing(true);
    const nextDay = currentDay + 1;
    const dayData = marketData[nextDay - 1]; // Day 1 is index 0

    // Prepare current stock price mapping for calculation helper
    const todayStocks = dayData.stocks;

    try {
      // Call server-side API to query Gemini with specific parameters for today
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day: nextDay,
          date: dayData.date,
          stocks: todayStocks,
          news: dayData.macroNews,
          setupConfig: {
            startingCapital,
            stopLossPercent,
            takeProfitPercent,
            objectivePrompt,
            marketRegime
          },
          portfolios: portfolios
        })
      });

      const resData = await response.json();
      const rawDecisions = resData.decisions;
      setApiUsed(resData.apiUsed);

      // Mutate copies of state safely
      const newPortfolios = JSON.parse(JSON.stringify(portfolios));
      let newLogs: TradeLog[] = [];

      // Process benchmark (SPY S&P 500 passive)
      const spyPrice = todayStocks["SPY"].price;
      let newBenchmark = { ...benchmark };
      
      if (nextDay === 1) {
        // Initial investment in SPY
        const initialSpyShares = startingCapital / spyPrice;
        newBenchmark = {
          cash: 0,
          shares: initialSpyShares,
          totalValue: startingCapital,
          pnlTotal: 0,
          pnlPercent: 0
        };
      } else {
        const value = newBenchmark.shares * spyPrice;
        const pnl = value - startingCapital;
        newBenchmark = {
          ...newBenchmark,
          totalValue: value,
          pnlTotal: pnl,
          pnlPercent: parseFloat(((pnl / startingCapital) * 100).toFixed(2))
        };
      }

      // Loop over models to process decisions
      const llmIds: LLMId[] = ["gemini", "gpt4", "claude", "llama"];
      
      for (const id of llmIds) {
        const port = newPortfolios[id] as Portfolio;
        const decisionsForAgent = rawDecisions[id] || [];

        // --- STEP A: VERIFY AND EXECUTE RISK MANAGEMENT LIMIT TRiggers (Stop Loss & Take Profit) ---
        // Run BEFORE new market trades to protect assets at opening bell
        Object.keys(port.holdings).forEach((ticker) => {
          const h = port.holdings[ticker] as PortfolioHolding;
          if (h.shares > 0) {
            const currentPrice = todayStocks[ticker].price;
            const openReturnPercent = ((currentPrice - h.avgCost) / h.avgCost) * 100;

            // Stop Loss test
            if (openReturnPercent <= -stopLossPercent) {
              const sharesSold = h.shares;
              const saleAmount = sharesSold * currentPrice;
              port.cash += saleAmount;
              
              // Record Brokerage transaction
              const log: TradeLog = {
                id: `sl-${id}-${nextDay}-${ticker}`,
                day: nextDay,
                date: dayData.date,
                llmId: id,
                ticker: ticker,
                action: "STOP_LOSS",
                shares: sharesSold,
                price: currentPrice,
                totalAmount: saleAmount,
                cashAfter: port.cash,
                reasoning: `Auto Risk Protocol: Position closed as Stop Loss breach (-${stopLossPercent}%) detected on market open. Day variance return: ${openReturnPercent.toFixed(1)}%.`
              };
              newLogs.push(log);

              // Reset holding structure
              port.holdings[ticker] = {
                ticker, shares: 0, avgCost: 0, currentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0
              };
            }
            // Take Profit test
            else if (openReturnPercent >= takeProfitPercent) {
              const sharesSold = h.shares;
              const saleAmount = sharesSold * currentPrice;
              port.cash += saleAmount;

              // Record transaction
              const log: TradeLog = {
                id: `tp-${id}-${nextDay}-${ticker}`,
                day: nextDay,
                date: dayData.date,
                llmId: id,
                ticker: ticker,
                action: "TAKE_PROFIT",
                shares: sharesSold,
                price: currentPrice,
                totalAmount: saleAmount,
                cashAfter: port.cash,
                reasoning: `Auto Risk Protocol: position liquidated to lock in paper profits. Target limit threshold observed (+${takeProfitPercent}%) achieved at ${openReturnPercent.toFixed(1)}%.`
              };
              newLogs.push(log);

              // Reset holding structure
              port.holdings[ticker] = {
                ticker, shares: 0, avgCost: 0, currentValue: 0, unrealizedPnL: 0, unrealizedPnLPercent: 0
              };
            }
          }
        });

        // --- STEP B: EXECUTE INCOMING DECISION RE-BALANCING REQS ---
        decisionsForAgent.forEach((dec: any) => {
          const ticker = dec.ticker;
          const action = dec.action as "BUY" | "SELL" | "HOLD";
          const amount = dec.amountPercent; // 0-100
          const price = todayStocks[ticker]?.price || 0;
          
          if (price === 0 || amount <= 0) return;

          const h = port.holdings[ticker] as PortfolioHolding;

          if (action === "BUY") {
            const capitalToUtilize = port.cash * (amount / 100);
            if (capitalToUtilize >= 1.0) { // minimum purchase limit
              const sharesPurchased = capitalToUtilize / price;
              const oldShares = h.shares;
              const oldCost = h.avgCost;

              h.shares += sharesPurchased;
              h.avgCost = (oldShares * oldCost + capitalToUtilize) / h.shares;
              port.cash -= capitalToUtilize;

              newLogs.push({
                id: `trade-${id}-${nextDay}-${ticker}-buy`,
                day: nextDay,
                date: dayData.date,
                llmId: id,
                ticker,
                action: "BUY",
                shares: sharesPurchased,
                price,
                totalAmount: capitalToUtilize,
                cashAfter: port.cash,
                reasoning: dec.reasoning || `Acquisition of ${amount}% allocation requested by LLM core.`
              });
            }
          } 
          else if (action === "SELL") {
            if (h.shares > 0) {
              const sharesToLiquidate = h.shares * (amount / 100);
              if (sharesToLiquidate > 0.00001) {
                const creditCapital = sharesToLiquidate * price;
                h.shares -= sharesToLiquidate;
                port.cash += creditCapital;

                if (h.shares < 0.0001) {
                  h.shares = 0;
                  h.avgCost = 0;
                }

                newLogs.push({
                  id: `trade-${id}-${nextDay}-${ticker}-sell`,
                  day: nextDay,
                  date: dayData.date,
                  llmId: id,
                  ticker,
                  action: "SELL",
                  shares: sharesToLiquidate,
                  price,
                  totalAmount: creditCapital,
                  cashAfter: port.cash,
                  reasoning: dec.reasoning || `Liquidation of ${amount}% exposure requested by LLM core.`
                });
              }
            }
          }
        });

        // --- STEP C: CALCULATE ENDING PORTFOLIO VALUE AND DRAWDOWN ---
        let holdingsMarketValue = 0;
        Object.keys(port.holdings).forEach((ticker) => {
          const h = port.holdings[ticker] as PortfolioHolding;
          const price = todayStocks[ticker].price;
          
          if (h.shares > 0) {
            h.currentValue = h.shares * price;
            h.unrealizedPnL = h.currentValue - (h.shares * h.avgCost);
            h.unrealizedPnLPercent = parseFloat((((price - h.avgCost) / h.avgCost) * 100).toFixed(2));
            holdingsMarketValue += h.currentValue;
          } else {
            h.currentValue = 0;
            h.unrealizedPnL = 0;
            h.unrealizedPnLPercent = 0;
          }
        });

        port.totalValue = port.cash + holdingsMarketValue;
        port.pnlTotal = port.totalValue - startingCapital;
        port.pnlPercent = parseFloat(((port.pnlTotal / startingCapital) * 100).toFixed(2));

        // Drawdown Tracking
        port.peakValue = Math.max(port.peakValue, port.totalValue);
        const currentDrawdown = ((port.peakValue - port.totalValue) / port.peakValue) * 100;
        port.maxDrawdown = Math.max(port.maxDrawdown, currentDrawdown);
      }

      // 4. Update timeline states and logs
      setPortfolios(newPortfolios);
      setBenchmark(newBenchmark);
      setTradeLogs((prev) => [...newLogs, ...prev]);

      // Record daily history coordinates
      const historyPoint: SimulationHistoryPoint = {
        day: nextDay,
        date: dayData.date,
        spyValue: newBenchmark.totalValue,
        geminiValue: newPortfolios.gemini.totalValue,
        gpt4Value: newPortfolios.gpt4.totalValue,
        claudeValue: newPortfolios.claude.totalValue,
        llamaValue: newPortfolios.llama.totalValue,
        news: dayData.macroNews.headline
      };

      setHistory((prev) => [...prev, historyPoint]);
      setCurrentDay(nextDay);
      
      // Stop automatically if reached 30 days
      if (nextDay >= 30) {
        setIsRunning(false);
      }
    } catch (e) {
      console.error("Simulation run error: ", e);
      setIsRunning(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Extract daily analysis coordinates for LlmCard Tab
  const getTodayReasoningsObj = () => {
    const defaultData: { [llmId: string]: any[] } = { gemini: [], gpt4: [], claude: [], llama: [] };
    if (currentDay === 0) return defaultData;

    // Filter logs for this exact day and convert to displays
    const dayLogs = tradeLogs.filter((log) => log.day === currentDay && log.action !== "STOP_LOSS" && log.action !== "TAKE_PROFIT");
    
    // Group logs
    const out: { [llmId: string]: any[] } = { gemini: [], gpt4: [], claude: [], llama: [] };
    dayLogs.forEach((log) => {
      out[log.llmId].push({
        ticker: log.ticker,
        action: log.action,
        reasoning: log.reasoning,
        amountPercent: log.action === "BUY" ? Math.round((log.totalAmount / (portfolios[log.llmId].cash + log.totalAmount)) * 100) : 50
      });
    });

    // Populate missing placeholders if the model did not execute trades but stood aside (neutral)
    const ids: LLMId[] = ["gemini", "gpt4", "claude", "llama"];
    ids.forEach((id) => {
      if (out[id].length === 0) {
        out[id].push({
          ticker: "AAPL / MSFT / NVDA / TSLA",
          action: "HOLD",
          reasoning: "Automated core stands aside on these assets as daily technical and sentiment metrics indicate neutral trend patterns.",
          amountPercent: 0
        });
      }
    });

    return out;
  };

  // Compute best performing model
  const getTopPerformer = () => {
    let topId: LLMId = "gemini";
    let topVal = portfolios.gemini.pnlPercent;

    const ids: LLMId[] = ["gpt4", "claude", "llama"];
    ids.forEach((id) => {
      if (portfolios[id].pnlPercent > topVal) {
        topVal = portfolios[id].pnlPercent;
        topId = id as LLMId;
      }
    });

    return {
      name: LLM_PROFILES.find((p) => p.id === topId)?.name || "Gemini 3.5 Flash",
      percent: topVal,
      color: LLM_PROFILES.find((p) => p.id === topId)?.avatarColor || ""
    };
  };

  const topPerformer = getTopPerformer();

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 font-sans antialiased pb-12">
      {/* 1. Header Area */}
      <Header currentDay={currentDay} date={currentDay === 0 ? "Oct 01, 2024" : marketData[currentDay - 1].date} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Academic Research Info Panel */}
        {showResearchInfo && (
          <div className="relative bg-gradient-to-r from-slate-900 to-indigo-950/40 text-white p-6 rounded-2xl border border-slate-800 shadow-xl">
            <button
              onClick={() => setShowResearchInfo(false)}
              className="absolute right-4 top-4 text-white/40 hover:text-white font-bold cursor-pointer transition-all hover:scale-105"
            >
              ×
            </button>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
                <Trophy className="w-6 h-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-450 font-mono">
                  Academic Research Thesis PoC
                </h2>
                <p className="text-lg font-black tracking-tight text-white font-sans">
                  "Which LLM returns better financial gains in 30 days?"
                </p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-4xl font-sans font-normal">
                  This experimental environment compares the paper yield of four industry LLM personas. At 8:30 AM Central market open, Gemini processes daily indicators (RSI, Moving Averages, MACD), public sentiment levels, today's pre-market macro news headlines, and active target objective criteria to compile transactions. Performance and capital preservation boundaries are measured dynamically against a passive Buy-and-Hold S&P 500 comparison.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Controls and Configuration Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ConfigPanel
              config={{
                startingCapital,
                stopLossPercent,
                takeProfitPercent,
                objectivePrompt,
                marketRegime
              }}
              onChange={handleConfigChange}
              disabled={currentDay > 0}
              onReset={handleReset}
            />
          </div>

          <div className="lg:col-span-2 flex flex-col justify-between gap-6">
            <SimulationControls
              currentDay={currentDay}
              isRunning={isRunning}
              isProcessing={isProcessing}
              speed={speed}
              onPlayPause={() => setIsRunning(!isRunning)}
              onStep={handleDaySimulationStep}
              onReset={handleReset}
              onSpeedChange={(val) => setSpeed(val)}
              apiUsed={apiUsed}
            />

            {/* Live Indicator Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Leader</div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${topPerformer.color}`} />
                  <span className="text-sm font-bold text-white">{topPerformer.name}</span>
                </div>
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-sans">Top Algorithm Return</div>
                <span className={`text-base font-black font-mono block ${topPerformer.percent >= 0 ? "text-emerald-450" : "text-rose-455"}`}>
                  {topPerformer.percent >= 0 ? "+" : ""}{topPerformer.percent}%
                </span>
              </div>

              <div className="space-y-1 text-left sm:text-right">
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider font-sans">SPY Index Return</div>
                <span className={`text-base font-black font-mono block ${benchmark.pnlPercent >= 0 ? "text-emerald-455" : "text-slate-400"}`}>
                  {benchmark.pnlPercent >= 0 ? "+" : ""}{benchmark.pnlPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Daily Stock Screener & Macro conditions */}
        <StockScreener dayData={currentDay === 0 ? marketData[0] : marketData[currentDay - 1]} />

        {/* 4. Performances & Benchmarking (Recharts and numerical reports) */}
        {currentDay > 0 && (
          <AnalyticsDashboard
            history={history}
            portfolios={portfolios}
            benchmark={benchmark}
            startingCapital={startingCapital}
          />
        )}

        {/* 5. Holdings Comparison Matrix */}
        <LlmCardComparison
          portfolios={portfolios}
          activeTab={activeLlmTab}
          setActiveTab={setActiveLlmTab}
          dailyReasoning={getTodayReasoningsObj()}
        />

        {/* 6. Real-Time Brokerage Ledger */}
        <BrokerageLogs logs={tradeLogs} />

      </main>
    </div>
  );
}
