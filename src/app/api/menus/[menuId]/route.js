import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/menus/[menuId]
// -> Returns the single menu with ID = menuId
export async function GET(request, { params }) {
  try {
    const { menuId } = params; // from the URL, e.g. /api/menus/10

    // Query the DB for one menu with id=menuId
    const result = await query('SELECT * FROM menus WHERE id = $1', [menuId]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ menu: result.rows[0] });
  } catch (err) {
    console.error('Error fetching single menu:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT /api/menus/[menuId]
// -> Update an existing menu with ID = menuId
export async function PUT(request, { params }) {
  try {
    const { menuId } = params; // from /api/menus/10
    const body = await request.json();
    const { name, templateId } = body;

    // Basic validation
    if (!name || !templateId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, templateId' },
        { status: 400 }
      );
    }

    // Update the menu in DB
    const updateResult = await query(
      `
        UPDATE menus
        SET name = $2, template_id = $3
        WHERE id = $1
        RETURNING *
      `,
      [menuId, name, templateId]
    );

    if (updateResult.rowCount === 0) {
      return NextResponse.json({ error: 'Menu not found' }, { status: 404 });
    }

    return NextResponse.json({ menu: updateResult.rows[0] });
  } catch (err) {
    console.error('Error updating menu:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/menus/[menuId]
// -> Delete an existing menu with ID = menuId
export async function DELETE(request, { params }) {
  try {
    const { menuId } = params;

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
