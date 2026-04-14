import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// In-memory OTP store (in production, use Redis)
const otpStore: Record<string, { otp: string; expiresAt: number }> = {}

// Generate and send OTP (mock for now)
export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    // Verify OTP (mock - in production, check against stored OTP)
    const storedOtp = otpStore[email]
    
    // For demo purposes, accept "123456" as valid OTP
    // In production, implement proper OTP verification
    const isValid = storedOtp?.otp === otp || otp === '123456'

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Update user as verified
    await prisma.user.updateMany({
      where: { email },
      data: { /* Add verified field if needed */ }
    })

    // Clear OTP
    delete otpStore[email]

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    })

  } catch (error: any) {
    console.error('[verify-otp] Error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error?.message },
      { status: 500 }
    )
  }
}

// Send OTP endpoint
export async function PUT(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store OTP with 10 minute expiry
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    }

    // In production, send email with OTP
    console.log(`[OTP] OTP for ${email}: ${otp}`)

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully'
    })

  } catch (error: any) {
    console.error('[send-otp] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP', details: error?.message },
      { status: 500 }
    )
  }
}
