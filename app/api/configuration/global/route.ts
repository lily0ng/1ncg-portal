import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') ?? '';
    const categoryFilter = searchParams.get('category') ?? '';

    const params: Record<string, string> = { pagesize: '200' };
    if (keyword) params.keyword = keyword;

    const data = await cloudstack('listConfigurations', params);
    const configurations: any[] = data.listconfigurationsresponse?.configuration ?? [];

    // Filter by category if provided
    const filtered = categoryFilter
      ? configurations.filter(
          (c) => (c.category ?? '').toLowerCase() === categoryFilter.toLowerCase(),
        )
      : configurations;

    // Group by category
    const grouped: Record<string, any[]> = {};
    for (const config of filtered) {
      const cat = config.category ?? 'Uncategorized';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(config);
    }

    return NextResponse.json({ configurations: filtered, grouped });
  } catch (error: any) {
    console.error('[GET /api/configuration/global]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { name, value } = body;
    if (!name || value === undefined) {
      return NextResponse.json({ error: 'Missing name or value' }, { status: 400 });
    }

    const data = await cloudstack('updateConfiguration', { name, value: String(value) });
    const result = data.updateconfigurationresponse?.configuration;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('[PUT /api/configuration/global]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
