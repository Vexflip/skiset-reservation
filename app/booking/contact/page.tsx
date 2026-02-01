"use client"

import { useState } from 'react'
import { useBooking } from '@/app/context/BookingContext'
import { useRouter } from 'next/navigation'

export default function ContactPage() {
    const { items, contactDetails, setContactDetails, resetBooking, rentalStartDate, rentalEndDate } = useBooking()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [promoCode, setPromoCode] = useState("")
    const [appliedPromo, setAppliedPromo] = useState<{ code: string, discountType: string, discountValue: number } | null>(null)
    const [promoError, setPromoError] = useState("")
    const [validatingPromo, setValidatingPromo] = useState(false)

    const handleApplyPromo = async () => {
        if (!promoCode.trim()) return
        setValidatingPromo(true)
        setPromoError("")
        try {
            const res = await fetch('/api/promocodes/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCode })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error)
            setAppliedPromo(data)
        } catch (err: any) {
            setAppliedPromo(null)
            setPromoError(err.message)
        } finally {
            setValidatingPromo(false)
        }
    }

    const removePromo = () => {
        setAppliedPromo(null)
        setPromoCode("")
        setPromoError("")
    }

    const calculateTotal = () => {
        const subtotal = items.reduce((sum, item) => sum + item.price, 0)
        if (!appliedPromo) return { subtotal, total: subtotal, discount: 0 }

        let discount = 0
        if (appliedPromo.discountType === 'PERCENTAGE') {
            discount = subtotal * (appliedPromo.discountValue / 100)
        } else {
            discount = appliedPromo.discountValue
        }
        discount = Math.min(discount, subtotal)

        return { subtotal, total: subtotal - discount, discount }
    }

    const { subtotal, total, discount } = calculateTotal()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Basic validation is handled by HTML required attributes, but we can add more here

        try {
            const payload = {
                ...contactDetails,
                startDate: rentalStartDate,
                endDate: rentalEndDate,
                promoCode: appliedPromo?.code,
                items: items.map(i => ({
                    category: i.category,
                    productName: i.productName || 'Unknown Product',
                    price: i.price,
                    image: i.image,
                    bootsImage: i.bootsImage,
                    helmetImage: i.helmetImage,
                    options: i.options?.join(','),
                    size: i.size,
                    level: i.level,
                    quantity: i.quantity,
                    // Personal information
                    surname: i.surname,
                    sex: i.sex,
                    age: i.age,
                    height: i.height,
                    weight: i.weight,
                    shoeSize: i.shoeSize,
                }))
            }

            const res = await fetch('/api/reservation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const err = await res.json()
                alert('Error: ' + (err.error || 'Something went wrong'))
                setLoading(false)
                return
            }

            router.push('/booking/success')
            // We do NOT reset booking here immediately if we want to show details on success page?
            // Actually usually we reset after moving away from success, or passing data via query/state.
            // Let's reset on success page mount or just clear storage here potentially.
            // For now, let's keep it in context to display on success page, clear it when leaving success page.
        } catch (error) {
            console.error(error)
            alert('Failed to submit reservation.')
            setLoading(false)
        }
    }

    const handleChange = (field: string, value: any) => {
        setContactDetails({ ...contactDetails, [field]: value })
    }

    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-2">Contact Details</h1>
            <p className="text-white mb-8">Please provide your details to confirm the reservation.</p>

            {/* Order Summary */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                    Reservation Summary
                </h2>

                {/* Dates */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800 flex justify-between items-center">
                    <span className="font-medium">Dates:</span>
                    <span>{new Date(rentalStartDate).toLocaleDateString()} - {new Date(rentalEndDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {items.map((item, idx) => (
                        <div key={item.id || idx} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                            <span className="text-gray-600 truncate mr-4">{item.productName}</span>
                            <span className="font-medium text-gray-900 whitespace-nowrap">{item.price.toFixed(2)}€</span>
                        </div>
                    ))}
                </div>

                {/* Promo Code Input */}
                <div className="mb-6 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Have a promo code?</label>
                    {appliedPromo ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </span>
                                <div>
                                    <span className="font-bold text-green-800 mr-2">{appliedPromo.code}</span>
                                    <span className="text-sm text-green-700">
                                        -{appliedPromo.discountType === 'PERCENTAGE' ? `${appliedPromo.discountValue}%` : `${appliedPromo.discountValue}€`} Applied
                                    </span>
                                </div>
                            </div>
                            <button onClick={removePromo} className="text-gray-400 hover:text-red-500 transition">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="Enter code"
                                className="flex-grow p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                disabled={validatingPromo}
                            />
                            <button
                                type="button"
                                onClick={handleApplyPromo}
                                disabled={!promoCode || validatingPromo}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 transition"
                            >
                                {validatingPromo ? '...' : 'Apply'}
                            </button>
                        </div>
                    )}
                    {promoError && (
                        <p className="text-red-500 text-sm mt-2">{promoError}</p>
                    )}
                </div>

                <div className="border-t border-gray-100 pt-4">
                    {appliedPromo && (
                        <div className="flex justify-between items-center text-gray-500 mb-1 text-sm">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(2)}€</span>
                        </div>
                    )}
                    {appliedPromo && (
                        <div className="flex justify-between items-center text-green-600 mb-2 font-medium">
                            <span>Discount ({appliedPromo.code})</span>
                            <span>-{discount.toFixed(2)}€</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-lg font-bold text-gray-900">Total to Pay</span>
                        <div className="text-right">
                            {appliedPromo && <span className="text-sm text-gray-400 line-through mr-2">{subtotal.toFixed(2)}€</span>}
                            <span className="text-3xl font-black text-blue-600">
                                {total.toFixed(2)}€
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">First Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={contactDetails.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Last Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={contactDetails.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                    <input
                        type="email"
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={contactDetails.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input
                        type="tel"
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={contactDetails.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Date fields removed - using global rental dates */}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                        value={contactDetails.notes}
                        onChange={(e) => handleChange('notes', e.target.value)}
                        placeholder="Any special requests?"
                    />
                </div>

                <div className="flex items-start gap-3 pt-6 pb-2">
                    <div className="flex items-center h-5">
                        <input
                            id="terms"
                            name="terms"
                            type="checkbox"
                            required
                            checked={contactDetails.termsAccepted}
                            onChange={(e) => handleChange('termsAccepted', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                    </div>
                    <div className="text-sm">
                        <label htmlFor="terms" className="font-medium text-gray-700">
                            I agree to the <a href="/terms" target="_blank" className="text-blue-600 hover:text-blue-500 underline">Terms of Service</a> and <a href="/privacy" target="_blank" className="text-blue-600 hover:text-blue-500 underline">Privacy Policy</a>
                        </label>
                        <p className="text-gray-500">You must accept our terms to proceed with the reservation.</p>
                    </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-gray-500 hover:text-gray-800 font-medium px-4"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg transition-transform active:scale-[0.98]
                        ${loading ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {loading ? 'Confirming...' : 'Confirm Reservation'}
                    </button>
                </div>
            </form>
        </div>
    )
}
