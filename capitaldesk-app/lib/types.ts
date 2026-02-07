/**
 * Database type definitions for CapitalDesk
 */

export interface Sector {
  sector_id: number;
  sector_name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface Stock {
  stock_id: number;
  symbol: string;
  company_name: string;
  sector_id: number;
  exchange: string;
  currency: string;
  created_at: Date;
  updated_at: Date;
}

export interface Holding {
  holding_id: number;
  stock_id: number;
  quantity: number;
  purchase_price: number;
  purchase_date: Date | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * Extended types with joined data
 */

export interface HoldingWithStock extends Holding {
  symbol: string;
  company_name: string;
  sector_name: string;
  exchange: string;
  currency: string;
}

export interface PortfolioSummary {
  total_holdings: number;
  total_investment: number;
  total_stocks: number;
  sectors_count: number;
}

export interface SectorSummary {
  sector_id: number;
  sector_name: string;
  holdings_count: number;
  total_investment: number;
  total_quantity: number;
}

/**
 * Live market data (fetched from external APIs, not stored in DB)
 */

export interface LiveStockData {
  symbol: string;
  current_price: number;
  change_percent: number;
  pe_ratio: number | null;
  last_updated: Date;
}

export interface PortfolioPosition extends HoldingWithStock {
  current_price: number | null;
  current_value: number;
  investment_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  portfolio_percent: number;
}
