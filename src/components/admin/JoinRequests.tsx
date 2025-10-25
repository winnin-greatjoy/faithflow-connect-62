import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const JoinRequests: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('department_join_requests')
      .select('id, member_id, department_id, action, status, created_at, member:members(full_name, email), dept:departments(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    if (!error) setRows(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const approve = async (r: any) => {
    setActingId(r.id);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setActingId(null); return; }
    if (r.action === 'join') {
      await supabase.from('department_assignments').insert({
        member_id: r.member_id,
        department_id: r.department_id,
        assigned_by: user.id,
        assigned_date: new Date().toISOString().slice(0,10),
        status: 'approved',
        type: 'assignment',
        reason: 'self-request approved'
      } as any);
    }
    await supabase.from('department_join_requests').update({ status: 'approved' }).eq('id', r.id);
    setActingId(null);
    await load();
  };

  const reject = async (r: any) => {
    setActingId(r.id);
    await supabase.from('department_join_requests').update({ status: 'rejected' }).eq('id', r.id);
    setActingId(null);
    await load();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-lg font-semibold">Pending Department Join/Leave Requests</div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-3 py-2">Member</th>
              <th className="text-left px-3 py-2">Department</th>
              <th className="text-left px-3 py-2">Action</th>
              <th className="text-left px-3 py-2">Created</th>
              <th className="text-left px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.member?.full_name || r.member_id}</td>
                <td className="px-3 py-2">{r.dept?.name || r.department_id}</td>
                <td className="px-3 py-2 capitalize">{r.action}</td>
                <td className="px-3 py-2">{new Date(r.created_at).toLocaleString()}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Button size="sm" onClick={() => approve(r)} disabled={actingId === r.id}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => reject(r)} disabled={actingId === r.id}>Reject</Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-gray-600" colSpan={5}>No pending requests.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
