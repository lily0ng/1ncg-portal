import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listDiskOfferings', {});
    const offerings = data.listdiskofferingsresponse?.diskoffering ?? [];

    return NextResponse.json({ offerings });
  } catch (error: any) {
    console.error('[GET /api/service-offerings/disk]', error);
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
    const { name, displaytext, disksize, storagetype } = body;

    if (!name || !displaytext) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const params: Record<string, string> = { name, displaytext };
    if (disksize !== undefined) params.disksize = String(disksize);
    if (storagetype) params.storagetype = storagetype;

    const data = await cloudstack('createDiskOffering', params);
    const offering = data.creatediskofferingresponse?.diskoffering;

    return NextResponse.json({ offering }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/service-offerings/disk]', error);
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

    const data = await cloudstack('deleteDiskOffering', { id });
    const result = data.deletediskofferingresponse;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('[DELETE /api/service-offerings/disk]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
