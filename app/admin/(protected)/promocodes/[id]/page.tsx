"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface ReservationItem {
    id: string;
    productName: string;
    category: string;
    quantity: number;
    price: number;
}

interface Reservation {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    totalPrice: number;
    discountAmount: number;
    finalPrice: number;
    status: string;
    createdAt: string;
    items: ReservationItem[];
}

interface PromoCodeDetails {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    maxUses: number | null;
    currentUses: number;
    isActive: boolean;
    expiresAt: string | null;
    reservations: Reservation[];
}

export default function PromoCodeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [promoCode, setPromoCode] = useState<PromoCodeDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromoCode = async () => {
            try {
                const res = await fetch(`/api/admin/promocodes/${id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch promo code details");
                }
                const data = await res.json();
                setPromoCode(data);
            } catch (err) {
                console.error(err);
                setError("Failed to load promo code details");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPromoCode();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="px-4 py-8 sm:px-0 animate-fade-in flex justify-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error || !promoCode) {
        return (
            <div className="px-4 py-8 sm:px-0 animate-fade-in text-center">
                <div className="bg-red-50 text-red-800 p-4 rounded-lg inline-block">
                    {error || "Promo code not found"}
                </div>
                <div className="mt-4">
                    <Link href="/admin/promocodes" className="text-blue-600 hover:underline">
                        Back to Promo Codes
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-8 sm:px-0 animate-fade-in max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                    <Link href="/admin/promocodes" className="hover:text-gray-900 transition flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back
                    </Link>
                    <span>/</span>
                    <span>Details</span>
                </div>

                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            {promoCode.code}
                            <span className={`text-base font-normal px-3 py-1 rounded-full ${promoCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {promoCode.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </h1>
                        <p className="text-gray-500 mt-2 text-lg">
                            {promoCode.discountType === 'PERCENTAGE'
                                ? `${promoCode.discountValue}% Off`
                                : `${promoCode.discountValue}€ Off`}
                            {promoCode.maxUses ? ` • Limit: ${promoCode.maxUses} uses` : ' • Unlimited uses'}
                            {promoCode.expiresAt && ` • Expires: ${format(new Date(promoCode.expiresAt), "PPP")}`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Uses</p>
                    <p className="text-3xl font-bold text-blue-600 mt-1">{promoCode.currentUses}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Savings Given</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">
                        {promoCode.reservations.reduce((acc, curr) => acc + curr.discountAmount, 0).toFixed(2)}€
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Revenue Generated</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {promoCode.reservations.reduce((acc, curr) => acc + curr.finalPrice, 0).toFixed(2)}€
                    </p>
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-900">Usage History</h2>
                    <span className="text-sm text-gray-500">{promoCode.reservations.length} reservations</span>
                </div>

                {promoCode.reservations.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 text-xs uppercase font-medium text-gray-400">
                                <tr>
                                    <th className="px-6 py-3">Reservation</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Items</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3 text-right">Total</th>
                                    <th className="px-6 py-3 text-right">Discount</th>
                                    <th className="px-6 py-3 text-center">Status</th>
                                    <th className="px-6 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {promoCode.reservations.map((res) => (
                                    <tr key={res.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                            {res.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-gray-900">{res.firstName} {res.lastName}</p>
                                                <p className="text-xs text-gray-500">{res.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                {res.items && res.items.length > 0 ? (
                                                    res.items.map((item, idx) => (
                                                        <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded inline-block w-fit">
                                                            {item.quantity && item.quantity > 1 ? `${item.quantity}x ` : ''}{item.productName}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No items</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {format(new Date(res.createdAt), "MMM d, yyyy")}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {res.finalPrice.toFixed(2)}€
                                        </td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium bg-green-50/30">
                                            -{res.discountAmount.toFixed(2)}€
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${res.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                                                res.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                    res.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {res.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                href={`/admin/reservations/${res.id}`}
                                                className="text-blue-600 hover:text-blue-900 font-medium hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400">
                        <p>No reservations have used this code yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
