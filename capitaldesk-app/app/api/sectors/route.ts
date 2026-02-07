/**
 * Sectors API Route
 * GET /api/sectors
 * Returns sector-wise portfolio breakdown with live market data
 */

import { NextResponse } from "next/server";
import { getAllHoldings, getAllSectors } from "@/lib/queries";
import { getBatchMarketData } from "@/lib/marketData";
import { enrichHoldingWithMarketData, aggregateBySector } from "@/lib/calculations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    console.log("📊 Fetching sectors data...");

    // Step 1: Get all sectors and holdings
    const [sectors, holdings] = await Promise.all([
      getAllSectors(),
      getAllHoldings(),
    ]);

    if (holdings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No holdings found",
        data: {
          sectors: sectors.map((s) => ({
            sector_id: s.sector_id,
            sector_name: s.sector_name,
            holdings_count: 0,
            total_investment: 0,
            total_current_value: 0,
            total_gain_loss: 0,
            gain_loss_percent: 0,
            portfolio_percent: 0,
          })),
          total_investment: 0,
        },
        timestamp: new Date().toISOString(),
      });
    }

    // Step 2: Fetch live market data
    const symbolsToFetch = holdings.map((h) => ({
      symbol: h.symbol,
      exchange: h.exchange,
    }));

    console.log(`📈 Fetching market data for ${symbolsToFetch.length} symbols...`);
    const marketDataMap = await getBatchMarketData(symbolsToFetch);

    // Step 3: Calculate total investment
    const totalInvestment = holdings.reduce(
      (sum, h) => sum + h.quantity * h.purchase_price,
      0
    );

    // Step 4: Enrich holdings with market data
    const positions = holdings.map((holding) => {
      const marketData = marketDataMap.get(holding.symbol.toUpperCase()) || null;
      return enrichHoldingWithMarketData(holding, marketData, totalInvestment);
    });

    // Step 5: Aggregate by sector
    const sectorAggregates = aggregateBySector(positions, totalInvestment);

    // Step 6: Add sector metadata
    const sectorsWithData = sectorAggregates.map((agg) => {
      const sector = sectors.find((s) => s.sector_name === agg.sector_name);
      return {
        sector_id: sector?.sector_id || 0,
        sector_name: agg.sector_name,
        description: sector?.description || null,
        holdings_count: agg.holdings_count,
        total_investment: agg.total_investment,
        total_current_value: agg.total_current_value,
        total_gain_loss: agg.total_gain_loss,
        gain_loss_percent: agg.gain_loss_percent,
        portfolio_percent: agg.portfolio_percent,
      };
    });

    // Step 7: Return response
    return NextResponse.json({
      success: true,
      data: {
        sectors: sectorsWithData,
        total_investment: totalInvestment,
        total_current_value: positions.reduce(
          (sum, p) => sum + p.current_value,
          0
        ),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Sectors API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch sectors data",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
