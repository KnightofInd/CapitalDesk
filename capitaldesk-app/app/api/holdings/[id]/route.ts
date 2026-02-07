import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// PUT - Update existing holding
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const holdingId = params.id;
    const body = await request.json();
    const { quantity, purchasePrice, purchaseDate } = body;

    if (!quantity || !purchasePrice) {
      return NextResponse.json(
        { error: 'Quantity and purchase price are required' },
        { status: 400 }
      );
    }

    await query(
      `UPDATE holdings 
       SET quantity = $1, purchase_price = $2, purchase_date = $3
       WHERE holding_id = $4`,
      [quantity, purchasePrice, purchaseDate, holdingId]
    );

    return NextResponse.json({
      success: true,
      message: 'Holding updated successfully'
    });

  } catch (error) {
    console.error('Error updating holding:', error);
    return NextResponse.json(
      { error: 'Failed to update holding' },
      { status: 500 }
    );
  }
}

// DELETE - Remove holding
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const holdingId = params.id;

    await query(
      'DELETE FROM holdings WHERE holding_id = $1',
      [holdingId]
    );

    return NextResponse.json({
      success: true,
      message: 'Holding deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting holding:', error);
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    );
  }
}
