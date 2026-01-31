import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const email = body.email?.trim().toLowerCase()
        const password = body.password
        const secret = body.secret

        if (!email || !password || !secret) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Hardcoded secret for admin creation
        if (secret !== '123456789') {
            return NextResponse.json({ error: 'Invalid secret key' }, { status: 403 })
        }

        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        })

        if (existingAdmin) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 400 })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        await prisma.admin.create({
            data: {
                email,
                passwordHash,
            },
        })

        return NextResponse.json({ success: true, message: 'Admin created successfully' })
    } catch (error) {
        console.error('Create admin error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
