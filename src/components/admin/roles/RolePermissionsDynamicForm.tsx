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

export function RolePermissionsDynamicForm({ open, onClose, roleId, roleName }: { open: boolean; onClose: () => void; roleId: string; roleName: string; }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [selections, setSelections] = useState<Record<string, Set<PermissionAction>>>({});
  const [moduleScopes, setModuleScopes] = useState<Record<string, { scope_type: 'global' | 'branch' | 'department' | 'ministry'; branch_id?: string; department_id?: string; ministry_id?: string }>>({});
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [ministries, setMinistries] = useState<{ id: string; name: string }[]>([]);

  const ALL_ACTIONS: PermissionAction[] = useMemo(() => ["view","create","update","delete","manage"], []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [mods, brs, deps, mins] = await Promise.all([
        supabase.from("modules").select("id, slug, name, is_active").eq("is_active", true).order("name"),
        supabase.from("church_branches").select("id, name").order("name"),
        supabase.from("departments").select("id, name").order("name"),
        (supabase as any).from("ministries").select("id, name").order("name")
      ]);
      if (!active) return;
      if (mods.error) { toast({ title: "Failed to load modules", description: mods.error.message, variant: "destructive" }); return; }
      if (brs.error) { toast({ title: "Failed to load branches", description: brs.error.message, variant: "destructive" }); return; }
      if (deps.error) { toast({ title: "Failed to load departments", description: deps.error.message, variant: "destructive" }); return; }
      if (mins.error) { toast({ title: "Failed to load ministries", description: mins.error.message, variant: "destructive" }); return; }
      setModules((mods.data || []) as any);
      setBranches((brs.data || []) as any);
      setDepartments((deps.data || []) as any);
      setMinistries((mins.data || []) as any);
    })();
    return () => { active = false; };
  }, [toast]);

  useEffect(() => {
    if (!roleId) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("module_role_permissions")
        .select("module_id, allowed_actions, scope_type, branch_id, department_id, ministry_id, module:modules(slug)")
        .eq("role_id", roleId);
      if (!active) return;
      if (error) {
        toast({ title: "Failed to load permissions", description: error.message, variant: "destructive" });
        return;
      }
      const next: Record<string, Set<PermissionAction>> = {};
      const scopes: Record<string, { scope_type: 'global' | 'branch' | 'department' | 'ministry'; branch_id?: string; department_id?: string; ministry_id?: string }> = {};
      (data || []).forEach((row: any) => {
        const slug = row.module?.slug as string | undefined;
        if (!slug) return;
        const incoming = { scope_type: row.scope_type as any, branch_id: row.branch_id || undefined, department_id: row.department_id || undefined, ministry_id: row.ministry_id || undefined };
        const existing = scopes[slug];
        const rank = (s: any) => (s === 'global' ? 1 : s === 'branch' ? 2 : s === 'department' ? 3 : 4);
        if (!existing || rank(incoming.scope_type) < rank(existing.scope_type)) {
          scopes[slug] = incoming as any;
          next[slug] = new Set<PermissionAction>((row.allowed_actions || []) as PermissionAction[]);
        }
      });
      setSelections(next);
      setModuleScopes(scopes);
    })();
    return () => { active = false; };
  }, [roleId, toast]);

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

  const setScope = (slug: string, scope_type: 'global' | 'branch' | 'department' | 'ministry') => {
    setModuleScopes(prev => ({
      ...prev,
      [slug]: { scope_type }
    }));
  };

  const setScopeTarget = (slug: string, key: 'branch_id' | 'department_id' | 'ministry_id', value: string) => {
    setModuleScopes(prev => ({
      ...prev,
      [slug]: { ...prev[slug], [key]: value, scope_type: prev[slug]?.scope_type || (key === 'branch_id' ? 'branch' : key === 'department_id' ? 'department' : 'ministry') }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      for (const m of modules) {
        const slug = m.slug as string;
        const actions = Array.from(selections[slug] || []);
        if (actions.length === 0) continue;
        const s = moduleScopes[slug] || { scope_type: 'global' };
        if (s.scope_type === 'branch' && !s.branch_id) throw new Error(`Select a branch for ${m.name}`);
        if (s.scope_type === 'department' && !s.department_id) throw new Error(`Select a department for ${m.name}`);
        if (s.scope_type === 'ministry' && !s.ministry_id) throw new Error(`Select a ministry for ${m.name}`);
      }

      const { error: delErr } = await (supabase as any)
        .from("module_role_permissions")
        .delete()
        .eq("role_id", roleId);
      if (delErr) throw delErr;

      const bySlug: Record<string, ModuleRow> = Object.fromEntries(modules.map(m => [m.slug as string, m]));
      const rows = Object.entries(selections)
        .map(([slug, set]) => ({ slug, actions: Array.from(set), scope: moduleScopes[slug] || { scope_type: 'global' } }))
        .filter(({ actions }) => actions.length > 0)
        .map(({ slug, actions, scope }) => ({
          module_id: bySlug[slug]?.id,
          role_id: roleId,
          scope_type: scope.scope_type as any,
          branch_id: scope.scope_type === 'branch' ? scope.branch_id || null : null,
          department_id: scope.scope_type === 'department' ? scope.department_id || null : null,
          ministry_id: scope.scope_type === 'ministry' ? scope.ministry_id || null : null,
          allowed_actions: actions as PermissionAction[],
        }))
        .filter(r => r.module_id);

      if (rows.length > 0) {
        const { error: insErr } = await (supabase as any).from("module_role_permissions").insert(rows as any[]);
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

        <div className="space-y-5 max-h-[70vh] overflow-y-auto">
          {modules.map((m) => {
            const slug = m.slug as string;
            const selected = selections[slug] || new Set<PermissionAction>();
            const allChecked = ALL_ACTIONS.every(a => selected.has(a));
            const someChecked = ALL_ACTIONS.some(a => selected.has(a));
            const scope = moduleScopes[slug] || { scope_type: 'global' };
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
                      <Checkbox checked={selected.has(action)} onCheckedChange={() => toggle(slug, action)} />
                      <span className="capitalize">{action}</span>
                    </label>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div>
                    <Label>Scope</Label>
                    <Select value={scope.scope_type} onValueChange={(v) => setScope(slug, v as any)}>
                      <SelectTrigger className="w-full"><SelectValue placeholder="Select scope" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="global">Global</SelectItem>
                        <SelectItem value="branch">Branch</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="ministry">Ministry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {scope.scope_type === 'branch' && (
                    <div>
                      <Label>Branch</Label>
                      <Select value={scope.branch_id || ""} onValueChange={(v) => setScopeTarget(slug, 'branch_id', v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select branch" /></SelectTrigger>
                        <SelectContent>
                          {branches.map(b => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {scope.scope_type === 'department' && (
                    <div>
                      <Label>Department</Label>
                      <Select value={scope.department_id || ""} onValueChange={(v) => setScopeTarget(slug, 'department_id', v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map(d => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {scope.scope_type === 'ministry' && (
                    <div>
                      <Label>Ministry</Label>
                      <Select value={scope.ministry_id || ""} onValueChange={(v) => setScopeTarget(slug, 'ministry_id', v)}>
                        <SelectTrigger className="w-full"><SelectValue placeholder="Select ministry" /></SelectTrigger>
                        <SelectContent>
                          {ministries.map(mi => (
                            <SelectItem key={mi.id} value={mi.id}>{mi.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
