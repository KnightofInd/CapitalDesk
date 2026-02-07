export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-slate-100">
          Technical Notes
        </h1>
        <p className="text-slate-400">
          Architecture, data sources, and implementation details
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Tech Stack
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-slate-200">Frontend</h3>
              <ul className="list-inside list-disc space-y-1 text-slate-300">
                <li>Next.js 15 with App Router</li>
                <li>React 19 with Server Components</li>
                <li>TypeScript for type safety</li>
                <li>Tailwind CSS for styling</li>
                <li>Custom hooks for data fetching</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-slate-200">Backend</h3>
              <ul className="list-inside list-disc space-y-1 text-slate-300">
                <li>Next.js API Routes (Node.js)</li>
                <li>PostgreSQL database</li>
                <li>Map-based in-memory caching</li>
                <li>Axios + Cheerio for scraping</li>
                <li>Python for data ingestion</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Architecture
          </h2>
          <div className="rounded-lg bg-slate-900 p-4 font-mono text-sm text-slate-300">
            <pre className="whitespace-pre-wrap">
{`Excel Data (One-time)
    ↓
Python Script (pandas + psycopg2)
    ↓
PostgreSQL (Static: symbols, sectors, holdings)
    ↓
Next.js API Routes
    ↓
In-Memory Cache (15-30s TTL)
    ↓
Yahoo Finance (CMP) + Google Finance (P/E)
    ↓
Server-Side Calculations
    ↓
Frontend (Auto-refresh every 15s)`}
            </pre>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Data Sources & Refresh
          </h2>
          <ul className="list-inside list-disc space-y-2 text-slate-300">
            <li>
              <strong className="text-slate-200">Yahoo Finance:</strong> Current
              Market Price (CMP), Daily change percentage
            </li>
            <li>
              <strong className="text-slate-200">Google Finance:</strong> P/E
              ratios, Market capitalization
            </li>
            <li>
              <strong className="text-slate-200">Refresh Interval:</strong> 15
              seconds (client polling)
            </li>
            <li>
              <strong className="text-slate-200">Cache TTL:</strong> 15-30
              seconds (reduces API load)
            </li>
            <li>
              <strong className="text-slate-200">Scraping Method:</strong> HTTP
              requests with HTML parsing
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Caching Strategy
          </h2>
          <div className="space-y-2 text-slate-300">
            <p>
              <strong className="text-slate-200">Why Map-based cache?</strong>
            </p>
            <ul className="list-inside list-disc space-y-1 text-slate-300">
              <li>Simple, no external dependencies (Redis, etc.)</li>
              <li>Fast in-memory lookups</li>
              <li>TTL-based automatic expiration</li>
              <li>Perfect for single-server deployments</li>
            </ul>
            <p className="mt-3">
              <strong className="text-slate-200">Cache per symbol:</strong>{" "}
              Reduces redundant API calls when multiple users view the same
              stock
            </p>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Database Design
          </h2>
          <div className="space-y-3">
            <div>
              <h3 className="mb-2 font-semibold text-slate-200">
                Key Principle: No Live Prices Stored
              </h3>
              <p className="text-slate-300">
                The database only stores static portfolio data. All live market
                prices are fetched at runtime and never persisted.
              </p>
            </div>
            <div className="rounded-lg bg-slate-900 p-4 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap">
{`sectors table:
  - sector_id, sector_name, description

stocks table:
  - stock_id, symbol, company_name
  - sector_id (FK), exchange, currency

holdings table:
  - holding_id, stock_id (FK)
  - quantity, purchase_price, purchase_date, notes`}
              </pre>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Calculations
          </h2>
          <div className="space-y-2 text-slate-300">
            <p>All financial calculations happen server-side:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong className="text-slate-200">Investment Value:</strong>{" "}
                Quantity × Purchase Price
              </li>
              <li>
                <strong className="text-slate-200">Current Value:</strong>{" "}
                Quantity × Current Market Price
              </li>
              <li>
                <strong className="text-slate-200">Gain/Loss:</strong> Current
                Value - Investment Value
              </li>
              <li>
                <strong className="text-slate-200">Gain/Loss %:</strong>{" "}
                (Gain/Loss ÷ Investment Value) × 100
              </li>
              <li>
                <strong className="text-slate-200">Portfolio %:</strong>{" "}
                (Investment Value ÷ Total Investment) × 100
              </li>
            </ul>
          </div>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Known Limitations
          </h2>
          <ul className="list-inside list-disc space-y-2 text-slate-300">
            <li>Web scraping may fail if source sites change structure</li>
            <li>Rate limiting possible from Yahoo/Google Finance</li>
            <li>15-second delay means data is not truly real-time</li>
            <li>P/E ratios and market caps may not be up-to-date</li>
            <li>Single-server cache doesn't work in multi-instance setups</li>
            <li>No user authentication (single portfolio owner)</li>
          </ul>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Disclaimer
          </h2>
          <p className="text-slate-300">
            Market data is delayed and for informational purposes only. This is
            not financial advice. All calculations are estimates and may not
            reflect real-time market conditions. Scraped data accuracy cannot
            be guaranteed. Use at your own risk.
          </p>
        </section>

        <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="mb-3 text-xl font-semibold text-slate-100">
            Development Timeline
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-900/30 text-center leading-8 text-green-400">
                ✓
              </div>
              <div>
                <div className="font-semibold text-slate-200">Phase 1</div>
                <div className="text-sm text-slate-400">
                  Project Setup & UI Foundation
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-900/30 text-center leading-8 text-green-400">
                ✓
              </div>
              <div>
                <div className="font-semibold text-slate-200">Phase 2</div>
                <div className="text-sm text-slate-400">
                  Database Schema & Python Ingestion
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-900/30 text-center leading-8 text-green-400">
                ✓
              </div>
              <div>
                <div className="font-semibold text-slate-200">Phase 3</div>
                <div className="text-sm text-slate-400">
                  Backend API Layer with Caching
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-green-900/30 text-center leading-8 text-green-400">
                ✓
              </div>
              <div>
                <div className="font-semibold text-slate-200">Phase 4</div>
                <div className="text-sm text-slate-400">
                  Frontend Core Pages with Live Updates
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
