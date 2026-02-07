/**
 * Portfolio calculation utilities
 * All financial calculations for gains, losses, and percentages
 */

import { HoldingWithStock, PortfolioPosition } from "./types";
import { MarketData } from "./marketData";

/**
 * Calculate investment value (purchase price × quantity)
 */
export function calculateInvestment(
  purchasePrice: number,
  quantity: number
): number {
  return purchasePrice * quantity;
}

/**
 * Calculate current value (current price × quantity)
 */
export function calculateCurrentValue(
  currentPrice: number,
  quantity: number
): number {
  return currentPrice * quantity;
}

/**
 * Calculate gain/loss amount
 */
export function calculateGainLoss(
  currentValue: number,
  investmentValue: number
): number {
  return currentValue - investmentValue;
}

/**
 * Calculate gain/loss percentage
 */
export function calculateGainLossPercent(
  gainLoss: number,
  investmentValue: number
): number {
  if (investmentValue === 0) return 0;
  return (gainLoss / investmentValue) * 100;
}

/**
 * Calculate portfolio percentage (position weight)
 */
export function calculatePortfolioPercent(
  investmentValue: number,
  totalInvestment: number
): number {
  if (totalInvestment === 0) return 0;
  return (investmentValue / totalInvestment) * 100;
}

/**
 * Convert holding to portfolio position with calculations
 */
export function enrichHoldingWithMarketData(
  holding: HoldingWithStock,
  marketData: MarketData | null,
  totalInvestment: number
): PortfolioPosition {
  const investmentValue = calculateInvestment(
    holding.purchase_price,
    holding.quantity
  );

  const currentPrice = marketData?.currentPrice || null;
  const currentValue = currentPrice
    ? calculateCurrentValue(currentPrice, holding.quantity)
    : investmentValue; // Fallback to investment if no price

  const gainLoss = currentPrice
    ? calculateGainLoss(currentValue, investmentValue)
    : 0;

  const gainLossPercent = currentPrice
    ? calculateGainLossPercent(gainLoss, investmentValue)
    : 0;

  const portfolioPercent = calculatePortfolioPercent(
    investmentValue,
    totalInvestment
  );

  return {
    ...holding,
    current_price: currentPrice,
    current_value: currentValue,
    investment_value: investmentValue,
    gain_loss: gainLoss,
    gain_loss_percent: gainLossPercent,
    portfolio_percent: portfolioPercent,
  };
}

/**
 * Format currency (INR)
 */
export function formatCurrency(
  amount: number,
  currency: string = "INR"
): string {
  if (currency === "INR") {
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Aggregate sector totals
 */
export interface SectorAggregate {
  sector_name: string;
  holdings_count: number;
  total_investment: number;
  total_current_value: number;
  total_gain_loss: number;
  gain_loss_percent: number;
  portfolio_percent: number;
}

export function aggregateBySector(
  positions: PortfolioPosition[],
  totalInvestment: number
): SectorAggregate[] {
  const sectorMap = new Map<string, PortfolioPosition[]>();

  // Group by sector
  positions.forEach((position) => {
    const sector = position.sector_name;
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(position);
  });

  // Calculate aggregates
  const aggregates: SectorAggregate[] = [];

  sectorMap.forEach((sectorPositions, sectorName) => {
    const total_investment = sectorPositions.reduce(
      (sum, p) => sum + p.investment_value,
      0
    );

    const total_current_value = sectorPositions.reduce(
      (sum, p) => sum + p.current_value,
      0
    );

    const total_gain_loss = total_current_value - total_investment;

    const gain_loss_percent =
      total_investment > 0 ? (total_gain_loss / total_investment) * 100 : 0;

    const portfolio_percent =
      totalInvestment > 0 ? (total_investment / totalInvestment) * 100 : 0;

    aggregates.push({
      sector_name: sectorName,
      holdings_count: sectorPositions.length,
      total_investment,
      total_current_value,
      total_gain_loss,
      gain_loss_percent,
      portfolio_percent,
    });
  });

  // Sort by investment descending
  return aggregates.sort((a, b) => b.total_investment - a.total_investment);
}
