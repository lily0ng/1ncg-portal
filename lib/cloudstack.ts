import crypto from 'crypto'

const CS_URL     = process.env.CS_URL!
const CS_API_KEY = process.env.CS_API_KEY!
const CS_SECRET  = process.env.CS_SECRET_KEY!

export async function cloudstack(
  command: string,
  params: Record<string, string> = {}
): Promise<any> {
  const all: Record<string, string> = { ...params, command, response: 'json', apikey: CS_API_KEY }

  // Build query string for signature (lowercase keys, sorted, lowercase values)
  const qs = Object.keys(all)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map(k =>
      encodeURIComponent(k).toLowerCase() + '=' +
      encodeURIComponent(all[k]).toLowerCase()
    ).join('&')

  const sig = crypto.createHmac('sha1', CS_SECRET).update(qs).digest('base64')

  // Use POST to avoid 431 Request Header Fields Too Large error
  const formData = new URLSearchParams()
  Object.keys(all).forEach(k => formData.append(k, all[k]))
  formData.append('signature', sig)

  const res = await fetch(`${CS_URL}/client/api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString()
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`CloudStack error: ${res.status} - ${text.slice(0, 200)}`)
  }

  return res.json()
}

export async function pollJob(jobId: string, maxWait = 120000): Promise<any> {
  const start = Date.now()
  while (Date.now() - start < maxWait) {
    const r = await cloudstack('queryAsyncJobResult', { jobid: jobId })
    const job = r.queryasyncjobresultresponse
    if (job.jobstatus === 1) return job.jobresult
    if (job.jobstatus === 2) throw new Error(job.jobresult?.errortext || 'Job failed')
    await new Promise(r => setTimeout(r, 2000))
  }
  throw new Error('Job timeout')
}
