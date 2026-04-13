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

    const data = await cloudstack('getVMPassword', { id: params.id })
    const password = data.getvmpasswordresponse?.password?.encryptedpassword

    return NextResponse.json({ password: password || null })
  } catch (error: any) {
    console.error('[password] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to get VM password', details: error?.message },
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
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await cloudstack('resetPasswordForVirtualMachine', { id: params.id })
    const responseKey = 'resetpasswordforvirtualmachineresponse'
    const jobId = data[responseKey]?.jobid

    if (jobId) {
      const result = await pollJob(jobId)
      const password = result?.jobresult?.virtualmachine?.password
      return NextResponse.json({ password: password || null, success: true })
    }

    const password = data[responseKey]?.virtualmachine?.password
    return NextResponse.json({ password: password || null, success: true })
  } catch (error: any) {
    console.error('[password] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password', details: error?.message },
      { status: 500 }
    )
  }
}
