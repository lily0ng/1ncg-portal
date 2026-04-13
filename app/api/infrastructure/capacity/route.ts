import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

const CAPACITY_TYPE_NAMES: Record<number, string> = {
  0: 'CPU',
  1: 'Memory',
  2: 'PrimaryStorage',
  3: 'SecondaryStorage',
  4: 'PublicIP',
  5: 'PrivateIP',
};

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listCapacity', { fetchlatest: 'true' });
    const rawCapacities: any[] = data.listcapacityresponse?.capacity ?? [];

    const capacities = rawCapacities.map((c) => ({
      ...c,
      typeName: CAPACITY_TYPE_NAMES[c.type] ?? `Type${c.type}`,
    }));

    const findSummary = (typeId: number) => {
      const items = capacities.filter((c) => c.type === typeId);
      const totalCapacity = items.reduce((sum, c) => sum + (c.capacitytotal ?? 0), 0);
      const totalUsed = items.reduce((sum, c) => sum + (c.capacityused ?? 0), 0);
      const pct = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
      return { totalCapacity, totalUsed, percentUsed: pct };
    };

    const summary = {
      cpu: findSummary(0),
      memory: findSummary(1),
      primaryStorage: findSummary(2),
      secondaryStorage: findSummary(3),
      publicIP: findSummary(4),
    };

    return NextResponse.json({ capacities, summary });
  } catch (error: any) {
    console.error('[GET /api/infrastructure/capacity]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
