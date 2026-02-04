import { Sidebar } from '@/components/dashboard/sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background relative">
            {/* Background elements for depth */}
            <div className="absolute inset-0 mesh-gradient-light dark:mesh-gradient opacity-30 pointer-events-none" />

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                {/* Glassmorphic Header */}
                <header className="flex h-20 items-center border-b border-white/5 glass px-8 bg-white/5 backdrop-blur-xl">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-primary uppercase tracking-widest">Kima CRM</span>
                        <h2 className="font-bold text-lg text-foreground tracking-tight">Workspace Overview</h2>
                    </div>

                    <div className="ml-auto flex items-center gap-6">
                        <div className="hidden md:flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-muted-foreground">
                            Press <kbd className="mx-1 px-1.5 py-0.5 rounded bg-white/10 text-foreground font-mono">⌘K</kbd> to search
                        </div>
                        <div className="h-10 w-10 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer border-white/10">
                            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                        </div>
                    </div>
                </header>

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
