import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/menuItems?menuId=123
 * -> Returns all items from menu_items where menu_id = 123,
 *    including the "menu_id" column in each row.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      // If user doesn't provide menuId, return 400
      return NextResponse.json(
        { error: 'Missing menuId parameter' },
        { status: 400 }
      );
    }

    // Fetch all items that belong to this menu_id
    const result = await query(
      'SELECT * FROM menu_items WHERE menu_id = $1 ORDER BY id ASC',
      [menuId]
    );

    // Return them as JSON
    return NextResponse.json({ menuItems: result.rows });
  } catch (err) {
    console.error('Error fetching menu items:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/menuItems
 * Create or update (upsert) a single item in the menu_items table.
 * 
 * Example JSON body:
 * {
 *   "id": 16,             // optional; if present we update instead of insert
 *   "menuId": 10,         // required
 *   "name": "Burger",
 *   "description": "Tasty burger",
 *   "price": 8.99,
 *   "category": "Main",
 *   "image_url": ""
 * }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      id,
      menuId,
      name,
      description = '',
      price = 0,
      category = '',
      image_url = '',
    } = body;

    // Basic validation
    if (!menuId || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: menuId or name' },
        { status: 400 }
      );
    }

    if (id) {
      // ----- UPDATE existing item -----
      const updateResult = await query(
        `
          UPDATE menu_items
          SET name = $2, description = $3, price = $4, category = $5, image_url = $6
          WHERE id = $1
          RETURNING *
        `,
        [id, name, description, price, category, image_url]
      );

      if (updateResult.rowCount === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      return NextResponse.json({ item: updateResult.rows[0] });
    } else {
      // ----- INSERT new item -----
      const insertResult = await query(
        `
          INSERT INTO menu_items (menu_id, name, description, price, category, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `,
        [menuId, name, description, price, category, image_url]
      );

      return NextResponse.json({ item: insertResult.rows[0] }, { status: 201 });
    }
  } catch (err) {
    console.error('Error creating/updating menu item:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/menuItems?itemId=16
 * -> Deletes a single item in menu_items with id=16.
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
    console.error('Error deleting menu item:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
