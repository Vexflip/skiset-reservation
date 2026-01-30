"use client"

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useBooking, BookingItem } from '@/app/context/BookingContext'
import { useRouter } from 'next/navigation'
import DatePicker, { registerLocale } from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"
import { fr } from 'date-fns/locale/fr'
registerLocale('fr', fr)
import { calculateRentalPrice } from '@/lib/pricing'

interface Product {
    id: string
    name: string
    description: string
    category: string
    price: string // string because Decimal comes as string from JSON often, or number
    originalPrice: string | null
    level: string
    image: string
    bootsImage?: string | null
    helmetImage?: string | null
    titleColor: string
    equipmentType: string
    targetGroup: string
    dayPrices?: string | null // JSON string for custom day pricing
}

export default function EquipmentPage() {
    const { items, addItem, removeItem, rentalStartDate, rentalEndDate, rentalDays, setRentalDates } = useBooking()
    const router = useRouter()
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false)
    const [pendingItem, setPendingItem] = useState<BookingItem | null>(null)

    useEffect(() => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                setProducts(data)
                setLoading(false)
            })
            .catch(err => console.error(err))
    }, [])

    const handleAddItem = (item: BookingItem) => {
        // Open modal with pending item instead of directly adding
        setPendingItem(item)
        setShowPersonalInfoModal(true)
    }

    const handlePersonalInfoSubmit = (personalInfo: Partial<BookingItem>) => {
        if (pendingItem) {
            addItem({ ...pendingItem, ...personalInfo })
            setShowPersonalInfoModal(false)
            setPendingItem(null)
            setIsCartOpen(true)
        }
    }

    const handlePersonalInfoCancel = () => {
        setShowPersonalInfoModal(false)
        setPendingItem(null)
    }

    const handleContinue = () => {
        if (items.length === 0) {
            alert('Please add at least one item.')
            return
        }
        if (!rentalStartDate || !rentalEndDate) {
            alert('Please select rental dates.')
            return
        }
        router.push('/booking/contact')
    }

    const [filterType, setFilterType] = useState('ALL')
    const [filterGroup, setFilterGroup] = useState('ALL')

    const filteredProducts = products.filter(product => {
        const typeMatch = filterType === 'ALL' || (product.equipmentType || 'SKI') === filterType
        const groupMatch = filterGroup === 'ALL' || (product.targetGroup || 'MAN') === filterGroup
        return typeMatch && groupMatch
    })

    const TYPE_FILTERS = [
        { id: 'ALL', label: 'All Equipment' },
        { id: 'SKI', label: 'Skis' },
        { id: 'SNOWBOARD', label: 'Snowboard' },
        { id: 'MINISKI', label: 'Miniskis' },
        { id: 'TOURING', label: 'Touring' }
    ]

    const GROUP_FILTERS = [
        { id: 'ALL', label: 'Everyone' },
        { id: 'MAN', label: 'Men' },
        { id: 'WOMAN', label: 'Women' },
        { id: 'TEEN', label: 'Teens' },
        { id: 'KID', label: 'Kids' }
    ]

    return (
        <>
            <div className="animate-fade-in max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Select Your Equipment</h1>
                <p className="text-gray-600 mb-8">Choose the best gear for your ski trip.</p>

                {/* Date Selection */}
                <div className="mb-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="flex items-center gap-2 text-blue-900">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <span className="text-sm font-bold uppercase tracking-wider">Période de location</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 flex-grow">
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Date de début</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={rentalStartDate ? new Date(rentalStartDate) : null}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                const dateStr = date.toISOString().split('T')[0]
                                                setRentalDates(dateStr, rentalEndDate || dateStr)
                                            }
                                        }}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        locale="fr"
                                        placeholderText="Sélectionner le début"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none cursor-pointer"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex-1">
                                <label className="block text-xs font-semibold text-gray-700 mb-1">Date de fin</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={rentalEndDate ? new Date(rentalEndDate) : null}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                const dateStr = date.toISOString().split('T')[0]
                                                setRentalDates(rentalStartDate, dateStr)
                                            }
                                        }}
                                        minDate={rentalStartDate ? new Date(rentalStartDate) : new Date()}
                                        maxDate={rentalStartDate ? new Date(new Date(rentalStartDate).getTime() + 13 * 24 * 60 * 60 * 1000) : undefined}
                                        dateFormat="dd/MM/yyyy"
                                        locale="fr"
                                        placeholderText="Sélectionner la fin"
                                        disabled={!rentalStartDate}
                                        dayClassName={(date: Date) => {
                                            if (!rentalStartDate) return ""
                                            const start = new Date(rentalStartDate)
                                            start.setHours(0, 0, 0, 0)
                                            const max = new Date(start.getTime() + 13 * 24 * 60 * 60 * 1000)

                                            if (date >= start && date <= max) {
                                                return "bg-green-100 text-green-800 font-bold rounded-full"
                                            }
                                            return ""
                                        }}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        wrapperClassName="w-full"
                                    />
                                </div>
                            </div>
                            {rentalStartDate && rentalEndDate && (
                                <div className="flex flex-col items-end">
                                    <div className="px-4 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-center min-w-[100px]">
                                        <div className="text-2xl">{rentalDays}</div>
                                        <div className="text-xs opacity-90">{rentalDays === 1 ? 'jour' : 'jours'}</div>
                                    </div>
                                    {rentalDays >= 14 && (
                                        <div className="mt-2 px-2 py-1 bg-red-100 border border-red-200 rounded text-center max-w-[120px]">
                                            <p className="text-[10px] text-red-700 font-bold leading-tight">
                                                Max 14 days limit reached
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-8 space-y-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    {/* Type Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <span className="text-sm font-bold text-gray-400 w-24 uppercase tracking-wider flex-shrink-0">Matériel</span>
                        <div className="flex flex-wrap gap-2">
                            {TYPE_FILTERS.map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setFilterType(filter.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterType === filter.id
                                        ? 'bg-gray-900 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Group Filters */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <span className="text-sm font-bold text-gray-400 w-24 uppercase tracking-wider flex-shrink-0">Profil</span>
                        <div className="flex flex-wrap gap-2">
                            {GROUP_FILTERS.map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setFilterGroup(filter.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filterGroup === filter.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50 hover:text-blue-600'
                                        }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20">Loading equipment...</div>
                ) : !rentalStartDate || !rentalEndDate ? (
                    <div className="text-center py-20 bg-blue-50 rounded-2xl border border-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-blue-400 mb-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-700">Veuillez sélectionner vos dates de location</p>
                        <p className="text-sm text-gray-500 mt-2">Choisissez votre période pour voir les prix</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onAdd={handleAddItem} rentalDays={rentalDays} />
                            ))
                        ) : (
                            <div className="col-span-3 text-center py-12 text-gray-500">
                                No equipment found for these filters.
                            </div>
                        )}
                    </div>
                )}

                {/* Spacer for fixed footer to prevent covering content */}
                <div className={`transition-all duration-300 ${items.length > 0 ? 'h-32' : 'h-12'}`}></div>
            </div>

            {/* Floating Action Button (FAB) */}
            {items.length > 0 && (
                <button
                    onClick={() => setIsCartOpen(!isCartOpen)}
                    className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-all transform hover:scale-110 active:scale-95 animate-bounce-in"
                    title="Toggle Cart"
                >
                    {isCartOpen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                    )}
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                        {items.length}
                    </span>
                </button>
            )}

            {/* Expanded Cart Summary */}
            {items.length > 0 && isCartOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
                    <div className="w-full max-w-[85rem] px-2 sm:px-4 lg:px-6 pb-4 pointer-events-auto">
                        <div className="bg-white border border-gray-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-slide-up">
                            <div className="p-4 md:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-baseline gap-3">
                                        <h2 className="text-xl font-bold text-gray-900">Your Selection ({items.length})</h2>
                                        <span className="text-lg font-medium text-gray-500">
                                            Total: <span className="text-blue-600 font-bold">{items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}€</span>
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleContinue}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-[0.98] flex items-center gap-2"
                                    >
                                        Reserve <span className="text-xl">→</span>
                                    </button>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-4 pt-3 snap-x px-1">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex-shrink-0 w-72 bg-gray-50 rounded-xl p-3 border border-gray-100 flex gap-3 relative group snap-start">
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-all z-20"
                                                title="Remove item"
                                            >
                                                ×
                                            </button>

                                            <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-100 overflow-hidden">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.productName} className="w-full h-full object-contain mix-blend-multiply" />
                                                ) : (
                                                    <span className="text-2xl">⛷</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col justify-between flex-grow">
                                                <div>
                                                    <div className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mb-1">{item.productName}</div>

                                                    {/* Personal Information */}
                                                    {(item.surname || item.height || item.weight || item.shoeSize) && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            {item.surname && (
                                                                <div className="text-xs mb-1">
                                                                    <span className="font-semibold text-gray-700">👤 {item.surname}</span>
                                                                </div>
                                                            )}
                                                            {(item.height || item.weight || item.shoeSize) && (
                                                                <div className="bg-gray-100 px-2 py-1 rounded flex items-center gap-2 text-xs">
                                                                    {item.height && (
                                                                        <span className="font-semibold text-gray-900">📏 {item.height}cm</span>
                                                                    )}
                                                                    {item.weight && (
                                                                        <span className="font-semibold text-gray-900">⚖️ {item.weight}kg</span>
                                                                    )}
                                                                    {item.shoeSize && (
                                                                        <span className="font-semibold text-gray-900">👟 {item.shoeSize}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between mt-1 gap-2">
                                                    <div className="flex gap-1">
                                                        {item.options?.includes('BOOTS') && (
                                                            <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-xs overflow-hidden" title="Boots">
                                                                {item.bootsImage ? <img src={item.bootsImage} className="w-full h-full object-contain" alt="Boots" /> : '👢'}
                                                            </div>
                                                        )}
                                                        {item.options?.includes('HELMET') && (
                                                            <div className="w-8 h-8 rounded bg-gray-50 border border-gray-200 flex items-center justify-center text-xs overflow-hidden" title="Helmet">
                                                                {item.helmetImage ? <img src={item.helmetImage} className="w-full h-full object-contain" alt="Helmet" /> : '⛑'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="font-bold text-blue-600">{item.price.toFixed(2)}€</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Personal Info Modal */}
            {showPersonalInfoModal && pendingItem && (
                <PersonalInfoModal
                    onSubmit={handlePersonalInfoSubmit}
                    onCancel={handlePersonalInfoCancel}
                />
            )}
        </>
    )
}

function ProductCard({ product, onAdd, rentalDays }: { product: Product, onAdd: (item: BookingItem) => void, rentalDays: number }) {
    const [addBoots, setAddBoots] = useState(false)
    const [addHelmet, setAddHelmet] = useState(false)

    // Constant add-on prices
    const BOOT_PRICE = 24.00
    const HELMET_PRICE = 24.00

    const [isHovered, setIsHovered] = useState(false)

    // Determine config based on product name/category (Visuals)
    let headerColorClass = 'text-gray-900'
    let iconColorClass = 'bg-gray-200'
    let cardBorderColorClass = 'border-gray-200'

    // Fallback logic for legacy products without titleColor
    if (!product.titleColor) {
        if (product.name.includes('Découverte')) {
            headerColorClass = 'text-red-600'
            iconColorClass = 'bg-red-600'
            cardBorderColorClass = 'hover:border-red-200'
        } else if (product.name.includes('Sensation')) {
            headerColorClass = 'text-gray-900'
            iconColorClass = 'bg-gray-900'
            cardBorderColorClass = 'hover:border-gray-400'
        } else if (product.name.includes('Excellence')) {
            headerColorClass = 'text-yellow-600'
            iconColorClass = 'bg-yellow-600'
            cardBorderColorClass = 'hover:border-yellow-200'
        }
    }

    // Calculate Prices with rental days
    const basePrice = Number(product.price)
    const originalBase = Number(product.originalPrice)

    // Use pricing utility to calculate base equipment price for rental period
    const basePriceForDays = calculateRentalPrice(basePrice, rentalDays, product.dayPrices)
    const originalBasePriceForDays = originalBase > 0 ? calculateRentalPrice(originalBase, rentalDays, product.dayPrices) : basePriceForDays

    // Add-on prices are always per day, so multiply by rental days
    const bootPriceForDays = BOOT_PRICE * rentalDays
    const helmetPriceForDays = HELMET_PRICE * rentalDays

    const totalPrice = basePriceForDays + (addBoots ? bootPriceForDays : 0) + (addHelmet ? helmetPriceForDays : 0)
    const totalOriginal = originalBasePriceForDays + (addBoots ? bootPriceForDays : 0) + (addHelmet ? helmetPriceForDays : 0)

    const discount = totalOriginal > totalPrice ? Math.round(((totalOriginal - totalPrice) / totalOriginal) * 100) : 0

    const handleAdd = () => {
        const options: string[] = []
        if (addBoots) options.push('BOOTS')
        if (addHelmet) options.push('HELMET')

        onAdd({
            id: uuidv4(),
            category: product.category as any,
            productName: product.name,
            price: totalPrice,
            image: product.image,
            size: 'Standard',
            level: product.level,
            quantity: 1,
            options: options,
            bootsImage: product.bootsImage,
            helmetImage: product.helmetImage
        })
    }

    // Determine dynamic border color
    // If not hovered: use default gray/black border (via CSS class or inline)
    // If hovered: use titleColor if available
    const activeBorderColor = isHovered && product.titleColor ? product.titleColor : undefined

    return (
        <div
            className={`bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] border ${cardBorderColorClass} flex flex-col h-full hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative`}
            style={{
                borderColor: activeBorderColor,
                // If titleColor exists and we hover, we override the border color.
                // Otherwise let the CSS class handle it (border-gray-200)
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header */}
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white relative rounded-t-xl">
                <div>
                    <h3
                        className={`font-extrabold text-lg flex items-center gap-2 ${!product.titleColor ? headerColorClass : ''}`}
                        style={{ color: product.titleColor || undefined }}
                    >
                        <span className="text-xl">❆</span> {product.name}
                    </h3>
                    <div className="flex space-x-1 mt-2">
                        {/* Dynamic Skill Level Circles */}
                        {/* Legacy Fallback */}
                        {(product.level || '').includes('BEGINNER') && !(product.level || '').includes('BEGINNER_') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                {/* Instant Custom Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Beginner
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}

                        {/* New Levels */}
                        {(product.level || '').includes('BEGINNER_GREEN') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Beginner (Green): First time skiing
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}
                        {(product.level || '').includes('BEGINNER_BLUE') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Beginner (Blue): Comfortable on gentle slopes
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}
                        {(product.level || '').includes('INTERMEDIATE') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Intermediate (Red): Parallel turns
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}
                        {(product.level || '').includes('ADVANCED') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Advanced (Black): Expert slopes
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}
                        {(product.level || '').includes('OFF_PISTE') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Hors Piste: Freeride / Powder
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}
                        {(product.level || '').includes('FREESTYLE') && (
                            <div className="relative group">
                                <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs shadow-sm cursor-help">
                                    <span style={{ filter: 'brightness(0) invert(1)' }}>⛷</span>
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                                    <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-xl">
                                        Snowpark: Tricks & Jumps
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900 mx-auto"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* Visual Circle (Selection Indicator) */}
                <div
                    className="w-6 h-6 rounded-full border-2"
                    style={{ borderColor: product.titleColor || '#e5e7eb' }}
                ></div>
            </div>

            <div className="p-4 text-sm text-gray-500 h-20 overflow-hidden text-sm leading-relaxed">
                {product.description}
            </div>

            {/* Price section */}
            <div className="px-4 pb-2 flex items-center justify-between">
                <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Prix web</div>
                    <div className="text-3xl font-black text-gray-900 tracking-tight">{totalPrice.toFixed(2)} €</div>
                </div>

                <div className="flex items-center gap-3">
                    {totalOriginal > totalPrice && (
                        <div className="text-right">
                            <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Prix magasin</div>
                            <div className="text-sm line-through text-gray-400 decoration-gray-400 font-medium">{totalOriginal.toFixed(2)} €</div>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold shadow-md transform rotate-12">
                            -{discount}%
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area: Split 2 Cols */}
            <div className="p-4 flex gap-3 flex-grow bg-white">
                {/* Left: Skis */}
                <div className="w-[40%] flex items-center justify-center rounded-lg p-2 min-h-[220px] relative">
                    {product.image ? (
                        <img src={product.image} alt={product.name} className="max-h-60 object-contain mix-blend-multiply z-10 hover:scale-110 transition-transform duration-300" />
                    ) : (
                        <div className="flex flex-col items-center text-gray-300">
                            <div className="text-4xl transform -rotate-45">SKI</div>
                        </div>
                    )}
                </div>

                {/* Right: Options */}
                <div className="w-[60%] flex flex-col gap-2.5 justify-center">
                    {/* Boots Option */}
                    <div
                        className={`group border-2 rounded-xl p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${addBoots ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-gray-200'}`}
                        onClick={() => setAddBoots(!addBoots)}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addBoots ? 'bg-red-500 border-red-500' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}>
                                {addBoots && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                            {/* Render Boots Image or Emoji */}
                            <div className="w-20 h-20 flex items-center justify-center">
                                {product.bootsImage ? (
                                    <img src={product.bootsImage} alt="Boots" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-xl">👢</div>
                                )}
                            </div>
                        </div>
                        <div className="text-[10px] font-medium text-gray-600 leading-tight">
                            Chaussures<br />
                            <span className={`font-bold ${addBoots ? 'text-gray-900' : 'text-gray-500'}`}>
                                {addBoots ? '(inclus)' : `(+${BOOT_PRICE.toFixed(2)}€)`}
                            </span>
                        </div>
                    </div>

                    {/* Helmet Option */}
                    <div
                        className={`group border-2 rounded-xl p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer select-none ${addHelmet ? 'border-gray-800 bg-gray-50' : 'border-gray-100 hover:border-gray-200'}`}
                        onClick={() => setAddHelmet(!addHelmet)}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${addHelmet ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}>
                                {addHelmet && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                            {/* Render Helmet Image or Emoji */}
                            <div className="w-20 h-20 flex items-center justify-center">
                                {product.helmetImage ? (
                                    <img src={product.helmetImage} alt="Helmet" className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-xl">⛑</div>
                                )}
                            </div>
                        </div>
                        <div className="text-[10px] font-medium text-gray-600 leading-tight">
                            Casque<br />
                            <span className={`font-bold ${addHelmet ? 'text-gray-900' : 'text-gray-500'}`}>
                                {addHelmet ? '(inclus)' : `(+${HELMET_PRICE.toFixed(2)}€)`}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 pt-0">
                <button
                    onClick={handleAdd}
                    className="w-full py-4 bg-[#e02e2e] hover:bg-[#c02525] text-white font-bold rounded-lg text-sm uppercase tracking-wide shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    Ajouter ce matériel
                </button>
            </div>
        </div>
    )
}

function PersonalInfoModal({
    onSubmit,
    onCancel
}: {
    onSubmit: (info: Partial<BookingItem>) => void
    onCancel: () => void
}) {
    const [formData, setFormData] = useState({
        surname: '',
        sex: '',
        age: '',
        height: '',
        weight: '',
        shoeSize: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        onSubmit({
            surname: formData.surname,
            sex: formData.sex,
            age: formData.age ? Number(formData.age) : undefined,
            height: formData.height,
            weight: formData.weight,
            shoeSize: formData.shoeSize
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <h2 className="text-2xl font-bold text-gray-900">Informations du Skieur</h2>
                    <p className="text-sm text-gray-600 mt-1">Veuillez renseigner les informations pour cet équipement</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Surname */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nom de famille"
                            />
                        </div>

                        {/* Sex */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sexe <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner...</option>
                                <option value="M">Homme</option>
                                <option value="F">Femme</option>
                            </select>
                        </div>

                        {/* Age */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Âge
                            </label>
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                min="1"
                                max="120"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="ex: 25"
                            />
                        </div>

                        {/* Height */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Taille (cm)
                            </label>
                            <select
                                name="height"
                                value={formData.height}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner...</option>
                                {Array.from({ length: 121 }, (_, i) => i + 100).map(height => (
                                    <option key={height} value={height.toString()}>{height} cm</option>
                                ))}
                            </select>
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Poids (kg)
                            </label>
                            <select
                                name="weight"
                                value={formData.weight}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner...</option>
                                {Array.from({ length: 131 }, (_, i) => i + 20).map(weight => (
                                    <option key={weight} value={weight.toString()}>{weight} kg</option>
                                ))}
                            </select>
                        </div>

                        {/* Shoe Size */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pointure
                            </label>
                            <select
                                name="shoeSize"
                                value={formData.shoeSize}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Sélectionner...</option>
                                <optgroup label="Enfant">
                                    <option value="24">24</option>
                                    <option value="25">25</option>
                                    <option value="26">26</option>
                                    <option value="27">27</option>
                                    <option value="28">28</option>
                                    <option value="29">29</option>
                                    <option value="30">30</option>
                                    <option value="31">31</option>
                                    <option value="32">32</option>
                                    <option value="33">33</option>
                                    <option value="34">34</option>
                                    <option value="35">35</option>
                                </optgroup>
                                <optgroup label="Adulte">
                                    <option value="36">36</option>
                                    <option value="37">37</option>
                                    <option value="38">38</option>
                                    <option value="39">39</option>
                                    <option value="40">40</option>
                                    <option value="41">41</option>
                                    <option value="42">42</option>
                                    <option value="43">43</option>
                                    <option value="44">44</option>
                                    <option value="45">45</option>
                                    <option value="46">46</option>
                                    <option value="47">47</option>
                                    <option value="48">48</option>
                                </optgroup>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            Confirmer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
