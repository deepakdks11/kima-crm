'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Zap, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            });

            if (error) throw error;

            setSuccess(true);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/20">
                        <Zap className="h-10 w-10 text-primary-foreground fill-current" />
                    </div>
                </div>

                <Card className="border-border/50 shadow-2xl shadow-primary/5 backdrop-blur-sm bg-card/80">
                    <CardHeader className="space-y-1 pb-4">
                        <CardTitle className="text-xl font-bold">Reset Password</CardTitle>
                        <CardDescription>Enter your email to receive recovery instructions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success ? (
                            <div className="flex flex-col items-center gap-4 py-4 text-center animate-in fade-in zoom-in">
                                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-lg">Check your email</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We sent a password reset link to <span className="font-medium text-foreground">{email}</span>.
                                    </p>
                                </div>
                                <Button variant="outline" className="w-full mt-2" asChild>
                                    <Link href="/login">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Login
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleReset} className="space-y-4">
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
                                                Sending Link...
                                            </>
                                        ) : 'Send Reset Link'}
                                    </Button>
                                    <Button variant="ghost" className="w-full" size="sm" asChild>
                                        <Link href="/login">
                                            Back to Login
                                        </Link>
                                    </Button>
                                </div>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
