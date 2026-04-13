import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listAlerts', { listall: 'true', pagesize: '100' });
    const alerts = data.listalertsresponse?.alert ?? [];

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('[GET /api/infrastructure/alerts]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
