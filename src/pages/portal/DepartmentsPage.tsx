import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuthz } from '@/hooks/useAuthz';
import { useToast } from '@/components/ui/use-toast';

export const DepartmentsPage: React.FC = () => {
  const { branchId } = useAuthz();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDepts, setAllDepts] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const resolveMemberId = async (userId: string, email?: string | null) => {
    const { data: memberByProfile } = await supabase
      .from('members')
      .select('id')
      .eq('profile_id', userId)
      .maybeSingle();
    if (memberByProfile?.id) return memberByProfile.id;

    if (email) {
      const { data: memberByEmail } = await supabase
        .from('members')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (memberByEmail?.id) return memberByEmail.id;
    }

    return null;
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const memberId = await resolveMemberId(user.id, user.email);
        const [{ data: assignments }, { data: depts }] = await Promise.all([
          memberId
            ? supabase
                .from('department_assignments')
                .select('id, status, type, department_id, department:departments(name)')
                .eq('member_id', memberId)
                .order('created_at', { ascending: false })
            : Promise.resolve({ data: [] as any[] }),
          branchId
            ? supabase.from('departments').select('id, name').eq('branch_id', branchId)
            : supabase.from('departments').select('id, name'),
        ]);
        setItems(assignments || []);
        setAllDepts(depts || []);
      }
      setLoading(false);
    })();
  }, [branchId]);

  const requestJoin = async () => {
    if (!selectedDept) return;
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const memberId = await resolveMemberId(user.id, user.email);
    if (!memberId) {
      toast({
        title: 'Member profile not linked',
        description: 'Unable to resolve your member record for this request.',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('department_join_requests')
      .insert({ member_id: memberId, department_id: selectedDept, action: 'join' });

    if (error) {
      toast({
        title: 'Request failed',
        description: error.message || 'Could not submit join request.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Join request submitted' });
    }
    setSubmitting(false);
  };

  const requestLeave = async (department_id: string) => {
    setSubmitting(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    const memberId = await resolveMemberId(user.id, user.email);
    if (!memberId) {
      toast({
        title: 'Member profile not linked',
        description: 'Unable to resolve your member record for this request.',
        variant: 'destructive',
      });
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('department_join_requests')
      .insert({ member_id: memberId, department_id, action: 'leave' });

    if (error) {
      toast({
        title: 'Request failed',
        description: error.message || 'Could not submit leave request.',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Leave request submitted' });
    }
    setSubmitting(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-lg font-semibold">My Departments</div>
      <div className="flex items-center gap-2">
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select department to join" />
          </SelectTrigger>
          <SelectContent>
            {allDepts.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={requestJoin} disabled={!selectedDept || submitting}>
          Request Join
        </Button>
      </div>
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{it.department?.name || 'Department'}</div>
              <div className="text-sm text-gray-600 capitalize">
                {it.type} - {it.status || 'pending'}
              </div>
            </div>
            <div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => requestLeave(it.department_id)}
                disabled={submitting}
              >
                Request Leave
              </Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-gray-600">No department assignments.</div>}
      </div>
    </Card>
  );
};
