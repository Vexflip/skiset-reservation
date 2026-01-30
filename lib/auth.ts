import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const SECRET = process.env.JWT_SECRET || 'super-secret-key'

export function signToken(payload: any) {
    return jwt.sign(payload, SECRET, { expiresIn: '1d' })
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, SECRET)
    } catch (e) {
        return null
    }
}

export async function getSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get('admin_token')?.value
    if (!token) return null
    return verifyToken(token)
}
