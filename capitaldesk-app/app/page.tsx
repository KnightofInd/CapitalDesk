"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { usePortfolio } from "@/hooks/usePortfolio";
import PortfolioTable from "@/components/PortfolioTable";
import {
  LoadingSpinner,
  StatCard,
  Alert,
  EmptyState,
  RefreshIndicator,
  Skeleton,
} from "@/components/UI";

export default function Home() {
  const { data, loading, error, lastUpdated, refresh } = usePortfolio(15000); // Refresh every 15 seconds
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleDelete = async (holdingId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this holding?');
    if (!confirmed) return;

    setDeleting(holdingId);
    const loadingToast = toast.loading('Deleting holding...');
    
    try {
      const response = await fetch(`/api/holdings/${holdingId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete holding');

      toast.success('Holding deleted successfully!', { id: loadingToast });
      // Refresh the portfolio data
      refresh();
    } catch (err) {
      toast.error('Failed to delete holding. Please try again.', { id: loadingToast });
    } finally {
      setDeleting(null);
    }
  };

  // Loading state
  if (loading && !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="mb-2 h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Loading..." value="..." loading />
          <StatCard label="Loading..." value="..." loading />
          <StatCard label="Loading..." value="..." loading />
          <StatCard label="Loading..." value="..." loading />
        </div>

        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error">
          <h3 className="mb-2 font-bold text-lg">Failed to load portfolio</h3>
          <p className="mb-4">{error}</p>
          <button
            onClick={refresh}
            className="rounded-lg bg-[#D43F3F] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#ff4d4d] transition-all shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!data || data.positions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mb-6 text-8xl opacity-30">📊</div>
            <h2 className="mb-3 text-3xl font-extrabold text-slate-100">
              Your Portfolio is Empty
            </h2>
            <p className="mb-8 text-slate-400 text-lg">
              Start building your portfolio by adding your first stock
            </p>
            <Link
              href="/browse"
              className="inline-block rounded-xl bg-gradient-to-r from-[#29298e] to-[#3d3daa] hover:from-[#3d3daa] hover:to-[#29298e] px-8 py-4 text-base font-bold text-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              + Browse Stocks to Add
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { summary, positions, sectors } = data;

  const totalGainLossTrend =
    Number(summary.gain_loss_percent) > 0
      ? "positive"
      : Number(summary.gain_loss_percent) < 0
      ? "negative"
      : "neutral";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-extrabold text-slate-100">
            Portfolio Dashboard
          </h1>
          <p className="text-slate-400 text-lg">
            Real-time portfolio tracking with live market data
          </p>
        </div>
        {lastUpdated && <RefreshIndicator lastUpdated={lastUpdated} />}
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Investment"
          value={`₹${Number(summary.total_investment).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subValue={`${summary.holdings_count} holdings`}
        />
        <StatCard
          label="Current Value"
          value={`₹${Number(summary.total_current_value).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subValue={`Across ${sectors.length} sectors`}
        />
        <StatCard
          label="Total Gain/Loss"
          value={`₹${Math.abs(Number(summary.total_gain_loss)).toLocaleString(
            "en-IN",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`}
          subValue={`${Number(summary.gain_loss_percent) >= 0 ? "+" : ""}${Number(summary.gain_loss_percent).toFixed(2)}%`}
          trend={totalGainLossTrend}
        />
        <StatCard
          label="Portfolio Performance"
          value={
            Number(summary.gain_loss_percent) >= 0
              ? `${Number(summary.gain_loss_percent).toFixed(2)}%`
              : `${Number(summary.gain_loss_percent).toFixed(2)}%`
          }
          subValue={Number(summary.gain_loss_percent) >= 0 ? "Profit" : "Loss"}
          trend={totalGainLossTrend}
        />
      </div>

      {/* Sector Summary */}
      <div className="mb-8">
        <h2 className="mb-6 text-2xl font-extrabold text-slate-100">
          Sector Breakdown
        </h2>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <div
              key={sector.sector_name}
              className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all group"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-100">
                  {sector.sector_name}
                </h3>
                <span className="text-xs font-semibold text-slate-400">
                  {sector.holdings_count} stocks
                </span>
              </div>
              <div className="mb-2 text-2xl font-extrabold text-slate-200">
                ₹
                {Number(sector.total_investment).toLocaleString("en-IN", {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400 font-semibold">
                  {Number(sector.portfolio_percent).toFixed(1)}% of portfolio
                </span>
                <span
                  className={
                    Number(sector.gain_loss_percent) >= 0
                      ? "text-[#1A9F5C] font-bold"
                      : "text-[#D43F3F] font-bold"
                  }
                >
                  {Number(sector.gain_loss_percent) >= 0 ? "+" : ""}
                  {Number(sector.gain_loss_percent).toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="mb-6">
        <h2 className="mb-6 text-2xl font-extrabold text-slate-100">
          All Holdings
        </h2>
      </div>
      <PortfolioTable 
        positions={positions} 
        groupBySector={true}
        onDelete={handleDelete}
      />

      {/* Data Disclaimer */}
      <div className="mt-8">
        <Alert type="info">
          <p className="text-sm font-medium">
            Market data is delayed by 15 seconds and for informational purposes
            only. This is not financial advice. All calculations are estimates
            based on scraped data which may not be accurate.
          </p>
        </Alert>
      </div>
    </div>
  );
}


