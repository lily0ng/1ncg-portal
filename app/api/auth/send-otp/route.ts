import { NextRequest, NextResponse } from 'next/server'

// In-memory OTP store (in production, use Redis)
const otpStore: Record<string, { otp: string; expiresAt: number }> = {}

export async function POST(req: NextRequest) {
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
      message: 'OTP sent successfully',
      // Only for development - remove in production
      devOtp: otp
    })

  } catch (error: any) {
    console.error('[send-otp] Error:', error)
    return NextResponse.json(
      { error: 'Failed to send OTP', details: error?.message },
      { status: 500 }
    )
  }
}

// Verify OTP
export async function PUT(req: NextRequest) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 }
      )
    }

    const stored = otpStore[email]
    
    if (!stored) {
      return NextResponse.json(
        { error: 'OTP expired or not found' },
        { status: 400 }
      )
    }

    if (stored.expiresAt < Date.now()) {
      delete otpStore[email]
      return NextResponse.json(
        { error: 'OTP expired' },
        { status: 400 }
      )
    }

    if (stored.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      )
    }

    // Clear OTP after successful verification
    delete otpStore[email]

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully'
    })

  } catch (error: any) {
    console.error('[verify-otp] Error:', error)
    return NextResponse.json(
      { error: 'Verification failed', details: error?.message },
      { status: 500 }
    )
  }
}
