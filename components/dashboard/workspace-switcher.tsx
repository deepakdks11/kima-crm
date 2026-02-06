'use client';

import { useState } from 'react';
import {
    Check,
    ChevronsUpDown,
    PlusCircle,
    Building2
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Workspace } from '@/lib/types';
import { useWorkspace } from '@/components/providers/workspace-provider';

export function WorkspaceSwitcher({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const { workspace: selectedWorkspace, workspaces, isLoading, setWorkspace } = useWorkspace();

    const onWorkspaceSelect = (workspace: Workspace) => {
        setWorkspace(workspace);
        setOpen(false);
        // In a real implementation, this would trigger a context update or router push
        // router.push(`/w/${workspace.slug}/dashboard`);
        console.log('Switched to workspace:', workspace.name);
    };

    if (isLoading) {
        return (
            <Button variant="outline" className="w-[200px] justify-between animate-pulse">
                Loading...
            </Button>
        );
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a workspace"
                    className={cn("w-[200px] justify-between", className)}
                >
                    <Avatar className="mr-2 h-5 w-5">
                        <AvatarImage
                            src={`https://avatar.vercel.sh/${selectedWorkspace?.slug}.png`}
                            alt={selectedWorkspace?.name}
                        />
                        <AvatarFallback>SC</AvatarFallback>
                    </Avatar>
                    {selectedWorkspace?.name || "Select Workspace"}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandInput placeholder="Search workspace..." />
                        <CommandEmpty>No workspace found.</CommandEmpty>
                        <CommandGroup heading="My Workspaces">
                            {workspaces.map((workspace) => (
                                <CommandItem
                                    key={workspace.id}
                                    onSelect={() => onWorkspaceSelect(workspace)}
                                    className="text-sm"
                                >
                                    <Avatar className="mr-2 h-5 w-5">
                                        <AvatarImage
                                            src={`https://avatar.vercel.sh/${workspace.slug}.png`}
                                            alt={workspace.name}
                                        />
                                        <AvatarFallback>
                                            {workspace.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    {workspace.name}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedWorkspace?.id === workspace.id
                                                ? "opacity-100"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <CommandSeparator />
                    <CommandList>
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false);
                                    // Handle create workspace dialog
                                    console.log("Create Workspace clicked");
                                }}
                            >
                                <PlusCircle className="mr-2 h-5 w-5" />
                                Create Workspace
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
