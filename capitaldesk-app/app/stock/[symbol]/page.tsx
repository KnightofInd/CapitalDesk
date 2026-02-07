"use client";

import { useStock } from "@/hooks/usePortfolio";
import {
  LoadingSpinner,
  StatCard,
  Alert,
  Card,
  Badge,
  GainLoss,
} from "@/components/UI";
import Link from "next/link";

export default function StockDetailPage({
  params,
}: {
  params: { symbol: string };
}) {
  const { data, loading, error } = useStock(params.symbol);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error">
          <h3 className="mb-2 font-semibold">Failed to load stock details</h3>
          <p className="mb-4">{error}</p>
          <Link
            href="/"
            className="inline-block rounded bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
          >
            Back to Portfolio
          </Link>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { stock, marketData, holdings, summary } = data;

  const gainLossTrend =
    Number(summary.gain_loss_percent) > 0
      ? "positive"
      : Number(summary.gain_loss_percent) < 0
      ? "negative"
      : "neutral";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to Portfolio
        </Link>
      </div>

      {/* Stock Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-slate-100">
              {stock.symbol}
            </h1>
            <p className="text-lg text-slate-300">{stock.company_name}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">{stock.exchange}</Badge>
            <Badge variant="default">{stock.currency}</Badge>
          </div>
        </div>
      </div>

      {/* Market Data */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Current Market Price"
          value={
            marketData.currentPrice
              ? `₹${Number(marketData.currentPrice).toFixed(2)}`
              : "N/A"
          }
          subValue={
            marketData.changePercent
              ? `${Number(marketData.changePercent) >= 0 ? "+" : ""}${Number(marketData.changePercent).toFixed(2)}%`
              : undefined
          }
          trend={
            marketData.changePercent
              ? Number(marketData.changePercent) > 0
                ? "positive"
                : Number(marketData.changePercent) < 0
                ? "negative"
                : "neutral"
              : undefined
          }
        />
        <StatCard
          label="P/E Ratio"
          value={marketData.peRatio ? Number(marketData.peRatio).toFixed(2) : "N/A"}
          subValue="Times earnings"
        />
        <StatCard
          label="Market Cap"
          value={marketData.marketCap || "N/A"}
        />
        <StatCard
          label="Data Source"
          value={marketData.source.toUpperCase()}
          subValue={new Date(marketData.lastUpdated).toLocaleTimeString()}
        />
      </div>

      {/* Position Summary */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-slate-100">
          Your Position
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Total Quantity"
            value={Number(summary.total_quantity).toLocaleString()}
            subValue={`${summary.holdings_count} purchase(s)`}
          />
          <StatCard
            label="Avg Purchase Price"
            value={`₹${Number(summary.average_purchase_price).toFixed(2)}`}
          />
          <StatCard
            label="Total Investment"
            value={`₹${Number(summary.total_investment).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}`}
          />
          <StatCard
            label="Current Value"
            value={`₹${Number(summary.current_value).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}`}
          />
          <StatCard
            label="Gain/Loss"
            value={`₹${Math.abs(Number(summary.gain_loss)).toLocaleString("en-IN", {
              maximumFractionDigits: 0,
            })}`}
            subValue={`${Number(summary.gain_loss_percent) >= 0 ? "+" : ""}${Number(summary.gain_loss_percent).toFixed(2)}%`}
            trend={gainLossTrend}
          />
        </div>
      </div>

      {/* Holdings History */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold text-slate-100">
          Purchase History
        </h2>
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700 text-left text-sm text-slate-400">
                  <th className="px-4 py-3 font-medium">Purchase Date</th>
                  <th className="px-4 py-3 text-right font-medium">Quantity</th>
                  <th className="px-4 py-3 text-right font-medium">
                    Purchase Price
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Investment Value
                  </th>
                  <th className="px-4 py-3 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding: any) => (
                  <tr
                    key={holding.holding_id}
                    className="border-b border-slate-700/50"
                  >
                    <td className="px-4 py-3 text-slate-300">
                      {holding.purchase_date
                        ? new Date(holding.purchase_date).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {Number(holding.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      ₹{Number(holding.purchase_price).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      ₹
                      {Number(holding.investment_value).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {holding.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Disclaimer */}
      <Alert type="info">
        <p className="text-sm">
          Market data is delayed and for informational purposes only. P/E ratio
          and market cap are scraped from public sources and may not be
          accurate.
        </p>
      </Alert>
    </div>
  );
}
