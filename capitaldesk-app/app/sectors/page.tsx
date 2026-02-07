"use client";

import { useSectors } from "@/hooks/usePortfolio";
import { LoadingSpinner, StatCard, Alert, Card, GainLoss } from "@/components/UI";

export default function SectorsPage() {
  const { data, loading, error } = useSectors();

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
          <h3 className="mb-2 font-semibold">Failed to load sectors</h3>
          <p>{error}</p>
        </Alert>
      </div>
    );
  }

  if (!data || data.sectors.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="info">
          <p>No sector data available.</p>
        </Alert>
      </div>
    );
  }

  const { sectors, total_investment, total_current_value } = data;
  const totalGainLoss = total_current_value - total_investment;
  const totalGainLossPercent =
    total_investment > 0 ? (totalGainLoss / total_investment) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-100">
          Sector Overview
        </h1>
        <p className="text-slate-400">
          Performance breakdown by market sector
        </p>
      </div>

      {/* Summary */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard
          label="Total Investment"
          value={`₹${Number(total_investment).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          subValue={`${sectors.length} sectors`}
        />
        <StatCard
          label="Current Value"
          value={`₹${Number(total_current_value).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
        />
        <StatCard
          label="Total Gain/Loss"
          value={`₹${Math.abs(Number(totalGainLoss)).toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          subValue={`${Number(totalGainLossPercent) >= 0 ? "+" : ""}${Number(totalGainLossPercent).toFixed(2)}%`}
          trend={
            Number(totalGainLossPercent) > 0
              ? "positive"
              : Number(totalGainLossPercent) < 0
              ? "negative"
              : "neutral"
          }
        />
      </div>

      {/* Sector Cards */}
      <div className="space-y-4">
        {sectors.map((sector: any) => (
          <Card key={sector.sector_id}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Sector Info */}
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-slate-100">
                    {sector.sector_name}
                  </h2>
                  <span className="rounded bg-slate-700 px-2 py-1 text-xs text-slate-300">
                    {sector.holdings_count} holdings
                  </span>
                </div>
                {sector.description && (
                  <p className="text-sm text-slate-400">{sector.description}</p>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <div className="text-xs text-slate-400">Investment</div>
                  <div className="font-mono text-sm font-semibold text-slate-200">
                    ₹
                    {Number(sector.total_investment).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Current Value</div>
                  <div className="font-mono text-sm font-semibold text-slate-200">
                    ₹
                    {Number(sector.total_current_value).toLocaleString("en-IN", {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Gain/Loss</div>
                  <div className="text-sm font-semibold">
                    <GainLoss
                      amount={Number(sector.total_gain_loss)}
                      percent={Number(sector.gain_loss_percent)}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">Portfolio Weight</div>
                  <div className="text-sm font-semibold text-slate-200">
                    {Number(sector.portfolio_percent).toFixed(2)}%
                  </div>
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${Math.min(Number(sector.portfolio_percent), 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

