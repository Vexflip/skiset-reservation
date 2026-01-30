import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

// Schema for product validation
const ProductSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    category: z.string(),
    price: z.coerce.number().min(0),
    originalPrice: z.coerce.number().optional(),
    level: z.string().optional(),
    image: z.string().optional().nullable(),
    bootsImage: z.string().optional().nullable(),
    helmetImage: z.string().optional().nullable(),
    titleColor: z.string().optional().nullable(),
    equipmentType: z.string().optional().nullable(),
    targetGroup: z.string().optional().nullable(),
    features: z.string().optional(),
    active: z.boolean().optional(),
    dayPrices: z.string().optional().nullable(),
})

export async function GET(request: Request) {
    try {
        const products = await prisma.product.findMany({
            where: { active: true },
            orderBy: { price: 'asc' }
        })
        return NextResponse.json(products)
    } catch (error) {
        console.error('Error fetching products:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        // Check Auth
        const session = await getSession()
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const result = ProductSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid data', details: result.error.format() }, { status: 400 })
        }

        const product = await prisma.product.create({
            data: result.data
        })

        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        console.error('Error creating product:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    // Implementation for update if needed via query param id or similar logic, 
    // usually better to have [id]/route.ts but for simplicity we can check body.id
    // For now let's stick to simple CREATE/LIST here.
    return NextResponse.json({ error: 'Method not implemented' }, { status: 405 })
}
