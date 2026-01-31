import nodemailer from 'nodemailer'

const smtpPort = parseInt(process.env.SMTP_PORT || '587')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: smtpPort,
    secure: smtpPort === 465, // true for port 465 (SSL), false for other ports (TLS)
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
})

export async function sendReservationEmail(to: string, reservationDetails: any) {
    try {
        // Format dates
        const startDate = new Date(reservationDetails.startDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        const endDate = new Date(reservationDetails.endDate).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })

        // Format prices
        const formatPrice = (price: any) => {
            const numPrice = typeof price === 'string' ? parseFloat(price) : price
            return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(numPrice)
        }

        // Build equipment list HTML
        const equipmentHTML = reservationDetails.items.map((item: any, index: number) => `
            <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 8px; vertical-align: top;">
                    <strong style="color: #1f2937;">${item.productName || item.category}</strong>
                    ${item.size ? `<br><span style="color: #6b7280; font-size: 13px;">Taille: ${item.size}</span>` : ''}
                    ${item.surname ? `<br><span style="color: #6b7280; font-size: 13px;">Pour: ${item.surname}</span>` : ''}
                    ${item.age ? `<br><span style="color: #6b7280; font-size: 13px;">Âge: ${item.age} ans</span>` : ''}
                </td>
                <td style="padding: 12px 8px; text-align: center; color: #6b7280;">${item.quantity}</td>
                <td style="padding: 12px 8px; text-align: right; color: #1f2937; font-weight: 500;">${formatPrice(item.price)}</td>
                <td style="padding: 12px 8px; text-align: right; color: #1f2937; font-weight: 600;">${formatPrice(Number(item.price) * item.quantity)}</td>
            </tr>
        `).join('')

        // Build pricing summary
        const totalPrice = formatPrice(reservationDetails.totalPrice)
        const discountAmount = formatPrice(reservationDetails.discountAmount)
        const finalPrice = formatPrice(reservationDetails.finalPrice)
        const hasDiscount = Number(reservationDetails.discountAmount) > 0


        // Build reservation tracking link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const trackingUrl = `${baseUrl}/reservation/${reservationDetails.id}`

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Skiset Relief" <no-reply@skiset.com>',
            to,
            subject: '✅ Confirmation de votre réservation Skiset',
            text: `Confirmation de réservation Skiset Relief
      
Bonjour ${reservationDetails.firstName} ${reservationDetails.lastName},

Merci pour votre réservation !

Détails de votre réservation:
- Dates: ${startDate} au ${endDate}
- Statut: ${reservationDetails.status}

Équipement réservé:
${reservationDetails.items.map((item: any) => `- ${item.productName || item.category} x${item.quantity} - ${formatPrice(Number(item.price) * item.quantity)}`).join('\n')}

Récapitulatif des prix:
Sous-total: ${totalPrice}
${hasDiscount ? `Code promo appliqué: -${discountAmount}\n` : ''}Total à payer: ${finalPrice}

Suivre ma réservation:
${trackingUrl}
(Utilisez votre nom de famille pour accéder)

À bientôt sur les pistes !
L'équipe Skiset Relief
      `,
            html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #334155 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 900; letter-spacing: -0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                RELIEF<span style="color: #60a5fa; font-size: 48px;">.</span>
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #bfdbfe; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">Skiset from La Norma</p>
                            <p style="margin: 10px 0 0 0; color: #93c5fd; font-size: 16px; font-weight: 600;">Confirmation de réservation</p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
                                Bonjour ${reservationDetails.firstName} ${reservationDetails.lastName} ! 👋
                            </h2>
                            <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Merci pour votre réservation. Nous avons bien reçu votre demande et nous sommes ravis de vous accompagner sur les pistes !
                            </p>
                        </td>
                    </tr>

                    <!-- Reservation Details -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #f9fafb; border-left: 4px solid #60a5fa; padding: 15px 20px; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;">
                                    Dates de location
                                </p>
                                <p style="margin: 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                                    📅 ${startDate}
                                </p>
                                <p style="margin: 8px 0 0 0; color: #1f2937; font-size: 16px; font-weight: 500;">
                                    📅 ${endDate}
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Equipment Table -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                                🎿 Équipement réservé
                            </h3>
                            <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f9fafb;">
                                        <th style="padding: 12px 8px; text-align: left; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Article</th>
                                        <th style="padding: 12px 8px; text-align: center; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Qté</th>
                                        <th style="padding: 12px 8px; text-align: right; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Prix unit.</th>
                                        <th style="padding: 12px 8px; text-align: right; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${equipmentHTML}
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- Pricing Summary -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 8px 0; color: #6b7280; font-size: 15px;">Sous-total:</td>
                                    <td style="padding: 8px 0; text-align: right; color: #1f2937; font-size: 15px; font-weight: 500;">${totalPrice}</td>
                                </tr>
                                ${hasDiscount ? `
                                <tr>
                                    <td style="padding: 8px 0; color: #059669; font-size: 15px;">
                                        <strong>🎉 Réduction appliquée</strong>
                                        ${reservationDetails.promoCode ? `<br><span style="font-size: 13px; color: #6b7280;">Code: ${reservationDetails.promoCode.code}</span>` : ''}
                                    </td>
                                    <td style="padding: 8px 0; text-align: right; color: #059669; font-size: 15px; font-weight: 600;">-${discountAmount}</td>
                                </tr>
                                ` : ''}
                                <tr style="border-top: 2px solid #e5e7eb;">
                                    <td style="padding: 12px 0; color: #1f2937; font-size: 18px; font-weight: 700;">Total à payer:</td>
                                    <td style="padding: 12px 0; text-align: right; color: #60a5fa; font-size: 22px; font-weight: 700;">${finalPrice}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Status Badge -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 12px 16px; border-radius: 6px; text-align: center;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: 600;">
                                    Statut de la réservation: <span style="text-transform: uppercase;">${reservationDetails.status}</span>
                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Tracking Link Button -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; border: 1px solid #93c5fd;">
                                <p style="margin: 0 0 12px 0; color: #1e3a8a; font-size: 16px; font-weight: 600;">
                                    📋 Suivez votre réservation
                                </p>
                                <p style="margin: 0 0 18px 0; color: #475569; font-size: 14px;">
                                    Consultez l'avancement de votre réservation en temps réel
                                </p>
                                <a href="${trackingUrl}" 
                                   style="display: inline-block; padding: 14px 32px; background-color: #60a5fa; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(96, 165, 250, 0.3);">
                                    Voir ma réservation
                                </a>
                                <p style="margin: 18px 0 0 0; color: #64748b; font-size: 12px;">
                                    🔒 Utilisez votre nom de famille pour accéder
                                </p>
                            </div>
                        </td>
                    </tr>

                    ${reservationDetails.notes ? `
                    <!-- Notes -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <p style="margin: 0 0 5px 0; color: #6b7280; font-size: 13px; font-weight: 600; text-transform: uppercase;">Vos notes:</p>
                            <p style="margin: 0; color: #4b5563; font-size: 14px; font-style: italic; line-height: 1.5;">${reservationDetails.notes}</p>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 15px; font-weight: 600; text-align: center;">
                                À bientôt sur les pistes ! ⛷️🏂
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                                L'équipe Skiset Relief<br>
                                <a href="mailto:${process.env.SMTP_FROM}" style="color: #60a5fa; text-decoration: none;">${process.env.SMTP_FROM}</a>
                            </p>
                            <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center; line-height: 1.5;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                                Pour toute question, contactez-nous à l'adresse ci-dessus.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        })

        console.log('Message sent: %s', info.messageId)
        return info
    } catch (error) {
        console.error('Error sending email:', error)
        return null
    }
}

export async function sendStatusUpdateEmail(to: string, reservationDetails: any) {
    try {
        // Build reservation tracking link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const trackingUrl = `${baseUrl}/reservation/${reservationDetails.id}`

        // Get status in French
        const getStatusText = (status: string) => {
            switch (status) {
                case 'CONFIRMED': return 'Confirmée ✅'
                case 'PENDING': return 'En attente ⏳'
                case 'COMPLETED': return 'Terminée 🎿'
                case 'CANCELLED': return 'Annulée ❌'
                default: return status
            }
        }

        const statusText = getStatusText(reservationDetails.status)
        const statusColor = reservationDetails.status === 'CONFIRMED' ? '#10b981' :
            reservationDetails.status === 'PENDING' ? '#f59e0b' :
                reservationDetails.status === 'COMPLETED' ? '#3b82f6' : '#ef4444'

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Skiset Relief" <no-reply@skiset.com>',
            to,
            subject: `📋 Mise à jour de votre réservation Skiset - ${statusText}`,
            text: `Mise à jour de votre réservation Skiset Relief

Bonjour ${reservationDetails.firstName} ${reservationDetails.lastName},

Le statut de votre réservation a été mis à jour.

Nouveau statut: ${statusText}
${reservationDetails.cancellationReason ? `\nRaison: ${reservationDetails.cancellationReason}\n` : ''}
Voir ma réservation:
${trackingUrl}
(Utilisez votre nom de famille pour accéder)

Pour toute question, n'hésitez pas à nous contacter.

L'équipe Skiset Relief
`,
            html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mise à jour de réservation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #334155 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 900; letter-spacing: -0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                RELIEF<span style="color: #60a5fa; font-size: 48px;">.</span>
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #bfdbfe; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">Skiset from La Norma</p>
                            <p style="margin: 10px 0 0 0; color: #93c5fd; font-size: 16px; font-weight: 600;">Mise à jour de réservation</p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 30px 30px 20px 30px;">
                            <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 22px; font-weight: 600;">
                                Bonjour ${reservationDetails.firstName} ${reservationDetails.lastName}! 👋
                            </h2>
                            <p style="margin: 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Le statut de votre réservation a été mis à jour.
                            </p>
                        </td>
                    </tr>

                    <!-- Status Badge -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-radius: 8px; padding: 24px; border: 1px solid #93c5fd; text-align: center;">
                                <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;">
                                    Nouveau statut
                                </p>
                                <p style="margin: 0; color: ${statusColor}; font-size: 24px; font-weight: 700;">
                                    ${statusText}
                                </p>
                            </div>
                        </td>
                    </tr>

                    ${reservationDetails.cancellationReason ? `
                    <!-- Cancellation Reason -->
                    <tr>
                        <td style="padding: 0 30px 20px 30px;">
                            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px 20px; border-radius: 4px;">
                                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                    Raison de l'annulation
                                </p>
                                <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.6;">
                                    ${reservationDetails.cancellationReason}
                                </p>
                            </div>
                        </td>
                    </tr>
                    ` : ''}

                    <!-- Tracking Link Button -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px; text-align: center;">
                            <a href="${trackingUrl}" 
                               style="display: inline-block; padding: 14px 32px; background-color: #60a5fa; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(96, 165, 250, 0.3);">
                                📋 Voir ma réservation
                            </a>
                            <p style="margin: 15px 0 0 0; color: #64748b; font-size: 12px;">
                                🔒 Utilisez votre nom de famille pour accéder
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0; color: #6b7280; font-size: 13px;">
                                Pour toute question, contactez-nous à 
                                <a href="mailto:no-reply@skiset-relief.vexflip.fr" style="color: #60a5fa; text-decoration: none;">no-reply@skiset-relief.vexflip.fr</a>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                                © ${new Date().getFullYear()} Skiset Relief - La Norma
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `
        })

        console.log('Status update email sent:', info.messageId)
        return info
    } catch (error) {
        console.error('Error sending status update email:', error)
        return null
    }
}

