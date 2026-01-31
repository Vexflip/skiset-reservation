import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const reservation = await prisma.reservation.findUnique({
            where: {
                id: id,
            },
            include: {
                items: true,
                promoCode: true,
            },
        })

        if (!reservation) {
            return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
        }

        // Convert Decimal types to numbers for JSON serialization
        const serializedReservation = {
            ...reservation,
            totalPrice: reservation.totalPrice ? Number(reservation.totalPrice) : 0,
            discountAmount: reservation.discountAmount ? Number(reservation.discountAmount) : 0,
            finalPrice: reservation.finalPrice ? Number(reservation.finalPrice) : 0,
            promoCode: reservation.promoCode ? {
                ...reservation.promoCode,
                discountValue: Number(reservation.promoCode.discountValue)
            } : null,
            items: reservation.items.map((item: any) => ({
                ...item,
                price: item.price ? Number(item.price) : 0,
                options: item.options ? item.options.split(',') : []
            }))
        }

        return NextResponse.json(serializedReservation)
    } catch (error) {
        console.error('Error fetching reservation:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, adminNotes, cancellationReason } = body

        const updateData: any = {}

        if (status) {
            // Validate status
            const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
            if (!validStatuses.includes(status)) {
                return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
            }
            updateData.status = status
        }

        if (typeof adminNotes === 'string') {
            updateData.adminNotes = adminNotes
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
        }

        const reservation = await prisma.reservation.update({
            where: { id },
            data: updateData,
            include: { items: true, promoCode: true }
        })

        // Send status update email if status was changed
        if (status && reservation.email) {
            try {
                const { sendStatusUpdateEmail } = await import('@/lib/email')
                // Pass cancellation reason if provided
                const reservationWithReason = {
                    ...reservation,
                    cancellationReason: status === 'CANCELLED' ? cancellationReason : undefined
                }
                await sendStatusUpdateEmail(reservation.email, reservationWithReason)
            } catch (emailError) {
                console.error('Failed to send status update email:', emailError)
                // Don't fail the request if email fails
            }
        }

        // Serialize the response
        const serializedReservation = {
            ...reservation,
            totalPrice: reservation.totalPrice ? Number(reservation.totalPrice) : 0,
            discountAmount: reservation.discountAmount ? Number(reservation.discountAmount) : 0,
            finalPrice: reservation.finalPrice ? Number(reservation.finalPrice) : 0,
            promoCode: reservation.promoCode ? {
                ...reservation.promoCode,
                discountValue: Number(reservation.promoCode.discountValue)
            } : null,
            items: reservation.items.map((item: any) => ({
                ...item,
                price: item.price ? Number(item.price) : 0,
                options: item.options ? item.options.split(',') : []
            }))
        }

        return NextResponse.json(serializedReservation)
    } catch (error) {
        console.error('Error updating reservation:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.reservation.delete({
            where: { id }
        })

        return NextResponse.json({ success: true, message: 'Reservation deleted' })
    } catch (error) {
        console.error('Error deleting reservation:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
