import { NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/adminAuth';
import {
  fetchCategoriesFromTiDB,
  createCategoryInTiDB,
  updateCategoryInTiDB,
  deleteCategoryInTiDB,
} from '@/lib/tidb';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categories = await fetchCategoriesFromTiDB({ includeHidden: true });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching admin blog categories:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const created = await createCategoryInTiDB({
      name: body.name.trim(),
      isVisible: body.isVisible !== false,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const id = body.id || body._id;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updated = await updateCategoryInTiDB(id, {
      name: body.name,
      isVisible: body.isVisible,
      order: body.order,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating blog category:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  try {
    const isAuth = await checkAdminAuth(request);
    if (!isAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const result = await deleteCategoryInTiDB(id);
    return NextResponse.json({ success: result.success });
  } catch (error) {
    console.error('Error deleting blog category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