export async function sendBroadcastEmail(to: string, subject: string, message: string, greeting: string = 'Bonjour', firstName?: string, lastName?: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'

        // Construct the full greeting
        // e.g. "Bonjour Jean Dupont," or just "Bonjour," if no name
        let fullGreeting = greeting.trim()
        if (firstName || lastName) {
            fullGreeting += ` ${firstName || ''} ${lastName || ''}`.trim()
        }
        fullGreeting += ","

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Skiset Relief" <no-reply@skiset.com>',
            to,
            subject: subject,
            text: `${fullGreeting}\n\n${message}`,
            html: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1e3a8a 0%, #334155 50%, #1e293b 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 48px; font-weight: 900; letter-spacing: -0.05em; text-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                RELIEF<span style="color: #60a5fa; font-size: 48px;">.</span>
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #bfdbfe; font-size: 14px; letter-spacing: 0.5px; text-transform: uppercase;">Skiset from La Norma</p>
                        </td>
                    </tr>

                    <!-- Greeting -->
                    <tr>
                        <td style="padding: 30px 30px 0 30px;">
                            <h2 style="margin: 0; color: #1f2937; font-size: 20px; font-weight: 600;">
                                ${fullGreeting} 👋
                            </h2>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 20px 30px 40px 30px;">
                            <div style="color: #1f2937; font-size: 16px; line-height: 1.8; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb;">
                            <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 15px; font-weight: 600; text-align: center;">
                                À bientôt sur les pistes ! ⛷️🏂
                            </p>
                            <p style="margin: 0; color: #6b7280; font-size: 13px; text-align: center; line-height: 1.6;">
                                L'équipe Skiset Relief<br>
                                <a href="mailto:${process.env.SMTP_FROM}" style="color: #60a5fa; text-decoration: none;">${process.env.SMTP_FROM}</a>
                            </p>
                            <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 11px; text-align: center; line-height: 1.5;">
                                Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                                Pour toute question, contactez-nous à l'adresse ci-dessus.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
            `,
        })

        console.log('Broadcast email sent: %s', info.messageId)
        return info
    } catch (error) {
        console.error('Error sending broadcast email:', error)
        return null
    }
}
