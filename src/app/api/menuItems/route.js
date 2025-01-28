import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/menuItems?menuId=123
 * Fetches all items for the specified menu
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      return NextResponse.json(
        { error: 'Missing menuId parameter' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM menu_items WHERE menu_id = $1',
      [menuId]
    );

    return NextResponse.json({ menuItems: result.rows });
  } catch (err) {
    console.error('Error fetching items:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/menuItems
 * Upsert (create or update) a single item
 * - If body.id exists, update
 * - Otherwise, insert new
 */
export async function POST(request) {
  try {
    const { id, menuId, name, description, price, category } =
      await request.json();

    if (!menuId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: menuId, name' },
        { status: 400 }
      );
    }

    if (id) {
      // ----- Update existing item -----
      const updateResult = await query(
        `
          UPDATE menu_items
          SET name = $2, description = $3, price = $4, category = $5
          WHERE id = $1
          RETURNING *
        `,
        [id, name, description, price, category]
      );

      if (updateResult.rowCount === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json({ item: updateResult.rows[0] });
    } else {
      // ----- Insert new item -----
      const insertResult = await query(
        `
          INSERT INTO menu_items (menu_id, name, description, price, category)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `,
        [menuId, name, description || '', price || 0, category || '']
      );

      return NextResponse.json({ item: insertResult.rows[0] }, { status: 201 });
    }
  } catch (err) {
    console.error('Error saving item:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/menuItems?itemId=456
 * Deletes the specified item
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Missing itemId parameter' },
        { status: 400 }
      );
    }

    const deleteResult = await query(
      'DELETE FROM menu_items WHERE id = $1 RETURNING *',
      [itemId]
    );

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting item:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
