import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/menus?restaurantId=1
// -> Returns all menus for a given restaurant
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Missing parameter: restaurantId' },
        { status: 400 }
      );
    }

    // Real DB query to fetch all menus for the restaurant
    const result = await query(
      'SELECT * FROM menus WHERE restaurant_id = $1',
      [restaurantId]
    );

    return NextResponse.json({ menus: result.rows });
  } catch (err) {
    console.error('Error fetching menus:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/menus
// -> Create or update (upsert) a menu
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, restaurantId, name, templateId } = body;

    // Validate
    if (!restaurantId || !name || !templateId) {
      return NextResponse.json(
        {
          error: 'Missing required fields: restaurantId, name, or templateId',
        },
        { status: 400 }
      );
    }

    if (id) {
      // ----- UPDATE an existing menu -----
      const updateResult = await query(
        `UPDATE menus
         SET name = $2, template_id = $3
         WHERE id = $1
         RETURNING *`,
        [id, name, templateId]
      );

      if (updateResult.rowCount === 0) {
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
      }

      return NextResponse.json({ menu: updateResult.rows[0] });
    } else {
      // ----- INSERT a new menu -----
      const insertResult = await query(
        `INSERT INTO menus (restaurant_id, name, template_id)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [restaurantId, name, templateId]
      );

      return NextResponse.json(
        { menu: insertResult.rows[0] },
        { status: 201 }
      );
    }
  } catch (err) {
    console.error('Error upserting menu:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
