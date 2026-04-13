import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listOauthProvider', {});
    const providers = data.listoauthproviderresponse?.oauthprovider ?? [];

    return NextResponse.json({ providers });
  } catch (error: any) {
    console.error('[GET /api/configuration/oauth]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { provider, clientid, secretkey, redirecturi, enabled } = body;

    if (!provider || !clientid || !secretkey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const params: Record<string, string> = {
      provider,
      clientid,
      secretkey,
    };
    if (redirecturi) params.redirecturi = redirecturi;
    if (enabled !== undefined) params.enabled = String(enabled);

    const data = await cloudstack('updateOauthProvider', params);
    const result = data.updateoauthproviderresponse?.oauthprovider;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('[POST /api/configuration/oauth]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
