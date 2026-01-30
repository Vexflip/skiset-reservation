"use strict";
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import Link from "next/link";

type PromoCode = {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    maxUses: number | null;
    currentUses: number;
    isActive: boolean;
    expiresAt: string | null;
    _count?: {
        reservations: number;
    };
};

export default function PromoCodesPage() {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCode, setCurrentCode] = useState<Partial<PromoCode>>({
        discountType: "PERCENTAGE",
        isActive: true,
        discountValue: 0
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchCodes();
    }, []);

    const fetchCodes = async () => {
        try {
            const res = await fetch("/api/admin/promocodes");
            const data = await res.json();
            setCodes(data);
        } catch (error) {
            console.error("Failed to fetch codes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = currentCode.id
                ? `/api/admin/promocodes/${currentCode.id}`
                : "/api/admin/promocodes";

            const method = currentCode.id ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(currentCode)
            });

            if (!res.ok) {
                const err = await res.json();
                alert("Error: " + err.error);
                return;
            }

            await fetchCodes();
            setIsEditing(false);
            setCurrentCode({ discountType: "PERCENTAGE", isActive: true, discountValue: 0 });
        } catch (error) {
            console.error("Error saving code", error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this promo code?")) return;
        try {
            await fetch(`/api/admin/promocodes/${id}`, { method: "DELETE" });
            setCodes(codes.filter(c => c.id !== id));
        } catch (error) {
            console.error("Error deleting code", error);
        }
    };

    const toggleStatus = async (code: PromoCode) => {
        try {
            await fetch(`/api/admin/promocodes/${code.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...code, isActive: !code.isActive })
            });
            // Optimistic update
            setCodes(codes.map(c => c.id === code.id ? { ...c, isActive: !c.isActive } : c));
        } catch (error) {
            console.error("Error toggling status", error);
        }
    }

    return (
        <>
            <div className="px-4 py-8 sm:px-0 animate-fade-in max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Promo Codes</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage discounts and coupons.</p>
                    </div>
                    <button
                        onClick={() => {
                            setCurrentCode({ discountType: "PERCENTAGE", isActive: true, discountValue: 0 });
                            setIsEditing(true);
                        }}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md"
                    >
                        <span className="text-xl leading-none">+</span> Create Code
                    </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-400">
                                <tr>
                                    <th className="px-6 py-4">Code</th>
                                    <th className="px-6 py-4">Discount</th>
                                    <th className="px-6 py-4">Usage</th>
                                    <th className="px-6 py-4">Expires</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {codes.map(code => (
                                    <tr key={code.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-bold text-gray-900 tracking-wide">{code.code}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${code.discountType === 'PERCENTAGE' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {code.discountType === 'PERCENTAGE' ? `-${code.discountValue}%` : `-${code.discountValue}€`}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link href={`/admin/promocodes/${code.id}`} className="font-medium text-blue-600 hover:underline" title="View Usage History">
                                                    {code.currentUses}
                                                </Link>
                                                <span className="text-gray-400">/</span>
                                                <span className="text-gray-500">{code.maxUses === null ? '∞' : code.maxUses}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {code.expiresAt ? format(new Date(code.expiresAt), "PPP") : "Never"}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => toggleStatus(code)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${code.isActive ? 'bg-green-500' : 'bg-gray-200'}`}
                                            >
                                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${code.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <Link href={`/admin/promocodes/${code.id}`} className="text-green-900 hover:text-green-900 font-medium">History</Link>
                                            <button onClick={() => { setCurrentCode(code); setIsEditing(true); }} className="text-blue-600 hover:text-blue-900 font-medium">Edit</button>
                                            <button onClick={() => handleDelete(code.id)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                {codes.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                            No promo codes found. Create one to get started.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">
                                {currentCode.id ? 'Edit Promo Code' : 'New Promo Code'}
                            </h2>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
                                <input
                                    required
                                    type="text"
                                    value={currentCode.code || ''}
                                    onChange={e => setCurrentCode({ ...currentCode, code: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none uppercase font-mono tracking-wider"
                                    placeholder="SUMMER2024"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                                    <select
                                        value={currentCode.discountType}
                                        onChange={e => setCurrentCode({ ...currentCode, discountType: e.target.value as any })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none bg-white"
                                    >
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED_AMOUNT">Fixed Amount (€)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Value</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        step={currentCode.discountType === 'PERCENTAGE' ? "1" : "0.01"}
                                        value={currentCode.discountValue ?? ''}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setCurrentCode({
                                                ...currentCode,
                                                discountValue: val === '' ? 0 : parseFloat(val)
                                            })
                                        }}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Uses (Optional)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={currentCode.maxUses ?? ''}
                                        onChange={e => setCurrentCode({ ...currentCode, maxUses: e.target.value ? parseInt(e.target.value) : null })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none"
                                        placeholder="Unlimited"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expires At (Optional)</label>
                                    <input
                                        type="date"
                                        value={currentCode.expiresAt ? new Date(currentCode.expiresAt).toISOString().split('T')[0] : ''}
                                        onChange={e => setCurrentCode({ ...currentCode, expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition outline-none"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition">Cancel</button>
                                <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition">
                                    {saving ? 'Saving...' : 'Save Code'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
