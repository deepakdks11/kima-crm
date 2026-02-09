'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Zap, Loader2 } from 'lucide-react';

function LoginForm() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const returnTo = searchParams?.get('return_to');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            router.refresh();
            // Redirect to return_to if present, otherwise dashboard
            if (returnTo) {
                router.push(decodeURIComponent(returnTo));
            } else {
                router.push('/dashboard');
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: returnTo ? `${window.location.origin}${decodeURIComponent(returnTo)}` : `${window.location.origin}/dashboard`
                }
            });
            if (error) throw error;
            alert('Check your email for confirmation link!');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px]" />
            </div>

            <div className="w-full max-w-[400px] px-4 relative z-10">
                {/* Logo Header */}
                <div className="flex flex-col items-center gap-6 mb-8 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 animate-in zoom-in duration-500">
                        <Zap className="h-10 w-10 text-primary-foreground fill-current" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight">
                            <span className="text-primary">Kima</span>CRM
                        </h1>
                        <p className="text-muted-foreground font-medium">Precision Lead Management</p>
                    </div>
                </div>

                <Card className="border-border/50 shadow-2xl shadow-primary/5 backdrop-blur-sm bg-card/80">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
                        <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Link href="/forgot-password" tabIndex={-1}>
                                        <span className="text-xs text-primary hover:underline cursor-pointer font-medium">Forgot?</span>
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-xl border border-destructive/20 animate-in slide-in-from-top-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-col gap-4 pt-2">
                                <Button type="submit" className="w-full h-11 text-base font-semibold shadow-lg shadow-primary/25" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : 'Sign In'}
                                </Button>
                                <div className="text-center text-sm text-muted-foreground">
                                    Don&apos;t have an account?{' '}
                                    <span
                                        className="text-primary font-semibold hover:underline cursor-pointer transition-colors"
                                        onClick={handleSignUp}
                                    >
                                        Sign up now
                                    </span>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Footer Quote or Tip */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-muted-foreground/60 italic">
                        &quot;Turning leads into loyalty with data-driven insights.&quot;
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
