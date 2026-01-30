"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

export type EquipmentCategory = 'ADULT_SKI' | 'KIDS_SKI' | 'SNOWBOARD' | 'HELMET'

export interface BookingItem {
    id: string
    category: EquipmentCategory
    productName: string
    price: number
    image?: string
    size: string
    level: string // BEGINNER, INTERMEDIATE, ADVANCED
    quantity: number
    options?: string[] // e.g. ['BOOTS', 'HELMET']
    bootsImage?: string | null
    helmetImage?: string | null

    // Personal information for this item
    surname?: string            // Nom de famille
    sex?: string                // Sexe (M/F)
    age?: number                // Âge
    height?: string             // Taille (dropdown selection)
    weight?: string             // Poids (dropdown selection)
    shoeSize?: string           // Pointure (dropdown selection)
}

interface BookingState {
    items: BookingItem[]
    addItem: (item: BookingItem) => void
    removeItem: (id: string) => void
    updateItem: (id: string, updates: Partial<BookingItem>) => void

    // Global rental dates
    rentalStartDate: string
    rentalEndDate: string
    rentalDays: number
    setRentalDates: (startDate: string, endDate: string) => void

    contactDetails: {
        startDate: string
        endDate: string
        firstName: string
        lastName: string
        email: string
        phone: string
        notes: string
    }
    setContactDetails: (details: any) => void
    resetBooking: () => void
}

const BookingContext = createContext<BookingState | undefined>(undefined)

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<BookingItem[]>([])
    const [rentalStartDate, setRentalStartDate] = useState('')
    const [rentalEndDate, setRentalEndDate] = useState('')
    const [rentalDays, setRentalDays] = useState(1)

    const [contactDetails, setContactDetails] = useState({
        startDate: '',
        endDate: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
    })

    // Load from localStorage on mount or set defaults
    useEffect(() => {
        const saved = localStorage.getItem('skiset_booking')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setItems(parsed.items || [])
                setContactDetails(parsed.contactDetails || {})

                if (parsed.rentalStartDate && parsed.rentalEndDate) {
                    setRentalStartDate(parsed.rentalStartDate)
                    setRentalEndDate(parsed.rentalEndDate)
                    setRentalDays(parsed.rentalDays || 1)
                } else {
                    // Saved state exists but no dates (e.g. old data), set defaults
                    setDefaultDates()
                }
            } catch (e) {
                console.error('Failed to load booking state', e)
                setDefaultDates()
            }
        } else {
            // No saved data, set defaults
            setDefaultDates()
        }
    }, [])

    const setDefaultDates = () => {
        const today = new Date()
        const nextWeek = new Date(today)
        nextWeek.setDate(today.getDate() + 6) // 7 days inclusive

        const startStr = today.toISOString().split('T')[0]
        const endStr = nextWeek.toISOString().split('T')[0]

        setRentalStartDate(startStr)
        setRentalEndDate(endStr)
        setRentalDays(7)
    }

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('skiset_booking', JSON.stringify({
            items,
            contactDetails,
            rentalStartDate,
            rentalEndDate,
            rentalDays
        }))
    }, [items, contactDetails, rentalStartDate, rentalEndDate, rentalDays])

    const addItem = React.useCallback((item: BookingItem) => {
        setItems((prev) => [...prev, item])
    }, [])

    const removeItem = React.useCallback((id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id))
    }, [])

    const updateItem = React.useCallback((id: string, updates: Partial<BookingItem>) => {
        setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)))
    }, [])

    const setRentalDates = React.useCallback((startDate: string, endDate: string) => {
        let finalStartDate = startDate
        let finalEndDate = endDate

        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            start.setHours(0, 0, 0, 0)
            end.setHours(0, 0, 0, 0)

            // 1. Enforce start <= end
            if (start > end) {
                finalEndDate = startDate
            } else {
                // 2. Enforce Max 14 Days
                const diffTime = end.getTime() - start.getTime()
                // diffDays calculation: diffTime is in ms. 
                // diffDays + 1 because the range is inclusive.
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

                if (diffDays > 14) {
                    // Cap at 14 days
                    const maxEnd = new Date(start)
                    maxEnd.setDate(start.getDate() + 13) // start + 13 days = 14 items inclusive
                    finalEndDate = maxEnd.toISOString().split('T')[0]
                }
            }
        }

        setRentalStartDate(finalStartDate)
        setRentalEndDate(finalEndDate)

        // Calculate rental days (final calculation)
        if (finalStartDate && finalEndDate) {
            const start = new Date(finalStartDate)
            const end = new Date(finalEndDate)
            start.setHours(0, 0, 0, 0)
            end.setHours(0, 0, 0, 0)
            const diffTime = end.getTime() - start.getTime()
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setRentalDays(diffDays + 1) // +1 to make it inclusive
        } else {
            setRentalDays(1)
        }
    }, [])

    const resetBooking = React.useCallback(() => {
        setItems([])
        setRentalStartDate('')
        setRentalEndDate('')
        setRentalDays(1)
        setContactDetails({
            startDate: '',
            endDate: '',
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            notes: '',
        })
        localStorage.removeItem('skiset_booking')
    }, [])

    return (
        <BookingContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateItem,
            rentalStartDate,
            rentalEndDate,
            rentalDays,
            setRentalDates,
            contactDetails,
            setContactDetails,
            resetBooking
        }}>
            {children}
        </BookingContext.Provider>
    )
}

export function useBooking() {
    const context = useContext(BookingContext)
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider')
    }
    return context
}
