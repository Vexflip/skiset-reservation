import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fetch all reservations
        // In a very large system, we would group by email in the database,
        // but for now fetching fields and aggregating in JS is fine and flexible.
        const reservations = await prisma.reservation.findMany({
            select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                createdAt: true,
                items: {
                    select: {
                        category: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        })

        // Aggregate by unique email
        const customersMap = new Map()

        reservations.forEach(res => {
            const email = res.email.toLowerCase()

            // Extract categories from this reservation
            const resCategories = res.items.map(i => i.category)

            if (!customersMap.has(email)) {
                customersMap.set(email, {
                    email: res.email, // Keep original case for display if desired, or use lower
                    firstName: res.firstName,
                    lastName: res.lastName,
                    phone: res.phone,
                    totalReservations: 1,
                    lastBookingDate: res.createdAt,
                    categories: new Set(resCategories)
                })
            } else {
                const customer = customersMap.get(email)
                customer.totalReservations += 1

                // Add new categories
                resCategories.forEach((c: string) => customer.categories.add(c))

                // efficient max date check since we sorted by desc, first one is latest
                // effectively we don't need to check, but let's be safe if order changes
                if (new Date(res.createdAt) > new Date(customer.lastBookingDate)) {
                    customer.lastBookingDate = res.createdAt
                }
            }
        })

        const customers = Array.from(customersMap.values()).map((c: any) => ({
            ...c,
            categories: Array.from(c.categories) // Convert Set to Array for JSON
        }))

        return NextResponse.json(customers)

    } catch (error) {
        console.error('Error fetching customers:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
