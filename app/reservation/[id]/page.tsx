"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'

interface ReservationItem {
    id: string
    category: string
    productName: string
    price: number
    quantity: number
    size?: string
    level?: string
    surname?: string
    age?: number
    height?: string
    weight?: string
    shoeSize?: string
}

interface PromoCode {
    code: string
    discountType: string
    discountValue: number
}

interface ReservationData {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    startDate: string
    endDate: string
    status: string
    totalPrice: number
    discountAmount: number
    finalPrice: number
    notes?: string
    items: ReservationItem[]
    promoCode?: PromoCode
    createdAt: string
}

export default function CustomerReservationPage() {
    const params = useParams()
    const reservationId = params.id as string

    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [reservation, setReservation] = useState<ReservationData | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(`/api/reservation/${reservationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'An error occurred')
                setLoading(false)
                return
            }

            setReservation(data)
            setLoading(false)
        } catch (err) {
            setError('Failed to load reservation. Please try again.')
            setLoading(false)
        }
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-300'
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300'
            default: return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'CONFIRMED': return 'Confirmée'
            case 'PENDING': return 'En attente'
            case 'COMPLETED': return 'Terminée'
            case 'CANCELLED': return 'Annulée'
            default: return status
        }
    }

    if (!reservation) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
                    <div className="text-center mb-6">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                            RELIEF<span className="text-blue-400">.</span>
                        </h1>
                        <p className="text-sm text-slate-500 mt-2">Skiset from La Norma</p>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                        Voir ma réservation
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Entrez votre nom de famille pour accéder aux détails de votre réservation.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Nom de famille
                            </label>
                            <input
                                type="text"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition"
                                placeholder="Votre nom de famille"
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-400 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Chargement...' : 'Accéder à ma réservation'}
                        </button>
                    </form>

                    <p className="text-xs text-slate-400 mt-6 text-center">
                        Réservation #{reservationId.slice(0, 8)}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-t-lg shadow-xl p-6 border-b-4 border-blue-400">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                                RELIEF<span className="text-blue-400">.</span>
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Skiset from La Norma</p>
                        </div>
                        <div className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white shadow-xl">
                    {/* Customer Info */}
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Informations client</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-slate-500">Nom complet</p>
                                <p className="font-semibold text-slate-900">{reservation.firstName} {reservation.lastName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Email</p>
                                <p className="font-semibold text-slate-900">{reservation.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Téléphone</p>
                                <p className="font-semibold text-slate-900">{reservation.phone}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Numéro de réservation</p>
                                <p className="font-mono text-sm font-semibold text-slate-900">{reservation.id.slice(0, 13)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="p-6 bg-blue-50 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">📅 Dates de location</h2>
                        <div className="space-y-2">
                            <p className="text-slate-700">
                                <span className="font-semibold">Du:</span> {formatDate(reservation.startDate)}
                            </p>
                            <p className="text-slate-700">
                                <span className="font-semibold">Au:</span> {formatDate(reservation.endDate)}
                            </p>
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">🎿 Équipement réservé</h2>
                        <div className="space-y-4">
                            {reservation.items.map((item, index) => (
                                <div key={item.id} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-slate-900">{item.productName || item.category}</h3>
                                            {item.surname && (
                                                <p className="text-sm text-slate-600">Pour: {item.surname}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-slate-900">{formatPrice(Number(item.price) * item.quantity)}</p>
                                            <p className="text-xs text-slate-500">Qté: {item.quantity}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                        {item.size && (
                                            <div>
                                                <span className="text-slate-500">Taille:</span>
                                                <span className="ml-1 text-slate-700">{item.size}</span>
                                            </div>
                                        )}
                                        {item.age && (
                                            <div>
                                                <span className="text-slate-500">Âge:</span>
                                                <span className="ml-1 text-slate-700">{item.age} ans</span>
                                            </div>
                                        )}
                                        {item.shoeSize && (
                                            <div>
                                                <span className="text-slate-500">Pointure:</span>
                                                <span className="ml-1 text-slate-700">{item.shoeSize}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="p-6 bg-slate-50">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">💰 Récapitulatif</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-slate-700">
                                <span>Sous-total:</span>
                                <span className="font-semibold">{formatPrice(Number(reservation.totalPrice))}</span>
                            </div>
                            {Number(reservation.discountAmount) > 0 && (
                                <div className="flex justify-between text-green-700">
                                    <span>
                                        Réduction{reservation.promoCode ? ` (${reservation.promoCode.code})` : ''}:
                                    </span>
                                    <span className="font-semibold">-{formatPrice(Number(reservation.discountAmount))}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t-2 border-slate-300">
                                <span>Total:</span>
                                <span>{formatPrice(Number(reservation.finalPrice))}</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {reservation.notes && (
                        <div className="p-6 border-t border-slate-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-2">📝 Notes</h2>
                            <p className="text-slate-700 italic">{reservation.notes}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-slate-900 rounded-b-lg shadow-xl p-6 text-center">
                    <p className="text-slate-400 text-sm">
                        Pour toute question, contactez-nous à{' '}
                        <a href="mailto:no-reply@skiset-relief.vexflip.fr" className="text-blue-400 hover:underline">
                            no-reply@skiset-relief.vexflip.fr
                        </a>
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                        © {new Date().getFullYear()} Skiset Relief - La Norma
                    </p>
                </div>
            </div>
        </div>
    )
}
