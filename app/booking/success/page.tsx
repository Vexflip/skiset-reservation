"use client"

import { useEffect } from 'react'
import { useBooking } from '@/app/context/BookingContext'
import Link from 'next/link'

export default function SuccessPage() {
    const { resetBooking, contactDetails } = useBooking()

    useEffect(() => {
        // Clear the session on unmount
        return () => {
            resetBooking()
        }
    }, []) // Empty dependency array to run only on mount/unmount

    return (
        <div className="animate-fade-in max-w-xl mx-auto text-center pt-16">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-4xl">
                🎉
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Reservation Confirmed!</h1>
            <p className="text-xl text-white mb-8">
                Thank you {contactDetails.firstName}. We have sent a confirmation email to <strong>{contactDetails.email}</strong>.
            </p>

            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 text-left inline-block w-full">
                <h3 className="font-semibold text-gray-900 mb-4 border-b pb-2">Next Steps</h3>
                <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center">✓ Check your email for details</li>
                    <li className="flex items-center">✓ Arrive at the shop on {new Date(contactDetails.startDate).toLocaleDateString()}</li>
                    <li className="flex items-center">✓ Pick up your equipment</li>
                </ul>
            </div>

            <div>
                <Link
                    href="/"
                    className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                    Return Home
                </Link>
            </div>
        </div>
    )
}
