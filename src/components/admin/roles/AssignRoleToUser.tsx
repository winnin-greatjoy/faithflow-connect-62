import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { RoleRecord } from "./AddEditRoleForm";

export function AssignRoleToUser({ open, onClose, role, onSaved }: { open: boolean; onClose: () => void; role: RoleRecord; onSaved: () => void; }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  const [userId, setUserId] = useState<string>("");
  const [branchId, setBranchId] = useState<string>("");
  const [departmentId, setDepartmentId] = useState<string>("");
  const [ministryId, setMinistryId] = useState<string>("");
  const [scopeType, setScopeType] = useState<'global' | 'branch' | 'department' | 'ministry'>('global');

  useEffect(() => {
    let active = true;
    (async () => {
      const [u, b, d] = await Promise.all([
        supabase.from("profiles").select("id, first_name, last_name").order("first_name"),
        supabase.from("church_branches").select("id, name").order("name"),
        supabase.from("departments").select("id, name").order("name"),
      ]);
      if (!active) return;
      if (u.error) { toast({ title: "Failed to load users", description: u.error.message, variant: "destructive" }); return; }
      if (b.error) { toast({ title: "Failed to load branches", description: b.error.message, variant: "destructive" }); return; }
      if (d.error) { toast({ title: "Failed to load departments", description: d.error.message, variant: "destructive" }); return; }
      setUsers((u.data || []) as any);
      setBranches((b.data || []) as any);
      setDepartments((d.data || []) as any);
    })();
    return () => { active = false; };
  }, [toast]);

  useEffect(() => {
    setUserId("");
    setBranchId("");
    setDepartmentId("");
    setMinistryId("");
    setScopeType('global');
  }, [role?.id]);

  const handleSave = async () => {
    if (!userId) { toast({ title: "Select a user", variant: "destructive" }); return; }
    if (scopeType === 'branch' && !branchId) { toast({ title: "Select a branch", variant: "destructive" }); return; }
    if (scopeType === 'department' && !departmentId) { toast({ title: "Select a department", variant: "destructive" }); return; }
    if (scopeType === 'ministry' && !ministryId) { toast({ title: "Enter a ministry ID", variant: "destructive" }); return; }

    setSaving(true);
    try {
      const payload: any = {
        user_id: userId,
        role_id: role.id,
      };
      if (scopeType === 'branch') payload.branch_id = branchId;
      if (scopeType === 'department') payload.department_id = departmentId;
      if (scopeType === 'ministry') payload.ministry_id = ministryId;

      const { error } = await supabase.from("user_roles").insert([payload]);
      if (error) throw error;
      toast({ title: "Role assigned" });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: "Assignment failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign “{role.name}”</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>User *</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select user" /></SelectTrigger>
              <SelectContent>
                {users.map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.first_name} {u.last_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Scope</Label>
            <Select value={scopeType} onValueChange={(v) => setScopeType(v as any)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select scope" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="ministry">Ministry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {scopeType === 'branch' && (
            <div>
              <Label>Branch *</Label>
              <Select value={branchId} onValueChange={setBranchId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select branch" /></SelectTrigger>
                <SelectContent>
                  {branches.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scopeType === 'department' && (
            <div>
              <Label>Department *</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scopeType === 'ministry' && (
            <div>
              <Label>Ministry ID *</Label>
              <Input value={ministryId} onChange={(e) => setMinistryId(e.target.value)} placeholder="Enter ministry UUID" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Assign"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
