import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/restaurants -> Returns all restaurants
export async function GET() {
  try {
    const result = await query('SELECT * FROM restaurants', []);
    return NextResponse.json({ restaurants: result.rows });
  } catch (err) {
    console.error('Error fetching restaurants:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/restaurants -> Creates a new restaurant
// Expects { "restaurantName": "..." } in the request body
export async function POST(request) {
  try {
    const { restaurantName } = await request.json();

    // Basic validation
    if (!restaurantName) {
      return NextResponse.json(
        { error: 'restaurantName is required' },
        { status: 400 }
      );
    }

    // Insert into DB, using a `name` column
    const insertResult = await query(
      `
        INSERT INTO restaurants (name)
        VALUES ($1)
        RETURNING *
      `,
      [restaurantName]
    );

    return NextResponse.json(
      { restaurant: insertResult.rows[0] },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating restaurant:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


