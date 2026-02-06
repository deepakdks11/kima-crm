'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { Loader2 } from 'lucide-react';

interface CreateWorkspaceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();
    const { refreshWorkspaces, setWorkspace } = useWorkspace();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            // 1. Create slug from name
            const slug = name.toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            const uniqueSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;

            // 2. Insert workspace
            const { data: workspace, error: wsError } = await supabase
                .from('workspaces')
                .insert({
                    name,
                    slug: uniqueSlug,
                    owner_id: user.id
                })
                .select()
                .single();

            if (wsError) throw wsError;

            // 3. Insert workspace_member (owner)
            const { error: memberError } = await supabase
                .from('workspace_members')
                .insert({
                    workspace_id: workspace.id,
                    user_id: user.id,
                    role: 'owner'
                });

            if (memberError) throw memberError;

            // 4. Refresh and select
            await refreshWorkspaces();
            setWorkspace(workspace);
            onOpenChange(false);
            setName('');
        } catch (error: any) {
            console.error('Error creating workspace:', error);
            alert(error.message || 'Failed to create workspace');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] rounded-xl border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl">
                <form onSubmit={onSubmit}>
                    <DialogHeader className="space-y-3">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Create Workspace
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            Give your new workspace a name. You can invite your team later to collaborate.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-6 font-primary">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-semibold px-1">
                                Workspace Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Kima Marketing"
                                className="h-11 px-4 text-base bg-muted/30 border-border/50 focus:ring-primary focus:border-primary transition-all duration-200"
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-muted"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                "Create Workspace"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
