
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
                secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                outline: "text-foreground",
                web3: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
                web2: "border-transparent bg-blue-500 text-white hover:bg-blue-600",

                // Segment-specific colors
                exporter: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
                wallet: "border-transparent bg-violet-500 text-white hover:bg-violet-600",
                dapp: "border-transparent bg-purple-500 text-white hover:bg-purple-600",
                freelancer: "border-transparent bg-green-500 text-white hover:bg-green-600",
                agency: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
                payments: "border-transparent bg-indigo-500 text-white hover:bg-indigo-600",

                // Status-specific colors
                new: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
                contacted: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
                demo: "border-transparent bg-green-500 text-white hover:bg-green-600",
                negotiation: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
                onboarded: "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
                lost: "border-transparent bg-red-500 text-white hover:bg-red-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props} />
    )
}

export { Badge, badgeVariants }
