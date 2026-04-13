import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
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

    const data = await cloudstack('listKubernetesClusters', { id: params.id })
    const cluster =
      data.listkubernetesclustersresponse?.kubernetescluster?.[0]

    if (!cluster) {
      return NextResponse.json(
        { error: 'Kubernetes cluster not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(cluster)
  } catch (error: any) {
    console.error('[kubernetes/[id]] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Kubernetes cluster', details: error?.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cloudstack('deleteKubernetesCluster', { id: params.id })
    const jobId = data.deletekubernetesclusterresponse?.jobid
    if (!jobId) {
      return NextResponse.json(
        { error: 'Delete Kubernetes cluster did not return a job ID' },
        { status: 500 }
      )
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[kubernetes/[id]] DELETE error:', error)
    return NextResponse.json(
      { error: 'Failed to delete Kubernetes cluster', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await req.json()
    let data: any
    if (body.action === 'start') {
      data = await cloudstack('startKubernetesCluster', { id: params.id })
    } else if (body.action === 'stop') {
      data = await cloudstack('stopKubernetesCluster', { id: params.id })
    } else {
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
