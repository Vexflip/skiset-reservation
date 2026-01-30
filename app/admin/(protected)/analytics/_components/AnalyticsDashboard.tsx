'use client'

import { useState, useEffect } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AnalyticsDashboard() {
    const [data, setData] = useState<{
        stats: {
            totalReservations: number
            totalRevenue: number
            averageOrderValue: number
        }
        charts: {
            revenueOverTime: { date: string, amount: number }[]
            equipmentDistribution: { name: string, value: number }[]
        }
    } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch('/api/admin/analytics')
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error('Failed to fetch analytics:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAnalytics()
    }, [])

    if (loading) return <div className="p-4 text-center text-gray-500">Loading analytics...</div>
    if (!data) return null

    return (
        <div className="space-y-6 mb-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.stats.totalRevenue)}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Total Reservations</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {data.stats.totalReservations}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Average Order Value</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(data.stats.averageOrderValue)}
                    </p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue (Last 30 Days)</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={data.charts.revenueOverTime}
                                margin={{
                                    top: 10,
                                    right: 30,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => {
                                        const d = new Date(str);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                    minTickGap={30}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: number | undefined) => value != null ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value) : ''}
                                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#3b82f6" fill="#eff6ff" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Equipment Distribution */}
                <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Distribution</h3>
                    {data.charts.equipmentDistribution.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.charts.equipmentDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.charts.equipmentDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend
                                        verticalAlign="middle"
                                        align="right"
                                        layout="vertical"
                                        iconType="circle"
                                        formatter={(value, entry: any) => (
                                            <span className="text-gray-600 text-sm ml-2">
                                                {value}: <span className="font-semibold">{entry.payload.value}</span>
                                            </span>
                                        )}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No equipment data available
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
