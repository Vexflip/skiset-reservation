import AnalyticsDashboard from './_components/AnalyticsDashboard'

export default function AnalyticsPage() {
    return (
        <div className="px-4 py-4 sm:px-0 animate-fade-in">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Analytics</h1>
            <AnalyticsDashboard />
        </div>
    )
}
