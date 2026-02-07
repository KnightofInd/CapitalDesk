/**
 * Stock Detail API Route
 * GET /api/stock/[symbol]
 * Returns detailed information for a specific stock with live market data
 */

import { NextResponse } from "next/server";
import { getStockBySymbol } from "@/lib/queries";
import { getMarketData } from "@/lib/marketData";
import { query } from "@/lib/db";
import { HoldingWithStock } from "@/lib/types";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    symbol: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();
  
  try {
    console.log(`📊 Fetching stock details for: ${symbol}`);

    // Step 1: Get stock information
    const stock = await getStockBySymbol(symbol);

    if (!stock) {
      return NextResponse.json(
        {
          success: false,
          error: "Stock not found",
          message: `No stock found with symbol: ${symbol}`,
          timestamp: new Date().toISOString(),
        },
        { status: 404 }
      );
    }

    // Step 2: Get all holdings for this stock
    const holdingsResult = await query<HoldingWithStock>(`
      SELECT 
        h.*,
        s.symbol,
        s.company_name,
        s.exchange,
        s.currency,
        sec.sector_name
      FROM holdings h
      JOIN stocks s ON h.stock_id = s.stock_id
      JOIN sectors sec ON s.sector_id = sec.sector_id
      WHERE s.symbol = $1
      ORDER BY h.purchase_date DESC
    `, [symbol]);

    const holdings = holdingsResult.rows;

    // Step 3: Fetch live market data
    console.log(`📈 Fetching market data for ${symbol}...`);
    const marketData = await getMarketData(symbol, stock.exchange);

    // Step 4: Calculate aggregates for all holdings
    const totalQuantity = holdings.reduce((sum, h) => sum + Number(h.quantity), 0);
    const totalInvestment = holdings.reduce(
      (sum, h) => sum + Number(h.quantity) * Number(h.purchase_price),
      0
    );
    const averagePurchasePrice = totalQuantity > 0 ? totalInvestment / totalQuantity : 0;

    const currentValue = marketData.currentPrice
      ? marketData.currentPrice * totalQuantity
      : totalInvestment;

    const gainLoss = currentValue - totalInvestment;
    const gainLossPercent = totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;

    // Step 5: Return detailed response
    return NextResponse.json({
      success: true,
      data: {
        stock: {
          stock_id: stock.stock_id,
          symbol: stock.symbol,
          company_name: stock.company_name,
          exchange: stock.exchange,
          currency: stock.currency,
        },
        marketData: {
          currentPrice: marketData.currentPrice,
          changePercent: marketData.changePercent,
          peRatio: marketData.peRatio,
          marketCap: marketData.marketCap,
          lastUpdated: marketData.lastUpdated,
          source: marketData.source,
        },
        holdings: holdings.map((h) => ({
          holding_id: h.holding_id,
          quantity: Number(h.quantity),
          purchase_price: Number(h.purchase_price),
          purchase_date: h.purchase_date,
          notes: h.notes,
          investment_value: Number(h.quantity) * Number(h.purchase_price),
        })),
        summary: {
          total_quantity: totalQuantity,
          total_investment: totalInvestment,
          average_purchase_price: averagePurchasePrice,
          current_value: currentValue,
          gain_loss: gainLoss,
          gain_loss_percent: gainLossPercent,
          holdings_count: holdings.length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(`❌ Stock API error for ${symbol}:`, error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch stock details",
        message: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
