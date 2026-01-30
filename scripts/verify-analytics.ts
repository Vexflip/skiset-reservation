import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying analytics data retrieval...')

    try {
        // 1. Get total stats
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

        console.log(`Found ${allReservations.length} reservations.`)

        const totalReservations = allReservations.length
        const totalRevenue = allReservations.reduce((acc, curr) => {
            if (curr.status !== 'CANCELLED') {
                return acc + Number(curr.finalPrice)
            }
            return acc
        }, 0)

        const averageOrderValue = totalReservations > 0 ? totalRevenue / totalReservations : 0

        console.log('Stats:', {
            totalReservations,
            totalRevenue,
            averageOrderValue
        })

        // Fetch products for map
        const products = await prisma.product.findMany({
            select: {
                name: true,
                equipmentType: true
            }
        })
        const productTypeMap = new Map<string, string>()
        products.forEach(p => {
            if (p.equipmentType) productTypeMap.set(p.name, p.equipmentType)
        })

        // Check equipment distribution
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
                    if (productTypeMap.has(item.productName)) {
                        type = productTypeMap.get(item.productName) || 'OTHER'
                    } else {
                        if (item.category === 'ADULT_SKI' || item.category === 'KIDS_SKI') type = 'SKI'
                        else if (item.category === 'SNOWBOARD') type = 'SNOWBOARD'
                    }

                    if (['SKI', 'SNOWBOARD', 'MINISKI', 'TOURING'].includes(type)) {
                        equipmentCount[type] = (equipmentCount[type] || 0) + item.quantity
                    } else {
                        equipmentCount['OTHER'] = (equipmentCount['OTHER'] || 0) + item.quantity
                    }
                })
            }
        })

        console.log('Equipment Distribution:', equipmentCount)
        console.log('Verification successful!')

    } catch (error) {
        console.error('Verification failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
