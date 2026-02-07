-- Sample data for testing (optional)
-- Run this after schema.sql to populate with test data

-- Sample stocks
INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency) VALUES
    ('RELIANCE', 'Reliance Industries Ltd', 1, 'NSE', 'INR'),
    ('TCS', 'Tata Consultancy Services', 1, 'NSE', 'INR'),
    ('HDFCBANK', 'HDFC Bank Ltd', 2, 'NSE', 'INR'),
    ('INFY', 'Infosys Ltd', 1, 'NSE', 'INR'),
    ('ICICIBANK', 'ICICI Bank Ltd', 2, 'NSE', 'INR'),
    ('HINDUNILVR', 'Hindustan Unilever Ltd', 5, 'NSE', 'INR'),
    ('ITC', 'ITC Ltd', 5, 'NSE', 'INR'),
    ('SBIN', 'State Bank of India', 2, 'NSE', 'INR'),
    ('BHARTIARTL', 'Bharti Airtel Ltd', 10, 'NSE', 'INR'),
    ('KOTAKBANK', 'Kotak Mahindra Bank', 2, 'NSE', 'INR');

-- Sample holdings
INSERT INTO holdings (stock_id, quantity, purchase_price, purchase_date, notes) VALUES
    (1, 50, 2450.50, '2025-01-15', 'Bought during dip'),
    (2, 100, 3800.00, '2024-12-10', 'Long term hold'),
    (3, 75, 1650.25, '2025-02-01', 'Banking sector exposure'),
    (4, 120, 1520.00, '2024-11-20', 'IT sector bet'),
    (5, 80, 1080.50, '2025-01-25', 'Financial services'),
    (6, 60, 2680.00, '2024-10-15', 'FMCG stable'),
    (7, 200, 425.75, '2024-09-05', 'Diversification'),
    (8, 150, 620.00, '2025-01-05', 'PSU bank exposure'),
    (9, 90, 1250.50, '2024-12-28', 'Telecom play'),
    (10, 45, 1820.00, '2025-02-03', 'Private bank');

-- Verify data
SELECT 
    s.sector_name,
    COUNT(st.stock_id) as stock_count,
    COUNT(h.holding_id) as holdings_count
FROM sectors s
LEFT JOIN stocks st ON s.sector_id = st.sector_id
LEFT JOIN holdings h ON st.stock_id = h.stock_id
GROUP BY s.sector_id, s.sector_name
ORDER BY holdings_count DESC;
