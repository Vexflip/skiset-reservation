import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const email = body.email?.trim().toLowerCase()
        const password = body.password

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 })
        }

        const admin = await prisma.admin.findUnique({
            where: { email },
        })

        if (!admin) {
            return NextResponse.json({
                error: `User not found: ${email}. Please create the admin first.`
            }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash)
        if (!isValid) {
            return NextResponse.json({
                error: 'Invalid password. Hash mismatch.'
            }, { status: 401 })
        }

        const token = signToken({ id: admin.id, email: admin.email })

        const cookieStore = await cookies()
        cookieStore.set('admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed from 'strict' to 'lax' for production compatibility
            maxAge: 86400, // 1 day
            path: '/',
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
