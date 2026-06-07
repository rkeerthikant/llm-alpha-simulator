import { DayMarketData, StockMetrics } from "./types";

// 30 rich chronological macro news events to simulate a realistic 30-day trading cycle
export const MACRO_NEWS_EVENTS: {
  headline: string;
  impact: "BULLISH" | "BEARISH" | "NEUTRAL";
  description: string;
}[] = [
  {
    headline: "Federal Reserve hints at interest rate cuts as inflation data moderates.",
    impact: "BULLISH",
    description: "Yields fall below 4.1%, tech stock prices show pre-market gains as borrowing cost concerns ease."
  },
  {
    headline: "Standard & Poor's reports solid jobs expansion; labor market remains robust.",
    impact: "BULLISH",
    description: "Economy enters mild expansionary track. Large caps trade higher, tech firms lead index recovery."
  },
  {
    headline: "Leading semiconductor designer reports record orders for Next-Gen AI chips.",
    impact: "BULLISH",
    description: "Nvidia supplier updates guidance. Semicap sector surges, NVDA sees massive market inflows."
  },
  {
    headline: "Crude oil spikes 4% amid escalating tensions in OPEC supply chains.",
    impact: "BEARISH",
    description: "Energy costs fuel worries over secondary inflation. Market indices gap down at open."
  },
  {
    headline: "CPI (Consumer Price Index) comes in hotter than projected at 0.3% MoM.",
    impact: "BEARISH",
    description: "Treasury yields press higher; aggressive hawkish Fed posture feared. Growth stocks decline."
  },
  {
    headline: "Treasury Sec. expresses optimism about high productivity gains stabilizing inflation.",
    impact: "BULLISH",
    description: "Constructive tone aids regional bankers and megacaps. Indices recover previous session losses."
  },
  {
    headline: "Major EV manufacturing competitor lowers average retail pricing, citing lithium cost declines.",
    impact: "NEUTRAL",
    description: "Increases competitive pressure on Tesla. Battery tech suppliers slide; mixed sector reactions."
  },
  {
    headline: "Retail sales beat consensus estimates, underscoring resilient consumer demand.",
    impact: "BULLISH",
    description: "Retail and tech commerce gain momentum. Broad-based market participation lifts major indexes."
  },
  {
    headline: "Rumors spread of strict regulatory antitrust probes into cloud software monopolies.",
    impact: "BEARISH",
    description: "MSFT and Google trade lower. Enterprise software sector drops 1.5% in early trading."
  },
  {
    headline: "New corporate tax proposal introduced in Congress; targets megacap profit margins.",
    impact: "BEARISH",
    description: "Selling pressure sweeps tech heavyweights. Volume spikes as institutional investors lock in gains."
  },
  {
    headline: "Federal Reserve holds interest rates flat; Chairman's speech strikes balanced tone.",
    impact: "NEUTRAL",
    description: "No change in near-term outlook. Market undergoes consolidation with low overall volatility."
  },
  {
    headline: "Apple announces major integration of local on-device neural engines with hardware update.",
    impact: "BULLISH",
    description: "Analysts upgrade AAPL to Strong Buy. Stock tests multiple-month breakouts at open."
  },
  {
    headline: "Supply chain blockages at major global ports cause temporary hardware delivery lag.",
    impact: "BEARISH",
    description: "Hardware manufacturer and auto supplier inventories build up. Delivery transit forecasts stretched."
  },
  {
    headline: "Key cloud computing research firm reports explosive 45% YoY growth in enterprise cloud storage.",
    impact: "BULLISH",
    description: "Cloud leaders benefit. MSFT and cloud-focused tech stocks bounce hard from critical support."
  },
  {
    headline: "EV sentiment weakens as multiple charging network operators report slower grid rollouts.",
    impact: "BEARISH",
    description: "Automotive high-growth models correct. TSLA faces downward trajectory amid cooling near-term expectations."
  },
  {
    headline: "Weekly jobless claims exceed forecasts, suggesting potential cooldown in hiring.",
    impact: "BULLISH", // Bullish for stock market as it increases Fed rate cut likelihood
    description: "Bond market rallies, rate cut expectations pull forward. Stocks climb on softer data."
  },
  {
    headline: "Foreign exchange volatility escalates as global central banks diversify reserves.",
    impact: "NEUTRAL",
    description: "Dollar index stabilizes. Export-heavy tech corporations experience currency hedging rebalancing."
  },
  {
    headline: "Nvidia beats high analysts' estimate by 15%, raising full year guidance across the board.",
    impact: "BULLISH",
    description: "Sensational quarterly records. NVDA moves 7% up in pre-market, lifting entire Nasdaq basket."
  },
  {
    headline: "Global sovereign wealth fund rebalances structure, trim positioning in high-multiple tech.",
    impact: "BEARISH",
    description: "Short-term technical profit taking on large-cap leaders. Outflows to defensive utilities noted."
  },
  {
    headline: "US Housing starts surge higher, hitting their highest level in seven months.",
    impact: "BULLISH",
    description: "Strong structural indicators boost macro outlook. Financials and industrials outpace tech sector."
  },
  {
    headline: "FTC launches official investigation on AI startup partnerships with cloud platforms.",
    impact: "BEARISH",
    description: "Antitrust spotlight dampens speculative enthusiasm. Cloud heavyweights see light volume decline."
  },
  {
    headline: "Major cyber-security platform patch causes brief global administrative disruption.",
    impact: "BEARISH",
    description: "Bounces back quickly but exposes critical system dependencies. Cybersecurity names surge."
  },
  {
    headline: "Consumer sentiment index rises to highest levels in a year; retail holiday spending spikes.",
    impact: "BULLISH",
    description: "Strong demand underpins corporate bottom lines. Indices resume upward trajectory."
  },
  {
    headline: "Fed Governor hints at 'higher for longer' paradigm if monthly core inflation pivots up.",
    impact: "BEARISH",
    description: "Hawkish narrative concerns rise. Volatility Index (VIX) climbs 12%; general index pullback."
  },
  {
    headline: "Tesla announces automated trial permissions for Full Self Driving (FSD) in major Asian markets.",
    impact: "BULLISH",
    description: "FSD monetize expansion hopes spark heavy buying. TSLA surges 8%, breaking descending resistances."
  },
  {
    headline: "Durable Goods orders report beats estimates by wide margin, tech orders lead.",
    impact: "BULLISH",
    description: "Signs of capital expenditure strength among enterprises. Cloud and device providers record gains."
  },
  {
    headline: "Major credit rating agency flags growing sovereign debt levels, warnings issued.",
    impact: "BEARISH",
    description: "Yields spike temporarily as risk premium adjusts. Tech and growth sectors undergo consolidation."
  },
  {
    headline: "S&P 500 options indicate massive quarterly expiration activities; extreme block trades noted.",
    impact: "NEUTRAL",
    description: "Heavy churning. No clear direction as derivative hedges keep leading assets bounded in narrow range."
  },
  {
    headline: "Nvidia announces next-generation architecture release, surpassing previous benchmarks.",
    impact: "BULLISH",
    description: "AI chip demands remain structural and insatiable. Technical traders execute massive follow-through."
  },
  {
    headline: "Index rebalancing flows conclude; tech heavyweights record huge end-of-month volume inflows.",
    impact: "BULLISH",
    description: "Passive index tracker buying supports key stocks. High-beta sectors outperform to finish the month."
  }
];

