"""
CapitalDesk - One-Time Data Ingestion Script
Reads Excel file with portfolio data and loads into PostgreSQL

Usage:
    python ingest_data.py portfolio_data.xlsx

Excel Format Expected:
    - Sheet: 'Holdings'
    - Columns: Symbol, Company Name, Sector, Exchange, Quantity, Purchase Price, Purchase Date, Notes
"""

import sys
import os
from datetime import datetime
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")


def normalize_symbol(symbol):
    """Normalize stock symbol (uppercase, trim whitespace)"""
    if pd.isna(symbol):
        return None
    return str(symbol).strip().upper()


def normalize_sector(sector):
    """Normalize sector name (title case, trim whitespace)"""
    if pd.isna(sector):
        return 'Other'
    return str(sector).strip().title()


def normalize_exchange(exchange):
    """Normalize exchange code (uppercase)"""
    if pd.isna(exchange):
        return 'NSE'  # Default
    return str(exchange).strip().upper()


def get_db_connection():
    """Create database connection"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        sys.exit(1)


def get_or_create_sector(cursor, sector_name):
    """Get sector_id or create new sector"""
    # Check if sector exists
    cursor.execute(
        "SELECT sector_id FROM sectors WHERE sector_name = %s",
        (sector_name,)
    )
    result = cursor.fetchone()
    
    if result:
        return result[0]
    
    # Create new sector
    cursor.execute(
        "INSERT INTO sectors (sector_name, description) VALUES (%s, %s) RETURNING sector_id",
        (sector_name, f"Auto-imported sector: {sector_name}")
    )
    return cursor.fetchone()[0]


def get_or_create_stock(cursor, symbol, company_name, sector_id, exchange, currency='INR'):
    """Get stock_id or create new stock"""
    # Check if stock exists
    cursor.execute(
        "SELECT stock_id FROM stocks WHERE symbol = %s",
        (symbol,)
    )
    result = cursor.fetchone()
    
    if result:
        return result[0]
    
    # Create new stock
    cursor.execute(
        """
        INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency)
        VALUES (%s, %s, %s, %s, %s)
        RETURNING stock_id
        """,
        (symbol, company_name, sector_id, exchange, currency)
    )
    return cursor.fetchone()[0]


def load_excel_data(file_path):
    """Load and validate Excel data"""
    print(f"📂 Reading Excel file: {file_path}")
    
    try:
        df = pd.read_excel(file_path, sheet_name='Holdings')
    except Exception as e:
        print(f"❌ Failed to read Excel file: {e}")
        sys.exit(1)
    
    # Required columns
    required_cols = ['Symbol', 'Company Name', 'Sector', 'Exchange', 'Quantity', 'Purchase Price']
    missing_cols = [col for col in required_cols if col not in df.columns]
    
    if missing_cols:
        print(f"❌ Missing required columns: {missing_cols}")
        sys.exit(1)
    
    print(f"✅ Found {len(df)} rows")
    return df


def clean_dataframe(df):
    """Clean and normalize dataframe"""
    print("🧹 Cleaning and normalizing data...")
    
    # Normalize symbols, sectors, exchanges
    df['Symbol'] = df['Symbol'].apply(normalize_symbol)
    df['Sector'] = df['Sector'].apply(normalize_sector)
    df['Exchange'] = df['Exchange'].apply(normalize_exchange)
    
    # Remove rows with missing critical data
    df = df.dropna(subset=['Symbol', 'Company Name', 'Quantity', 'Purchase Price'])
    
    # Convert types
    df['Quantity'] = pd.to_numeric(df['Quantity'], errors='coerce')
    df['Purchase Price'] = pd.to_numeric(df['Purchase Price'], errors='coerce')
    
    # Remove invalid rows
    df = df[df['Quantity'] > 0]
    df = df[df['Purchase Price'] > 0]
    
    # Handle optional columns
    if 'Purchase Date' not in df.columns:
        df['Purchase Date'] = None
    if 'Notes' not in df.columns:
        df['Notes'] = None
    if 'Currency' not in df.columns:
        df['Currency'] = 'INR'
    
    print(f"✅ {len(df)} valid rows after cleaning")
    return df


def ingest_data(df):
    """Insert data into PostgreSQL"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("💾 Inserting data into database...")
    
    inserted_stocks = 0
    inserted_holdings = 0
    errors = []
    
    try:
        for idx, row in df.iterrows():
            try:
                # Get or create sector
                sector_id = get_or_create_sector(cursor, row['Sector'])
                
                # Get or create stock
                stock_id = get_or_create_stock(
                    cursor,
                    row['Symbol'],
                    row['Company Name'],
                    sector_id,
                    row['Exchange'],
                    row.get('Currency', 'INR')
                )
                inserted_stocks += 1
                
                # Insert holding
                cursor.execute(
                    """
                    INSERT INTO holdings (stock_id, quantity, purchase_price, purchase_date, notes)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        stock_id,
                        float(row['Quantity']),
                        float(row['Purchase Price']),
                        row.get('Purchase Date'),
                        row.get('Notes')
                    )
                )
                inserted_holdings += 1
                
            except Exception as e:
                error_msg = f"Row {idx + 2} ({row['Symbol']}): {str(e)}"
                errors.append(error_msg)
                print(f"⚠️  {error_msg}")
        
        # Commit transaction
        conn.commit()
        
        print("\n✅ Data ingestion complete!")
        print(f"   📊 Stocks processed: {inserted_stocks}")
        print(f"   💼 Holdings inserted: {inserted_holdings}")
        
        if errors:
            print(f"\n⚠️  {len(errors)} errors occurred:")
            for error in errors[:5]:  # Show first 5 errors
                print(f"   - {error}")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Fatal error during ingestion: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()


def verify_data():
    """Verify inserted data"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print("\n📋 Data Verification:")
    
    # Count sectors
    cursor.execute("SELECT COUNT(*) FROM sectors")
    print(f"   Sectors: {cursor.fetchone()[0]}")
    
    # Count stocks
    cursor.execute("SELECT COUNT(*) FROM stocks")
    print(f"   Stocks: {cursor.fetchone()[0]}")
    
    # Count holdings
    cursor.execute("SELECT COUNT(*) FROM holdings")
    print(f"   Holdings: {cursor.fetchone()[0]}")
    
    # Show portfolio summary
    cursor.execute("""
        SELECT 
            sec.sector_name,
            COUNT(DISTINCT h.holding_id) as holdings_count,
            SUM(h.quantity * h.purchase_price) as total_investment
        FROM holdings h
        JOIN stocks st ON h.stock_id = st.stock_id
        JOIN sectors sec ON st.sector_id = sec.sector_id
        GROUP BY sec.sector_name
        ORDER BY total_investment DESC
    """)
    
    print("\n   Portfolio by Sector:")
    for row in cursor.fetchall():
        print(f"   - {row[0]}: {row[1]} holdings, ₹{row[2]:,.2f} invested")
    
    cursor.close()
    conn.close()


def main():
    """Main execution"""
    if len(sys.argv) < 2:
        print("Usage: python ingest_data.py <excel_file_path>")
        print("Example: python ingest_data.py portfolio_data.xlsx")
        sys.exit(1)
    
    excel_file = sys.argv[1]
    
    if not os.path.exists(excel_file):
        print(f"❌ File not found: {excel_file}")
        sys.exit(1)
    
    print("=" * 60)
    print("CapitalDesk - Data Ingestion Script")
    print("=" * 60)
    
    # Load and clean data
    df = load_excel_data(excel_file)
    df = clean_dataframe(df)
    
    # Preview data
    print("\n📊 Data Preview (first 5 rows):")
    print(df[['Symbol', 'Company Name', 'Sector', 'Quantity', 'Purchase Price']].head())
    
    # Confirm before proceeding
    response = input("\n⚠️  Proceed with data ingestion? (yes/no): ")
    if response.lower() not in ['yes', 'y']:
        print("❌ Ingestion cancelled")
        sys.exit(0)
    
    # Ingest data
    ingest_data(df)
    
    # Verify
    verify_data()
    
    print("\n" + "=" * 60)
    print("✅ Script completed successfully!")
    print("=" * 60)


if __name__ == "__main__":
    main()
