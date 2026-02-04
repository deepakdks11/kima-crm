'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface PipelineFunnelProps {
    data: { name: string; value: number }[];
}

export function PipelineFunnel({ data }: PipelineFunnelProps) {
    if (!data || data.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm italic">
                No pipeline data available
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    </linearGradient>
                </defs>
                <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                />
                <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    barSize={45}
                >
                    {data.map((entry, index) => (
                        <Cell
                            key={`cell-${index}`}
                            fill="url(#barGradient)"
                            className="hover:opacity-80 transition-opacity"
                        />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
