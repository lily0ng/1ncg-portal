import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listServiceOfferings', { issystem: 'false' });
    const offerings = data.listserviceofferingsresponse?.serviceoffering ?? [];

    return NextResponse.json({ offerings });
  } catch (error: any) {
    console.error('[GET /api/service-offerings/compute]', error);
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
    const { name, displaytext, cpunumber, cpuspeed, memory } = body;

    if (!name || !displaytext || !cpunumber || !cpuspeed || !memory) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const data = await cloudstack('createServiceOffering', {
      name,
      displaytext,
      cpunumber: String(cpunumber),
      cpuspeed: String(cpuspeed),
      memory: String(memory),
    });

    const offering = data.createserviceofferingresponse?.serviceoffering;
    return NextResponse.json({ offering }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/service-offerings/compute]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing id query parameter' }, { status: 400 });
    }

    const data = await cloudstack('deleteServiceOffering', { id });
    const result = data.deleteserviceofferingresponse;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('[DELETE /api/service-offerings/compute]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