// Helper to simulate stock prices and indicators based on the market regime
export function generate30DaysMarketData(regime: "baseline" | "bull" | "bear"): DayMarketData[] {
  const result: DayMarketData[] = [];
  
  // Starting reference prices
  const startingPrices: { [ticker: string]: number } = {
    AAPL: 215.00,
    MSFT: 420.00,
    NVDA: 118.00,
    TSLA: 205.00,
    SPY: 545.00
  };

  // Base trends for each stock (daily standard drift % on baseline)
  const baseDrifts: { [ticker: string]: number } = {
    AAPL: 0.0008,  // Moderate positive
    MSFT: 0.0006,  // Stable positive
    NVDA: 0.0022,  // Aggressive positive (AI boom)
    TSLA: -0.0005, // Volatile / slightly bearish standard trend
    SPY: 0.0005    // Average market tracker
  };

  // Volatilities
  const volatilies: { [ticker: string]: number } = {
    AAPL: 0.012,
    MSFT: 0.010,
    NVDA: 0.028, // High beta
    TSLA: 0.035, // Extremely high beta
    SPY: 0.007
  };

  let currentPrices = { ...startingPrices };

  for (let i = 1; i <= 30; i++) {
    const dayIndex = i - 1;
    const newsEvent = MACRO_NEWS_EVENTS[dayIndex];
    let newsMod = 0; // influence of today's news
    
    if (newsEvent.impact === "BULLISH") newsMod = 0.006;
    if (newsEvent.impact === "BEARISH") newsMod = -0.008;

    // Adjust news based on regime
    let regimeMod = 0;
    if (regime === "bull") {
      regimeMod = 0.008; // positive macro current
      // boost bullish news, soften bearish news
      if (newsEvent.impact === "BEARISH") newsMod = -0.002;
    } else if (regime === "bear") {
      regimeMod = -0.012; // deep selloffs
      // double bearish news pain, cancel bullish news
      if (newsEvent.impact === "BULLISH") newsMod = 0.001;
      if (newsEvent.impact === "BEARISH") newsMod = -0.018;
    }

    // Specific stock adjustments on certain key days to match headlines
    const stockOverrides: { [ticker: string]: number } = {};
    if (i === 3) stockOverrides["NVDA"] = 0.045; // Semiconductor record orders
    if (i === 9) stockOverrides["MSFT"] = -0.025; // Antitrust probe rumors
    if (i === 12) stockOverrides["AAPL"] = 0.038;  // Apple intelligence hardware breakout
    if (i === 15) stockOverrides["TSLA"] = -0.040; // EV cooling sentiment
    if (i === 18) stockOverrides["NVDA"] = 0.075; // NVDA beats earnings
    if (i === 25) stockOverrides["TSLA"] = 0.082;  // TSLA FSD trial permissions
    if (i === 29) stockOverrides["NVDA"] = 0.052; // NVDA next-gen launch

    // Compute date based on a simulated Oct 2024 calendar
    const dayNum = i + 1; // start from Oct 2
    const formattedDate = `2024-10-${dayNum < 10 ? "0" + dayNum : dayNum}`;

    const stocksOnDay: { [ticker: string]: StockMetrics } = {};

    // Loop through AAPL, MSFT, NVDA, TSLA, SPY
    const tickers = ["AAPL", "MSFT", "NVDA", "TSLA", "SPY"];
    for (const ticker of tickers) {
      const lastPrice = currentPrices[ticker];
      const drift = baseDrifts[ticker];
      const vol = volatilies[ticker];

      // Pseudo-random noise seeded by index to ensure repeatability
      // Sine wave noise acts as a seeded random fluctuation
      const noise = Math.sin(i * 1.7 + ticker.charCodeAt(0) * 31) * vol;
      
      let pctChange = drift + regimeMod + newsMod + noise;

      // Apply overrides if any
      if (stockOverrides[ticker] !== undefined) {
        pctChange += stockOverrides[ticker];
      }

      // SPY is a composite index, so moderate its change and align mostly with S&P components
      if (ticker === "SPY") {
        const weightedComponents = 
          (stocksOnDay["AAPL"]?.changePercent || pctChange) * 0.2 +
          (stocksOnDay["MSFT"]?.changePercent || pctChange) * 0.2 +
          (stocksOnDay["NVDA"]?.changePercent || pctChange) * 0.15 +
          (stocksOnDay["TSLA"]?.changePercent || pctChange) * 0.05;
        pctChange = pctChange * 0.4 + weightedComponents * 0.6;
      }

      // Calculate final price (ensure no negative prices)
      const newPrice = Math.max(1.0, parseFloat((lastPrice * (1 + pctChange)).toFixed(2)));
      currentPrices[ticker] = newPrice;

      // Compute interesting dynamic indicators
      // Relative Strength Index (RSI): oscillate between 25 and 75 based on price momentum
      const progressMod = (newPrice - startingPrices[ticker]) / startingPrices[ticker];
      let baseRsi = 50 + progressMod * 100 + Math.sin(i * 0.9) * 12;
      const rsi = Math.max(15, Math.min(85, Math.round(baseRsi)));

      // SMA 50 & 200 (progressive tracking)
      const sma50Multiplier = 0.98 + (drift * i) + Math.cos(i * 0.3) * 0.02;
      const sma50 = parseFloat((startingPrices[ticker] * sma50Multiplier).toFixed(2));
      const sma200 = parseFloat((startingPrices[ticker] * 0.95).toFixed(2));

      // MACD status based on rsi & trend
      let macd: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
      if (rsi > 60) macd = "BULLISH";
      else if (rsi < 40) macd = "BEARISH";

      // Sentiment score: 0 to 100
      let sentimentScore = 50;
      if (newsEvent.impact === "BULLISH") sentimentScore += 20;
      if (newsEvent.impact === "BEARISH") sentimentScore -= 25;
      if (pctChange > 0.015) sentimentScore += 15;
      if (pctChange < -0.015) sentimentScore -= 20;
      // Clamp
      sentimentScore = Math.max(10, Math.min(95, Math.round(sentimentScore + Math.cos(i * 1.1) * 8)));

      let sentiment: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
      if (sentimentScore > 65) sentiment = "BULLISH";
      if (sentimentScore < 35) sentiment = "BEARISH";

      stocksOnDay[ticker] = {
        ticker,
        price: newPrice,
        changePercent: parseFloat((pctChange * 100).toFixed(2)),
        rsi,
        sma50,
        sma200,
        macd,
        sentiment,
        sentimentScore
      };
    }

    result.push({
      day: i,
      date: formattedDate,
      macroNews: {
        headline: newsEvent.headline,
        impact: newsEvent.impact,
        sentimentDescription: newsEvent.description
      },
      stocks: stocksOnDay
    });
  }

  return result;
}

