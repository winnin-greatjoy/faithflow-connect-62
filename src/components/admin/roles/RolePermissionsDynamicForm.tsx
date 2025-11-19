import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PermissionAction = "view" | "create" | "update" | "delete" | "manage";

type ModuleRow = { id: string; slug: string; name: string; is_active: boolean };
type FeatureRow = { id: string; module_id: string; slug: string; name: string; is_active?: boolean };

export function RolePermissionsDynamicForm({ open, onClose, roleId, roleName }: { open: boolean; onClose: () => void; roleId: string; roleName: string; }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [selections, setSelections] = useState<Record<string, Set<PermissionAction>>>({});
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);
  const [committees, setCommittees] = useState<{ id: string; name: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: string; title: string }[]>([]);
  const [scopeType, setScopeType] = useState<'global' | 'branch'>('global');
  const [branchId, setBranchId] = useState<string>('');
  const [coverageType, setCoverageType] = useState<'global' | 'department' | 'ministry' | 'committee' | 'task'>('global');
  const [departmentId, setDepartmentId] = useState<string>('');
  const [ministryId, setMinistryId] = useState<string>('');
  const [committeeId, setCommitteeId] = useState<string>('');
  const [taskId, setTaskId] = useState<string>('');

  // Feature registry and selections
  const [featuresByModule, setFeaturesByModule] = useState<Record<string, FeatureRow[]>>({});
  const [featureSelections, setFeatureSelections] = useState<Record<string, Set<PermissionAction>>>({});

  const ALL_ACTIONS: PermissionAction[] = useMemo(() => ["view","create","update","delete","manage"], []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [mods, brs, deps, mins, cms, tks, feats] = await Promise.all([
        supabase.from("modules").select("id, slug, name, is_active").eq("is_active", true).order("name"),
        supabase.from("church_branches").select("id, name").order("name"),
        supabase.from("departments").select("id, name").order("name"),
        supabase.from("ministries").select("id, name").order("name"),
        supabase.from("committees").select("id, name").order("name"),
        supabase.from("committee_tasks").select("id, title").order("created_at", { ascending: false }),
        supabase.from("features").select("id, module_id, slug, name, is_active").eq("is_active", true)
      ]);
      if (!active) return;
      if (mods.error) { toast({ title: "Failed to load modules", description: mods.error.message, variant: "destructive" }); return; }
      if (brs.error) { toast({ title: "Failed to load branches", description: brs.error.message, variant: "destructive" }); return; }
      if (deps.error) { toast({ title: "Failed to load departments", description: deps.error.message, variant: "destructive" }); return; }
      if (mins.error) { toast({ title: "Failed to load ministries", description: mins.error.message, variant: "destructive" }); return; }
      if (cms.error) { toast({ title: "Failed to load committees", description: cms.error.message, variant: "destructive" }); return; }
      if (tks.error) { toast({ title: "Failed to load tasks", description: tks.error.message, variant: "destructive" }); return; }
      if (feats.error) { toast({ title: "Failed to load features", description: feats.error.message, variant: "destructive" }); return; }
      setModules((mods.data || []) as any);
      setBranches((brs.data || []) as any);
      setDepartments((deps.data || []) as any);
      setMinistries((mins.data || []) as any);
      setCommittees((cms.data || []) as any);
      setTasks((tks.data || []) as any);
      const fmap: Record<string, FeatureRow[]> = {};
      ((feats.data || []) as any[]).forEach((f: any) => {
        const mid = f.module_id as string;
        if (!fmap[mid]) fmap[mid] = [];
        fmap[mid].push(f as FeatureRow);
      });
      setFeaturesByModule(fmap);
    })();
    return () => { active = false; };
  }, [toast]);

  useEffect(() => {
    if (!roleId) return;
    // Require necessary targets for selected scope/coverage
    if (scopeType === 'branch' && !branchId) { setSelections({}); return; }
    if (coverageType === 'department' && !departmentId) { setSelections({}); setFeatureSelections({}); return; }
    if (coverageType === 'ministry' && !ministryId) { setSelections({}); setFeatureSelections({}); return; }
    if (coverageType === 'committee' && !committeeId) { setSelections({}); setFeatureSelections({}); return; }
    if (coverageType === 'task' && !taskId) { setSelections({}); setFeatureSelections({}); return; }
    let active = true;
    (async () => {
      let q = (supabase as any)
        .from('role_permissions')
        .select('actions, feature_id, module:modules(slug)')
        .eq('role_id', roleId)
        .eq('scope_type', scopeType)
        .eq('coverage_type', coverageType) as any;
      if (scopeType === 'branch') q = q.eq('branch_id', branchId);
      else q = q.is('branch_id', null);
      if (coverageType === 'department') { q = q.eq('department_id', departmentId).is('ministry_id', null).is('committee_id', null).is('task_id', null); }
      else if (coverageType === 'ministry') { q = q.eq('ministry_id', ministryId).is('department_id', null).is('committee_id', null).is('task_id', null); }
      else if (coverageType === 'committee') { q = q.eq('committee_id', committeeId).is('department_id', null).is('ministry_id', null).is('task_id', null); }
      else if (coverageType === 'task') { q = q.eq('task_id', taskId).is('department_id', null).is('ministry_id', null).is('committee_id', null); }
      else { q = q.is('department_id', null).is('ministry_id', null).is('committee_id', null).is('task_id', null); }
      const { data, error } = await q;
      if (!active) return;
      if (error) { toast({ title: 'Failed to load permissions', description: error.message, variant: 'destructive' }); return; }
      const next: Record<string, Set<PermissionAction>> = {};
      const nextFeat: Record<string, Set<PermissionAction>> = {};
      (data || []).forEach((row: any) => {
        const slug = row.module?.slug as string | undefined;
        if (!slug) return;
        if (row.feature_id) {
          nextFeat[row.feature_id as string] = new Set<PermissionAction>((row.actions || []) as PermissionAction[]);
        } else {
          next[slug] = new Set<PermissionAction>((row.actions || []) as PermissionAction[]);
        }
      });
      setSelections(next);
      setFeatureSelections(nextFeat);
    })();
    return () => { active = false; };
  }, [roleId, scopeType, branchId, coverageType, departmentId, ministryId, toast]);

  const toggle = (slug: string, action: PermissionAction) => {
    setSelections(prev => {
      const next = { ...prev };
      const cur = new Set<PermissionAction>(next[slug] || []);
      if (cur.has(action)) cur.delete(action); else cur.add(action);
      next[slug] = cur;
      return next;
    });
  };

  const setAllForModule = (slug: string, value: boolean) => {
    setSelections(prev => {
      const next = { ...prev };
      next[slug] = value ? new Set<PermissionAction>(ALL_ACTIONS) : new Set<PermissionAction>();
      return next;
    });
  };

  // Feature helpers
  const toggleFeature = (featureId: string, action: PermissionAction) => {
    setFeatureSelections(prev => {
      const next = { ...prev } as Record<string, Set<PermissionAction>>;
      const cur = new Set<PermissionAction>(next[featureId] || []);
      if (cur.has(action)) cur.delete(action); else cur.add(action);
      next[featureId] = cur;
      return next;
    });
  };

  const setAllForFeature = (featureId: string, value: boolean) => {
    setFeatureSelections(prev => {
      const next = { ...prev } as Record<string, Set<PermissionAction>>;
      next[featureId] = value ? new Set<PermissionAction>(ALL_ACTIONS) : new Set<PermissionAction>();
      return next;
    });
  };

  // Reset selections when high-level scope/coverage toggles change
  useEffect(() => {
    setSelections({});
    setFeatureSelections({});
  }, [scopeType, coverageType]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (scopeType === 'branch' && !branchId) throw new Error('Select a branch');
      if (coverageType === 'department' && !departmentId) throw new Error('Select a department');
      if (coverageType === 'ministry' && !ministryId) throw new Error('Select a ministry');

      // Delete existing rows for this role + current scope/coverage selection
      let del = (supabase as any)
        .from('role_permissions')
        .delete()
        .eq('role_id', roleId)
        .eq('scope_type', scopeType)
        .eq('coverage_type', coverageType) as any;
      if (scopeType === 'branch') del = del.eq('branch_id', branchId); else del = del.is('branch_id', null);
      if (coverageType === 'department') del = del.eq('department_id', departmentId).is('ministry_id', null).is('committee_id', null).is('task_id', null);
      else if (coverageType === 'ministry') del = del.eq('ministry_id', ministryId).is('department_id', null).is('committee_id', null).is('task_id', null);
      else if (coverageType === 'committee') del = del.eq('committee_id', committeeId).is('department_id', null).is('ministry_id', null).is('task_id', null);
      else if (coverageType === 'task') del = del.eq('task_id', taskId).is('department_id', null).is('ministry_id', null).is('committee_id', null);
      else del = del.is('department_id', null).is('ministry_id', null).is('committee_id', null).is('task_id', null);
      const { error: delErr } = await del;
      if (delErr) throw delErr;

      const bySlug: Record<string, ModuleRow> = Object.fromEntries(modules.map(m => [m.slug as string, m]));
      const featuresById: Record<string, FeatureRow> = {};
      Object.values(featuresByModule).forEach(arr => arr.forEach(f => { featuresById[f.id] = f; }));
      const rows = Object.entries(selections)
        .map(([slug, set]) => ({ slug, actions: Array.from(set) }))
        .filter(({ actions }) => actions.length > 0)
        .map(({ slug, actions }) => ({
          module_id: bySlug[slug]?.id,
          role_id: roleId,
          feature_id: null,
          actions: actions as PermissionAction[],
          scope_type: scopeType,
          branch_id: scopeType === 'branch' ? branchId : null,
          coverage_type: coverageType,
          department_id: coverageType === 'department' ? departmentId : null,
          ministry_id: coverageType === 'ministry' ? ministryId : null,
          committee_id: coverageType === 'committee' ? committeeId : null,
          task_id: coverageType === 'task' ? taskId : null,
        }))
        .filter(r => r.module_id);

      const featureRows = Object.entries(featureSelections)
        .map(([fid, set]) => ({ fid, actions: Array.from(set) }))
        .filter(({ actions }) => actions.length > 0)
        .map(({ fid, actions }) => ({
          module_id: featuresById[fid]?.module_id,
          role_id: roleId,
          feature_id: fid,
          actions: actions as PermissionAction[],
          scope_type: scopeType,
          branch_id: scopeType === 'branch' ? branchId : null,
          coverage_type: coverageType,
          department_id: coverageType === 'department' ? departmentId : null,
          ministry_id: coverageType === 'ministry' ? ministryId : null,
          committee_id: coverageType === 'committee' ? committeeId : null,
          task_id: coverageType === 'task' ? taskId : null,
        }))
        .filter(r => r.module_id && r.feature_id);

      const payload = [...rows, ...featureRows];
      if (payload.length > 0) {
        const { error: insErr } = await (supabase as any).from('role_permissions').insert(payload as any[]);
        if (insErr) throw insErr;
      }

      toast({ title: "Permissions saved" });
      onClose();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Permissions — {roleName}</DialogTitle>
        </DialogHeader>

      <div className="space-y-5">
        {/* Scope (global / branch) and Coverage (global / department / ministry) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Scope</Label>
            <Select value={scopeType} onValueChange={(v) => setScopeType(v as any)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select scope" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (all branches)</SelectItem>
                <SelectItem value="branch">Branch</SelectItem>
              </SelectContent>
            </Select>
            {scopeType === 'branch' && (
              <div className="mt-2">
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
          </div>

          <div>
            <Label>Coverage</Label>
            <Select value={coverageType} onValueChange={(v) => setCoverageType(v as any)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select coverage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Global (all modules)</SelectItem>
                <SelectItem value="department">Department</SelectItem>
                <SelectItem value="ministry">Ministry</SelectItem>
                <SelectItem value="committee">Committee</SelectItem>
                <SelectItem value="task">Task</SelectItem>
              </SelectContent>
            </Select>
            {coverageType === 'department' && (
              <div className="mt-2">
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
            {coverageType === 'ministry' && (
              <div className="mt-2">
                <Label>Ministry *</Label>
                <Select value={ministryId} onValueChange={setMinistryId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select ministry" /></SelectTrigger>
                  <SelectContent>
                    {ministries.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {coverageType === 'committee' && (
              <div className="mt-2">
                <Label>Committee *</Label>
                <Select value={committeeId} onValueChange={setCommitteeId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select committee" /></SelectTrigger>
                  <SelectContent>
                    {committees.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {coverageType === 'task' && (
              <div className="mt-2">
                <Label>Task *</Label>
                <Select value={taskId} onValueChange={setTaskId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select task" /></SelectTrigger>
                  <SelectContent>
                    {tasks.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {modules.map((m) => {
          const slug = m.slug as string;
          const selected = selections[slug] || new Set<PermissionAction>();
          const allChecked = ALL_ACTIONS.every(a => selected.has(a));
          const someChecked = ALL_ACTIONS.some(a => selected.has(a));
          return (
            <div key={m.id}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-800 border-b pb-1">{m.name}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <Checkbox checked={allChecked} onCheckedChange={(v) => setAllForModule(slug, Boolean(v))} />
                  <span>All</span>
                  {someChecked && !allChecked && <span className="text-xs text-gray-500">Partial</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                {ALL_ACTIONS.map((action) => (
                  <label key={action} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={selected.has(action)}
                      onCheckedChange={() => toggle(slug, action)}
                    />
                    <span className="capitalize">{action}</span>
                  </label>
                ))}
              </div>

              {/* Feature-level actions for this module */}
              {featuresByModule[m.id]?.length ? (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium">Features</h5>
                  </div>
                  <div className="space-y-3 mt-2">
                    {featuresByModule[m.id].map((f) => {
                      const fsel = featureSelections[f.id] || new Set<PermissionAction>();
                      const fall = ALL_ACTIONS.every(a => fsel.has(a));
                      const fsome = ALL_ACTIONS.some(a => fsel.has(a));
                      return (
                        <div key={f.id} className="border rounded-md p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{f.name}</div>
                            <div className="flex items-center gap-2 text-xs">
                              <Checkbox checked={fall} onCheckedChange={(v) => setAllForFeature(f.id, Boolean(v))} />
                              <span>All</span>
                              {fsome && !fall && <span className="text-[10px] text-gray-500">Partial</span>}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mt-3">
                            {ALL_ACTIONS.map((action) => (
                              <label key={action} className="flex items-center gap-2 text-sm">
                                <Checkbox
                                  checked={fsel.has(action)}
                                  onCheckedChange={() => toggleFeature(f.id, action)}
                                />
                                <span className="capitalize">{action}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
      </div>
    </DialogContent>
  </Dialog>
  );
}
