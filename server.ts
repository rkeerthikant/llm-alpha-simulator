import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared Gemini AI Client (Lazy initialized)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// 1. API API - LLM Analysis Endpoint
app.post("/api/analyze", async (req: Request, res: Response) => {
  const { day, date, stocks, news, setupConfig, portfolios } = req.body;

  // Attempt to initialize Gemini client
  const client = getGeminiClient();

  if (!client) {
    // FALLBACK RULE-BASED DECISION GENERATOR
    // This allows complete offline and key-less sandbox experience that operates mathematically!
    const fallbackDecisions = generateRuleBasedDecisions(day, stocks, news, setupConfig, portfolios);
    return res.json({
      decisions: fallbackDecisions,
      apiUsed: "LOCAL_QUANT_ENGINE",
      message: "Simulation active using local rule-based quant engine. To enable real-time Gemini AI analysis, set GEMINI_API_KEY in Settings."
    });
  }

  // GEMINI PROMPT FORMULATION
  const prompt = `
  You are a quantitative research algorithm coordinator simulating 4 distinct LLM stock trading portfolios over a 30-day challenge.
  Initial capital for each model was $${setupConfig.startingCapital || 1000}.
  Current objective goal specified by the user: "${setupConfig.objectivePrompt || "Steady portfolio growth with proper risk mitigation"}"

  Current Day: Day ${day} (${date})
  Market Regime: ${setupConfig.marketRegime || "baseline"}
  
  TODAY'S MACRO NEWS:
  Headline: "${news.headline}"
  Impact level: ${news.impact}
  Description: "${news.sentimentDescription}"

  CURRENT STOCK DATA:
  ${Object.keys(stocks).map(ticker => {
    const s = stocks[ticker];
    return `- ${ticker}: Price = $${s.price} (${s.changePercent > 0 ? "+" : ""}${s.changePercent}%), RSI(14) = ${s.rsi}, SMA(50) = $${s.sma50}, SMA(200) = $${s.sma200}, MACD = ${s.macd}, Public Sentiment = ${s.sentiment} (${s.sentimentScore}/100)`;
  }).join("\n")}

  CURRENT PORTFOLIO BALANCES AND POSITION HOLDINGS:
  - Gemini 3.5 Flash: Cash = $${portfolios.gemini.cash.toFixed(2)}, holdings = ${JSON.stringify(portfolios.gemini.holdings)}
  - GPT-4o: Cash = $${portfolios.gpt4.cash.toFixed(2)}, holdings = ${JSON.stringify(portfolios.gpt4.holdings)}
  - Claude 3.5 Sonnet: Cash = $${portfolios.claude.cash.toFixed(2)}, holdings = ${JSON.stringify(portfolios.claude.holdings)}
  - Llama 3: Cash = $${portfolios.llama.cash.toFixed(2)}, holdings = ${JSON.stringify(portfolios.llama.holdings)}

  Determine the daily BUY, SELL, or HOLD decisions for EACH of the four LLM trading avatars for the following four tickers: AAPL, MSFT, NVDA, TSLA. 
  
  Strictly adjust action outputs to match each model's specified persona style:
  1. Gemini 3.5 Flash (Balanced/Macro Analytical): Weight technicial patterns alongside today's macro news. Takes moderate sizes.
  2. GPT-4o (Technical/Quant): Highly sensitive to indicators. If RSI is low (<40), leans to BUY. If RSI is high (>70), leans to SELL. Looks at MACD momentum.
  3. Claude 3.5 Sonnet (Risk-Averse/Capital Preservation): Extremely cautious. Holds high cash reserves. Only risks small portions (10-15%). Strict logic.
  4. Llama 3 (Aggressive/Momentum Chaser): Trades in large sizes (40-60%). Targets stock with strong relative strength, ignoring overbought signals to ride runs. High beta preference.

  Notes for JSON Schema:
  - "action" MUST be "BUY", "SELL", or "HOLD".
  - "amountPercent" is an integer [0-100].
    - Under "BUY", this represents the percentage of available portfolio Cash to spend on this stock today.
    - Under "SELL", this represents the percentage of current Stock Shares held to liquidate.
    - Under "HOLD", this is 0.
  - "reasoning" MUST be a one-sentence text capturing the respective persona's logic for its choices.
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["gemini", "gpt4", "claude", "llama"],
          properties: {
            gemini: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["ticker", "action", "amountPercent", "reasoning"],
                properties: {
                  ticker: { type: Type.STRING },
                  action: { type: Type.STRING },
                  amountPercent: { type: Type.INTEGER },
                  reasoning: { type: Type.STRING }
                }
              }
            },
            gpt4: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["ticker", "action", "amountPercent", "reasoning"],
                properties: {
                  ticker: { type: Type.STRING },
                  action: { type: Type.STRING },
                  amountPercent: { type: Type.INTEGER },
                  reasoning: { type: Type.STRING }
                }
              }
            },
            claude: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["ticker", "action", "amountPercent", "reasoning"],
                properties: {
                  ticker: { type: Type.STRING },
                  action: { type: Type.STRING },
                  amountPercent: { type: Type.INTEGER },
                  reasoning: { type: Type.STRING }
                }
              }
            },
            llama: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["ticker", "action", "amountPercent", "reasoning"],
                properties: {
                  ticker: { type: Type.STRING },
                  action: { type: Type.STRING },
                  amountPercent: { type: Type.INTEGER },
                  reasoning: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const textResponse = response.text || "{}";
    const decisions = JSON.parse(textResponse);
    return res.json({
      decisions,
      apiUsed: "GEMINI_3.5_FLASH",
      message: "AI decision analysis retrieved successfully from Gemini server."
    });
  } catch (error: any) {
    console.error("Gemini API Error, falling back to local simulation:", error);
    const fallbackDecisions = generateRuleBasedDecisions(day, stocks, news, setupConfig, portfolios);
    return res.json({
      decisions: fallbackDecisions,
      apiUsed: "LOCAL_QUANT_ENGINE_FALLBACK",
      error: error.message,
      message: "Gemini server failed. Falling back to local quant rules seamlessly."
    });
  }
});

// 2. Fallback procedural decision rules to support offline/keyless preview
function generateRuleBasedDecisions(
  day: number,
  stocks: any,
  news: any,
  setupConfig: any,
  portfolios: any
) {
  const result: any = {
    gemini: [],
    gpt4: [],
    claude: [],
    llama: []
  };

  const tickers = ["AAPL", "MSFT", "NVDA", "TSLA"];

  // 1. GEMINI: Balanced macro-technical
  for (const ticker of tickers) {
    const s = stocks[ticker];
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";
    let amountPercent = 0;
    let reasoning = "";

    const hasPosition = portfolios.gemini.holdings[ticker] && portfolios.gemini.holdings[ticker].shares > 0;

    if (news.impact === "BULLISH" && s.rsi < 65) {
      action = "BUY";
      amountPercent = 20;
      reasoning = `Adding positioning in ${ticker} as positive macro news aligns with an standard technical entry at RSI ${s.rsi}.`;
    } else if (news.impact === "BEARISH" && hasPosition) {
      action = "SELL";
      amountPercent = 40;
      reasoning = `Reducing exposure of ${ticker} to lock in paper reserves following bearish macro headlines.`;
    } else if (s.rsi > 70 && hasPosition) {
      action = "SELL";
      amountPercent = 30;
      reasoning = `Trimming ${ticker} following short-term overbought Technical indices.`;
    } else if (s.rsi < 35) {
      action = "BUY";
      amountPercent = 15;
      reasoning = `Initiating moderate cost-averaging in ${ticker} at oversold territory (RSI ${s.rsi}).`;
    } else {
      reasoning = `Holding current level in ${ticker} as daily indicators remain inside our macro baseline.`;
    }

    result.gemini.push({ ticker, action, amountPercent, reasoning });
  }

  // 2. GPT-4: Rigorous indicators quant
  for (const ticker of tickers) {
    const s = stocks[ticker];
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";
    let amountPercent = 0;
    let reasoning = "";

    const hasPosition = portfolios.gpt4.holdings[ticker] && portfolios.gpt4.holdings[ticker].shares > 0;

    if (s.rsi < 38) {
      action = "BUY";
      amountPercent = 40; // larger quant buy
      reasoning = `Oversold RSI trigger (${s.rsi}) on ${ticker}. Initiating technical long-averaging structure.`;
    } else if (s.rsi > 68 && hasPosition) {
      action = "SELL";
      amountPercent = 50; // larger quant liquidation
      reasoning = `Overbought RSI boundary reached (${s.rsi}). Automated algorithms execute supply liquidation.`;
    } else if (s.macd === "BULLISH" && s.price > s.sma50) {
      action = "BUY";
      amountPercent = 20;
      reasoning = `Trend-following MACD crossover and price trading above SMA(50) signals structural accumulation.`;
    } else if (s.macd === "BEARISH" && hasPosition) {
      action = "SELL";
      amountPercent = 30;
      reasoning = `Bearish MACD signal warning. Reducing technical risk thresholds.`;
    } else {
      reasoning = `Maintain neutral posture for ${ticker}; no automated quant indicators breached.`;
    }

    result.gpt4.push({ ticker, action, amountPercent, reasoning });
  }

  // 3. CLAUDE: Extremely low risk, holds large cash buffer
  for (const ticker of tickers) {
    const s = stocks[ticker];
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";
    let amountPercent = 0;
    let reasoning = "";

    const hasPosition = portfolios.claude.holdings[ticker] && portfolios.claude.holdings[ticker].shares > 0;

    if (s.rsi < 30) {
      action = "BUY";
      amountPercent = 10; // small cautious buy
      reasoning = `Evaluating strong valuation support. Allocating cautious 10% cash to ${ticker} at maximum oversold.`;
    } else if (hasPosition && s.changePercent < -3) {
      action = "SELL";
      amountPercent = 100; // fast stop-loss
      reasoning = `Daily downside limit exceeded on ${ticker}. Executing complete loss mitigation to guard equity.`;
    } else if (hasPosition && s.rsi > 60) {
      action = "SELL";
      amountPercent = 50; // secure gains easily
      reasoning = `Locking in paper profits on ${ticker} as RSI enters distribution range above 60.`;
    } else {
      reasoning = `Standing aside on ${ticker} to preserve liquidity reserves and wait for favorable margins of safety.`;
    }

    result.claude.push({ ticker, action, amountPercent, reasoning });
  }

  // 4. LLAMA: Dynamic momentum, breakout chaser
  for (const ticker of tickers) {
    const s = stocks[ticker];
    let action: "BUY" | "SELL" | "HOLD" = "HOLD";
    let amountPercent = 0;
    let reasoning = "";

    const hasPosition = portfolios.llama.holdings[ticker] && portfolios.llama.holdings[ticker].shares > 0;

    if (s.changePercent > 1.5 || s.rsi > 55) {
      action = "BUY";
      amountPercent = 50; // aggressive buy
      reasoning = `Chasing breakout momentum on ${ticker} with high volume conviction. Target immediate trend gains.`;
    } else if (s.changePercent < -4 && hasPosition) {
      action = "SELL";
      amountPercent = 25; // reluctant to sell all
      reasoning = `Slightly trimming ${ticker} coordinates, but maintaining core momentum positioning.`;
    } else if (s.sentiment === "BULLISH") {
      action = "BUY";
      amountPercent = 35;
      reasoning = `Social sentiments are extremely positive. Adding high-beta exposure in $^{ticker} to maximize yields.`;
    } else {
      reasoning = `Holding existing ${ticker} momentum stack and searching for key breakout levels.`;
    }

    result.llama.push({ ticker, action, amountPercent, reasoning });
  }

  return result;
}

// 3. Vite development vs production pipeline middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Integrate Vite middleware
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
