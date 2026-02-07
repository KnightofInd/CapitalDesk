# 📊 CapitalDesk - Real-Time Stock Portfolio Tracker

A modern, real-time stock portfolio tracking dashboard built with Next.js 15, PostgreSQL (Supabase), and live market data scraping from Yahoo Finance and Google Finance.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Core Features
- **Real-Time Market Data**: Live stock prices from Yahoo Finance with 15-second auto-refresh
- **Portfolio Dashboard**: Track investments, current values, and gains/losses across multiple stocks
- **Sector Analysis**: Breakdown of portfolio by industry sectors (Technology, Finance, Healthcare, etc.)
- **Stock Marketplace**: Browse and add 49+ popular NSE stocks with quick-add modal
- **Comprehensive Calculations**: Automatic calculation of portfolio metrics, sector allocations, and performance

### Technical Features
- **Live Data Polling**: Client-side refresh every 15 seconds for real-time updates
- **Intelligent Caching**: Map-based in-memory cache with 15-30s TTL to minimize API calls
- **Batch Processing**: Fetches market data for all stocks in parallel for optimal performance
- **Error Handling**: React Error Boundaries and toast notifications for graceful error management
- **Responsive Design**: Mobile-first design with horizontal scrolling tables and touch-friendly UI
- **Type-Safe**: Full TypeScript implementation with strict type checking

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - App Router with React Server Components
- **React 19** - Latest React features with client/server composition
- **TypeScript** - Full type safety across the application
- **Tailwind CSS v4** - Utility-first CSS framework with custom design system
- **React Hot Toast** - Toast notifications for user feedback

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL** - Supabase hosted database with transaction pooler
- **Axios + Cheerio** - Web scraping for market data from Yahoo/Google Finance
- **Node.js pg** - PostgreSQL client for database operations

### Design System
- **Font**: Manrope (400, 500, 600, 700, 800)
- **Primary Color**: `#29298e` (deep purple/blue)
- **Status Colors**: Green (`#1A9F5C`), Yellow (`#E6B800`), Red (`#D43F3F`)
- **Components**: Custom UI library with StatCard, Badge, Alert, GainLoss indicators

## 📁 Project Structure

```
CapitalDesk/
├── capitaldesk-app/           # Next.js 15 application
│   ├── app/                   # App Router pages & API routes
│   │   ├── api/              # API endpoints
│   │   │   ├── portfolio/    # GET portfolio with calculations
│   │   │   ├── stock/[symbol]/ # GET individual stock data
│   │   │   ├── sectors/      # GET sector breakdown
│   │   │   ├── stocks/       # GET stock catalog
│   │   │   └── holdings/     # CRUD operations for holdings
│   │   ├── browse/           # Stock marketplace page
│   │   ├── sectors/          # Sector analysis page
│   │   ├── stock/[symbol]/   # Individual stock detail page
│   │   ├── layout.tsx        # Root layout with fonts & Toaster
│   │   ├── page.tsx          # Dashboard (home page)
│   │   └── globals.css       # Global styles & design tokens
│   ├── components/           # React components
│   │   ├── Header.tsx        # Navigation bar with gradient logo
│   │   ├── Footer.tsx        # Footer with disclaimer
│   │   ├── PortfolioTable.tsx # Holdings table with sector grouping
│   │   ├── UI.tsx            # Reusable UI components library
│   │   ├── ErrorBoundary.tsx # React error boundary
│   │   └── ClientLayout.tsx  # Client-side layout wrapper
│   ├── hooks/                # Custom React hooks
│   │   ├── usePortfolio.ts   # Portfolio data with polling
│   │   ├── useStock.ts       # Individual stock data
│   │   └── useSectors.ts     # Sector breakdown data
│   ├── lib/                  # Core business logic
│   │   ├── db.ts            # Database connection & query util
│   │   ├── queries.ts       # SQL queries for holdings/stocks
│   │   ├── marketData.ts    # Yahoo/Google Finance scrapers
│   │   ├── calculations.ts  # Portfolio & sector calculations
│   │   ├── cache.ts         # In-memory caching layer
│   │   └── types.ts         # TypeScript interfaces
│   └── package.json         # Dependencies & scripts
├── database/                 # Database schema & seeds
│   ├── schema.sql           # PostgreSQL schema (sectors, stocks, holdings)
│   └── seed_stocks.sql      # 49 popular NSE stocks seed data
├── scripts/                  # Data ingestion scripts (optional)
│   └── ingest_holdings.py   # Python script for bulk data import
└── README.md                # This file

```

