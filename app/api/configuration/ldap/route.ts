import { NextRequest, NextResponse } from 'next/server';
import { cloudstack } from '@/lib/cloudstack';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await cloudstack('listLdapConfigurations', {});
    const configs = data.listldapconfigurationsresponse?.LdapConfiguration ?? [];

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error('[GET /api/configuration/ldap]', error);
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
    const { hostname, port, ...rest } = body;

    if (!hostname || !port) {
      return NextResponse.json({ error: 'Missing hostname or port' }, { status: 400 });
    }

    const params: Record<string, string> = { hostname, port: String(port) };
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined && v !== null) params[k] = String(v);
    }

    const data = await cloudstack('addLdapConfiguration', params);
    const result = data.addldapconfigurationresponse?.ldapconfiguration;

    return NextResponse.json({ result }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/configuration/ldap]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const { hostname } = body;
    if (!hostname) {
      return NextResponse.json({ error: 'Missing hostname' }, { status: 400 });
    }

    const data = await cloudstack('deleteLdapConfiguration', { hostname });
    const result = data.deleteldapconfigurationresponse;

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('[DELETE /api/configuration/ldap]', error);
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 });
  }
}
