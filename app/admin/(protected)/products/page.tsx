"use client"

import { useState, useEffect } from 'react'
import { generateDefaultDayPrices } from '@/lib/pricing'

interface Product {
    id: string
    name: string
    description: string
    category: string
    price: number
    originalPrice: number | null
    level: string
    image: string
    bootsImage: string
    helmetImage: string
    titleColor: string
    equipmentType: string
    targetGroup: string
    active: boolean
    dayPrices?: string | null
    disclaimer?: string | null
}

export default function ProductManagement() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({})
    const [uploading, setUploading] = useState(false)
    const [showDayPricing, setShowDayPricing] = useState(false)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            setProducts(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const method = currentProduct.id ? 'PUT' : 'POST'
        const url = currentProduct.id ? `/api/products/${currentProduct.id}` : '/api/products'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentProduct)
            })

            if (res.ok) {
                setIsEditing(false)
                setCurrentProduct({})
                fetchProducts()
            } else {
                alert('Failed to save product')
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure?')) return

        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                fetchProducts()
            }
        } catch (e) {
            console.error(e)
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'bootsImage' | 'helmetImage' = 'image') => {
        if (!e.target.files || e.target.files.length === 0) return

        const file = e.target.files[0]
        const formData = new FormData()
        formData.append('file', file)

        setUploading(true)
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })
            const data = await res.json()
            if (res.ok) {
                setCurrentProduct(prev => ({ ...prev, [field]: data.url }))
            } else {
                alert('Upload failed')
            }
        } catch (err) {
            console.error(err)
            alert('Upload error')
        } finally {
            setUploading(false)
        }
    }

    const toggleLevel = (level: string) => {
        const currentLevels = currentProduct.level ? currentProduct.level.split(',') : []
        let newLevels
        if (currentLevels.includes(level)) {
            newLevels = currentLevels.filter(l => l !== level)
        } else {
            newLevels = [...currentLevels, level]
        }
        // clean up empty strings or duplicates just in case
        const levelString = newLevels.filter(Boolean).join(',')
        setCurrentProduct(prev => ({ ...prev, level: levelString }))
    }

    const SKILL_LEVELS = [
        { id: 'BEGINNER_GREEN', label: 'Beginner (Green)', description: 'First time skiing / Learning' },
        { id: 'BEGINNER_BLUE', label: 'Beginner (Blue)', description: 'Comfortable on gentle slopes' },
        { id: 'INTERMEDIATE', label: 'Intermediate (Red)', description: 'Parallel turns on most slopes' },
        { id: 'ADVANCED', label: 'Advanced (Black)', description: 'Expert, steep slopes & speed' },
        { id: 'OFF_PISTE', label: 'Hors Piste', description: 'Freeride & Powder capability' },
        { id: 'FREESTYLE', label: 'Snowpark', description: 'Tricks, Jumps & Park features' }
    ]

    // Day pricing helpers
    const parseDayPrices = (): { [day: string]: number } => {
        if (!currentProduct.dayPrices) return {}
        try {
            return JSON.parse(currentProduct.dayPrices)
        } catch {
            return {}
        }
    }

    const updateDayPrice = (day: number, price: string) => {
        const prices = parseDayPrices()
        const priceNum = parseFloat(price)

        if (price === '' || isNaN(priceNum)) {
            delete prices[day.toString()]
        } else {
            prices[day.toString()] = priceNum
        }

        setCurrentProduct({ ...currentProduct, dayPrices: JSON.stringify(prices) })
    }

    const autoFillDayPrices = () => {
        const basePrice = currentProduct.price || 0
        const defaultPrices = generateDefaultDayPrices(basePrice, 14)
        setCurrentProduct({ ...currentProduct, dayPrices: JSON.stringify(defaultPrices) })
    }

    return (
        <>
            <div className="px-4 py-8 sm:px-0 animate-fade-in max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Products</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your inventory and pricing.</p>
                    </div>
                    <button
                        onClick={() => { setIsEditing(true); setCurrentProduct({ category: 'ADULT_SKI', active: true, level: 'BEGINNER' }); }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                    >
                        <span className="text-xl leading-none">+</span> Add Product
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
                            <div className="h-40 bg-gray-50 relative p-4 flex items-center justify-center group-hover:bg-blue-50/30 transition">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="h-full object-contain mix-blend-multiply" />
                                ) : (
                                    <span className="text-gray-300 text-4xl">⛷</span>
                                )}
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wider text-gray-500">
                                    {product.category}
                                </div>
                            </div>

                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-gray-900 leading-tight group-hover:text-blue-600 transition">{product.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 h-10">{product.description}</p>

                                <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-2">
                                    <div>
                                        <div className="text-xs text-gray-400 font-semibold uppercase">Price</div>
                                        <div className="font-bold text-xl text-gray-900">{product.price}€</div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setCurrentProduct(product); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                        </button>
                                        <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div >

            {
                isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {currentProduct.id ? 'Edit Product' : 'New Product'}
                                </h2>
                                <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            <div className="overflow-y-auto p-8">
                                <form id="productForm" onSubmit={handleSubmit} className="space-y-8">
                                    {/* Basic Info Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Basic Information</h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                                <input
                                                    required
                                                    value={currentProduct.name || ''}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none"
                                                    placeholder="e.g. Découverte Pack"
                                                />
                                            </div>

                                            {/* Matériel (Equipment Type) */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Matériel</label>
                                                <div className="relative">
                                                    <select
                                                        value={currentProduct.equipmentType || 'SKI'}
                                                        onChange={e => setCurrentProduct({ ...currentProduct, equipmentType: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none appearance-none bg-white"
                                                    >
                                                        <option value="SKI">Ski</option>
                                                        <option value="SNOWBOARD">Snowboard</option>
                                                        <option value="MINISKI">Miniski</option>
                                                        <option value="TOURING">Ski Touring</option>
                                                    </select>
                                                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Profil (Target Group) */}
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Profil</label>
                                                <div className="relative">
                                                    <select
                                                        value={currentProduct.targetGroup || 'MAN'}
                                                        onChange={e => setCurrentProduct({ ...currentProduct, targetGroup: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none appearance-none bg-white"
                                                    >
                                                        <option value="MAN">Man</option>
                                                        <option value="WOMAN">Woman</option>
                                                        <option value="TEEN">Teen</option>
                                                        <option value="KID">Kid</option>
                                                    </select>
                                                    <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                                    </div>
                                                </div>
                                            </div>


                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Skill Levels (Multi-select)</label>
                                                <div className="space-y-2 p-3 border border-gray-100 rounded-lg bg-gray-50/50">
                                                    {SKILL_LEVELS.map(level => {
                                                        const isChecked = (currentProduct.level || '').split(',').includes(level.id)
                                                        return (
                                                            <label key={level.id} className="flex items-center space-x-3 cursor-pointer hover:bg-white p-1 rounded transition" title={level.description}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => toggleLevel(level.id)}
                                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                                />
                                                                <span className="text-sm text-gray-700">{level.label}</span>
                                                            </label>
                                                        )
                                                    })}
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                                <textarea
                                                    required
                                                    value={currentProduct.description || ''}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none h-32 resize-none"
                                                    placeholder="Describe the product features and intended use..."
                                                />
                                                <p className="text-xs text-gray-400 mt-2 text-right">{currentProduct.description?.length || 0} characters</p>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Disclaimer (Optional)</label>
                                                <input
                                                    value={currentProduct.disclaimer || ''}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, disclaimer: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none"
                                                    placeholder="e.g. Valid for 3 days minimum"
                                                />
                                                <p className="text-xs text-gray-400 mt-1">Text displayed below the 'Add' button on booking page.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-gray-100" />

                                    {/* Pricing Section */}
                                    <div className="space-y-6">
                                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pricing & Media</h3>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Web Price (€)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={currentProduct.price || ''}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, price: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none font-mono"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price (€)</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={currentProduct.originalPrice || ''}
                                                    onChange={e => setCurrentProduct({ ...currentProduct, originalPrice: parseFloat(e.target.value) })}
                                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none font-mono text-gray-500"
                                                    placeholder="0.00 (Optional)"
                                                />
                                            </div>

                                            {/* Day Pricing Configuration */}
                                            <div className="col-span-2">
                                                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div>
                                                            <label className="block text-sm font-semibold text-gray-700">Multi-Day Pricing (Optional)</label>
                                                            <p className="text-xs text-gray-500 mt-1">Set custom prices for rental periods (1-14 days)</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={autoFillDayPrices}
                                                                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition font-medium"
                                                            >
                                                                Auto-fill (Base × Days)
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowDayPricing(!showDayPricing)}
                                                                className="px-3 py-1.5 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition font-medium"
                                                            >
                                                                {showDayPricing ? 'Hide' : 'Show'} Pricing Table
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {showDayPricing && (
                                                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                                {Array.from({ length: 14 }, (_, i) => i + 1).map(day => {
                                                                    const dayPrices = parseDayPrices()
                                                                    const customPrice = dayPrices[day.toString()]
                                                                    const basePrice = currentProduct.price || 0
                                                                    const defaultPrice = basePrice * day
                                                                    const hasCustom = customPrice !== undefined

                                                                    return (
                                                                        <div key={day} className="relative">
                                                                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                                                                Day {day}
                                                                                {hasCustom && (
                                                                                    <span className="ml-1 text-blue-600">★</span>
                                                                                )}
                                                                            </label>
                                                                            <input
                                                                                type="number"
                                                                                step="0.01"
                                                                                value={customPrice !== undefined ? customPrice : ''}
                                                                                onChange={(e) => updateDayPrice(day, e.target.value)}
                                                                                placeholder={defaultPrice.toFixed(2)}
                                                                                className={`w-full px-2 py-1.5 text-sm rounded border ${hasCustom ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition outline-none font-mono`}
                                                                            />
                                                                            {!hasCustom && (
                                                                                <span className="text-xs text-gray-400 mt-0.5 block">Default: {defaultPrice.toFixed(2)}€</span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                                                                <p>★ Blue fields indicate custom pricing. Leave empty to use default (base price × days).</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="col-span-2 space-y-6">
                                                {/* Main Image */}
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image (Main)</label>
                                                    <div className="flex gap-4">
                                                        <div className="flex-grow">
                                                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                                    <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                                                    <p className="text-xs text-gray-500"><span className="font-semibold">Click to upload</span> product image</p>
                                                                </div>
                                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} disabled={uploading} />
                                                            </label>
                                                        </div>
                                                        <div className="w-32 h-32 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                                                            {currentProduct.image ? (
                                                                <img src={currentProduct.image} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
                                                            ) : (
                                                                <span className="text-gray-300 text-xs text-center leading-none">NO<br />IMG</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6">
                                                    {/* Boots Image */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Boots Image (Optional)</label>
                                                        <div className="flex gap-4">
                                                            <div className="flex-grow">
                                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                                                    <span className="text-xs text-gray-500 text-center px-2">Upload Boots</span>
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'bootsImage')} disabled={uploading} />
                                                                </label>
                                                            </div>
                                                            <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                                                                {currentProduct.bootsImage ? (
                                                                    <img src={currentProduct.bootsImage} alt="Boots" className="w-full h-full object-contain mix-blend-multiply" />
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs text-center leading-none">NO<br />BOOTS</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Helmet Image */}
                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Helmet Image (Optional)</label>
                                                        <div className="flex gap-4">
                                                            <div className="flex-grow">
                                                                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                                                    <span className="text-xs text-gray-500 text-center px-2">Upload Helmet</span>
                                                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'helmetImage')} disabled={uploading} />
                                                                </label>
                                                            </div>
                                                            <div className="w-24 h-24 rounded-lg bg-gray-100 border border-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden p-2">
                                                                {currentProduct.helmetImage ? (
                                                                    <img src={currentProduct.helmetImage} alt="Helmet" className="w-full h-full object-contain mix-blend-multiply" />
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs text-center leading-none">NO<br />HELMET</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">Card Title Color</label>
                                                <div className="flex items-center gap-4">
                                                    <input
                                                        type="color"
                                                        value={currentProduct.titleColor || '#2563eb'}
                                                        onChange={e => setCurrentProduct({ ...currentProduct, titleColor: e.target.value })}
                                                        className="w-12 h-12 p-1 rounded-lg border border-gray-200 cursor-pointer h-12"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={currentProduct.titleColor || ''}
                                                        onChange={e => setCurrentProduct({ ...currentProduct, titleColor: e.target.value })}
                                                        className="flex-grow px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none font-mono text-sm uppercase"
                                                        placeholder="#2563EB"
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">Select a color for the product card header.</p>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="px-8 py-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200/50 rounded-lg transition">Cancel</button>
                                    <button type="submit" form="productForm" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5" disabled={uploading}>
                                        {uploading ? 'Uploading...' : 'Save Product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

        </>
    )
}
