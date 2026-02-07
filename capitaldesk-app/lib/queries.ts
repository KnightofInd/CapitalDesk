/**
 * Database query functions for CapitalDesk
 */

import { query } from "./db";
import {
  Sector,
  Stock,
  Holding,
  HoldingWithStock,
  PortfolioSummary,
  SectorSummary,
} from "./types";

/**
 * Get all sectors
 */
export async function getAllSectors(): Promise<Sector[]> {
  const result = await query<Sector>(
    "SELECT * FROM sectors ORDER BY sector_name"
  );
  return result.rows;
}

/**
 * Get all stocks
 */
export async function getAllStocks(): Promise<Stock[]> {
  const result = await query<Stock>("SELECT * FROM stocks ORDER BY symbol");
  return result.rows;
}

/**
 * Get stock by symbol
 */
export async function getStockBySymbol(
  symbol: string
): Promise<Stock | null> {
  const result = await query<Stock>(
    "SELECT * FROM stocks WHERE symbol = $1",
    [symbol.toUpperCase()]
  );
  return result.rows[0] || null;
}

/**
 * Get all holdings with stock and sector information
 */
export async function getAllHoldings(): Promise<HoldingWithStock[]> {
  const result = await query<HoldingWithStock>(`
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
    ORDER BY h.holding_id
  `);
  return result.rows;
}

/**
 * Get holdings by sector
 */
export async function getHoldingsBySector(
  sectorId: number
): Promise<HoldingWithStock[]> {
  const result = await query<HoldingWithStock>(
    `
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
    WHERE sec.sector_id = $1
    ORDER BY h.holding_id
  `,
    [sectorId]
  );
  return result.rows;
}

/**
 * Get portfolio summary statistics
 */
export async function getPortfolioSummary(): Promise<PortfolioSummary> {
  const result = await query<PortfolioSummary>(`
    SELECT 
      COUNT(DISTINCT h.holding_id) as total_holdings,
      COALESCE(SUM(h.quantity * h.purchase_price), 0) as total_investment,
      COUNT(DISTINCT s.stock_id) as total_stocks,
      COUNT(DISTINCT sec.sector_id) as sectors_count
    FROM holdings h
    JOIN stocks s ON h.stock_id = s.stock_id
    JOIN sectors sec ON s.sector_id = sec.sector_id
  `);
  return result.rows[0];
}

/**
 * Get sector-wise summary
 */
export async function getSectorSummary(): Promise<SectorSummary[]> {
  const result = await query<SectorSummary>(`
    SELECT 
      sec.sector_id,
      sec.sector_name,
      COUNT(h.holding_id) as holdings_count,
      COALESCE(SUM(h.quantity * h.purchase_price), 0) as total_investment,
      COALESCE(SUM(h.quantity), 0) as total_quantity
    FROM sectors sec
    LEFT JOIN stocks s ON sec.sector_id = s.sector_id
    LEFT JOIN holdings h ON s.stock_id = h.stock_id
    GROUP BY sec.sector_id, sec.sector_name
    HAVING COUNT(h.holding_id) > 0
    ORDER BY total_investment DESC
  `);
  return result.rows;
}

/**
 * Get holding by ID
 */
export async function getHoldingById(
  holdingId: number
): Promise<HoldingWithStock | null> {
  const result = await query<HoldingWithStock>(
    `
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
    WHERE h.holding_id = $1
  `,
    [holdingId]
  );
  return result.rows[0] || null;
}
