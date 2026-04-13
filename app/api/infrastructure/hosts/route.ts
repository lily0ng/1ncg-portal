import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [hostsData, metricsData] = await Promise.all([
      cloudstack('listHosts', { type: 'Routing' }),
      cloudstack('listHostsMetrics', { type: 'Routing' }),
    ]);

    const hosts: any[] = hostsData.listhostsresponse?.host ?? [];
    const metrics: any[] = metricsData.listhostsmetricsresponse?.host ?? [];

    const metricsMap = new Map<string, any>();
    for (const m of metrics) {
      metricsMap.set(m.id, m);
    }

    const merged = hosts.map((host) => {
      const m = metricsMap.get(host.id);
      if (!m) return host;
      return {
        ...host,
        cpuused: m.cpuused ?? null,
        cpuusedpercent: m.cpuusedpercent ?? null,
        memoryused: m.memoryused ?? null,
        memoryusedpercent: m.memoryusedpercent ?? null,
      };
    });

    return NextResponse.json({ hosts: merged });
  } catch (error: any) {
    console.error('[GET /api/infrastructure/hosts]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
