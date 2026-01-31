"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [secret, setSecret] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            if (res.ok) {
                router.push('/admin/dashboard')
            } else {
                const data = await res.json()
                setError(data.error || 'Login failed')
                setLoading(false)
            }
        } catch (err) {
            setError('An error occurred')
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setLoading(true)

        try {
            const res = await fetch('/api/admin/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, secret }),
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(data.message || 'Admin created successfully')
                setIsCreating(false)
                setSecret('')
                setPassword('')
            } else {
                setError(data.error || 'Creation failed')
            }
        } catch (err) {
            setError('An error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {isCreating ? 'Create Admin' : 'Admin Access'}
                </h1>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-100">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm border border-green-100">
                        {success}
                    </div>
                )}

                <form onSubmit={isCreating ? handleCreate : handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {isCreating && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                            <input
                                type="password"
                                required
                                placeholder="Enter secret key to create admin"
                                className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={secret}
                                onChange={(e) => setSecret(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-lg font-semibold transition"
                    >
                        {loading ? 'Processing...' : (isCreating ? 'Create Admin' : 'Sign In')}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={() => {
                            setIsCreating(!isCreating)
                            setError('')
                            setSuccess('')
                        }}
                        className="text-sm text-gray-500 hover:text-gray-900 underline"
                    >
                        {isCreating ? 'Back to Login' : 'Create New Admin'}
                    </button>
                </div>
            </div>
        </div>
    )
}
