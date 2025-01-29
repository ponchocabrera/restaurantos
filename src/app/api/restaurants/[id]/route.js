import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  const { id } = params; // read [id] from the URL
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: Number(id) },
    });
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ restaurant });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch restaurant' },
      { status: 500 }
    );
  }
}

// UPDATE (PUT) - full update example
export async function PUT(request, { params }) {
  const { id } = params;
  try {
    const { name } = await request.json();
    const updated = await prisma.restaurant.update({
      where: { id: Number(id) },
      data: { name },
    });
    return NextResponse.json({ restaurant: updated });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update restaurant' },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    await prisma.restaurant.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Restaurant deleted' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete restaurant' },
      { status: 500 }
    );
  }
}
