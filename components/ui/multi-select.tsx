"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Command,
    CommandGroup,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    options,
    selected,
    onChange,
    placeholder = "Select options...",
    className,
}: MultiSelectProps) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");

    const handleUnselect = (option: string) => {
        onChange(selected.filter((s) => s !== option));
    };

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            const input = inputRef.current;
            if (input) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    if (input.value === "" && selected.length > 0) {
                        onChange(selected.slice(0, -1));
                    }
                }
                if (e.key === "Escape") {
                    input.blur();
                }
            }
        },
        [selected, onChange]
    );

    const selectables = options.filter((option) => !selected.includes(option));

    return (
        <Command
            onKeyDown={handleKeyDown}
            className="overflow-visible bg-transparent"
        >
            <div
                className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 bg-background/50 backdrop-blur-sm"
            >
                <div className="flex flex-wrap gap-1">
                    {selected.map((option) => (
                        <Badge
                            key={option}
                            variant="secondary"
                            className="hover:bg-secondary/80 bg-primary/20 text-primary-foreground border-primary/30"
                        >
                            {option}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleUnselect(option);
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                onClick={() => handleUnselect(option)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                    {/* Avoid having the "Search" Input be too small, so give it a minimum width */}
                    <CommandPrimitive.Input
                        ref={inputRef}
                        value={inputValue}
                        onValueChange={setInputValue}
                        onBlur={() => {
                            // Small timeout to allow onSelect to fire before closing
                            setTimeout(() => setOpen(false), 200);
                        }}
                        onFocus={() => setOpen(true)}
                        placeholder={placeholder}
                        className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                    />
                </div>
            </div>
            <div className="relative mt-2">
                <div
                    onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    className={cn(
                        "absolute w-full z-50 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in",
                        open ? "block" : "hidden"
                    )}
                >
                    <CommandList>
                        <CommandGroup className="h-full overflow-auto max-h-60 p-1">
                            {selectables.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                    No options left.
                                </div>
                            )}
                            {selectables.map((option) => (
                                <CommandItem
                                    key={option}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onSelect={() => {
                                        setInputValue("");
                                        onChange([...selected, option]);
                                    }}
                                    className="cursor-pointer"
                                >
                                    {option}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </div>
            </div>
        </Command>
    );
}
