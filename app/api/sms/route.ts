import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'to and message required' }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const from = process.env.TWILIO_PHONE_NUMBER

    if (!accountSid || !authToken || !from) {
      console.log('Twilio not configured — SMS skipped')
      return NextResponse.json({ success: true, skipped: true })
    }

    if (!accountSid.startsWith('AC')) {
      console.log('Invalid Twilio Account SID — SMS skipped')
      return NextResponse.json({ success: true, skipped: true })
    }

    const twilio = require('twilio')
    const client = twilio(accountSid, authToken)

    await client.messages.create({
      body: message,
      from,
      to,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SMS error:', error.message)
    return NextResponse.json({ success: true, skipped: true })
  }
}