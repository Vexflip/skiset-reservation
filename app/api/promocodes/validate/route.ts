"use strict";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const promo = await prisma.promoCode.findUnique({
            where: { code }
        });

        if (!promo || !promo.isActive) {
            return NextResponse.json({ error: "Invalid promo code" }, { status: 400 }); // 400 better than 404 for Logic
        }

        // Check expiration
        if (promo.expiresAt && new Date() > promo.expiresAt) {
            return NextResponse.json({ error: "Promo code has expired" }, { status: 400 });
        }

        // Check usage limits
        if (promo.maxUses !== null && promo.currentUses >= promo.maxUses) {
            return NextResponse.json({ error: "Promo code usage limit reached" }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            code: promo.code,
            discountType: promo.discountType,
            discountValue: promo.discountValue
        });

    } catch (error) {
        console.error("Promo validation error:", error);
        return NextResponse.json({ error: "Validation failed" }, { status: 500 });
    }
}
