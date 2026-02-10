"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface LeadsBySourceProps {
    data: { name: string; value: number }[];
}

export function LeadsBySourceChart({ data }: LeadsBySourceProps) {
    const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe', '#f5f3ff'];

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <XAxis type="number" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} width={100} />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}

interface ConversionRateCardProps {
    totalLeads: number;
    convertedLeads: number; // e.g., Onboarded or Demo
}

export function ConversionRateCard({ totalLeads, convertedLeads }: ConversionRateCardProps) {
    const rate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : "0";

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl border border-primary/10">
            <span className="text-4xl font-bold text-primary">{rate}%</span>
            <span className="text-sm text-muted-foreground mt-2">Conversion Rate</span>
            <span className="text-xs text-muted-foreground/50 mt-1">Leads to Deals</span>
        </div>
    );
}
