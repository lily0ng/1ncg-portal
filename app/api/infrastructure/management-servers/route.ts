import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listManagementServers', {});
    const servers = data.listmanagementserversresponse?.managementserver ?? [];

    return NextResponse.json({ servers });
  } catch (error: any) {
    console.error('[GET /api/infrastructure/management-servers]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
