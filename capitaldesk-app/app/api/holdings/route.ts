import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// POST - Add new holding
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symbol, companyName, sector, quantity, purchasePrice, purchaseDate, exchange = 'NSE' } = body;

    // Validate required fields
    if (!symbol || !companyName || !sector || !quantity || !purchasePrice) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create stock
    let stockResult = await query(
      'SELECT stock_id FROM stocks WHERE symbol = $1',
      [symbol.toUpperCase()]
    );

    let stockId;
    if (stockResult.rows.length === 0) {
      // Get sector_id from sector name
      const sectorResult = await query(
        'SELECT sector_id FROM sectors WHERE LOWER(sector_name) = LOWER($1)',
        [sector]
      );

      if (sectorResult.rows.length === 0) {
        return NextResponse.json(
          { error: `Sector '${sector}' not found` },
          { status: 400 }
        );
      }

      const sectorId = sectorResult.rows[0].sector_id;

      // Create new stock
      const newStock = await query(
        `INSERT INTO stocks (symbol, company_name, sector_id, exchange, currency)
         VALUES ($1, $2, $3, $4, 'INR')
         RETURNING stock_id`,
        [symbol.toUpperCase(), companyName, sectorId, exchange]
      );
      stockId = newStock.rows[0].stock_id;
    } else {
      stockId = stockResult.rows[0].stock_id;
    }

    // Create holding
    const holding = await query(
      `INSERT INTO holdings (stock_id, quantity, purchase_price, purchase_date)
       VALUES ($1, $2, $3, $4)
       RETURNING holding_id`,
      [stockId, quantity, purchasePrice, purchaseDate || new Date().toISOString().split('T')[0]]
    );

    return NextResponse.json({
      success: true,
      holdingId: holding.rows[0].holding_id,
      message: 'Stock added successfully'
    });

  } catch (error) {
    console.error('Error adding holding:', error);
    return NextResponse.json(
      { error: 'Failed to add holding' },
      { status: 500 }
    );
  }
}

// GET - List all holdings (alternative to /api/portfolio)
export async function GET() {
  try {
    const result = await query(`
      SELECT 
        h.holding_id,
        s.symbol,
        s.company_name,
        sec.sector_name,
        h.quantity,
        h.purchase_price,
        h.purchase_date,
        s.exchange
      FROM holdings h
      JOIN stocks s ON h.stock_id = s.stock_id
      JOIN sectors sec ON s.sector_id = sec.sector_id
      ORDER BY sec.sector_name, s.symbol
    `);

    return NextResponse.json({ holdings: result.rows });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch holdings' },
      { status: 500 }
    );
  }
}
