import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-27.basil' as any,
})

export async function POST(req: NextRequest) {
  try {
    const { amount, demandeId, description } = await req.json()

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // en centimes
      currency: 'mad',
      metadata: {
        demande_id: demandeId,
      },
      description: description ?? 'Paiement BricoMaroc',
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
