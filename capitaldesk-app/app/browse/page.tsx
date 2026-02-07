'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { LoadingSpinner, Badge, Alert } from '@/components/UI';

interface Stock {
  stock_id: number;
  symbol: string;
  company_name: string;
  sector_name: string;
  exchange: string;
  in_portfolio: boolean;
}

export default function BrowseStocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [formData, setFormData] = useState({
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  });

  const sectors = ['All', 'Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Materials', 'Telecommunications'];

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    filterStocks();
  }, [searchTerm, selectedSector, stocks]);

  const fetchStocks = async () => {
    try {
      const response = await fetch('/api/stocks');
      const data = await response.json();
      setStocks(data.stocks);
      setFilteredStocks(data.stocks);
    } catch (err) {
      setError('Failed to load stocks');
    } finally {
      setLoading(false);
    }
  };

  const filterStocks = () => {
    let filtered = stocks;

    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSector && selectedSector !== 'All') {
      filtered = filtered.filter(stock => stock.sector_name === selectedSector);
    }

    setFilteredStocks(filtered);
  };

  const openAddModal = (stock: Stock) => {
    setSelectedStock(stock);
    setShowModal(true);
    setFormData({
      quantity: '',
      purchasePrice: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleAddToPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;

    const loadingToast = toast.loading('Adding to portfolio...');
    
    try {
      const response = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedStock.symbol,
          companyName: selectedStock.company_name,
          sector: selectedStock.sector_name,
          exchange: selectedStock.exchange,
          quantity: parseFloat(formData.quantity),
          purchasePrice: parseFloat(formData.purchasePrice),
          purchaseDate: formData.purchaseDate
        })
      });

      if (!response.ok) throw new Error('Failed to add stock');

      toast.success(`${selectedStock.symbol} added to portfolio!`, { id: loadingToast });
      
      // Refresh stocks list
      await fetchStocks();
      setShowModal(false);
      setSelectedStock(null);

    } catch (err) {
      toast.error('Failed to add stock to portfolio. Please try again.', { id: loadingToast });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-3">Browse Stocks</h1>
        <p className="text-slate-400 text-lg">Select stocks to add to your portfolio</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-8 bg-slate-900 rounded-xl p-6 border border-slate-700 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by symbol or company name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#29298e] focus:border-transparent transition-all"
            />
          </div>

          {/* Sector Filter */}
          <div>
            <label className="block text-sm font-semibold text-slate-400 mb-2">Sector</label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#29298e] focus:border-transparent transition-all"
            >
              {sectors.map(sector => (
                <option key={sector} value={sector === 'All' ? '' : sector}>
                  {sector}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 text-sm font-semibold text-slate-400">
          Showing {filteredStocks.length} of {stocks.length} stocks
        </div>
      </div>

      {/* Stocks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStocks.map(stock => (
          <div
            key={stock.stock_id}
            className="bg-slate-900 rounded-xl p-5 border border-slate-700 hover:border-slate-600 hover:shadow-xl transition-all group"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <Link href={`/stock/${stock.symbol}`}>
                  <h3 className="text-xl font-extrabold text-[#29298e] hover:text-[#3d3daa] font-mono transition-colors cursor-pointer">{stock.symbol}</h3>
                </Link>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{stock.company_name}</p>
              </div>
              {stock.in_portfolio && (
                <Badge className="bg-[#1A9F5C]/10 text-[#1A9F5C] border-[#1A9F5C]/30 ml-2">
                  In Portfolio
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <Badge className="bg-[#29298e]/10 text-[#29298e] border-[#29298e]/30">
                  {stock.sector_name}
                </Badge>
                <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {stock.exchange}
                </Badge>
              </div>

              <button
                onClick={() => openAddModal(stock)}
                className="bg-gradient-to-r from-[#29298e] to-[#3d3daa] hover:from-[#3d3daa] hover:to-[#29298e] text-white text-sm font-bold px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
              >
                + Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredStocks.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4 opacity-20">🔍</div>
          <p className="text-slate-400 text-lg">No stocks found matching your search</p>
        </div>
      )}

      {/* Add to Portfolio Modal */}
      {showModal && selectedStock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-2xl p-8 max-w-md w-full border border-slate-700 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-white mb-6">
              Add {selectedStock.symbol}
            </h2>

            <div className="mb-6 bg-slate-800 rounded-xl p-4 border border-slate-700">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</p>
              <p className="text-white font-bold text-lg mb-3">{selectedStock.company_name}</p>
              <div className="flex gap-2">
                <Badge className="bg-[#29298e]/10 text-[#29298e] border-[#29298e]/30">
                  {selectedStock.sector_name}
                </Badge>
                <Badge className="bg-slate-700/50 text-slate-300 border-slate-600">
                  {selectedStock.exchange}
                </Badge>
              </div>
            </div>

            <form onSubmit={handleAddToPortfolio}>
              <div className="mb-5">
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g., 10"
                  step="0.0001"
                  min="0.0001"
                  max="1000000"
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#29298e] focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Enter the number of shares (up to 4 decimal places)</p>
              </div>

              <div className="mb-5">
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  Purchase Price (₹) *
                </label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                  placeholder="e.g., 2450.50"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  required
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#29298e] focus:border-transparent transition-all"
                />
                <p className="mt-1 text-xs text-slate-500">Price per share in rupees</p>
              </div>

              <div className="mb-7">
                <label className="block text-slate-300 text-sm font-bold mb-2">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#29298e] focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#29298e] to-[#3d3daa] hover:from-[#3d3daa] hover:to-[#29298e] text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Add to Portfolio
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
