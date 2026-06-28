import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json()

    if (!to || !message) {
      return NextResponse.json({ error: 'to and message required' }, { status: 400 })
    }

    let phone = to.replace(/\s/g, '')
    if (phone.startsWith('0')) {
      phone = '+212' + phone.slice(1)
    } else if (!phone.startsWith('+')) {
      phone = '+212' + phone
    }

    const sms = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to: phone,
    })

    return NextResponse.json({ success: true, sid: sms.sid })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}