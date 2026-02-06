'use client';

import { useEffect, useState, use } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { useWorkspace } from '@/components/providers/workspace-provider';

interface InvitationDetails {
    id: string;
    email: string;
    workspace_id: string;
    workspace_name: string;
    role: string;
}

export default function InvitationPage() {
    const router = useRouter();
    const params = useParams();
    const token = params?.token as string;

    const supabase = createClient();
    const { refreshWorkspaces } = useWorkspace();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invite, setInvite] = useState<InvitationDetails | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (token) {
            checkUserAndInvite();
        }
    }, [token]);

    const checkUserAndInvite = async () => {
        console.log('Validating token:', token);
        try {
            // 1. Check current auth status
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            // 2. Validate Token using RPC function
            const { data, error: rpcError } = await supabase.rpc('get_invitation_details', {
                lookup_token: token
            });

            if (rpcError) {
                console.error('RPC Error:', rpcError);
                throw new Error(rpcError.message || 'Database error during validation');
            }

            // RPC returns an array
            if (!data || data.length === 0) {
                setError('This invitation is invalid or has expired.');
                return;
            }

            setInvite(data[0] as InvitationDetails);

        } catch (err: any) {
            console.error('Error checking invitation:', err);
            setError(`Failed to validate invitation: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!invite || !user) return;
        setProcessing(true);

        try {
            // 1. Check if email matches (optional safety check, can be relaxed if you want to allow accepting with different email)
            // For strict security, you might enforce email matching.

            // 2. Add to workspace_members
            const { error: joinError } = await supabase
                .from('workspace_members')
                .insert({
                    workspace_id: invite.workspace_id,
                    user_id: user.id,
                    role: invite.role
                });

            if (joinError) {
                // Ignore unique violation if already member
                if (joinError.code !== '23505') throw joinError;
            }

            // 3. Delete invitation
            await supabase
                .from('invitations')
                .delete()
                .eq('id', invite.id);

            // 4. Update the local context
            localStorage.setItem('kima_active_workspace_id', invite.workspace_id);
            await refreshWorkspaces();

            // 5. Redirect
            router.push('/dashboard');
        } catch (err) {
            console.error('Error accepting invite:', err);
            setError('Failed to join workspace. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleLoginRedirect = () => {
        // Redirect to login with return URL back to this invite page
        const returnUrl = encodeURIComponent(`/invite/${token}`);
        router.push(`/login?return_to=${returnUrl}`);
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background p-4">
                <Card className="max-w-md w-full">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                            <XCircle className="h-6 w-6 text-destructive" />
                        </div>
                        <CardTitle className="text-xl">Invalid Invitation</CardTitle>
                        <CardDescription>{error}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-center">
                        <Button onClick={() => router.push('/login')}>Go to Login</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-background p-4">
            <Card className="max-w-md w-full shadow-lg">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">You've been invited!</CardTitle>
                    <CardDescription className="text-base mt-2">
                        You have been invited to join <strong>{invite?.workspace_name}</strong> as a <strong>{invite?.role}</strong>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {!user ? (
                        <div className="text-center space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Please log in or create an account to accept this invitation.
                            </p>
                            <Button className="w-full gap-2" onClick={handleLoginRedirect}>
                                Log in to Accept <ArrowRight className="h-4 w-4" />
                            </Button>
                            <div className="text-xs text-muted-foreground">
                                Don't have an account? <span className="text-primary cursor-pointer hover:underline" onClick={handleLoginRedirect}>Sign up</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="p-3 bg-muted rounded-lg text-sm">
                                Logged in as <strong>{user.email}</strong>
                            </div>
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleAccept}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Joining...
                                    </>
                                ) : (
                                    'Join Workspace'
                                )}
                            </Button>
                            <p className="text-xs text-muted-foreground cursor-pointer hover:underline" onClick={() => supabase.auth.signOut().then(() => setUser(null))}>
                                Not you? Sign out
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
