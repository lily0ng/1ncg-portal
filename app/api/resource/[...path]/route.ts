import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Construct the file path from the URL path segments
    const filePath = join(process.cwd(), 'resource', ...params.path)
    
    // Security check: ensure the path is within the resource directory
    const resourceDir = join(process.cwd(), 'resource')
    if (!filePath.startsWith(resourceDir)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
    
    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('Not Found', { status: 404 })
    }
    
    // Read the file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type based on file extension
    const ext = filePath.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'
    
    switch (ext) {
      case 'png':
        contentType = 'image/png'
        break
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg'
        break
      case 'gif':
        contentType = 'image/gif'
        break
      case 'svg':
        contentType = 'image/svg+xml'
        break
      case 'ico':
        contentType = 'image/x-icon'
        break
      case 'css':
        contentType = 'text/css'
        break
      case 'js':
        contentType = 'application/javascript'
        break
      case 'json':
        contentType = 'application/json'
        break
    }
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('[resource] Error serving file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
