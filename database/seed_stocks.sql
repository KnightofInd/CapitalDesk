-- Seed Popular Indian Stocks (NSE)
-- This adds commonly traded stocks so users can browse and add them easily

-- Technology Sector Stocks
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('TCS', 'Tata Consultancy Services', (SELECT sector_id FROM sectors WHERE sector_name = 'Technology'), 'NSE', 'INR'),
('INFY', 'Infosys Limited', (SELECT sector_id FROM sectors WHERE sector_name = 'Technology'), 'NSE', 'INR'),
('WIPRO', 'Wipro Limited', (SELECT sector_id FROM sectors WHERE sector_name = 'Technology'), 'NSE', 'INR'),
('HCLTECH', 'HCL Technologies', (SELECT sector_id FROM sectors WHERE sector_name = 'Technology'), 'NSE', 'INR'),
('TECHM', 'Tech Mahindra', (SELECT sector_id FROM sectors WHERE sector_name = 'Technology'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;

-- Finance Sector Stocks
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('HDFCBANK', 'HDFC Bank', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('ICICIBANK', 'ICICI Bank', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('SBIN', 'State Bank of India', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('AXISBANK', 'Axis Bank', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('KOTAKBANK', 'Kotak Mahindra Bank', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('BAJFINANCE', 'Bajaj Finance', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('HDFCLIFE', 'HDFC Life Insurance', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('SBILIFE', 'SBI Life Insurance', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;

-- Energy Sector Stocks
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('RELIANCE', 'Reliance Industries', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR'),
('ONGC', 'Oil & Natural Gas Corporation', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR'),
('IOC', 'Indian Oil Corporation', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR'),
('BPCL', 'Bharat Petroleum', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR'),
('NTPC', 'NTPC Limited', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR'),
('POWERGRID', 'Power Grid Corporation', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR'),
('ADANIGREEN', 'Adani Green Energy', (SELECT sector_id FROM sectors WHERE sector_name = 'Energy'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;

-- Consumer Goods Sector
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('HINDUNILVR', 'Hindustan Unilever', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR'),
('ITC', 'ITC Limited', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR'),
('NESTLEIND', 'Nestle India', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR'),
('BRITANNIA', 'Britannia Industries', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR'),
('DABUR', 'Dabur India', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR'),
('MARICO', 'Marico Limited', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR'),
('TITAN', 'Titan Company', (SELECT sector_id FROM sectors WHERE sector_name = 'Consumer'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;

-- Healthcare/Pharma Sector
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('SUNPHARMA', 'Sun Pharmaceutical', (SELECT sector_id FROM sectors WHERE sector_name = 'Healthcare'), 'NSE', 'INR'),
('DRREDDY', 'Dr. Reddy''s Laboratories', (SELECT sector_id FROM sectors WHERE sector_name = 'Healthcare'), 'NSE', 'INR'),
('CIPLA', 'Cipla Limited', (SELECT sector_id FROM sectors WHERE sector_name = 'Healthcare'), 'NSE', 'INR'),
('APOLLOHOSP', 'Apollo Hospitals', (SELECT sector_id FROM sectors WHERE sector_name = 'Healthcare'), 'NSE', 'INR'),
('DIVISLAB', 'Divi''s Laboratories', (SELECT sector_id FROM sectors WHERE sector_name = 'Healthcare'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;

-- Industrial Sector
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('LT', 'Larsen & Toubro', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('BHARTIARTL', 'Bharti Airtel', (SELECT sector_id FROM sectors WHERE sector_name = 'Telecommunications'), 'NSE', 'INR'),
('M&M', 'Mahindra & Mahindra', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('TATAMOTORS', 'Tata Motors', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('TATASTEEL', 'Tata Steel', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR'),
('HINDALCO', 'Hindalco Industries', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR'),
('ULTRACEMCO', 'UltraTech Cement', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR'),
('ASIANPAINT', 'Asian Paints', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;

-- Additional Popular Stocks
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
('BAJAJFINSV', 'Bajaj Finserv', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('MARUTI', 'Maruti Suzuki', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('ADANIENT', 'Adani Enterprises', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('ADANIPORTS', 'Adani Ports', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('JSWSTEEL', 'JSW Steel', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR'),
('INDUSINDBK', 'IndusInd Bank', (SELECT sector_id FROM sectors WHERE sector_name = 'Finance'), 'NSE', 'INR'),
('COALINDIA', 'Coal India', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR'),
('EICHERMOT', 'Eicher Motors', (SELECT sector_id FROM sectors WHERE sector_name = 'Industrial'), 'NSE', 'INR'),
('GRASIM', 'Grasim Industries', (SELECT sector_id FROM sectors WHERE sector_name = 'Materials'), 'NSE', 'INR')
ON CONFLICT (symbol) DO NOTHING;
