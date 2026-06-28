import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rateLimit'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  // Rate limiting — max 5 emails par minute par IP
  const ip = req.headers.get('x-forwarded-for') ?? 'anonymous'
  const limit = rateLimit(`email:${ip}`, 5, 60000)
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Trop de requetes. Reessayez dans 1 minute.' },
      { status: 429 }
    )
  }

  try {
    const { to, subject, type, data } = await req.json()

    let html = ''

    if (type === 'inscription') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B7A56; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">BricoMaroc</h1>
          </div>
          <div style="background: #f7f5f0; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1a1a;">Bienvenue ${data.nom} !</h2>
            <p style="color: #555; line-height: 1.6;">
              Votre compte BricoMaroc a ete cree avec succes.
              ${data.role === 'artisan'
                ? 'Votre profil est en cours de verification. Vous serez notifie une fois valide.'
                : 'Vous pouvez maintenant poster vos demandes et trouver des artisans de confiance.'
              }
            </p>
            <a href="https://bricomaroc.vercel.app"
              style="display: inline-block; background: #1B7A56; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">
              Acceder a mon compte
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              BricoMaroc — La plateforme de confiance pour vos travaux au Maroc
            </p>
          </div>
        </div>
      `
    }

    if (type === 'nouveau_devis') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B7A56; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">BricoMaroc</h1>
          </div>
          <div style="background: #f7f5f0; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1a1a;">Nouveau devis recu</h2>
            <p style="color: #555; line-height: 1.6;">
              Bonjour ${data.clientNom},<br/>
              L'artisan <strong>${data.artisanNom}</strong> vous a envoye un devis pour votre demande
              <strong>"${data.titreDemande}"</strong>.
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="color: #555; padding: 4px 0;">Main d'oeuvre</td>
                  <td style="text-align: right; font-weight: bold;">${data.mainOeuvre} MAD</td>
                </tr>
                <tr>
                  <td style="color: #555; padding: 4px 0;">Materiaux</td>
                  <td style="text-align: right; font-weight: bold;">${data.materiaux} MAD</td>
                </tr>
                <tr>
                  <td style="color: #555; padding: 4px 0;">Deplacement</td>
                  <td style="text-align: right; font-weight: bold;">${data.deplacement} MAD</td>
                </tr>
                <tr style="border-top: 2px solid #eee;">
                  <td style="color: #1a1a1a; font-weight: bold; padding-top: 8px;">Total</td>
                  <td style="text-align: right; font-size: 20px; font-weight: bold; color: #1B7A56; padding-top: 8px;">
                    ${data.total} MAD
                  </td>
                </tr>
              </table>
            </div>
            <a href="https://bricomaroc.vercel.app/espace-client"
              style="display: inline-block; background: #1B7A56; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Voir le devis
            </a>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              Ce devis est valable ${data.valableJours} jours.
            </p>
          </div>
        </div>
      `
    }

    if (type === 'mission_terminee') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B7A56; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">BricoMaroc</h1>
          </div>
          <div style="background: #f7f5f0; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1a1a;">Mission terminee</h2>
            <p style="color: #555; line-height: 1.6;">
              Bonjour ${data.clientNom},<br/>
              Votre mission <strong>"${data.titreDemande}"</strong> a ete marquee comme terminee.
              N'oubliez pas de laisser un avis pour aider la communaute.
            </p>
            <a href="https://bricomaroc.vercel.app/avis/${data.demandeId}"
              style="display: inline-block; background: #f59e0b; color: #1a1a1a; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Laisser un avis
            </a>
          </div>
        </div>
      `
    }
    if (type === 'newsletter') {
  html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #1B7A56; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">BricoMaroc</h1>
      </div>
      <div style="background: #f7f5f0; padding: 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1a1a1a;">Bienvenue ${data.nom} !</h2>
        <p style="color: #555; line-height: 1.6;">
          Vous etes maintenant inscrit a la newsletter BricoMaroc.
          Vous recevrez nos actualites, conseils et offres exclusives.
        </p>
        <div style="background: white; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="color: #1B7A56; font-weight: bold; margin: 0 0 10px 0;">Ce que vous recevrez :</p>
          <ul style="color: #555; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Conseils d'entretien pour votre maison</li>
            <li>Offres exclusives sur les missions</li>
            <li>Nouveaux artisans disponibles dans votre ville</li>
            <li>Actualites BricoMaroc</li>
          </ul>
        </div>
        <a href="https://bricomaroc.vercel.app"
          style="display: inline-block; background: #1B7A56; color: white; padding: 12px 24px;
            border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
          Visiter BricoMaroc
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Pour vous desinscrire, repondez a cet email avec "DESINSCRIPTION".
        </p>
      </div>
    </div>
  `
}

    if (type === 'artisan_valide') {
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #1B7A56; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">BricoMaroc</h1>
          </div>
          <div style="background: #f7f5f0; padding: 30px; border-radius: 0 0 12px 12px;">
            <h2 style="color: #1a1a1a;">Profil valide !</h2>
            <p style="color: #555; line-height: 1.6;">
              Bonjour ${data.nom},<br/>
              Felicitations ! Votre profil artisan a ete verifie et valide par notre equipe.
            </p>
            <a href="https://bricomaroc.vercel.app/dashboard"
              style="display: inline-block; background: #1B7A56; color: white; padding: 12px 24px;
                border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">
              Acceder a mon dashboard
            </a>
          </div>
        </div>
      `
    }

    const { data: emailData, error } = await resend.emails.send({
      from: 'BricoMaroc <noreply@bricomaroc.ma>',
      to,
      subject,
      html,
    })

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return NextResponse.json({ success: true, id: emailData?.id })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}