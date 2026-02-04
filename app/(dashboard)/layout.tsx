
import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header - Optional, maybe for breadcrumbs or user profile top right */}
                <header className="flex h-16 items-center border-b border-gray-200 bg-white px-6">
                    <div className="font-semibold text-lg text-gray-800">
                        Kima + Trustodi CRM
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                        {/* User Profile or Search could go here */}
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
