import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    variant?: 'default' | 'compact' | 'centered';
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    variant = 'default',
    className
}: EmptyStateProps) {
    const isCompact = variant === 'compact';
    const isCentered = variant === 'centered';

    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center text-center px-4',
                isCompact ? 'py-8' : 'py-12 md:py-16',
                isCentered && 'min-h-[400px]',
                className
            )}
        >
            {Icon && (
                <div
                    className={cn(
                        'rounded-full bg-muted/50 flex items-center justify-center mb-4',
                        isCompact ? 'h-12 w-12' : 'h-16 w-16 md:h-20 md:w-20'
                    )}
                >
                    <Icon
                        className={cn(
                            'text-muted-foreground/50',
                            isCompact ? 'h-6 w-6' : 'h-8 w-8 md:h-10 md:w-10'
                        )}
                    />
                </div>
            )}

            <h3
                className={cn(
                    'font-semibold text-foreground mb-2',
                    isCompact ? 'text-base' : 'text-lg md:text-xl'
                )}
            >
                {title}
            </h3>

            {description && (
                <p
                    className={cn(
                        'text-muted-foreground max-w-md mb-6',
                        isCompact ? 'text-xs' : 'text-sm md:text-base'
                    )}
                >
                    {description}
                </p>
            )}

            {action && (
                <Button onClick={action.onClick} size={isCompact ? 'sm' : 'default'}>
                    {action.label}
                </Button>
            )}
        </div>
    );
}