## 🗄️ Database Schema

### Tables

**sectors** (10 rows)
- `sector_id` (PK, SERIAL)
- `sector_name` (UNIQUE)
- `description`

**stocks** (49 rows seeded)
- `stock_id` (PK, SERIAL)
- `symbol` (UNIQUE)
- `company_name`
- `sector_id` (FK → sectors)
- `exchange` (NSE/BSE)

**holdings** (user portfolio)
- `holding_id` (PK, SERIAL)
- `stock_id` (FK → stocks)
- `quantity` (DECIMAL)
- `purchase_price` (DECIMAL)
- `purchase_date` (DATE)
- `created_at`, `updated_at`

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (or Supabase account)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CapitalDesk/capitaldesk-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create `.env.local` in `capitaldesk-app/`:
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

Example (Supabase transaction pooler):
```env
DATABASE_URL=postgresql://postgres.YOUR_PROJECT_ID:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

4. **Set up the database**

Run the schema and seed scripts in your PostgreSQL database:
```bash
cd ../database
# Execute schema.sql first
# Then execute seed_stocks.sql
```

Or using `psql`:
```bash
psql $DATABASE_URL -f database/schema.sql
psql $DATABASE_URL -f database/seed_stocks.sql
```

5. **Start the development server**
```bash
cd capitaldesk-app
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is in use)

## 📊 API Endpoints

### Portfolio & Holdings
- `GET /api/portfolio` - Full portfolio with live data and calculations
- `GET /api/holdings` - List all holdings (no market data)
- `POST /api/holdings` - Add new holding
- `PUT /api/holdings/[id]` - Update holding
- `DELETE /api/holdings/[id]` - Delete holding

### Stock Data
- `GET /api/stock/[symbol]` - Individual stock with live price & P/E ratio
- `GET /api/stocks?search=TCS&sector=Technology` - Stock catalog with filters
- `GET /api/sectors` - Sector breakdown with allocation

### Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-02-08T10:30:00.000Z",
  "cached": false
}
```

## 💾 Caching Strategy

The application uses a multi-layer caching approach:

1. **Market Data Cache** (15-30s TTL)
   - In-memory Map cache for Yahoo/Google Finance scrapes
   - Reduces redundant HTTP requests
   - Auto-invalidation on expiry

2. **Client-Side Polling** (15s interval)
   - `usePortfolio` hook refreshes every 15 seconds
   - Smooth UI updates without page reload
   - Optimistic UI updates for mutations

## 🎨 Design System

### Colors
```css
--color-primary: #29298e;        /* Deep purple/blue */
--color-primary-light: #3d3daa;  /* Lighter variant */
--color-status-green: #1A9F5C;   /* Positive gains */
--color-status-yellow: #E6B800;  /* Warnings */
--color-status-red: #D43F3F;     /* Negative/errors */
```

### Components
- **StatCard**: Summary metric cards with trends (positive/negative/neutral)
- **Badge**: Labeled tags with variants (default, success, error, warning)
- **Alert**: Info/error/warning/success message boxes
- **GainLoss**: Color-coded gain/loss display with percentage
- **Card**: Container with shadows and hover effects
- **LoadingSpinner**: Three sizes (sm, md, lg)
- **Skeleton**: Animated loading placeholders

## 📱 Pages

### 1. Dashboard (`/`)
- Portfolio summary cards (Investment, Current Value, Gain/Loss, Performance)
- Sector breakdown cards
- Holdings table grouped by sector
- Live refresh indicator
- Delete functionality with confirmation

### 2. Browse Stocks (`/browse`)
- Search by symbol or company name
- Filter by sector (10 sectors)
- Grid layout with stock cards
- Quick-add modal (quantity, price, date)
- "In Portfolio" badges

### 3. Sectors (`/sectors`)
- Sector-wise performance analysis
- Allocation percentages
- Holdings count per sector
- Gain/loss per sector

### 4. Stock Detail (`/stock/[symbol]`)
- Individual stock information
- Live CMP (Current Market Price)
- P/E Ratio from Google Finance
- Company details & sector

## 🔐 Environment Variables

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (transaction pooler recommended for Supabase)

**Note:** No API keys needed for market data (web scraping approach)

## 🧪 Testing

The application includes:
- ✅ React Error Boundaries for graceful error handling
- ✅ Toast notifications for user feedback (replacing alerts)
- ✅ Form validation (min/max constraints, decimal precision)
- ✅ TypeScript strict mode (no type errors)
- ✅ Mobile responsive design
- ✅ Test data scripts (removed after use)

## 🛡️ Error Handling

### Error Boundaries
React Error Boundary catches component-level errors and displays:
- User-friendly error message
- Error details (in development)
- "Reload Page" button for recovery

### API Error Handling
- All API routes return structured error responses
- 500 status for server errors
- Descriptive error messages logged to console
- Toast notifications inform users of failures

### Market Data Failures
- Graceful fallback to cached data
- Null CMP if scraping fails (displayed as "N/A")
- Logs errors without breaking portfolio calculations

## ⚡ Performance

- **Batch Market Data Fetching**: Fetches all symbols in parallel
- **Caching**: 15-30s TTL reduces API load by ~80%
- **Client-Side Polling**: Only fetches changed data
- **Database Indexing**: Indexes on `symbol`, `sector_id`, `stock_id`
- **Connection Pooling**: Supabase transaction pooler (port 6543)

## 📦 Dependencies

### Core
- `next@15.1.6` - React framework
- `react@19.0.0` - UI library
- `typescript@5` - Type safety
- `tailwindcss@4` - Styling

### Database
- `pg@8.13.1` - PostgreSQL client
- `@types/pg` - TypeScript types

### Utilities
- `axios@1.7.9` - HTTP client for scraping
- `cheerio@1.0.0` - HTML parsing
- `react-hot-toast@2.4.1` - Toast notifications

## 🚀 Deployment

### Recommended Platforms
- **Vercel** (Next.js optimized)
- **Netlify**
- **Railway**
- **Render**

### Environment Setup
1. Set `DATABASE_URL` in platform environment variables
2. Ensure PostgreSQL is accessible from deployment platform
3. Use Supabase transaction pooler for serverless deployments
4. Set Node.js version to 18+ in platform settings

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

## 📝 Known Limitations

1. **Market Data Delay**: 15-second polling means data is delayed by up to 15 seconds
2. **Web Scraping Reliability**: Yahoo/Google Finance may change HTML structure, breaking scrapers
3. **No Real API Keys**: Scraping approach is less reliable than paid APIs (but free!)
4. **NSE Stocks Only**: Seeded with 49 NSE stocks (can add more manually)
5. **Single Currency**: Only supports INR (₹)
6. **No Authentication**: Open access (add auth for production)

## 🔮 Future Enhancements

- [ ] User authentication & multi-user support
- [ ] Watchlist feature (track stocks without buying)
- [ ] Price alerts & notifications
- [ ] Historical performance charts (Chart.js)
- [ ] Export portfolio to CSV/PDF
- [ ] Cryptocurrency support
- [ ] Multiple currency support (USD, EUR)
- [ ] Integration with real stock APIs (Alpha Vantage, IEX Cloud)
- [ ] Dark/light theme toggle
- [ ] Advanced filtering & sorting options

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing documentation in `/database`, `/scripts`, and component files

## ⚠️ Disclaimer

**This application is for educational and informational purposes only.**

- Market data is delayed by 15 seconds and may not be accurate
- Data is scraped from public sources and may be incomplete or incorrect
- This is NOT financial advice
- Do not make investment decisions based solely on this application
- Always consult with a qualified financial advisor before investing

---

**Built with ❤️ using Next.js 15, React 19, and PostgreSQL**
