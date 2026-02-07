"""
Excel Template Generator for CapitalDesk
Creates a sample Excel file with the correct format for data ingestion

Usage: python create_excel_template.py
"""

import pandas as pd
from datetime import datetime, timedelta

# Sample portfolio data
sample_data = {
    'Symbol': ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'ITC', 'SBIN', 'HINDUNILVR'],
    'Company Name': [
        'Reliance Industries Ltd',
        'Tata Consultancy Services',
        'HDFC Bank Ltd',
        'Infosys Ltd',
        'ICICI Bank Ltd',
        'ITC Ltd',
        'State Bank of India',
        'Hindustan Unilever Ltd'
    ],
    'Sector': ['Energy', 'Technology', 'Finance', 'Technology', 'Finance', 'Consumer', 'Finance', 'Consumer'],
    'Exchange': ['NSE', 'NSE', 'NSE', 'NSE', 'NSE', 'NSE', 'NSE', 'NSE'],
    'Quantity': [50, 100, 75, 120, 80, 200, 150, 60],
    'Purchase Price': [2450.50, 3800.00, 1650.25, 1520.00, 1080.50, 425.75, 620.00, 2680.00],
    'Purchase Date': [
        '2025-01-15',
        '2024-12-10',
        '2025-02-01',
        '2024-11-20',
        '2025-01-25',
        '2024-09-05',
        '2025-01-05',
        '2024-10-15'
    ],
    'Currency': ['INR'] * 8,
    'Notes': [
        'Bought during dip',
        'Long term hold',
        'Banking sector exposure',
        'IT sector bet',
        'Financial services',
        'Diversification',
        'PSU bank exposure',
        'FMCG stable'
    ]
}

# Create DataFrame
df = pd.DataFrame(sample_data)

# Calculate investment value for reference
df['Investment Value'] = df['Quantity'] * df['Purchase Price']

# Write to Excel with formatting
output_file = 'portfolio_template.xlsx'

with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    # Write main data
    df.to_excel(writer, sheet_name='Holdings', index=False)
    
    # Get workbook and worksheet
    workbook = writer.book
    worksheet = writer.sheets['Holdings']
    
    # Auto-adjust column widths
    for idx, col in enumerate(df.columns):
        max_length = max(
            df[col].astype(str).map(len).max(),
            len(col)
        )
        worksheet.column_dimensions[chr(65 + idx)].width = max_length + 2
    
    # Create instructions sheet
    instructions = pd.DataFrame({
        'Column Name': ['Symbol', 'Company Name', 'Sector', 'Exchange', 'Quantity', 'Purchase Price', 'Purchase Date', 'Currency', 'Notes'],
        'Required': ['Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'Yes', 'No', 'No', 'No'],
        'Description': [
            'Stock ticker symbol (e.g., RELIANCE, TCS)',
            'Full company name',
            'Market sector (e.g., Technology, Finance, Energy)',
            'Stock exchange code (NSE, BSE, NYSE, NASDAQ)',
            'Number of shares owned (must be > 0)',
            'Average purchase price per share (must be > 0)',
            'Date of purchase (YYYY-MM-DD format)',
            'Currency code (default: INR)',
            'Optional notes about the holding'
        ],
        'Example': [
            'RELIANCE',
            'Reliance Industries Ltd',
            'Energy',
            'NSE',
            '50',
            '2450.50',
            '2025-01-15',
            'INR',
            'Bought during dip'
        ]
    })
    
    instructions.to_excel(writer, sheet_name='Instructions', index=False)
    
    # Format instructions sheet
    inst_sheet = writer.sheets['Instructions']
    for idx, col in enumerate(instructions.columns):
        max_length = max(
            instructions[col].astype(str).map(len).max(),
            len(col)
        )
        inst_sheet.column_dimensions[chr(65 + idx)].width = max_length + 2

print(f"✅ Excel template created: {output_file}")
print(f"📊 Contains {len(df)} sample holdings")
print(f"💰 Total sample investment: ₹{df['Investment Value'].sum():,.2f}")
print("\nTo use this template:")
print("1. Replace sample data with your actual holdings")
print("2. Keep the 'Holdings' sheet name unchanged")
print("3. Ensure required columns are filled")
print("4. Run: python ingest_data.py portfolio_template.xlsx")
