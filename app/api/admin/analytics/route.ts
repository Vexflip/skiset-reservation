import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        // 1. Get total stats and items for equipment analysis
        const allReservations = await prisma.reservation.findMany({
            select: {
                id: true,
                finalPrice: true,
                status: true,
                createdAt: true,
                items: {
                    select: {
                        productName: true,
                        category: true,
                        quantity: true
                    }
                }
            }
        })

        // Fetch product map for equipment type lookup
        const products = await prisma.product.findMany({
            select: {
                name: true,
                equipmentType: true,
                category: true
            }
        })

        const productTypeMap = new Map<string, string>()
        products.forEach(p => {
            if (p.equipmentType) {
                productTypeMap.set(p.name, p.equipmentType)
            }
        })

        const totalReservations = allReservations.length
        const totalRevenue = allReservations.reduce((acc, curr) => {
            if (curr.status !== 'CANCELLED') {
                return acc + curr.finalPrice.toNumber()
            }
            return acc
        }, 0)

        const averageOrderValue = totalReservations > 0 ? totalRevenue / totalReservations : 0

        // 2. Prepare data for charts (Last 30 days)
        const dayMap = new Map<string, number>()
        const today = new Date()

        // Initialize last 30 days with 0
        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(today.getDate() - i)
            const dateStr = d.toLocaleDateString('en-CA') // YYYY-MM-DD
            dayMap.set(dateStr, 0)
        }

        allReservations.forEach(res => {
            if (res.status !== 'CANCELLED') {
                const dateStr = new Date(res.createdAt).toLocaleDateString('en-CA')
                if (dayMap.has(dateStr)) {
                    dayMap.set(dateStr, (dayMap.get(dateStr) || 0) + res.finalPrice.toNumber())
                }
            }
        })

        const revenueOverTime = Array.from(dayMap.entries()).map(([date, amount]) => ({
            date,
            amount
        }))

        // 3. Equipment Type Distribution
        const equipmentCount: Record<string, number> = {
            'SKI': 0,
            'SNOWBOARD': 0,
            'MINISKI': 0,
            'TOURING': 0,
            'OTHER': 0
        }

        allReservations.forEach(res => {
            if (res.status !== 'CANCELLED') {
                res.items.forEach(item => {
                    let type = 'OTHER'

                    // Try to find exact type from product lookup
                    if (productTypeMap.has(item.productName)) {
                        type = productTypeMap.get(item.productName) || 'OTHER'
                    } else {
                        // Fallback logic based on specific requests from user "ski, snow, miniski or touring"
                        // Mapping category to these if possible
                        if (item.category === 'ADULT_SKI' || item.category === 'KIDS_SKI') type = 'SKI'
                        else if (item.category === 'SNOWBOARD') type = 'SNOWBOARD'
                        // Cannot reliably determine MINISKI or TOURING from category alone if they share ADULT_SKI category
                        // But usually they might be distinct products.
                        // Assuming 'OTHER' or 'SKI' for now if unknown.
                    }

                    // Normalize to requested keys
                    if (['SKI', 'SNOWBOARD', 'MINISKI', 'TOURING'].includes(type)) {
                        equipmentCount[type] = (equipmentCount[type] || 0) + item.quantity
                    } else {
                        equipmentCount['OTHER'] = (equipmentCount['OTHER'] || 0) + item.quantity
                    }
                })
            }
        })

        const equipmentDistribution = Object.keys(equipmentCount)
            .filter(key => equipmentCount[key] > 0)
            .map(type => ({
                name: type,
                value: equipmentCount[type]
            }))

        return NextResponse.json({
            stats: {
                totalReservations,
                totalRevenue,
                averageOrderValue
            },
            charts: {
                revenueOverTime,
                equipmentDistribution // Replaced statusDistribution
            }
        })

    } catch (error) {
        console.error('Analytics API Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        )
    }
}
