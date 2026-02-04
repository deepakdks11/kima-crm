'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

export default function FollowUpsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
                    <p className="text-sm text-muted-foreground">Manage your daily tasks and interactions.</p>
                </div>
            </div>

            <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-3">
                    <TabsTrigger value="overdue" className="text-red-500">Overdue</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                </TabsList>

                <TabsContent value="overdue">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-500 flex items-center gap-2">
                                <AlertCircle className="h-5 w-5" />
                                Overdue Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                You&apos;re all caught up! No overdue tasks.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="today">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                Due Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Dummy placeholder for visual check */}
                                <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30">
                                    <div>
                                        <h3 className="font-medium">Acme Corp - Initial Call</h3>
                                        <p className="text-sm text-muted-foreground">Web3 Segment • High Priority</p>
                                    </div>
                                    <Button size="sm">Mark Completed</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="upcoming">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Upcoming Tasks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-muted-foreground">
                                No upcoming tasks scheduled.
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
