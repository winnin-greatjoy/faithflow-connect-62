import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DepartmentDashboard } from '@/components/departments/DepartmentDashboard';
import { DepartmentTaskBoard } from '@/components/departments/DepartmentTaskBoard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardSkeleton } from '@/components/ui/skeletons';

export const DepartmentPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [department, setDepartment] = useState<{ id: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadDepartment = async () => {
      if (!slug) return;
      
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('id, name')
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{department.name}</h1>
            <p className="text-muted-foreground">Manage department members, tasks, and activities</p>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DepartmentDashboard
              departmentId={department.id}
              departmentName={department.name}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <DepartmentTaskBoard departmentId={department.id} canEdit={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
