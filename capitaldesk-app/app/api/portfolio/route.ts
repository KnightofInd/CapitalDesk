/**
 * Portfolio API Route
 * GET /api/portfolio
 * Returns complete portfolio with live market data and calculations
 */

import { NextResponse } from "next/server";
import { getAllHoldings } from "@/lib/queries";
import { getBatchMarketData } from "@/lib/marketData";
import { enrichHoldingWithMarketData, aggregateBySector } from "@/lib/calculations";
import { PortfolioPosition } from "@/lib/types";

export const dynamic = "force-dynamic"; // Disable caching for this route

export async function GET() {
  try {
    console.log("📊 Fetching portfolio data...");

    // Step 1: Get all holdings from database
    const holdings = await getAllHoldings();

    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No holdings found",
        data: {
          positions: [],
          summary: {
            total_investment: 0,
            total_current_value: 0,
            total_gain_loss: 0,
            gain_loss_percent: 0,
            holdings_count: 0,
          },
          sectors: [],
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: Extract unique symbols for market data fetch
    const symbolsToFetch = holdings.map((h) => ({
      symbol: h.symbol,
      exchange: h.exchange,
    }));

    // Step 3: Fetch live market data in batch
    console.log(`📈 Fetching market data for ${symbolsToFetch.length} symbols...`);
    const marketDataMap = await getBatchMarketData(symbolsToFetch);

    // Step 4: Calculate total investment first
    const totalInvestment = holdings.reduce(
      (sum, h) => sum + h.quantity * h.purchase_price,
      0
    );

    // Step 5: Enrich holdings with market data and calculations
    const positions: PortfolioPosition[] = holdings.map((holding) => {
      const marketData = marketDataMap.get(holding.symbol.toUpperCase()) || null;
      return enrichHoldingWithMarketData(holding, marketData, totalInvestment);
    });

    // Step 6: Calculate portfolio totals
    const totalCurrentValue = positions.reduce(
      (sum, p) => sum + p.current_value,
      0
    );
    const totalGainLoss = totalCurrentValue - totalInvestment;
    const gainLossPercent =
      totalInvestment > 0 ? (totalGainLoss / totalInvestment) * 100 : 0;

    // Step 7: Aggregate by sector
    const sectors = aggregateBySector(positions, totalInvestment);

    // Step 8: Sort positions by investment value (descending)
    positions.sort((a, b) => b.investment_value - a.investment_value);

    // Step 9: Return response
    return NextResponse.json({
      success: true,
      data: {
        positions,
        summary: {
          total_investment: totalInvestment,
          total_current_value: totalCurrentValue,
          total_gain_loss: totalGainLoss,
          gain_loss_percent: gainLossPercent,
          holdings_count: holdings.length,
        },
        sectors,
      },
      timestamp: new Date().toISOString(),
      cached: false,
    });
  } catch (error) {
    console.error("❌ Portfolio API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch portfolio data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
