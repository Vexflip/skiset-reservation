import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: Request) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const date = searchParams.get('date')

        const where: any = {}
        if (date) {
            // Simple date filtering (exact start date match for example, or overlapping?)
            // Let's do exact start date or range matching if requested.
            // User asked: "Ability to filter reservations by date"
            // Let's assume finding reservations STARTING on this date.
            const d = new Date(date)
            const nextDay = new Date(d)
            nextDay.setDate(d.getDate() + 1)

            where.startDate = {
                gte: d,
                lt: nextDay
            }
        }

        const status = searchParams.get('status')
        if (status && status !== 'ALL') {
            where.status = status
        }

        const customer = searchParams.get('customer')
        if (customer) {
            where.OR = [
                { firstName: { contains: customer, mode: 'insensitive' } },
                { lastName: { contains: customer, mode: 'insensitive' } },
                { email: { contains: customer, mode: 'insensitive' } },
            ]

        }

        const promoCode = searchParams.get('promoCode')
        if (promoCode) {
            where.promoCode = {
                code: promoCode
            }
        }

        const reservations = await prisma.reservation.findMany({
            where,
            include: {
                items: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Convert Decimal types to numbers for JSON serialization
        const serializedReservations = reservations.map((reservation: any) => ({
            ...reservation,
            totalPrice: reservation.totalPrice ? Number(reservation.totalPrice) : 0,
            items: reservation.items.map((item: any) => ({
                ...item,
                price: item.price ? Number(item.price) : 0,
                options: item.options ? item.options.split(',') : []
            }))
        }))

        return NextResponse.json(serializedReservations)
    } catch (error) {
        console.error('Error fetching reservations:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
