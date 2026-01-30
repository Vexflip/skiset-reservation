
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const admins = await prisma.admin.findMany()
    console.log('Admins:', admins)

    const products = await prisma.product.findMany()
    console.log('Product count:', products.length)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
