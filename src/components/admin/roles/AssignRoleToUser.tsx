import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RoleRecord } from './AddEditRoleForm';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function AssignRoleToUser({
  open,
  onClose,
  role,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  role: RoleRecord;
  onSaved: () => void;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [users, setUsers] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);

  const [userIds, setUserIds] = useState<string[]>([]);
  const [openUserPopover, setOpenUserPopover] = useState(false);
  const [branchId, setBranchId] = useState<string>('');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [ministryId, setMinistryId] = useState<string>('');
  const [scopeType, setScopeType] = useState<'global' | 'branch' | 'department' | 'ministry'>(
    'global'
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const [u, b, d, m] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name').order('first_name'),
        supabase.from('church_branches').select('id, name').order('name'),
        supabase.from('departments').select('id, name').order('name'),
        supabase.from('ministries').select('id, name').order('name'),
      ]);
      if (!active) return;
      if (u.error) {
        toast({
          title: 'Failed to load users',
          description: u.error.message,
          variant: 'destructive',
        });
        return;
      }
      if (b.error) {
        toast({
          title: 'Failed to load branches',
          description: b.error.message,
          variant: 'destructive',
        });
        return;
      }
      if (d.error) {
        toast({
          title: 'Failed to load departments',
          description: d.error.message,
          variant: 'destructive',
        });
        return;
      }
      if (m.error) {
        toast({
          title: 'Failed to load ministries',
          description: m.error.message,
          variant: 'destructive',
        });
        return;
      }
      setUsers((u.data || []) as any);
      setBranches((b.data || []) as any);
      setDepartments((d.data || []) as any);
      setMinistries((m.data || []) as any);
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    setUserIds([]);
    setBranchId('');
    setDepartmentId('');
    setMinistryId('');
    setScopeType('global');
  }, [role?.id]);

  const handleSave = async () => {
    if (userIds.length === 0) {
      toast({ title: 'Select at least one user', variant: 'destructive' });
      return;
    }
    if (scopeType === 'branch' && !branchId) {
      toast({ title: 'Select a branch', variant: 'destructive' });
      return;
    }
    if (scopeType === 'department' && !departmentId) {
      toast({ title: 'Select a department', variant: 'destructive' });
      return;
    }
    if (scopeType === 'ministry' && !ministryId) {
      toast({ title: 'Enter a ministry ID', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const promises = userIds.map(async (uId) => {
        const payload: any = {
          userId: uId,
          roleId: role.id,
        };
        if (scopeType === 'branch') payload.branchId = branchId;
        if (scopeType === 'department') payload.departmentId = departmentId;
        if (scopeType === 'ministry') payload.ministryId = ministryId;

        return supabase.functions.invoke('admin-roles', {
          body: {
            action: 'ASSIGN_ROLE',
            payload: payload,
          },
        });
      });

      const results = await Promise.all(promises);
      const errors = results.filter((r) => r.error);

      if (errors.length > 0) {
        console.error('Some assignments failed:', errors);
        throw new Error(`${errors.length} assignments failed.`);
      }

      toast({ title: `Role assigned to ${userIds.length} user(s)` });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: 'Assignment failed', description: e.message, variant: 'destructive' });
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
            <Label>Users *</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {userIds.map((id) => {
                const user = users.find((u) => u.id === id);
                return (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {user?.first_name} {user?.last_name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => setUserIds((ids) => ids.filter((i) => i !== id))}
                    />
                  </Badge>
                );
              })}
            </div>
            <Popover open={openUserPopover} onOpenChange={setOpenUserPopover}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openUserPopover}
                  className="w-full justify-between"
                >
                  {userIds.length > 0 ? `${userIds.length} user(s) selected` : 'Select users...'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((u) => (
                        <CommandItem
                          key={u.id}
                          value={`${u.first_name} ${u.last_name}`}
                          onSelect={() => {
                            setUserIds((prev) =>
                              prev.includes(u.id)
                                ? prev.filter((id) => id !== u.id)
                                : [...prev, u.id]
                            );
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              userIds.includes(u.id) ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          {u.first_name} {u.last_name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Scope</Label>
            <Select value={scopeType} onValueChange={(v) => setScopeType(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
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
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scopeType === 'department' && (
            <div>
              <Label>Department *</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {scopeType === 'ministry' && (
            <div>
              <Label>Ministry *</Label>
              <Select value={ministryId} onValueChange={setMinistryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select ministry" />
                </SelectTrigger>
                <SelectContent>
                  {ministries.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Assign'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
