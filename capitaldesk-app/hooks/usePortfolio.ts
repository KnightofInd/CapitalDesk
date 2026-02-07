/**
 * Custom hook for fetching portfolio data with auto-refresh
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface PortfolioData {
  positions: any[];
  summary: {
    total_investment: number;
    total_current_value: number;
    total_gain_loss: number;
    gain_loss_percent: number;
    holdings_count: number;
  };
  sectors: any[];
}

interface UsePortfolioResult {
  data: PortfolioData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function usePortfolio(
  refreshInterval: number = 15000
): UsePortfolioResult {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPortfolio = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch("/api/portfolio", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setLastUpdated(new Date());
      } else {
        throw new Error(result.error || "Failed to fetch portfolio");
      }
    } catch (err) {
      console.error("Portfolio fetch error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPortfolio();
  }, [fetchPortfolio]);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchPortfolio, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchPortfolio]);

  return {
    data,
    loading,
    error,
    lastUpdated,
    refresh: fetchPortfolio,
  };
}

// Hook for fetching stock details
export function useStock(
  symbol: string
): {
  data: any;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStock() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/stock/${symbol}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch stock");
        }
      } catch (err) {
        console.error("Stock fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    if (symbol) {
      fetchStock();
    }
  }, [symbol]);

  return { data, loading, error };
}

// Hook for fetching sectors
export function useSectors(): {
  data: any;
  loading: boolean;
  error: string | null;
} {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSectors() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/sectors", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to fetch sectors");
        }
      } catch (err) {
        console.error("Sectors fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchSectors();
  }, []);

  return { data, loading, error };
}
