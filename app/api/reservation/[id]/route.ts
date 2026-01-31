import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { attempts: number; resetAt: number }>()

function checkRateLimit(key: string, maxAttempts = 10, windowMs = 3600000): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(key)

    // Clean up expired entries
    if (record && now > record.resetAt) {
        rateLimitMap.delete(key)
    }

    const current = rateLimitMap.get(key)
    if (!current) {
        rateLimitMap.set(key, { attempts: 1, resetAt: now + windowMs })
        return true
    }

    if (current.attempts >= maxAttempts) {
        return false
    }

    current.attempts++
    return true
}

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { password } = await request.json()
        const { id: reservationId } = await params

        if (!password) {
            return NextResponse.json(
                { error: 'Password is required' },
                { status: 400 }
            )
        }

        // Rate limiting key (reservation ID + IP would be better in production)
        const rateLimitKey = `reservation:${reservationId}`

        if (!checkRateLimit(rateLimitKey)) {
            return NextResponse.json(
                { error: 'Too many attempts. Please try again later.' },
                { status: 429 }
            )
        }

        // Fetch reservation
        const reservation = await prisma.reservation.findUnique({
            where: { id: reservationId },
            include: {
                items: true,
                promoCode: true,
            },
        })

        if (!reservation) {
            return NextResponse.json(
                { error: 'Reservation not found' },
                { status: 404 }
            )
        }

        // Verify password (case-insensitive last name comparison)
        const isPasswordCorrect =
            password.toLowerCase().trim() === reservation.lastName.toLowerCase().trim()

        if (!isPasswordCorrect) {
            return NextResponse.json(
                { error: 'Invalid password. Please use your last name.' },
                { status: 401 }
            )
        }

        // Password is correct - return reservation data (excluding admin notes)
        const { adminNotes, ...customerData } = reservation

        return NextResponse.json(customerData, { status: 200 })
    } catch (error) {
        console.error('Error fetching reservation:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
