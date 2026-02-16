import { STOCK_UNIVERSE, EXCLUDED_SECTORS } from "./stocks.js";
import { LOCAL_PRICE_SERIES } from "./localPrices.js";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function pctChange(from, to) {
  if (!Number.isFinite(from) || !Number.isFinite(to) || from <= 0) return 0;
  return (to - from) / from;
}

function annualizedVolatility(series) {
  const returns = [];
  for (let i = 1; i < series.length; i += 1) {
    const r = pctChange(series[i - 1], series[i]);
    returns.push(r);
  }

  if (!returns.length) return 0.3;

  const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance =
    returns.reduce((sum, r) => sum + (r - mean) ** 2, 0) / Math.max(returns.length - 1, 1);

  return Math.sqrt(variance) * Math.sqrt(252);
}

export function projectSellValue(initialInvestment, annualReturn, months) {
  const years = months / 12;
  return initialInvestment * (1 + annualReturn) ** years;
}

async function fetchStooqSeries(asxCode) {
  const endpoint = `https://stooq.com/q/d/l/?s=${asxCode.toLowerCase()}.au&i=d`;
  const response = await fetch(endpoint, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Stooq fetch failed for ${asxCode}`);
  }

  const text = await response.text();
  const lines = text.trim().split("\n");
  const headers = lines.shift();
  if (!headers || lines.length < 30) {
    throw new Error(`Not enough data for ${asxCode}`);
  }

  return lines
    .map((line) => line.split(",")[4])
    .map((close) => Number.parseFloat(close))
    .filter((close) => Number.isFinite(close));
}

export async function getPriceSeries(asxCode) {
  try {
    const liveSeries = await fetchStooqSeries(asxCode);
    if (liveSeries.length >= 126) {
      return { source: "live", prices: liveSeries };
    }
  } catch {
    // fallback below
  }

  return {
    source: "fallback",
    prices: LOCAL_PRICE_SERIES[asxCode] || [],
  };
}

export function scoreStock(stock, prices) {
  const n = prices.length;
  if (n < 126) return null;

  const currentPrice = prices[n - 1];
  const r3m = pctChange(prices[n - 63], currentPrice);
  const r6m = pctChange(prices[n - 126], currentPrice);
  const r12m = pctChange(prices[0], currentPrice);
  const vol = annualizedVolatility(prices.slice(-126));

  const momentumSignal = clamp(0.45 * r3m + 0.35 * r6m + 0.2 * r12m, -0.35, 0.45);
  const sentimentSignal = clamp(0.55 * stock.newsSentiment + 0.45 * stock.blogSentiment, -0.4, 0.6);
  const riskAdjusted = clamp(momentumSignal - 0.5 * vol, -0.4, 0.4);

  const totalScore =
    0.42 * momentumSignal + 0.24 * sentimentSignal + 0.24 * stock.reportSignal + 0.1 * riskAdjusted;

  const annualReturn = clamp(0.05 + (totalScore + 0.1) * 0.42, 0.02, 0.35);

  return {
    ...stock,
    currentPrice,
    score: totalScore,
    annualReturn,
    diagnostics: {
      r3m,
      r6m,
      r12m,
      vol,
      source: "computed",
    },
  };
}

export async function generateTips() {
  const candidates = STOCK_UNIVERSE.filter((stock) => !EXCLUDED_SECTORS.includes(stock.sector));

  const analysed = await Promise.all(
    candidates.map(async (stock) => {
      const { source, prices } = await getPriceSeries(stock.code);
      const scored = scoreStock(stock, prices);
      if (!scored) return null;
      return {
        ...scored,
        diagnostics: {
          ...scored.diagnostics,
          source,
        },
      };
    })
  );

  return analysed
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((stock) => {
      const projections = [3, 6, 9, 12].map((months) => ({
        months,
        projectedSellValue: projectSellValue(500, stock.annualReturn, months),
      }));

      return {
        ...stock,
        rationale: [
          `Performance: 3m ${Math.round(stock.diagnostics.r3m * 100)}%, 6m ${Math.round(
            stock.diagnostics.r6m * 100
          )}%`,
          `Sentiment + reports: positive media/blog signal and analyst-style report weighting`,
          `Data source: ${stock.diagnostics.source === "live" ? "live price feed" : "local fallback snapshot"}`,
        ],
        projections,
      };
    });
}
