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

    const payments = await db.invoice.findMany({
      where: { status: 'PAID' },
      include: { user: true },
      orderBy: { paidAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error: any) {
    console.error('[GET /api/billing/payments]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
