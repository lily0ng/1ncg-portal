import { NextRequest, NextResponse } from 'next/server'
import { cloudstack } from '@/lib/cloudstack'
import { getAuthUser } from '@/lib/auth'

// In-memory store for comments (in production, use a database)
const commentsStore: Record<string, any[]> = {}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vmId = params.id

    // Get comments for this VM
    const comments = commentsStore[vmId] || []

    // Sort by created date descending
    comments.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())

    return NextResponse.json({ comments, count: comments.length })
  } catch (error: any) {
    console.error('[comments] GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments', comments: [], count: 0 },
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

    const vmId = params.id
    const body = await req.json()
    const { text } = body

    if (!text || !text.trim()) {
      return NextResponse.json({ error: 'Comment text is required' }, { status: 400 })
    }

    // Create new comment
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      username: user.username || user.name || 'Admin',
      account: user.account || user.email,
      domain: user.domain || 'ROOT',
      created: new Date().toISOString(),
      resourceid: vmId,
      resourcetype: 'VirtualMachine',
    }

    // Store comment
    if (!commentsStore[vmId]) {
      commentsStore[vmId] = []
    }
    commentsStore[vmId].push(newComment)

    return NextResponse.json({ comment: newComment, success: true })
  } catch (error: any) {
    console.error('[comments] POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add comment', details: error?.message },
      { status: 500 }
    )
  }
}
