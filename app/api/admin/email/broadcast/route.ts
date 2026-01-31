import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { sendBroadcastEmail } from '@/lib/email'

export async function POST(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { recipients, subject, message, greeting } = await request.json()

        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            return NextResponse.json({ error: 'No recipients provided' }, { status: 400 })
        }

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 })
        }

        // Send individually to each recipient for privacy
        let successCount = 0
        let failureCount = 0

        for (const recipient of recipients) {
            // Handle both old string format (fallback) and new object format
            const email = typeof recipient === 'string' ? recipient : recipient.email
            const firstName = typeof recipient === 'object' ? recipient.firstName : undefined
            const lastName = typeof recipient === 'object' ? recipient.lastName : undefined

            if (!email) continue

            const result = await sendBroadcastEmail(email, subject, message, greeting, firstName, lastName)
            if (result) {
                successCount++
            } else {
                failureCount++
                console.error(`Failed to send to: ${email}`)
            }
        }

        console.log(`Broadcast completed: ${successCount} sent, ${failureCount} failed`)

        if (successCount === 0) {
            return NextResponse.json({ error: 'All emails failed to send' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            failed: failureCount
        })

    } catch (error) {
        console.error('Error sending broadcast:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
