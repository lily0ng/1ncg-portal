import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listNetworkOfferings', { state: 'Enabled' });
    const offerings = data.listnetworkofferingsresponse?.networkoffering ?? [];

    return NextResponse.json({ offerings });
  } catch (error: any) {
    console.error('[GET /api/service-offerings/network]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, displaytext, traffictype, guestiptype, supportedservices } = body;

    if (!name || !displaytext || !traffictype || !guestiptype || !supportedservices) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await cloudstack('createNetworkOffering', {
      name,
      displaytext,
      traffictype,
      guestiptype,
      supportedservices: Array.isArray(supportedservices)
        ? supportedservices.join(',')
        : supportedservices,
    });

    const offering = data.createnetworkofferingresponse?.networkoffering;
    return NextResponse.json({ offering }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/service-offerings/network]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
