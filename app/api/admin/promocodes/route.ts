"use strict";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const codes = await prisma.promoCode.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { reservations: true }
                }
            }
        });
        return NextResponse.json(codes);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch promo codes" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { code, discountType, discountValue, maxUses, expiresAt } = body;

        // Basic validation
        if (!code || !discountValue) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existing = await prisma.promoCode.findUnique({ where: { code } });
        if (existing) {
            return NextResponse.json({ error: "Code already exists" }, { status: 400 });
        }

        const promoCode = await prisma.promoCode.create({
            data: {
                code,
                discountType,
                discountValue,
                maxUses: maxUses ? parseInt(maxUses) : null,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                isActive: true
            }
        });

        return NextResponse.json(promoCode, { status: 201 });
    } catch (error) {
        console.error("Promo code creation error:", error);
        return NextResponse.json({ error: "Failed to create promo code" }, { status: 500 });
    }
}
