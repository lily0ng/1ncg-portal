import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN' && user.role !== 'RESELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const balances = await db.user.findMany({
      select: { id: true, username: true, email: true, balance: true },
    });

    return NextResponse.json({ balances });
  } catch (error: any) {
    console.error('[GET /api/billing/credits]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN' && user.role !== 'RESELLER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { userId, amount, reason } = body;

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: 'Missing userId or amount' }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { balance: { increment: amount } },
      select: { id: true, username: true, email: true, balance: true },
    });

    return NextResponse.json({ user: updated, reason: reason ?? null });
  } catch (error: any) {
    console.error('[PUT /api/billing/credits]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
