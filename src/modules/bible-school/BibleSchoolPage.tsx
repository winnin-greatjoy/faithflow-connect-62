// src/modules/bible-school/BibleSchoolPage.tsx
// Main orchestrator page for Bible School module
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, BookOpen, FileText, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePrograms } from './hooks/usePrograms';
import { useCohorts } from './hooks/useCohorts';
import { useStudents } from './hooks/useStudents';
import { useApplications } from './hooks/useApplications';
import { ProgramCard } from './components/ProgramCard';
import { CohortCard } from './components/CohortCard';
import { CohortDetailPage } from './CohortDetailPage';
import { StudentTable } from './components/StudentTable';
import { ApplicationTable } from './components/ApplicationTable';
import { StatsCard } from './components/StatsCard';
import {
  ApplyDialog,
  CreateCohortDialog,
  EnrollStudentDialog,
  RecordAttendanceDialog,
  GradeExamDialog,
  PromoteDialog,
  GraduateDialog,
} from './components/dialogs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useBibleSchoolAccess } from './hooks/useBibleSchoolAccess';
import type { BibleCohort } from './types';

export const BibleSchoolPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const access = useBibleSchoolAccess();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch data
  const { programs, reload: reloadPrograms } = usePrograms();
  const { cohorts: allCohorts, reload: reloadCohorts } = useCohorts();
  const { students, reload: reloadStudents } = useStudents({ status: 'enrolled' });
  const { applications, reload: reloadApplications } = useApplications({ status: 'pending' });

  // Filter cohorts by branch for branch admins (only if branch is known)
  // TODO: Get actual user's assigned branch instead of selectedBranchId
  const cohorts =
    access.isBranchAdmin && !access.isFullAdmin && access.userBranchId
      ? allCohorts.filter((c) => c.branch_id === access.userBranchId)
      : allCohorts;

  // Debug logging
  console.log('Bible School Access:', {
    isBranchAdmin: access.isBranchAdmin,
    isFullAdmin: access.isFullAdmin,
    userBranchId: access.userBranchId,
    allCohortsCount: allCohorts.length,
    filteredCohortsCount: cohorts.length,
  });

  // Dialog states
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isCreateCohortOpen, setIsCreateCohortOpen] = useState(false);
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);

  // Cohort status update handler
  const updateCohortStatus = async (cohort: BibleCohort, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bible_cohorts')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', cohort.id);

      if (error) throw error;

      toast({
        title: 'Cohort Updated',
        description: `${cohort.cohort_name} status changed to ${newStatus}`,
      });

      reloadCohorts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update cohort status',
        variant: 'destructive',
      });
    }
  };

  // Helper functions
  const getProgramName = (programId: string) => {
    return programs.find((p) => p.id === programId)?.name || 'Unknown';
  };

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return 'Central';
    return 'Branch'; // TODO: Implement actual branch lookup
  };

  const getMemberName = (memberId: string) => {
    return 'Member'; // TODO: Implement actual member lookup
  };

  const stats = {
    totalStudents: students.length,
    activeStudents: students.filter((s) => s.status === 'enrolled').length,
    activeCohorts: cohorts.length,
    pendingApplications: applications.length,
  };

  // If a cohort is selected, show its detail page
  if (selectedCohortId) {
    return (
      <div className="p-6">
        <CohortDetailPage cohortId={selectedCohortId} onBack={() => setSelectedCohortId(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
          <TabsTrigger value="training">Training</TabsTrigger>
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

        {/* Training Tab (Merged Programs & Cohorts) */}
        <TabsContent value="training" className="space-y-8">
          {programs.map((program) => {
            const programCohorts = cohorts.filter((c) => c.program_id === program.id);

            return (
              <div key={program.id} className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      {program.name}
                      <Badge variant={program.is_centralized ? 'secondary' : 'outline'}>
                        {program.is_centralized ? 'Central' : 'Branch'}
                      </Badge>
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">
                      {program.description} • Level {program.level_order}
                    </p>
                  </div>
                  {(access.isFullAdmin || access.canCreateCohort(program.level_order)) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Pre-select program? Dialog doesn't support it yet but we could add it
                        setIsCreateCohortOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Cohort
                    </Button>
                  )}
                </div>

                {programCohorts.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {programCohorts.map((cohort) => (
                      <CohortCard
                        key={cohort.id}
                        cohort={cohort}
                        programName={program.name}
                        branchName={getBranchName(cohort.branch_id)}
                        onClick={(c) => setSelectedCohortId(c.id)}
                        onActivate={(c) => updateCohortStatus(c as any, 'active')}
                        onComplete={(c) => updateCohortStatus(c as any, 'completed')}
                        onCancel={(c) => updateCohortStatus(c as any, 'cancelled')}
                        showActions={
                          access.isFullAdmin ||
                          access.canEditCohort(cohort.branch_id, program.level_order)
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                    <p className="text-muted-foreground text-sm">
                      No active cohorts for this program.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
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
            onView={(app) => {
              setSelectedApplication(app);
              setIsEnrollOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <ApplyDialog
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        programs={programs}
        onSuccess={() => {
          reloadApplications();
          setIsApplyOpen(false);
        }}
      />

      <CreateCohortDialog
        isOpen={isCreateCohortOpen}
        onClose={() => setIsCreateCohortOpen(false)}
        programs={programs}
        onSuccess={() => {
          reloadCohorts();
          setIsCreateCohortOpen(false);
        }}
        isBranchAdminOnly={access.isBranchAdmin && !access.isFullAdmin}
        userBranchId={access.userBranchId}
      />

      <EnrollStudentDialog
        isOpen={isEnrollOpen}
        onClose={() => {
          setIsEnrollOpen(false);
          setSelectedApplication(null);
        }}
        application={selectedApplication}
        cohorts={cohorts}
        onSuccess={() => {
          reloadStudents();
          reloadApplications();
          setIsEnrollOpen(false);
          setSelectedApplication(null);
        }}
      />
    </div>
  );
};
