"use client"

import { BookingProvider } from '@/app/context/BookingContext'
import Link from 'next/link'

export default function BookingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <BookingProvider>
            <div className="min-h-screen relative flex flex-col">
                {/* Background with gradient */}
                <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 -z-10" />

                {/* Decorative background pattern */}
                <div className="fixed inset-0 -z-10 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>


                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    {children}
                </main>
                <footer className="bg-transparent py-6 text-center text-white/70 text-sm">
                    © {new Date().getFullYear()} Skiset Reservation. All rights reserved.
                </footer>
            </div>
        </BookingProvider>
    )
}
