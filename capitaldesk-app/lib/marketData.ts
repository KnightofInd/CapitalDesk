/**
 * Market data fetchers for Yahoo Finance and Google Finance
 * Scrapes live stock prices, P/E ratios, and other metrics
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { getCache, getCacheKey, CacheTTL } from "./cache";

// User agent to mimic browser requests
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export interface MarketData {
  symbol: string;
  currentPrice: number | null;
  changePercent: number | null;
  peRatio: number | null;
  marketCap: string | null;
  lastUpdated: Date;
  source: "yahoo" | "google" | "cache" | "fallback";
}

/**
 * Format symbol for Yahoo Finance
 * Indian stocks: Add .NS (NSE) or .BO (BSE) suffix
 */
function formatYahooSymbol(symbol: string, exchange: string): string {
  const upperSymbol = symbol.toUpperCase();
  const upperExchange = exchange.toUpperCase();

  // If already has suffix, return as is
  if (upperSymbol.includes(".")) {
    return upperSymbol;
  }

  // Add exchange suffix for Indian stocks
  if (upperExchange === "NSE") {
    return `${upperSymbol}.NS`;
  } else if (upperExchange === "BSE") {
    return `${upperSymbol}.BO`;
  }

  // For US stocks, return as is
  return upperSymbol;
}

/**
 * Fetch current price from Yahoo Finance
 */
async function fetchYahooPrice(
  symbol: string,
  exchange: string
): Promise<{ price: number | null; changePercent: number | null }> {
  try {
    const yahooSymbol = formatYahooSymbol(symbol, exchange);
    const url = `https://finance.yahoo.com/quote/${yahooSymbol}`;

    console.log(`📊 Fetching from Yahoo Finance: ${yahooSymbol}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);

    // Try to extract price from various selectors
    let price: number | null = null;
    let changePercent: number | null = null;

    // Method 1: fin-streamer element
    const priceElement = $('fin-streamer[data-symbol="' + yahooSymbol + '"][data-field="regularMarketPrice"]');
    if (priceElement.length > 0) {
      price = parseFloat(priceElement.attr("value") || priceElement.text());
    }

    // Method 2: Try main price class
    if (!price) {
      const priceText = $('fin-streamer[data-field="regularMarketPrice"]').first().text();
      price = parseFloat(priceText.replace(/,/g, ""));
    }

    // Extract change percent
    const changeElement = $('fin-streamer[data-field="regularMarketChangePercent"]').first();
    if (changeElement.length > 0) {
      const changeText = changeElement.text().replace(/[()%]/g, "");
      changePercent = parseFloat(changeText);
    }

    if (price && !isNaN(price)) {
      console.log(`✅ Yahoo: ${yahooSymbol} = ${price}`);
      return { price, changePercent };
    }

    console.warn(`⚠️ Yahoo: Could not parse price for ${yahooSymbol}`);
    return { price: null, changePercent: null };
  } catch (error) {
    console.error(`❌ Yahoo Finance error for ${symbol}:`, error instanceof Error ? error.message : error);
    return { price: null, changePercent: null };
  }
}

/**
 * Fetch P/E ratio and market cap from Google Finance
 */
async function fetchGoogleFinance(
  symbol: string,
  exchange: string
): Promise<{ peRatio: number | null; marketCap: string | null }> {
  try {
    const upperExchange = exchange.toUpperCase();
    const url = `https://www.google.com/finance/quote/${symbol}:${upperExchange}`;

    console.log(`📈 Fetching from Google Finance: ${symbol}:${upperExchange}`);

    const response = await axios.get(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);

    let peRatio: number | null = null;
    let marketCap: string | null = null;

    // Try to find P/E ratio
    $("div.gyGNQ").each((_, element) => {
      const label = $(element).find(".mfs7Fc").text().trim();
      const value = $(element).find(".P6K39c").text().trim();

      if (label.includes("P/E ratio") || label.includes("PE ratio")) {
        peRatio = parseFloat(value);
      }

      if (label.includes("Market cap")) {
        marketCap = value;
      }
    });

    console.log(`✅ Google: ${symbol} P/E=${peRatio}, Cap=${marketCap}`);
    return { peRatio, marketCap };
  } catch (error) {
    console.error(`❌ Google Finance error for ${symbol}:`, error instanceof Error ? error.message : error);
    return { peRatio: null, marketCap: null };
  }
}

/**
 * Main function to fetch market data with caching
 */
export async function getMarketData(
  symbol: string,
  exchange: string = "NSE"
): Promise<MarketData> {
  const cache = getCache();
  const cacheKey = getCacheKey("market", `${symbol}:${exchange}`);

  // Check cache first
  const cached = cache.get<MarketData>(cacheKey);
  if (cached) {
    console.log(`💾 Cache hit for ${symbol}`);
    return { ...cached, source: "cache" };
  }

  // Fetch from both sources in parallel
  const [yahooData, googleData] = await Promise.all([
    fetchYahooPrice(symbol, exchange),
    fetchGoogleFinance(symbol, exchange),
  ]);

  const marketData: MarketData = {
    symbol: symbol.toUpperCase(),
    currentPrice: yahooData.price,
    changePercent: yahooData.changePercent,
    peRatio: googleData.peRatio,
    marketCap: googleData.marketCap,
    lastUpdated: new Date(),
    source: yahooData.price ? "yahoo" : "fallback",
  };

  // Cache the result
  cache.set(cacheKey, marketData, CacheTTL.MARKET_DATA);

  return marketData;
}

/**
 * Fetch market data for multiple symbols in parallel
 */
export async function getBatchMarketData(
  symbols: { symbol: string; exchange: string }[]
): Promise<Map<string, MarketData>> {
  const results = new Map<string, MarketData>();

  // Fetch in parallel with concurrency limit
  const BATCH_SIZE = 5; // Process 5 at a time to avoid rate limits

  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    const promises = batch.map((s) => getMarketData(s.symbol, s.exchange));

    const batchResults = await Promise.allSettled(promises);

    batchResults.forEach((result, index) => {
      const { symbol, exchange } = batch[index];
      if (result.status === "fulfilled") {
        results.set(symbol.toUpperCase(), result.value);
      } else {
        console.error(`Failed to fetch ${symbol}:`, result.reason);
        // Set fallback data
        results.set(symbol.toUpperCase(), {
          symbol: symbol.toUpperCase(),
          currentPrice: null,
          changePercent: null,
          peRatio: null,
          marketCap: null,
          lastUpdated: new Date(),
          source: "fallback",
        });
      }
    });

    // Small delay between batches
    if (i + BATCH_SIZE < symbols.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
