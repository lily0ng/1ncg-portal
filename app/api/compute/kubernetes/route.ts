import { NextRequest, NextResponse } from 'next/server'
import { cloudstack, pollJob } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let params: Record<string, string> = {}
    if (user.role === 'ADMIN') {
      params = { listall: 'true' }
    } else if (user.role === 'RESELLER') {
      params = { domainid: user.domainId, isrecursive: 'true' }
    } else {
      params = { account: user.account, domainid: user.domainId }
    }

    const data = await cloudstack('listKubernetesClusters', params)
    return NextResponse.json(
      data.listkubernetesclustersresponse?.kubernetescluster || []
    )
  } catch (error: any) {
    console.error('[kubernetes] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Kubernetes clusters', details: error?.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name,
      zoneid,
      kubernetesversionid,
      serviceofferingid,
      networkid,
      size,
      masternodes,
    } = body

    if (!name || !zoneid || !kubernetesversionid || !serviceofferingid) {
      return NextResponse.json(
        {
          error:
            'name, zoneid, kubernetesversionid, and serviceofferingid are required',
        },
        { status: 400 }
      )
    }

    const clusterParams: Record<string, string> = {
      name,
      zoneid,
      kubernetesversionid,
      serviceofferingid,
    }
    if (networkid) clusterParams.networkid = networkid
    if (size) clusterParams.size = String(size)
    if (masternodes) clusterParams.masternodes = String(masternodes)

    if (user.role !== 'ADMIN') {
      clusterParams.account = user.account
      clusterParams.domainid = user.domainId
    }

    const data = await cloudstack('createKubernetesCluster', clusterParams)
    const jobId = data.createkubernetesclusterresponse?.jobid
    if (!jobId) {
      return NextResponse.json(
        { error: 'Create Kubernetes cluster did not return a job ID' },
        { status: 500 }
      )
    }

    const result = await pollJob(jobId)
    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error('[kubernetes] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to create Kubernetes cluster', details: error?.message },
      { status: 500 }
    )
  }
}
