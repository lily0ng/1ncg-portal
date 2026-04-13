import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cloudstack('getKubernetesClusterConfig', {
      id: params.id,
    })

    return NextResponse.json({
      config: data.getkubernetesclusterconfigresponse?.clusterconfig,
    })
  } catch (error: any) {
    console.error('[kubernetes/[id]/config] GET error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch Kubernetes cluster config',
        details: error?.message,
      },
      { status: 500 }
    )
  }
}
