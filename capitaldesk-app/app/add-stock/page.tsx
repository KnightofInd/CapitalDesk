'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const SECTORS = [
  'Technology',
  'Finance',
  'Healthcare',
  'Energy',
  'Consumer',
  'Industrial',
  'Real Estate',
  'Materials',
  'Utilities',
  'Telecommunications'
];

export default function AddStockPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    symbol: '',
    companyName: '',
    sector: 'Finance',
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    exchange: 'NSE'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/holdings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add stock');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        symbol: '',
        companyName: '',
        sector: 'Finance',
        quantity: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        exchange: 'NSE'
      });

      // Redirect after 2 seconds
      setTimeout(() => router.push('/'), 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Add Stock to Portfolio</h1>
        <p className="text-slate-400">Enter stock details to add it to your holdings</p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-900/20 border border-green-500/50 text-green-400 px-4 py-3 rounded-lg mb-6">
          ✓ Stock added successfully! Redirecting to dashboard...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          ✗ {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 shadow-lg">
        {/* Stock Symbol */}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Stock Symbol *
          </label>
          <input
            type="text"
            name="symbol"
            value={formData.symbol}
            onChange={handleChange}
            placeholder="e.g., RELIANCE, TCS, INFY"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            required
          />
          <p className="text-slate-500 text-xs mt-1">Enter the stock ticker symbol (without .NS or .BO suffix)</p>
        </div>

        {/* Company Name */}
        <div className="mb-4">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Company Name *
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g., Reliance Industries Ltd"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        {/* Sector and Exchange */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Sector *
            </label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              {SECTORS.map(sector => (
                <option key={sector} value={sector}>{sector}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Exchange *
            </label>
            <select
              name="exchange"
              value={formData.exchange}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="NSE">NSE</option>
              <option value="BSE">BSE</option>
            </select>
          </div>
        </div>

        {/* Quantity and Purchase Price */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Quantity *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="e.g., 10"
              step="0.0001"
              min="0.0001"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Purchase Price (₹) *
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={formData.purchasePrice}
              onChange={handleChange}
              placeholder="e.g., 2450.50"
              step="0.01"
              min="0.01"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>
        </div>

        {/* Purchase Date */}
        <div className="mb-6">
          <label className="block text-slate-300 text-sm font-medium mb-2">
            Purchase Date
          </label>
          <input
            type="date"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            {loading ? 'Adding Stock...' : 'Add to Portfolio'}
          </button>
          <Link
            href="/"
            className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <h3 className="text-blue-400 font-medium mb-2">📝 Quick Tips:</h3>
        <ul className="text-slate-400 text-sm space-y-1">
          <li>• Use standard NSE symbols (RELIANCE, TCS, INFY, HDFCBANK, etc.)</li>
          <li>• Live prices will be fetched automatically from Yahoo Finance</li>
          <li>• You can add multiple holdings of the same stock</li>
        </ul>
      </div>
    </div>
  );
}
