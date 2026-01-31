"use client"

import { useState, useEffect } from 'react'

interface Customer {
    email: string
    firstName: string
    lastName: string
    phone: string
    totalReservations: number
    lastBookingDate: string
    categories: string[] // e.g. ["ADULT_SKI", "SNOWBOARD"]
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([])
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState('ALL')
    const [minReservations, setMinReservations] = useState<number>(0)
    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())

    // Email Modal State
    const [showEmailModal, setShowEmailModal] = useState(false)
    const [emailSubject, setEmailSubject] = useState('')
    const [emailGreeting, setEmailGreeting] = useState('Bonjour')
    const [emailMessage, setEmailMessage] = useState('')
    const [sending, setSending] = useState(false)

    // Feedback
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    useEffect(() => {
        fetchCustomers()
    }, [])

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [feedback])

    const fetchCustomers = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/customers')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setCustomers(data)
            setFilteredCustomers(data)
        } catch (e) {
            console.error(e)
            setFeedback({ message: 'Failed to load customers', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    useEffect(() => {
        let result = customers

        // 1. Name/Email Search
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase()
            result = result.filter(c =>
                c.firstName.toLowerCase().includes(lowerQ) ||
                c.lastName.toLowerCase().includes(lowerQ) ||
                c.email.toLowerCase().includes(lowerQ)
            )
        }

        // 2. Type Filter
        if (typeFilter !== 'ALL') {
            result = result.filter(c => c.categories.includes(typeFilter))
        }

        // 3. Min Reservations
        if (minReservations > 0) {
            result = result.filter(c => c.totalReservations >= minReservations)
        }

        setFilteredCustomers(result)
        // Reset selection when filters change (optional, but safer)
        setSelectedEmails(new Set())
    }, [customers, searchQuery, typeFilter, minReservations])

    const toggleSelectAll = () => {
        if (selectedEmails.size === filteredCustomers.length) {
            setSelectedEmails(new Set())
        } else {
            setSelectedEmails(new Set(filteredCustomers.map(c => c.email)))
        }
    }

    const toggleCustomer = (email: string) => {
        const newSelected = new Set(selectedEmails)
        if (newSelected.has(email)) {
            newSelected.delete(email)
        } else {
            newSelected.add(email)
        }
        setSelectedEmails(newSelected)
    }

    const handleSendEmail = async () => {
        if (!emailSubject || !emailMessage || !emailGreeting) {
            alert('Please fill in subject, greeting and message')
            return
        }

        try {
            setSending(true)

            // Get full customer details for selected emails
            const selectedCustomers = customers
                .filter(c => selectedEmails.has(c.email))
                .map(c => ({
                    email: c.email,
                    firstName: c.firstName,
                    lastName: c.lastName
                }))

            const res = await fetch('/api/admin/email/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipients: selectedCustomers,
                    subject: emailSubject,
                    greeting: emailGreeting,
                    message: emailMessage
                })
            })

            if (!res.ok) throw new Error('Failed to send')

            setFeedback({ message: `Email sent to ${selectedEmails.size} customers!`, type: 'success' })
            setShowEmailModal(false)
            setEmailSubject('')
            setEmailMessage('')
            setSelectedEmails(new Set()) // Optional: clear selection
        } catch (e) {
            console.error(e)
            setFeedback({ message: 'Failed to send email', type: 'error' })
        } finally {
            setSending(false)
        }
    }

    return (
        <>
            <div className="px-4 py-4 sm:px-0 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Customers</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-500">
                            {filteredCustomers.length} found ({customers.length} total)
                        </div>
                        {selectedEmails.size > 0 && (
                            <button
                                onClick={() => setShowEmailModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Send Email to ({selectedEmails.size})
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Search Customer</label>
                        <input
                            type="text"
                            placeholder="Name or Email..."
                            className="p-2 border rounded-lg text-sm bg-gray-50 w-48 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Reservation Type</label>
                        <select
                            className="p-2 border rounded-lg text-sm bg-gray-50 w-40 shadow-sm"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            <option value="ALL">All Types</option>
                            <option value="ADULT_SKI">Adult Ski</option>
                            <option value="KIDS_SKI">Kids Ski</option>
                            <option value="SNOWBOARD">Snowboard</option>
                            <option value="HELMET">Helmet</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Min. Reservations</label>
                        <input
                            type="number"
                            min="0"
                            className="p-2 border rounded-lg text-sm bg-gray-50 w-32 shadow-sm"
                            value={minReservations}
                            onChange={(e) => setMinReservations(parseInt(e.target.value) || 0)}
                        />
                    </div>

                    {(searchQuery || typeFilter !== 'ALL' || minReservations > 0) && (
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setTypeFilter('ALL')
                                setMinReservations(0)
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 underline pb-2"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={filteredCustomers.length > 0 && selectedEmails.size === filteredCustomers.length}
                                            onChange={toggleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservations</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Booking</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">Loading...</td></tr>
                                ) : filteredCustomers.length === 0 ? (
                                    <tr><td colSpan={5} className="px-6 py-10 text-center">No customers found matching filters.</td></tr>
                                ) : (
                                    filteredCustomers.map((c) => (
                                        <tr key={c.email} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmails.has(c.email)}
                                                    onChange={() => toggleCustomer(c.email)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{c.firstName} {c.lastName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{c.email}</div>
                                                <div className="text-sm text-gray-500">{c.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {c.totalReservations} Orders
                                                </span>
                                                <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                                                    {c.categories.join(', ')}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(c.lastBookingDate).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Send Broadcast Email</h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                            <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded">
                                Sending to {selectedEmails.size} customers
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Greeting (e.g. "Bonjour", "Hey")</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={emailGreeting}
                                onChange={e => setEmailGreeting(e.target.value)}
                                placeholder="Bonjour"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={emailSubject}
                                onChange={e => setEmailSubject(e.target.value)}
                                placeholder="Special Offer, Update, etc."
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                className="w-full p-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                value={emailMessage}
                                onChange={e => setEmailMessage(e.target.value)}
                                placeholder="Write your message here..."
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEmailModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sending || !emailSubject || !emailMessage}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                            >
                                {sending ? 'Sending...' : 'Send Email'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white font-medium flex items-center gap-2 animate-fade-in z-50 ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {feedback.message}
                </div>
            )}
        </>
    )
}
