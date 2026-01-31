import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendReservationEmail } from '@/lib/email'
import { z } from 'zod'

const ItemSchema = z.object({
    category: z.string(),
    productName: z.string().optional(),
    price: z.number().optional().default(0),
    image: z.string().optional().nullable(),
    bootsImage: z.string().optional().nullable(),
    helmetImage: z.string().optional().nullable(),
    options: z.string().optional().nullable(),
    size: z.string().optional(),
    level: z.string().optional(),
    quantity: z.number().min(1),

    // Personal information fields
    surname: z.string().optional(),
    sex: z.string().optional(),
    age: z.number().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    shoeSize: z.string().optional(),
})

const ReservationSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(5),
    startDate: z.string(), // We accept ISO strings
    endDate: z.string(),
    notes: z.string().optional(),
    promoCode: z.string().optional(),
    items: z.array(ItemSchema).min(1),
})

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const result = ReservationSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid data', details: result.error.format() }, { status: 400 })
        }

        const { items, promoCode, ...data } = result.data

        // Calculate total price (Base Price)
        const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

        // Items no longer need date transformations as dates are global
        const transformedItems = items.map(item => ({
            ...item
        }))

        // Verify and Apply Promo Code
        let discountAmount = 0
        let promoCodeId: string | null = null
        let finalPrice = totalPrice

        // Start Transaction to ensure promo usage is counted correctly
        const transactionResult = await prisma.$transaction(async (tx) => {
            if (promoCode) {
                const promo = await tx.promoCode.findUnique({ where: { code: promoCode } })

                if (!promo || !promo.isActive) {
                    throw new Error("Invalid promo code")
                }

                if (promo.expiresAt && new Date() > promo.expiresAt) {
                    throw new Error("Promo code has expired")
                }

                if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
                    throw new Error("Promo code usage limit reached")
                }

                // Calculate Discount
                if (promo.discountType === 'PERCENTAGE') {
                    // discountValue is percentage (e.g., 10 for 10%)
                    discountAmount = totalPrice * (Number(promo.discountValue) / 100)
                } else {
                    // FIXED_AMOUNT
                    discountAmount = Number(promo.discountValue)
                }

                // Ensure we don't discount more than the total price
                discountAmount = Math.min(discountAmount, totalPrice)
                finalPrice = totalPrice - discountAmount
                promoCodeId = promo.id

                // Increment Usage
                await tx.promoCode.update({
                    where: { id: promo.id },
                    data: { currentUses: { increment: 1 } }
                })
            }

            const reservation = await tx.reservation.create({
                data: {
                    ...data,
                    startDate: new Date(data.startDate),
                    endDate: new Date(data.endDate),
                    totalPrice,      // Original Total
                    discountAmount,  // Discount Applied
                    finalPrice,      // Final to Pay
                    promoCodeId,
                    items: {
                        create: transformedItems,
                    },
                },
                include: {
                    items: true,
                    promoCode: true, // Include promo code details for email
                },
            })

            return reservation
        })

        // Send email asynchronously (outside transaction)
        try {
            await sendReservationEmail(transactionResult.email, transactionResult)
        } catch (emailError) {
            console.error("Failed to send email but reservation created", emailError)
        }

        return NextResponse.json(transactionResult, { status: 201 })
    } catch (error: any) {
        console.error('Error creating reservation:', error)
        // Differentiate expected logic errors vs internal errors
        if (error.message === "Invalid promo code" || error.message === "Promo code has expired" || error.message === "Promo code usage limit reached") {
            return NextResponse.json({ error: error.message }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
