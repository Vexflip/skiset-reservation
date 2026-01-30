"use client"

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ReservationItem {
    id: string
    productName: string
    category: string
    quantity: number
    size?: string
    level?: string
    price: number
    image?: string
    options?: string[]
    bootsImage?: string
    helmetImage?: string

    // Personal information
    surname?: string
    itemStartDate?: string
    itemEndDate?: string
    sex?: string
    age?: number
    height?: string
    weight?: string
    shoeSize?: string
}

interface ReservationDetails {
    id: string
    firstName: string
    lastName: string
    email: string
    startDate: string
    endDate: string
    status: string
    items: ReservationItem[]
    totalPrice: number
    discountAmount?: number
    finalPrice?: number
    promoCode?: {
        code: string
        discountType: "PERCENTAGE" | "FIXED_AMOUNT"
        discountValue: number
    } | null
    createdAt?: string
    adminNotes?: string | null
}

// Helper to get friendly category names
const getCategoryDisplayName = (category: string) => {
    switch (category) {
        case 'ADULT_SKI': return 'Ski Adulte'
        case 'KIDS_SKI': return 'Ski Enfant'
        case 'SNOWBOARD': return 'Snowboard'
        case 'HELMET': return 'Casque'
        default: return category
    }
}

export default function ReservationDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const { id } = use(params)
    const [reservation, setReservation] = useState<ReservationDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [actionLoading, setActionLoading] = useState(false)
    const [notes, setNotes] = useState('')
    const [notesSaving, setNotesSaving] = useState(false)
    const [feedback, setFeedback] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
    const [confirmModal, setConfirmModal] = useState<{ show: boolean, message: string, action: () => Promise<void> | void, isDangerous?: boolean } | null>(null)

    useEffect(() => {
        if (feedback) {
            const timer = setTimeout(() => setFeedback(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [feedback])

    useEffect(() => {
        const fetchReservation = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/admin/reservations/${id}`)

                if (!res.ok) {
                    throw new Error('Failed to fetch reservation')
                }

                const data = await res.json()
                setReservation(data)
                setNotes(data.adminNotes || '')
            } catch (e) {
                console.error(e)
                setError('Failed to load reservation details')
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchReservation()
        }
    }, [id])

    const handleStatusUpdate = (newStatus: string) => {
        if (!reservation) return

        const message = newStatus === 'CONFIRMED'
            ? 'Are you sure you want to validate this reservation?'
            : 'Are you sure you want to cancel this reservation?'

        setConfirmModal({
            show: true,
            message,
            isDangerous: newStatus === 'CANCELLED',
            action: async () => {
                try {
                    setActionLoading(true)
                    const res = await fetch(`/api/admin/reservations/${id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status: newStatus })
                    })

                    if (!res.ok) {
                        throw new Error('Failed to update reservation')
                    }

                    const updatedReservation = await res.json()
                    setReservation(updatedReservation)
                    setFeedback({
                        message: newStatus === 'CONFIRMED' ? 'Réservation confirmée !' :
                            newStatus === 'CANCELLED' ? 'Réservation annulée.' : 'Statut mis à jour !',
                        type: 'success'
                    })
                } catch (e) {
                    console.error(e)
                    setFeedback({ message: 'Erreur lors de la mise à jour', type: 'error' })
                } finally {
                    setActionLoading(false)
                    setConfirmModal(null)
                }
            }
        })
    }

    const handleSaveNotes = async () => {
        try {
            setNotesSaving(true)
            const res = await fetch(`/api/admin/reservations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ adminNotes: notes })
            })

            if (!res.ok) throw new Error('Failed to save notes')

            setFeedback({ message: 'Note personnelle sauvegardée !', type: 'success' })
        } catch (e) {
            console.error(e)
            setFeedback({ message: 'Erreur lors de la sauvegarde de la note', type: 'error' })
        } finally {
            setNotesSaving(false)
        }
    }

    const handleDelete = () => {
        setConfirmModal({
            show: true,
            message: 'Are you sure you want to delete this reservation? This action cannot be undone.',
            isDangerous: true,
            action: async () => {
                try {
                    setActionLoading(true)
                    const res = await fetch(`/api/admin/reservations/${id}`, {
                        method: 'DELETE'
                    })

                    if (!res.ok) {
                        throw new Error('Failed to delete reservation')
                    }

                    // Redirect to dashboard after successful deletion
                    setFeedback({ message: 'Réservation supprimée.', type: 'success' })
                    setTimeout(() => router.push('/admin/dashboard'), 1500)
                } catch (e) {
                    console.error(e)
                    setFeedback({ message: 'Erreur lors de la suppression', type: 'error' })
                    setActionLoading(false)
                } finally {
                    setConfirmModal(null)
                }
            }
        })
    }

    if (loading) {
        return (
            <div className="px-4 py-8 sm:px-0 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-600">Loading reservation details...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !reservation) {
        return (
            <div className="px-4 py-8 sm:px-0 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800 font-medium">{error || 'Reservation not found'}</p>
                        <Link
                            href="/admin/dashboard"
                            className="mt-4 inline-block text-blue-600 hover:text-blue-800 underline"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="px-4 py-8 sm:px-0 animate-fade-in">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <Link
                            href="/admin/dashboard"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Reservation Details</h1>
                        <p className="text-sm text-gray-500 mt-1">ID: {reservation.id}</p>
                    </div>

                    {/* Customer Information Card */}
                    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Customer Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="text-lg font-medium text-gray-900">{reservation.firstName} {reservation.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email Address</p>
                                <p className="text-lg font-medium text-gray-900">{reservation.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Rental Period</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {new Date(reservation.startDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-sm text-gray-600">
                                    to {new Date(reservation.endDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    ({Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days)
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${reservation.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                    reservation.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                        reservation.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {reservation.status}
                                </span>
                            </div>
                            {reservation.createdAt && (
                                <div>
                                    <p className="text-sm text-gray-500">Booking Date</p>
                                    <p className="text-base font-medium text-gray-900">
                                        {new Date(reservation.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Admin Notes Card */}
                    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-blue-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                            Admin Private Notes
                        </h2>
                        <div className="space-y-3">
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add private notes here (visible only to admins)..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px]"
                            />
                            <div className="flex justify-end">
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={notesSaving}
                                    className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {notesSaving ? 'Saving...' : 'Save Notes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Equipment Details Card */}
                    <div className="bg-white shadow-md rounded-lg border border-gray-200 p-6 mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            Equipment ({reservation.items.length} {reservation.items.length === 1 ? 'item' : 'items'})
                        </h2>

                        <div className="space-y-4">
                            {reservation.items.map((item) => (
                                <div key={item.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Product Image */}
                                        <div className="w-24 h-24 bg-white rounded-md border border-gray-300 flex items-center justify-center overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.productName} className="w-full h-full object-contain" />
                                            ) : (
                                                <span className="text-4xl">⛷</span>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900">{item.productName || item.category}</h3>
                                                    {item.category && item.productName && (
                                                        <p className="text-sm text-gray-500">{getCategoryDisplayName(item.category)}</p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-blue-600">{Number(item.price).toFixed(2)}€</p>
                                                    <p className="text-xs text-gray-500">per item</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                                {/* Quantity, Size, Level removed as per request */}
                                            </div>

                                            {/* Add-ons/Options */}
                                            {item.options && item.options.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {item.options.includes('BOOTS') && (
                                                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium flex items-center gap-1">
                                                            🥾 Boots {item.bootsImage && '📸'}
                                                        </span>
                                                    )}
                                                    {item.options.includes('HELMET') && (
                                                        <span className="px-3 py-1 bg-yellow-50 text-yellow-700 text-xs rounded-full font-medium flex items-center gap-1">
                                                            🪖 Helmet {item.helmetImage && '📸'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Rental Duration for this item */}
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Rental Period</p>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {new Date(reservation.startDate).toLocaleDateString()} - {new Date(reservation.endDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Duration</p>
                                                        <p className="text-sm font-bold text-blue-600">
                                                            {Math.ceil((new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Personal Information Section */}
                                            {(item.surname || item.height || item.weight || item.shoeSize) && (
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">📋 Personal Info</p>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {item.surname && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Nom</p>
                                                                <p className="text-sm font-semibold text-gray-900">{item.surname}</p>
                                                            </div>
                                                        )}
                                                        {item.sex && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Sexe</p>
                                                                <p className="text-sm font-semibold text-gray-900">{item.sex === 'M' ? 'Homme' : 'Femme'}</p>
                                                            </div>
                                                        )}
                                                        {item.age && (
                                                            <div>
                                                                <p className="text-xs text-gray-500">Âge</p>
                                                                <p className="text-sm font-semibold text-gray-900">{item.age} ans</p>
                                                            </div>
                                                        )}
                                                        {(item.height || item.weight || item.shoeSize) && (
                                                            <div className="md:col-span-4 bg-gray-50 px-3 py-2 rounded border border-gray-100 flex flex-wrap gap-4">
                                                                {item.height && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500">Taille:</span>
                                                                        <span className="text-sm font-bold text-gray-900">{item.height} cm</span>
                                                                    </div>
                                                                )}
                                                                {item.weight && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500">Poids:</span>
                                                                        <span className="text-sm font-bold text-gray-900">{item.weight} kg</span>
                                                                    </div>
                                                                )}
                                                                {item.shoeSize && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-xs text-gray-500">Pointure:</span>
                                                                        <span className="text-sm font-bold text-gray-900">{item.shoeSize}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Subtotal */}
                                            {item.quantity > 1 && (
                                                <div className="mt-3 pt-3 border-t border-gray-300">
                                                    <p className="text-sm text-gray-600">
                                                        Subtotal: <span className="font-bold text-gray-900">{(Number(item.price) * item.quantity).toFixed(2)}€</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Price Summary Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md rounded-lg border-2 border-blue-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Summary</h2>
                        <div className="space-y-2">
                            {reservation.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{item.productName || getCategoryDisplayName(item.category)} (×{item.quantity})</span>
                                    <span className="font-medium text-gray-900">{(Number(item.price) * item.quantity).toFixed(2)}€</span>
                                </div>
                            ))}
                            <div className="border-t-2 border-blue-300 pt-3 mt-3">
                                {reservation.promoCode ? (
                                    <>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="text-lg font-medium text-gray-900">{Number(reservation.totalPrice).toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2 text-green-700">
                                            <div className="flex items-center gap-2">
                                                <span>Discount ({reservation.promoCode.code})</span>
                                                <span className="text-xs bg-green-200 px-2 py-0.5 rounded-full">
                                                    {reservation.promoCode.discountType === 'PERCENTAGE'
                                                        ? `-${reservation.promoCode.discountValue}%`
                                                        : `-${reservation.promoCode.discountValue}€`}
                                                </span>
                                            </div>
                                            <span className="font-medium">-{Number(reservation.discountAmount).toFixed(2)}€</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                                            <span className="text-2xl font-bold text-gray-900">Total</span>
                                            <span className="text-3xl font-bold text-blue-600">{Number(reservation.finalPrice).toFixed(2)}€</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-900">Total</span>
                                        <span className="text-3xl font-bold text-blue-600">{Number(reservation.totalPrice).toFixed(2)}€</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 space-y-4">
                        {/* Status Action Buttons */}
                        {reservation.status !== 'CANCELLED' && reservation.status !== 'COMPLETED' && (
                            <div className="flex gap-4">
                                {reservation.status === 'PENDING' && (
                                    <button
                                        onClick={() => handleStatusUpdate('CONFIRMED')}
                                        disabled={actionLoading}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {actionLoading ? 'Processing...' : 'Validate Reservation'}
                                    </button>
                                )}
                                {(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && (
                                    <button
                                        onClick={() => handleStatusUpdate('CANCELLED')}
                                        disabled={actionLoading}
                                        className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        {actionLoading ? 'Processing...' : 'Cancel Reservation'}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Secondary Actions */}
                        <div className="flex gap-4">
                            <Link
                                href="/admin/dashboard"
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors text-center flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back to Dashboard
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Print Details
                            </button>
                        </div>

                        {/* Delete Button - Separate and Dangerous */}
                        <button
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {actionLoading ? 'Deleting...' : 'Delete Reservation'}
                        </button>
                    </div>

                </div>
            </div>

            {/* Feedback Toast */}
            {feedback && (
                <div className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-lg text-white font-medium flex items-center gap-2 animate-fade-in z-50 ${feedback.type === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                    {feedback.type === 'success' ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {feedback.message}
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {confirmModal && confirmModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmation</h3>
                        <p className="text-gray-600 mb-8 leading-relaxed">
                            {confirmModal.message}
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setConfirmModal(null)}
                                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    confirmModal.action()
                                }}
                                className={`px-5 py-2.5 rounded-lg text-white font-medium shadow-sm transition-colors ${confirmModal.isDangerous
                                    ? 'bg-red-600 hover:bg-red-700'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
