import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect("/admin/login");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">Skiset Admin</span>
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/admin/dashboard" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                                    Dashboard
                                </Link>
                                <Link href="/admin/products" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                                    Products
                                </Link>
                                <Link href="/admin/customers" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                                    Customers
                                </Link>
                                <Link href="/admin/promocodes" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                                    Promo Codes
                                </Link>
                                <Link href="/admin/analytics" className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md font-medium">
                                    Analytics
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <span className="text-sm text-gray-500 mr-4 font-mono">{(session as any).email}</span>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
