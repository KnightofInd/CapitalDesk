/**
 * Portfolio Table Component
 * Displays holdings grouped by sector with color-coded gains/losses
 */

"use client";

import Link from "next/link";
import { GainLoss } from "./UI";

interface Position {
  holding_id: number;
  symbol: string;
  company_name: string;
  sector_name: string;
  quantity: number;
  purchase_price: number;
  current_price: number | null;
  investment_value: number;
  current_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  portfolio_percent: number;
  exchange: string;
  currency: string;
}

interface PortfolioTableProps {
  positions: Position[];
  groupBySector?: boolean;
  onDelete?: (holdingId: number) => void;
}

export default function PortfolioTable({
  positions,
  groupBySector = true,
  onDelete,
}: PortfolioTableProps) {
  if (positions.length === 0) {
    return null;
  }

  // Group positions by sector
  const groupedPositions = groupBySector
    ? positions.reduce((acc, position) => {
        const sector = position.sector_name;
        if (!acc[sector]) {
          acc[sector] = [];
        }
        acc[sector].push(position);
        return acc;
      }, {} as Record<string, Position[]>)
    : { All: positions };

  return (
    <div className="space-y-8">
      {Object.entries(groupedPositions).map(([sectorName, sectorPositions]) => (
        <div key={sectorName}>
          {groupBySector && (
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100">
                {sectorName}
              </h2>
              <span className="text-sm font-medium text-slate-400">
                {sectorPositions.length} holdings
              </span>
            </div>
          )}

          <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-800/50 backdrop-blur-sm">
                  <tr className="border-b border-slate-700 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-4">Symbol</th>
                    <th className="px-4 py-4">Company</th>
                    <th className="px-4 py-4 text-right">Qty</th>
                    <th className="px-4 py-4 text-right">
                      Avg Price
                    </th>
                    <th className="px-4 py-4 text-right">CMP</th>
                    <th className="px-4 py-4 text-right">
                      Investment
                    </th>
                    <th className="px-4 py-4 text-right">
                      Current Value
                    </th>
                    <th className="px-4 py-4 text-right">
                      Gain/Loss
                    </th>
                    <th className="px-4 py-4 text-right">
                      Portfolio %
                    </th>
                    {onDelete && (
                      <th className="px-4 py-4 text-center">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {sectorPositions.map((position) => (
                    <tr
                      key={position.holding_id}
                      className="border-b border-slate-700/30 transition-all hover:bg-slate-800/50 group"
                    >
                      <td className="px-4 py-4">
                        <Link
                          href={`/stock/${position.symbol}`}
                          className="font-mono font-bold text-[#29298e] hover:text-[#3d3daa] transition-colors"
                        >
                          {position.symbol}
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-slate-200 font-medium">
                        <div className="max-w-xs truncate">
                          {position.company_name}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right text-slate-300 font-semibold">
                        {Number(position.quantity).toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-slate-300 font-semibold">
                        ₹{Number(position.purchase_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-slate-200 font-bold">
                        {position.current_price ? (
                          `₹${Number(position.current_price).toFixed(2)}`
                        ) : (
                          <span className="text-slate-500">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-slate-300 font-semibold">
                        ₹
                        {Number(position.investment_value).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-4 text-right font-mono text-slate-200 font-bold">
                        ₹
                        {Number(position.current_value).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <GainLoss
                          amount={Number(position.gain_loss)}
                          percent={Number(position.gain_loss_percent)}
                        />
                      </td>
                      <td className="px-4 py-4 text-right text-slate-400 font-semibold">
                        {Number(position.portfolio_percent).toFixed(2)}%
                      </td>
                      {onDelete && (
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => onDelete(position.holding_id)}
                            className="text-[#D43F3F] hover:text-[#ff4d4d] hover:bg-[#D43F3F]/10 px-3 py-1.5 rounded-lg transition-all text-sm font-semibold"
                            title="Delete holding"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
