import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET - List all available stocks (catalog/marketplace)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const sector = searchParams.get('sector') || '';

    let sql = `
      SELECT 
        s.stock_id,
        s.symbol,
        s.company_name,
        sec.sector_name,
        s.exchange,
        s.currency,
        CASE 
          WHEN h.stock_id IS NOT NULL THEN true 
          ELSE false 
        END as in_portfolio
      FROM stocks s
      JOIN sectors sec ON s.sector_id = sec.sector_id
      LEFT JOIN holdings h ON s.stock_id = h.stock_id
      WHERE 1=1
    `;

    const params: any[] = [];
    
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (LOWER(s.symbol) LIKE LOWER($${params.length}) OR LOWER(s.company_name) LIKE LOWER($${params.length}))`;
    }

    if (sector) {
      params.push(sector);
      sql += ` AND sec.sector_name = $${params.length}`;
    }

    sql += ' ORDER BY s.symbol';

    const result = await query(sql, params);

    return NextResponse.json({ 
      stocks: result.rows,
      total: result.rows.length 
    });

  } catch (error) {
    console.error('Error fetching stocks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stocks' },
      { status: 500 }
    );
  }
}
