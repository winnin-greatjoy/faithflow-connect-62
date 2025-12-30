// src/modules/bible-school/BibleSchoolPage.tsx
// Main orchestrator page for Bible School module
import React, { useState } from 'react';
import { Users, GraduationCap, BookOpen, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrograms } from './hooks/usePrograms';
import { useCohorts } from './hooks/useCohorts';
import { useStudents } from './hooks/useStudents';
import { useApplications } from './hooks/useApplications';
import { ProgramCard } from './components/ProgramCard';
import { CohortTable } from './components/CohortTable';
import { StudentTable } from './components/StudentTable';
import { ApplicationTable } from './components/ApplicationTable';
import { StatsCard } from './components/StatsCard';

export const BibleSchoolPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch data
    const { programs } = usePrograms();
    const { cohorts } = useCohorts({ status: 'active' });
    const { students } = useStudents({ status: 'enrolled' });
    const { applications } = useApplications({ status: 'pending' });

    // Helper functions
    const getProgramName = (programId: string) => {
        return programs.find(p => p.id === programId)?.name || 'Unknown';
    };

    const getBranchName = (branchId: string | null) => {
        if (!branchId) return 'Central';
        return 'Branch'; // TODO: Implement actual branch lookup
    };

    const getMemberName = (memberId: string) => {
        return 'Member'; // TODO: Implement actual member lookup
    };

    // Stats
    const stats = {
        totalStudents: students.length,
        activeStudents: students.filter(s => s.status === 'enrolled').length,
        activeCohorts: cohorts.length,
        pendingApplications: applications.length,
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bible School</h1>
                <p className="text-muted-foreground">
                    Manage training programs from Foundation to Pastoral levels
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={Users}
                    description="All enrolled students"
                />
                <StatsCard
                    title="Active Students"
                    value={stats.activeStudents}
                    icon={GraduationCap}
                    description="Currently enrolled"
                />
                <StatsCard
                    title="Active Cohorts"
                    value={stats.activeCohorts}
                    icon={BookOpen}
                    description="Running programs"
                />
                <StatsCard
                    title="Pending Applications"
                    value={stats.pendingApplications}
                    icon={FileText}
                    description="Awaiting review"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="programs">Programs</TabsTrigger>
                    <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Active Programs</h2>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {programs.slice(0, 3).map((program) => (
                                <ProgramCard key={program.id} program={program} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold mb-4">Recent Applications</h2>
                        <ApplicationTable
                            applications={applications.slice(0, 5)}
                            getMemberName={getMemberName}
                            getProgramName={getProgramName}
                            getBranchName={getBranchName}
                            showActions={false}
                        />
                    </div>
                </TabsContent>

                {/* Programs Tab */}
                <TabsContent value="programs" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {programs.map((program) => (
                            <ProgramCard key={program.id} program={program} />
                        ))}
                    </div>
                </TabsContent>

                {/* Cohorts Tab */}
                <TabsContent value="cohorts" className="space-y-4">
                    <CohortTable
                        cohorts={cohorts}
                        getProgramName={getProgramName}
                        getBranchName={getBranchName}
                    />
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-4">
                    <StudentTable students={students} />
                </TabsContent>

                {/* Applications Tab */}
                <TabsContent value="applications" className="space-y-4">
                    <ApplicationTable
                        applications={applications}
                        getMemberName={getMemberName}
                        getProgramName={getProgramName}
                        getBranchName={getBranchName}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};
