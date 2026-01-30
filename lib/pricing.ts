/**
 * Pricing calculation utilities for date-based rental pricing
 */

export interface DayPrices {
    [day: string]: number
}

/**
 * Calculate the rental price based on the number of days
 * @param basePrice The base price for 1 day
 * @param days The number of rental days (1-14)
 * @param dayPricesJson Optional JSON string containing custom pricing for specific days
 * @returns The calculated price
 */
export function calculateRentalPrice(
    basePrice: number,
    days: number,
    dayPricesJson?: string | null
): number {
    // Validate days
    if (days < 1) return 0
    if (!Number.isFinite(days)) return 0

    // If no custom pricing, use simple multiplication
    if (!dayPricesJson) {
        return basePrice * days
    }

    try {
        const dayPrices: DayPrices = JSON.parse(dayPricesJson)

        // Check if there's a custom price for this specific number of days
        const customPrice = dayPrices[days.toString()]

        if (customPrice !== undefined && Number.isFinite(customPrice)) {
            return customPrice
        }

        // Fallback to base price × days
        return basePrice * days
    } catch (error) {
        // If JSON parsing fails, fallback to simple calculation
        console.error('Failed to parse dayPrices JSON:', error)
        return basePrice * days
    }
}

/**
 * Calculate the number of days between two dates (inclusive)
 * @param startDate Start date
 * @param endDate End date
 * @returns Number of days
 */
export function calculateRentalDays(startDate: Date, endDate: Date): number {
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Reset time to midnight for accurate day calculation
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    const diffTime = end.getTime() - start.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Add 1 to make it inclusive (e.g., same day = 1 day)
    return diffDays + 1
}

/**
 * Generate default day prices based on base price
 * @param basePrice The base price for 1 day
 * @param maxDays Maximum number of days to generate (default 14)
 * @returns DayPrices object
 */
export function generateDefaultDayPrices(basePrice: number, maxDays: number = 14): DayPrices {
    const prices: DayPrices = {}

    for (let day = 1; day <= maxDays; day++) {
        prices[day.toString()] = basePrice * day
    }

    return prices
}

/**
 * Validate day prices JSON structure
 * @param dayPricesJson JSON string to validate
 * @returns boolean indicating if valid
 */
export function isValidDayPricesJson(dayPricesJson: string): boolean {
    try {
        const parsed = JSON.parse(dayPricesJson)

        if (typeof parsed !== 'object' || parsed === null) {
            return false
        }

        // Check that all values are valid numbers
        for (const [key, value] of Object.entries(parsed)) {
            const dayNum = parseInt(key)
            if (isNaN(dayNum) || dayNum < 1 || dayNum > 14) {
                return false
            }
            if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
                return false
            }
        }

        return true
    } catch {
        return false
    }
}
