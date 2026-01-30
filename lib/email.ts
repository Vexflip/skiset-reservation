import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
})

export async function sendReservationEmail(to: string, reservationDetails: any) {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Skiset Reservation" <no-reply@skiset.com>',
            to,
            subject: 'Reservation Confirmation',
            text: `Thank you for your reservation!
      
      Details:
      Name: ${reservationDetails.firstName} ${reservationDetails.lastName}
      Dates: ${new Date(reservationDetails.startDate).toLocaleDateString()} - ${new Date(reservationDetails.endDate).toLocaleDateString()}
      
      Items:
      ${reservationDetails.items.map((item: any) => `- ${item.category} (${item.quantity})`).join('\n')}
      
      Status: ${reservationDetails.status}
      `,
            html: `
        <h1>Reservation Confirmation</h1>
        <p>Thank you for your reservation, <strong>${reservationDetails.firstName}</strong>!</p>
        <p><strong>Dates:</strong> ${new Date(reservationDetails.startDate).toLocaleDateString()} - ${new Date(reservationDetails.endDate).toLocaleDateString()}</p>
        <h3>Equipment:</h3>
        <ul>
          ${reservationDetails.items.map((item: any) => `<li>${item.category} - Qty: ${item.quantity} ${item.size ? `(Size: ${item.size})` : ''}</li>`).join('')}
        </ul>
        <p>Status: <strong>${reservationDetails.status}</strong></p>
      `,
        })

        console.log('Message sent: %s', info.messageId)
        return info
    } catch (error) {
        console.error('Error sending email:', error)
        return null
    }
}
