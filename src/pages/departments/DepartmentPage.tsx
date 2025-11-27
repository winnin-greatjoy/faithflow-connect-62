import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DepartmentDashboard } from '@/components/departments/DepartmentDashboard';
import { UsheringDashboard } from '@/components/departments/UsheringDashboard';
import { ChoirDashboard } from '@/components/departments/ChoirDashboard';
import { TechnicalDashboard } from '@/components/departments/TechnicalDashboard';
import { FinanceDashboard } from '@/components/departments/FinanceDashboard';
import { EvangelismDashboard } from '@/components/departments/EvangelismDashboard';
import { PrayerTeamDashboard } from '@/components/departments/PrayerTeamDashboard';
import { DepartmentTaskBoard } from '@/components/departments/DepartmentTaskBoard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// Map department slugs to their specialized dashboard components
const SPECIALIZED_DASHBOARDS: Record<string, React.FC> = {
  ushering: UsheringDashboard,
  choir: ChoirDashboard,
  technical: TechnicalDashboard,
  finance: FinanceDashboard,
  evangelism: EvangelismDashboard,
  'prayer-team': PrayerTeamDashboard,
};

export const DepartmentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<{ id: string; name: string; slug: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadDepartment = async () => {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name, slug')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          toast({
            title: 'Department not found',
            description: 'The requested department does not exist.',
            variant: 'destructive',
          });
          return;
        }

        setDepartment(data);
      } catch (error: any) {
        toast({
          title: 'Error loading department',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDepartment();
  }, [slug, toast]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Department Not Found</h2>
          <p className="text-muted-foreground">The department you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Get the specialized dashboard component if it exists
  const SpecializedDashboard = SPECIALIZED_DASHBOARDS[department.slug];

  // If using specialized dashboard, render it directly without tabs
  if (SpecializedDashboard) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <SpecializedDashboard departmentId={department.id} />
        </div>
      </div>
    );
  }

  // Otherwise use generic dashboard with tabs
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/departments')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <p className="text-muted-foreground">
              Manage department members, tasks, and activities
            </p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DepartmentDashboard departmentId={department.id} departmentName={department.name} />
          </TabsContent>

          <TabsContent value="tasks">
            <DepartmentTaskBoard departmentId={department.id} canEdit={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
