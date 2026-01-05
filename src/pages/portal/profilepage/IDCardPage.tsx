import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MembershipCard } from '@/components/admin/MembershipCard';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useBranches } from '@/hooks/useBranches';
import { Skeleton } from '@/components/ui/skeleton';

export const IDCardPage: React.FC = () => {
  const { user } = useAuth();
  const { branches } = useBranches();
  const [member, setMember] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtName, setDistrictName] = useState<string>('');

  useEffect(() => {
    const fetchMember = async () => {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();

      if (data) {
        setMember(data);

        // Fetch departments
        const { data: deptData } = await supabase
          .from('department_assignments')
          .select('*, departments(name)')
          .eq('member_id', data.id)
          .eq('status', 'approved');

        if (deptData) {
          setDepartments(deptData.map((d: any) => d.departments.name));
        }

        // Fetch District info via Branch
        const { data: branchData } = await supabase
          .from('church_branches')
          .select('*, districts(name)')
          .eq('id', data.branch_id)
          .single();

        if (branchData?.districts) {
          setDistrictName(branchData.districts.name);
        }
      }
      setLoading(false);
    };

    fetchMember();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[250px] w-full max-w-[400px] rounded-[2rem]" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold">Member record not found</h2>
        <p className="text-muted-foreground mt-2">Please contact your branch administrator.</p>
      </div>
    );
  }

  const branchName = branches.find((b) => b.id === member.branch_id)?.name || 'Unknown Branch';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-serif">Digital ID Card</h1>
        <p className="text-muted-foreground mt-2 font-medium">Your official membership token</p>
      </div>

      <Card className="border border-primary/10 bg-card overflow-hidden rounded-[2.5rem] shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Standard Identifier</CardTitle>
          <CardDescription>
            This card can be presented for verification and event check-ins.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-12">
          <MembershipCard
            member={member}
            branchName={branchName}
            districtName={districtName}
            departments={departments}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default IDCardPage;
