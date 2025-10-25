import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuthz } from '@/hooks/useAuthz';

export const DepartmentsPage: React.FC = () => {
  const { branchId } = useAuthz();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDepts, setAllDepts] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const [{ data: assignments }, { data: depts }] = await Promise.all([
          supabase
            .from('department_assignments')
            .select('id, status, type, department_id, department:departments(name)')
            .eq('member_id', user.id)
            .order('created_at', { ascending: false }),
          branchId ? supabase.from('departments').select('id, name').eq('branch_id', branchId) : supabase.from('departments').select('id, name')
        ]);
        setItems(assignments || []);
        setAllDepts(depts || []);
      }
      setLoading(false);
    })();
  }, []);

  const requestJoin = async () => {
    if (!selectedDept) return;
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }
    await supabase.from('department_join_requests').insert({ member_id: user.id, department_id: selectedDept, action: 'join' });
    setSubmitting(false);
  };

  const requestLeave = async (department_id: string) => {
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); return; }
    await supabase.from('department_join_requests').insert({ member_id: user.id, department_id, action: 'leave' });
    setSubmitting(false);
  };

  if (loading) return <div>Loading…</div>;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-lg font-semibold">My Departments</div>
      <div className="flex items-center gap-2">
        <Select value={selectedDept} onValueChange={setSelectedDept}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select department to join" />
          </SelectTrigger>
          <SelectContent>
            {allDepts.map(d => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button size="sm" onClick={requestJoin} disabled={!selectedDept || submitting}>Request Join</Button>
      </div>
      <div className="space-y-2">
        {items.map(it => (
          <div key={it.id} className="flex items-center justify-between border rounded p-3">
            <div>
              <div className="font-medium">{it.department?.name || 'Department'}</div>
              <div className="text-sm text-gray-600 capitalize">{it.type} • {it.status || 'pending'}</div>
            </div>
            <div>
              <Button size="sm" variant="outline" onClick={() => requestLeave(it.department_id)} disabled={submitting}>Request Leave</Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-gray-600">No department assignments.</div>}
      </div>
    </Card>
  );
}
