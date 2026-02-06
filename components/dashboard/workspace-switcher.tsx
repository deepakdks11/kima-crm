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
import { CreateWorkspaceDialog } from './create-workspace-dialog';

export function WorkspaceSwitcher({ className }: { className?: string }) {
    const [open, setOpen] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { workspace: selectedWorkspace, workspaces, isLoading, setWorkspace } = useWorkspace();

    const onWorkspaceSelect = (workspace: Workspace) => {
        setWorkspace(workspace);
        setOpen(false);
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
        <>
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
                <PopoverContent
                    className="w-[280px] p-0 z-[100] bg-popover/95 backdrop-blur-xl shadow-2xl border border-border/50 overflow-hidden rounded-xl"
                    align="start"
                    sideOffset={8}
                >
                    <Command className="bg-transparent border-none">
                        <div className="p-3 border-b bg-muted/30">
                            <CommandInput
                                placeholder="Search workspace..."
                                className="h-9 border-none focus:ring-0 bg-background/50 rounded-md"
                            />
                        </div>
                        <CommandList className="max-h-[320px] p-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20">
                            <CommandEmpty className="py-10 text-sm text-center text-muted-foreground animate-in fade-in duration-300">
                                No workspace found.
                            </CommandEmpty>
                            <CommandGroup heading="My Workspaces" className="px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                {workspaces.map((workspace) => (
                                    <CommandItem
                                        key={workspace.id}
                                        onSelect={() => onWorkspaceSelect(workspace)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 my-1 cursor-pointer rounded-lg transition-all duration-200 group",
                                            selectedWorkspace?.id === workspace.id
                                                ? "bg-primary/10 text-primary hover:bg-primary/15"
                                                : "hover:bg-muted"
                                        )}
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-background/50 group-hover:scale-105 transition-transform duration-200 overflow-hidden shrink-0 shadow-sm">
                                            <Avatar className="h-full w-full">
                                                <AvatarImage
                                                    src={`https://avatar.vercel.sh/${workspace.slug}.png`}
                                                    alt={workspace.name}
                                                />
                                                <AvatarFallback className="text-[10px] font-bold bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
                                                    {workspace.name.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className="flex flex-col flex-1 truncate">
                                            <span className="truncate font-medium text-sm">{workspace.name}</span>
                                            <span className="text-[10px] text-muted-foreground/70 truncate">Active Membership</span>
                                        </div>
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4 text-primary transition-all duration-200",
                                                selectedWorkspace?.id === workspace.id
                                                    ? "opacity-100 scale-100"
                                                    : "opacity-0 scale-50"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <div className="p-2 border-t bg-muted/20 backdrop-blur-md">
                            <CommandGroup>
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        setShowCreateDialog(true);
                                    }}
                                    className="flex items-center gap-3 px-3 py-3 cursor-pointer rounded-lg group text-primary transition-all duration-200 hover:bg-primary/10"
                                >
                                    <div className="bg-primary/20 p-1.5 rounded-lg group-hover:bg-primary/30 transition-colors">
                                        <PlusCircle className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="font-semibold text-sm">Create New Workspace</span>
                                </CommandItem>
                            </CommandGroup>
                        </div>
                    </Command>
                </PopoverContent>
            </Popover>

            <CreateWorkspaceDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />
        </>
    );
}
