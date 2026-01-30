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
                <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 -z-10" />

                {/* Decorative background pattern */}
                <div className="fixed inset-0 -z-10 opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
                    <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
                </div>

                <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-10 border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                            Skiset
                        </Link>
                        <nav className="flex space-x-4">
                            <Link href="/booking/equipment" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Equipment</Link>
                            <Link href="/booking/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Contact</Link>
                        </nav>
                    </div>
                </header>
                <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                    {children}
                </main>
                <footer className="bg-white/60 backdrop-blur-sm py-6 text-center text-gray-600 text-sm border-t border-gray-200">
                    © {new Date().getFullYear()} Skiset Reservation. All rights reserved.
                </footer>
            </div>
        </BookingProvider>
    )
}
