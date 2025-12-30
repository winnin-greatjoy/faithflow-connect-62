// src/components/admin/evangelism/EvangelismDashboard.tsx
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Users, Heart } from 'lucide-react';
import { FirstTimerTable } from './FirstTimerTable';
import { FirstTimerFormDialog } from './FirstTimerFormDialog';
import { useFirstTimers } from '@/modules/members/hooks/useFirstTimers';
import { useBranches } from '@/hooks/useBranches';
import type { FirstTimer } from '@/types/membership';

export const EvangelismDashboard = () => {
    const [showFirstTimerForm, setShowFirstTimerForm] = useState(false);
    const [editingFirstTimer, setEditingFirstTimer] = useState<FirstTimer | null>(null);
    const [selectedFirstTimerIds, setSelectedFirstTimerIds] = useState<string[]>([]);

    const { firstTimers, loading, reload } = useFirstTimers();
    const { branches } = useBranches();

    const getBranchName = (branchId: string) => {
        return branches.find(b => b.id === branchId)?.name || 'Unknown Branch';
    };

    const handleAddFirstTimer = () => {
        setEditingFirstTimer(null);
        setShowFirstTimerForm(true);
    };

    const handleEditFirstTimer = (firstTimer: FirstTimer) => {
        setEditingFirstTimer(firstTimer);
        setShowFirstTimerForm(true);
    };

    const handleDeleteFirstTimer = async (id: string) => {
        // TODO: Implement delete with confirmation
        console.log('Delete first timer:', id);
    };

    const handleFormSubmit = () => {
        reload();
        setShowFirstTimerForm(false);
        setEditingFirstTimer(null);
    };

    // Stats
    const totalFirstTimers = firstTimers.length;
    const newThisWeek = firstTimers.filter((ft) => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(ft.serviceDate) >= weekAgo;
    }).length;
    const converted = firstTimers.filter(ft => ft.status === 'converted').length;

    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Evangelism Department</h1>
                <p className="text-muted-foreground">
                    Manage first-timers, outreach events, and follow-up activities
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total First-Timers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalFirstTimers}</div>
                        <p className="text-xs text-muted-foreground">All time</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New This Week</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{newThisWeek}</div>
                        <p className="text-xs text-muted-foreground">Last 7 days</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Converted</CardTitle>
                        <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{converted}</div>
                        <p className="text-xs text-muted-foreground">Praise God!</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="first-timers">
                <TabsList>
                    <TabsTrigger value="first-timers">First-Timers</TabsTrigger>
                    <TabsTrigger value="outreach" disabled>Outreach Events</TabsTrigger>
                    <TabsTrigger value="follow-up" disabled>Follow-up</TabsTrigger>
                </TabsList>

                <TabsContent value="first-timers" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>First-Timers Management</CardTitle>
                                    <CardDescription>
                                        Track and follow up with visitors to the church
                                    </CardDescription>
                                </div>
                                <Button onClick={handleAddFirstTimer}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    Add First-Timer
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-12">Loading first-timers...</div>
                            ) : (
                                <FirstTimerTable
                                    firstTimers={firstTimers}
                                    selectedIds={selectedFirstTimerIds}
                                    onSelectionChange={setSelectedFirstTimerIds}
                                    onEdit={handleEditFirstTimer}
                                    onDelete={handleDeleteFirstTimer}
                                    getBranchName={getBranchName}
                                />
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="outreach">
                    <Card>
                        <CardHeader>
                            <CardTitle>Outreach Events</CardTitle>
                            <CardDescription>Plan and manage evangelism outreach activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-gray-500">
                                <p>Coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="follow-up">
                    <Card>
                        <CardHeader>
                            <CardTitle>Follow-up Tracking</CardTitle>
                            <CardDescription>Monitor follow-up activities and outcomes</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12 text-gray-500">
                                <p>Coming soon...</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <FirstTimerFormDialog
                open={showFirstTimerForm}
                onOpenChange={setShowFirstTimerForm}
                firstTimer={editingFirstTimer}
                onSubmit={handleFormSubmit}
            />
        </div>
    );
};
