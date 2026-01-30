import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'ethereal_user',
        pass: process.env.SMTP_PASS || 'ethereal_pass',
    },
})

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { recipients, subject, message } = await request.json()

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
        }

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
        }

        // Loop and send individually to hide other recipients (BCC style logic implies one email with BCC, 
        // but individual sending allows personalizing if we wanted, and avoids exposing list in To header if we did bulk)
        // For standard "broadcast", sending individually is safer for privacy unless using BCC.
        // Let's use BCC for efficiency if the provider supports it, or individual.
        // NodeMailer can accept an array in 'bcc'.

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Skiset Admin" <no-reply@skiset.com>',
            bcc: recipients, // Use BCC to hide recipients from each other
            subject: subject,
            text: message,
            html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</div>`
        })

        console.log('Broadcast sent: %s', info.messageId)

        return NextResponse.json({ success: true, count: recipients.length })

    } catch (error) {
        console.error('Error sending broadcast:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