// 4 detailed LLM Personalities that decide trading buy-and-sell orders
export const LLM_PROFILES = [
  {
    id: "gemini",
    name: "Gemini 3.5 Flash",
    description: "Core Analytical Engine",
    avatarColor: "from-blue-600 to-indigo-700 text-white",
    style: "Balanced / Macro-contextual focus. Aligns indicators with macro policy directives."
  },
  {
    id: "gpt4",
    name: "GPT-4o (Simulated)",
    description: "Technical Quant Model",
    avatarColor: "from-emerald-600 to-teal-700 text-white",
    style: "Mathematical / Indicator-driven. Triggers purely on RSI thresholds and SMA supports."
  },
  {
    id: "claude",
    name: "Claude 3.5 Sonnet (Simulated)",
    description: "Risk-Managed Model",
    avatarColor: "from-orange-600 to-amber-700 text-white",
    style: "Risk-Averse / Diversification focus. Implements strict capital limits and fast stops."
  },
  {
    id: "llama",
    name: "Llama 3 70B (Simulated)",
    description: "Momentum / Growth-Chaser",
    avatarColor: "from-purple-600 to-pink-700 text-white",
    style: "Aggressive / Trend-following. Rides breakouts and runs large positions in tech leaders."
  }
];

export const INITIAL_CASH = 1000;
