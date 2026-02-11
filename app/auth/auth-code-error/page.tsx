'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams?.get('error');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
            <p className="text-muted-foreground max-w-md mb-8">
                {error || "We encountered an issue while verifying your secure login. This could be due to an expired link or a cancelled request."}
            </p>
            <div className="flex gap-4">
                <Button asChild variant="default">
                    <Link href="/login">Try Again</Link>
                </Button>
                <Button asChild variant="outline">
                    <Link href="/">Back Home</Link>
                </Button>
            </div>
        </div>
    );
}

export default function AuthCodeErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorContent />
        </Suspense>
    );
}
