-- CapitalDesk Database Schema
-- PostgreSQL 12+

-- Drop tables if they exist (for clean re-creation)
DROP TABLE IF EXISTS holdings CASCADE;
DROP TABLE IF EXISTS stocks CASCADE;
DROP TABLE IF EXISTS sectors CASCADE;

-- Sectors table
CREATE TABLE sectors (
    sector_id SERIAL PRIMARY KEY,
    sector_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stocks table
CREATE TABLE stocks (
    stock_id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    sector_id INTEGER NOT NULL REFERENCES sectors(sector_id) ON DELETE RESTRICT,
    exchange VARCHAR(20) NOT NULL, -- NSE, BSE, NYSE, NASDAQ, etc.
    currency VARCHAR(10) DEFAULT 'INR',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Holdings table (user's portfolio positions)
CREATE TABLE holdings (
    holding_id SERIAL PRIMARY KEY,
    stock_id INTEGER NOT NULL REFERENCES stocks(stock_id) ON DELETE CASCADE,
    quantity DECIMAL(15, 4) NOT NULL CHECK (quantity > 0),
    purchase_price DECIMAL(15, 2) NOT NULL CHECK (purchase_price > 0),
    purchase_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_stocks_sector_id ON stocks(sector_id);
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_holdings_stock_id ON holdings(stock_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to auto-update updated_at
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stocks_updated_at BEFORE UPDATE ON stocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holdings_updated_at BEFORE UPDATE ON holdings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default sectors
INSERT INTO sectors (sector_name, description) VALUES
    ('Technology', 'Information technology and software companies'),
    ('Finance', 'Banks, insurance, and financial services'),
    ('Healthcare', 'Pharmaceuticals and healthcare services'),
    ('Energy', 'Oil, gas, and renewable energy companies'),
    ('Consumer', 'Consumer goods and retail companies'),
    ('Industrial', 'Manufacturing and industrial companies'),
    ('Real Estate', 'Real estate and property companies'),
    ('Materials', 'Mining, metals, and raw materials'),
    ('Utilities', 'Electric, gas, and water utilities'),
    ('Telecommunications', 'Telecom and communication services');

-- Add comments for documentation
COMMENT ON TABLE sectors IS 'Market sectors for stock classification';
COMMENT ON TABLE stocks IS 'Stock master data - no live prices stored here';
COMMENT ON TABLE holdings IS 'User portfolio holdings with purchase prices and quantities';
COMMENT ON COLUMN holdings.quantity IS 'Number of shares held';
COMMENT ON COLUMN holdings.purchase_price IS 'Average purchase price per share';
