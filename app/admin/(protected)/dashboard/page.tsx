"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'


interface Reservation {
    id: string
    firstName: string
    lastName: string
    email: string
    startDate: string
    endDate: string
    status: string
    items: any[]
}

export default function Dashboard() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const [reservations, setReservations] = useState<Reservation[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL')
    const [customerFilter, setCustomerFilter] = useState('')
    const [promoFilter, setPromoFilter] = useState(searchParams?.get('promoCode') || '')

    // Update state if URL changes (e.g. navigation)
    useEffect(() => {
        const code = searchParams?.get('promoCode')
        if (code !== null && code !== promoFilter) {
            setPromoFilter(code)
        }
    }, [searchParams])

    const fetchReservations = async () => {
        setLoading(true)
        let url = '/api/admin/reservations'
        const params = new URLSearchParams()

        if (dateFilter) params.append('date', dateFilter)
        if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter)
        if (customerFilter) params.append('customer', customerFilter)
        if (promoFilter) params.append('promoCode', promoFilter)

        if (Array.from(params).length > 0) {
            url += `?${params.toString()}`
        }

        try {
            const res = await fetch(url)
            const data = await res.json()

            // Ensure data is an array before setting state
            if (Array.isArray(data)) {
                setReservations(data)
            } else {
                console.error('Invalid data format:', data)
                setReservations([])
            }
        } catch (e) {
            console.error(e)
            setReservations([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Debounce customer search
        const timeoutId = setTimeout(() => {
            fetchReservations()
        }, 300)
        return () => clearTimeout(timeoutId)
    }, [dateFilter, statusFilter, customerFilter, promoFilter])

    return (
        <div className="px-4 py-4 sm:px-0 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Reservations</h1>
                <div className="flex items-center space-x-4">
                    {/* Customer Search */}
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Search:</span>
                        <input
                            type="text"
                            placeholder="Name or Email..."
                            className="p-2 border rounded-lg text-sm bg-white shadow-sm w-48"
                            value={customerFilter}
                            onChange={(e) => setCustomerFilter(e.target.value)}
                        />
                        {customerFilter && (
                            <button
                                onClick={() => setCustomerFilter('')}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Status:</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 border rounded-lg text-sm bg-white shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CANCELLED">Cancelled</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Date:</span>
                        <input
                            type="date"
                            className="p-2 border rounded-lg text-sm bg-white shadow-sm"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        />
                        {dateFilter && (
                            <button
                                onClick={() => setDateFilter('')}
                                className="text-xs text-blue-600 hover:underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : reservations.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">No reservations found.</td>
                                </tr>
                            ) : (
                                reservations.map((res) => {
                                    const statusColors =
                                        res.status === 'CONFIRMED' ? 'bg-green-50 hover:bg-green-100' :
                                            res.status === 'CANCELLED' ? 'bg-red-50 hover:bg-red-100' :
                                                res.status === 'COMPLETED' ? 'bg-blue-50 hover:bg-blue-100' :
                                                    'bg-yellow-50 hover:bg-yellow-100'

                                    const statusBadgeColors =
                                        res.status === 'CONFIRMED' ? 'bg-green-200 text-green-900' :
                                            res.status === 'CANCELLED' ? 'bg-red-200 text-red-900' :
                                                res.status === 'COMPLETED' ? 'bg-blue-200 text-blue-900' :
                                                    'bg-yellow-200 text-yellow-900'

                                    return (
                                        <tr key={res.id} className={statusColors}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{res.firstName} {res.lastName}</div>
                                                        <div className="text-sm text-gray-500">{res.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadgeColors}`}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {res.items.length} items
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/reservations/${res.id}`}
                                                    className="text-blue-600 hover:text-blue-900 hover:underline"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
