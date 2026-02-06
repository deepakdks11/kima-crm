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
            <PopoverContent className="w-[280px] p-0 z-[100] bg-popover shadow-2xl border border-border overflow-hidden" align="start" sideOffset={8}>
                <Command className="bg-popover border-none">
                    <div className="p-2 border-b bg-muted/30">
                        <CommandInput
                            placeholder="Search workspace..."
                            className="h-9 border-none focus:ring-0 bg-background/50"
                        />
                    </div>
                    <CommandList className="max-h-[300px] bg-popover p-1 overflow-y-auto">
                        <CommandEmpty className="py-6 text-sm text-center text-muted-foreground">
                            No workspace found.
                        </CommandEmpty>
                        <CommandGroup heading="My Workspaces" className="px-2">
                            {workspaces.map((workspace) => (
                                <CommandItem
                                    key={workspace.id}
                                    onSelect={() => onWorkspaceSelect(workspace)}
                                    className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg aria-selected:bg-primary aria-selected:text-primary-foreground transition-all duration-200"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background overflow-hidden shrink-0">
                                        <Avatar className="h-full w-full">
                                            <AvatarImage
                                                src={`https://avatar.vercel.sh/${workspace.slug}.png`}
                                                alt={workspace.name}
                                            />
                                            <AvatarFallback className="text-[10px] font-bold">
                                                {workspace.name.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <span className="flex-1 truncate font-medium">{workspace.name}</span>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            selectedWorkspace?.id === workspace.id
                                                ? "opacity-100 shadow-sm"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                    <div className="p-1 border-t bg-muted/20">
                        <CommandGroup>
                            <CommandItem
                                onSelect={() => {
                                    setOpen(false);
                                    // Handle create workspace dialog or redirect
                                    console.log("Create Workspace clicked");
                                }}
                                className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-lg text-primary hover:bg-primary/10 hover:text-primary transition-colors font-semibold"
                            >
                                <PlusCircle className="h-5 w-5 text-primary" />
                                <span>Create New Workspace</span>
                            </CommandItem>
                        </CommandGroup>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
