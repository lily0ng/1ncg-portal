import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listStoragePools', {});
    const storagePools = data.liststorагepoolsresponse?.storagepool
      ?? data.liststoragepoolsresponse?.storagepool
      ?? [];

    return NextResponse.json({ storagePools });
  } catch (error: any) {
    console.error('[GET /api/infrastructure/storage-pools]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
