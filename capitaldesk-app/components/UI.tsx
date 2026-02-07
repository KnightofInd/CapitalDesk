/**
 * Reusable UI Components for CapitalDesk
 */

import React from "react";

// Loading Spinner
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-slate-600 border-t-slate-300`}
      />
    </div>
  );
}

// Skeleton Loader
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-700 ${className}`}
    />
  );
}

// Card Container
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg hover:shadow-xl transition-shadow ${className}`}
    >
      {children}
    </div>
  );
}

// Stat Card (for summary metrics)
export function StatCard({
  label,
  value,
  subValue,
  trend,
  loading = false,
}: {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: "positive" | "negative" | "neutral";
  loading?: boolean;
}) {
  const trendColors = {
    positive: "text-[#1A9F5C]",
    negative: "text-[#D43F3F]",
    neutral: "text-slate-400",
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg">
        <Skeleton className="mb-2 h-4 w-20" />
        <Skeleton className="mb-1 h-8 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg hover:shadow-xl hover:border-slate-600 transition-all">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-400">{label}</p>
      </div>
      <p className="mb-1 text-3xl font-extrabold tracking-tight text-white">{value}</p>
      {subValue && (
        <p className={`text-sm font-semibold ${trend ? trendColors[trend] : "text-slate-400"}`}>
          {subValue}
        </p>
      )}
    </div>
  );
}

// Badge
export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "error" | "warning";
  className?: string;
}) {
  const variants = {
    default: "bg-slate-700/50 text-slate-300 border-slate-600",
    success: "bg-[#1A9F5C]/10 text-[#1A9F5C] border-[#1A9F5C]/30",
    error: "bg-[#D43F3F]/10 text-[#D43F3F] border-[#D43F3F]/30",
    warning: "bg-[#E6B800]/10 text-[#E6B800] border-[#E6B800]/30",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${className || variants[variant]}`}
    >
      {children}
    </span>
  );
}

// Alert/Error Message
export function Alert({
  type = "info",
  children,
}: {
  type?: "info" | "error" | "warning" | "success";
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-[#29298e] bg-[#29298e]/10 text-slate-200",
    error: "border-[#D43F3F] bg-[#D43F3F]/10 text-[#D43F3F]",
    warning: "border-[#E6B800] bg-[#E6B800]/10 text-[#E6B800]",
    success: "border-[#1A9F5C] bg-[#1A9F5C]/10 text-[#1A9F5C]",
  };

  return (
    <div className={`rounded-xl border p-4 ${styles[type]}`}>
      {children}
    </div>
  );
}

// Empty State
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 text-7xl opacity-20">📊</div>
      <h3 className="mb-3 text-2xl font-bold text-slate-200">{title}</h3>
      <p className="mb-6 text-slate-400 max-w-md">{description}</p>
      {action}
    </div>
  );
}

// Gain/Loss Display
export function GainLoss({
  amount,
  percent,
  currency = "₹",
}: {
  amount: number;
  percent: number;
  currency?: string;
}) {
  const isPositive = amount >= 0;
  const colorClass = isPositive ? "text-[#1A9F5C]" : "text-[#D43F3F]";
  const sign = isPositive ? "+" : "";

  return (
    <div className={`font-bold ${colorClass}`}>
      <div>
        {sign}
        {currency}
        {Math.abs(amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>
      <div className="text-sm font-semibold">
        ({sign}
        {percent.toFixed(2)}%)
      </div>
    </div>
  );
}

// Refresh Indicator
export function RefreshIndicator({ lastUpdated }: { lastUpdated: Date }) {
  const [timeAgo, setTimeAgo] = React.useState("");

  React.useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor(
        (Date.now() - lastUpdated.getTime()) / 1000
      );
      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}m ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <div className="h-2 w-2 animate-pulse rounded-full bg-[#1A9F5C]" />
      <span>Live • Updated {timeAgo}</span>
    </div>
  );
}
