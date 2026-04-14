import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { cloudstack } from '@/lib/cloudstack'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { fullName, email, phone, password, accountType, country, state, city, address, postalCode } = body

    // Validation
    if (!fullName || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Generate username from email
    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    
    // Check if username exists
    const existingUsername = await prisma.user.findFirst({
      where: { username }
    })
    
    const finalUsername = existingUsername 
      ? `${username}${Date.now().toString().slice(-4)}` 
      : username

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Try to create user in CloudStack first (optional, depends on your setup)
    let csUserId = `local-${Date.now()}`
    let domainId = 'default'
    let account = finalUsername

    try {
      // Create user in CloudStack if API is available
      const csResponse = await cloudstack('createAccount', {
        email,
        firstname: fullName.split(' ')[0] || fullName,
        lastname: fullName.split(' ').slice(1).join(' ') || '',
        password: password, // CloudStack will hash this
        username: finalUsername,
        accounttype: '0', // USER account
        domainid: 'default',
      })
      
      if (csResponse.createaccountresponse?.account?.id) {
        csUserId = csResponse.createaccountresponse.account.id
        domainId = csResponse.createaccountresponse.account.domainid || 'default'
        account = csResponse.createaccountresponse.account.name || finalUsername
      }
    } catch (csError) {
      console.log('[register] CloudStack user creation skipped or failed:', csError)
      // Continue with local user creation even if CloudStack fails
    }

    // Create user in database
    const user = await prisma.user.create({
      data: {
        csUserId,
        username: finalUsername,
        email,
        role: 'USER',
        domainId,
        account,
        balance: 0,
      }
    })

    // Store additional user details (can be extended to a separate Profile model)
    // For now, we'll store these in metadata or create a separate Profile model

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    })

  } catch (error: any) {
    console.error('[register] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create account', details: error?.message },
      { status: 500 }
    )
  }
}
