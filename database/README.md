# Database Setup

## Schema Overview

### Tables

1. **sectors** - Market sector classifications
   - `sector_id` (PK)
   - `sector_name` (unique)
   - `description`

2. **stocks** - Stock master data (no live prices)
   - `stock_id` (PK)
   - `symbol` (unique)
   - `company_name`
   - `sector_id` (FK → sectors)
   - `exchange` (NSE, BSE, NYSE, etc.)
   - `currency`

3. **holdings** - User portfolio positions
   - `holding_id` (PK)
   - `stock_id` (FK → stocks)
   - `quantity`
   - `purchase_price`
   - `purchase_date`
   - `notes`

## Setup Instructions

### 1. Install PostgreSQL
```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# Or use Docker
docker run --name capitaldesk-db -e POSTGRES_PASSWORD=yourpassword -p 5432:5432 -d postgres:15
```

### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE capitaldesk;
\c capitaldesk
```

### 3. Run Schema
```bash
psql -U postgres -d capitaldesk -f schema.sql
```

### 4. (Optional) Load Sample Data
```bash
psql -U postgres -d capitaldesk -f seed_sample_data.sql
```

### 5. Set Environment Variables
Create `.env.local` in `capitaldesk-app/`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/capitaldesk
```

## Design Notes

- **No live prices in database**: CMP, P/E ratios are fetched live from APIs
- **Static data only**: Symbols, sectors, purchase history
- **Calculations happen at runtime**: Investment value, gain/loss, portfolio %
- All timestamps use UTC
- `updated_at` auto-updates via triggers
