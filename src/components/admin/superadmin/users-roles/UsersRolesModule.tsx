import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConvertApprovalTable } from "./ConvertApprovalTable";
import { MemberTrainingView } from "./MemberTrainingView";
import { SuperadminUsersRoles } from "../SuperadminUsersRoles";
import { Shield, Users, GraduationCap } from "lucide-react";

export const UsersRolesModule = () => {
    const [activeTab, setActiveTab] = useState("converts");

    // Force re-render comment
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users & Roles</h2>
                    <p className="text-muted-foreground">
                        Manage spiritual roles, approvals, and leadership training pipeline
                    </p>
                </div>
            </div>

            <Tabs defaultValue="converts" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="converts" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Convert Approvals
                    </TabsTrigger>
                    <TabsTrigger value="training" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Training Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="roles" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Role Management
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="converts" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Baptism & Convert Approval Queue</CardTitle>
                            <CardDescription>
                                Review converts submitted by branches and districts. Only National HQ can finalize baptism.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ConvertApprovalTable />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="training" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Leadership Training Pipeline</CardTitle>
                            <CardDescription>
                                Track progress for Discipleship, Leadership, and Pastoral training courses.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <MemberTrainingView />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="roles" className="space-y-4">
                    {/* Reuse existing robust component */}
                    <SuperadminUsersRoles />
                </TabsContent>
            </Tabs>
        </div>
    );
};
