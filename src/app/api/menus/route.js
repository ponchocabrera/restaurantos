import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * GET /api/menus
 * If ?restaurantId=123 is provided, filter by that restaurant.
 * Otherwise, return all menus.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (restaurantId) {
      // If restaurantId is provided, return only that restaurant's menus
      const result = await query(
        'SELECT * FROM menus WHERE restaurant_id = $1',
        [restaurantId]
      );
      return NextResponse.json({ menus: result.rows });
    } else {
      // No restaurantId? Return ALL menus
      const result = await query('SELECT * FROM menus');
      return NextResponse.json({ menus: result.rows });
    }
  } catch (err) {
    console.error('Error fetching menus:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/menus
 * Upsert (create or update) a menu:
 * - If body.id exists, update the menu
 * - Otherwise, insert a new menu
 */
export async function POST(request) {
  try {
    const { id, restaurantId, name, templateId } = await request.json();

    if (!restaurantId || !name || !templateId) {
      return NextResponse.json(
        {
          error: 'Missing required fields: restaurantId, name, or templateId',
        },
        { status: 400 }
      );
    }

    if (id) {
      // ----- Update existing menu -----
      const updateResult = await query(
        `
          UPDATE menus
          SET name = $2, template_id = $3
          WHERE id = $1
          RETURNING *
        `,
        [id, name, templateId]
      );

      if (updateResult.rowCount === 0) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      return NextResponse.json({ menu: updateResult.rows[0] });
    } else {
      // ----- Insert new menu -----
      const insertResult = await query(
        `
          INSERT INTO menus (restaurant_id, name, template_id)
          VALUES ($1, $2, $3)
          RETURNING *
        `,
        [restaurantId, name, templateId]
      );

      return NextResponse.json({ menu: insertResult.rows[0] }, { status: 201 });
    }
  } catch (err) {
    console.error('Error upserting menu:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/menus?menuId=123
 * Deletes the specified menu
 */
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      return NextResponse.json(
        { error: 'Missing menuId parameter' },
        { status: 400 }
      );
    }

    const deleteResult = await query(
      'DELETE FROM menus WHERE id = $1 RETURNING *',
      [menuId]
    );

    if (deleteResult.rowCount === 0) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error deleting menu:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
