'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Workspace } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface WorkspaceContextType {
    workspace: Workspace | null;
    workspaces: Workspace[];
    isLoading: boolean;
    setWorkspace: (workspace: Workspace) => void;
    refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [workspace, setWorkspaceState] = useState<Workspace | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    const refreshWorkspaces = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch workspaces where user is a member or owner
            // Note: The RLS policy "Users can view workspaces they are members of" handles the filtering
            const { data, error } = await supabase
                .from('workspaces')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching workspaces:', error);
                return;
            }

            if (data) {
                const fetchedWorkspaces = data as Workspace[];
                setWorkspaces(fetchedWorkspaces);

                // Handle selection logic
                const storedId = localStorage.getItem('kima_active_workspace_id');
                const lastActive = fetchedWorkspaces.find(w => w.id === storedId);

                if (lastActive) {
                    setWorkspaceState(lastActive);
                    document.cookie = `kima_active_workspace_id=${lastActive.id}; path=/; max-age=31536000; SameSite=Lax`;
                } else if (fetchedWorkspaces.length > 0) {
                    // Default to first one
                    const defaultWs = fetchedWorkspaces[0];
                    setWorkspaceState(defaultWs);
                    localStorage.setItem('kima_active_workspace_id', defaultWs.id);
                    document.cookie = `kima_active_workspace_id=${defaultWs.id}; path=/; max-age=31536000; SameSite=Lax`;
                }
            }
        } catch (error) {
            console.error('Failed to load workspaces', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshWorkspaces();
    }, [supabase]);

    const setWorkspace = (newWorkspace: Workspace) => {
        setWorkspaceState(newWorkspace);
        localStorage.setItem('kima_active_workspace_id', newWorkspace.id);
        document.cookie = `kima_active_workspace_id=${newWorkspace.id}; path=/; max-age=31536000; SameSite=Lax`;
        // Optional: Trigger a router refresh or soft reload to ensure data revalidation
        router.refresh();
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspace,
                workspaces,
                isLoading,
                setWorkspace,
                refreshWorkspaces
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
