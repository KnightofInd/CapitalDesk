# Python Scripts

This directory contains Python utilities for CapitalDesk data management.

## Scripts

### 1. `ingest_data.py`
One-time data ingestion script that reads Excel and populates PostgreSQL.

**Usage:**
```bash
# Install dependencies
pip install -r requirements.txt

# Configure database
cp .env.example .env
# Edit .env with your DATABASE_URL

# Run ingestion
python ingest_data.py portfolio_data.xlsx
```

**Excel Format Required:**
- Sheet name: `Holdings`
- Columns (required): Symbol, Company Name, Sector, Exchange, Quantity, Purchase Price
- Columns (optional): Purchase Date, Currency, Notes

### 2. `create_excel_template.py`
Generates a sample Excel file with the correct format.

**Usage:**
```bash
python create_excel_template.py
```

This creates `portfolio_template.xlsx` with:
- Sample data in "Holdings" sheet
- Instructions in "Instructions" sheet

## Installation

### On Windows:
```powershell
# Install Python 3.10+
# https://www.python.org/downloads/

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### On Linux/Mac:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Environment Variables

Create a `.env` file:
```env
DATABASE_URL=postgresql://username:password@host:port/database
```

Example:
```env
DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/capitaldesk
```

## Data Flow

```
Excel File (portfolio_data.xlsx)
    ↓
ingest_data.py (pandas + psycopg2)
    ↓
PostgreSQL Database
    - sectors table
    - stocks table  
    - holdings table
```

## Features

- **Data Normalization**: Symbols uppercase, sectors title case
- **Validation**: Checks required fields, positive quantities/prices
- **Error Handling**: Continues on row errors, reports at end
- **Upsert Logic**: Reuses existing sectors/stocks, adds new holdings
- **Verification**: Post-ingestion summary and statistics

## Notes

- This script runs **once only** for initial data load
- Subsequent updates should use the Next.js admin interface (Phase 8)
- Database schema must be created first (see ../database/README.md)
