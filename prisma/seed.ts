import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@skiset.com'
  const password = 'password123'
  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
    },
  })

  console.log({ admin })

  // Seed Products
  const products = [
    {
      name: 'Découverte',
      description: 'Je skie avec du matériel sécurisant et maniable pour découvrir les plaisirs de la glisse facile.',
      category: 'ADULT_SKI',
      price: 121.60,
      originalPrice: 152.00,
      level: 'BEGINNER',
      image: '/images/ski-decouverte.png', // Placeholder
      active: true
    },
    {
      name: 'Sensation',
      description: 'Je skie avec du matériel polyvalent, pour des sensations décuplées, toutes pistes et dans toutes les conditions de neige.',
      category: 'ADULT_SKI',
      price: 112.00,
      originalPrice: 140.00,
      level: 'INTERMEDIATE',
      image: '/images/ski-sensation.png', // Placeholder
      active: true
    },
    {
      name: 'Excellence',
      description: 'Je skie avec le top de la sélection SKISET, pour plus de performances et un plaisir intense, aussi bien sur piste qu\'en hors piste.',
      category: 'ADULT_SKI',
      price: 194.65,
      originalPrice: 229.00,
      level: 'ADVANCED',
      image: '/images/ski-excellence.png', // Placeholder
      active: true
    }
  ]

  for (const product of products) {
    await prisma.product.create({
      data: product
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
