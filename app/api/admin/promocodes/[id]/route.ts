"use strict";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        const promoCode = await prisma.promoCode.findUnique({
            where: { id },
            include: {
                reservations: {
                    orderBy: { createdAt: 'desc' },
                    include: { items: true }
                }
            }
        });

        if (!promoCode) {
            return NextResponse.json({ error: "Promo code not found" }, { status: 404 });
        }

        // Serialize Decimal and Date fields
        const serializedPromoCode = {
            ...promoCode,
            discountValue: Number(promoCode.discountValue),
            reservations: promoCode.reservations.map(res => ({
                ...res,
                totalPrice: Number(res.totalPrice),
                discountAmount: Number(res.discountAmount),
                finalPrice: Number(res.finalPrice),
                startDate: res.startDate.toISOString(),
                endDate: res.endDate.toISOString(),
                createdAt: res.createdAt.toISOString(),
                // @ts-ignore
                items: res.items ? res.items.map(item => ({
                    ...item,
                    price: Number(item.price)
                })) : []
            }))
        };

        return NextResponse.json(serializedPromoCode);
    } catch (error) {
        console.error("Promo code fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch promo code" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;
        const body = await req.json();
        const { discountType, discountValue, maxUses, expiresAt, isActive } = body;

        const promoCode = await prisma.promoCode.update({
            where: { id },
            data: {
                discountType,
                discountValue,
                maxUses: maxUses === '' ? null : (maxUses ? parseInt(maxUses) : null),
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive
            }
        });

        return NextResponse.json(promoCode);
    } catch (error) {
        console.error("Promo code update error:", error);
        return NextResponse.json({ error: "Failed to update promo code" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = await params;

        await prisma.promoCode.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Promo code deletion error:", error);
        return NextResponse.json({ error: "Failed to delete promo code" }, { status: 500 });
    }
}
