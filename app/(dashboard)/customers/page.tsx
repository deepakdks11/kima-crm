'use client';

import { useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Lead } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ClosedCustomersPage() {
    const supabase = createClient();
    const [customers, setCustomers] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCustomers() {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .eq('status', 'Onboarded')
                .order('updated_at', { ascending: false });

            if (data) setCustomers(data);
            setLoading(false);
        }
        fetchCustomers();
    }, [supabase]);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Closed Customers</h1>
                <p className="text-sm text-muted-foreground">Manage your onboarded partners and revenue.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Customer Portfolio</CardTitle>
                    <CardDescription>All leads currently in &quot;Onboarded&quot; status.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-12">Loading customers...</div>
                    ) : customers.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No customers closed yet. Keep pushing!
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto rounded-lg border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted text-muted-foreground uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Company</th>
                                        <th className="px-6 py-3">Segment</th>
                                        <th className="px-6 py-3">Product Used</th>
                                        <th className="px-6 py-3">Onboarded Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customers.map((customer) => (
                                        <tr key={customer.id} className="bg-card border-b hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4 font-medium">{customer.company_name}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="secondary">{customer.segment}</Badge>
                                            </td>
                                            <td className="px-6 py-4">{customer.product_fit || 'N/A'}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {format(new Date(customer.updated_at || customer.created_at), 'MMM d, yyyy')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
