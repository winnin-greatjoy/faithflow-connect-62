import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type PermissionAction = "view" | "create" | "update" | "delete" | "manage";

type ModuleRow = { id: string; slug: string; name: string; is_active: boolean };

export function RolePermissionsDynamicForm({ open, onClose, roleId, roleName }: { open: boolean; onClose: () => void; roleId: string; roleName: string; }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [selections, setSelections] = useState<Record<string, Set<PermissionAction>>>({});

  const ALL_ACTIONS: PermissionAction[] = useMemo(() => ["view","create","update","delete","manage"], []);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: mods, error } = await supabase
        .from("modules")
        .select("id, slug, name, is_active")
        .eq("is_active", true)
        .order("name");
      if (!active) return;
      if (error) {
        toast({ title: "Failed to load modules", description: error.message, variant: "destructive" });
        return;
      }
      setModules((mods || []) as any);
    })();
    return () => { active = false; };
  }, [toast]);

  useEffect(() => {
    if (!roleId) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("module_role_permissions")
        .select("module_id, allowed_actions, module:modules(slug)")
        .eq("role_id", roleId)
        .eq("scope_type", "global");
      if (!active) return;
      if (error) {
        toast({ title: "Failed to load permissions", description: error.message, variant: "destructive" });
        return;
      }
      const next: Record<string, Set<PermissionAction>> = {};
      (data || []).forEach((row: any) => {
        const slug = row.module?.slug as string | undefined;
        if (!slug) return;
        next[slug] = new Set<PermissionAction>((row.allowed_actions || []) as PermissionAction[]);
      });
      setSelections(next);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error: delErr } = await supabase
        .from("module_role_permissions")
        .delete()
        .eq("role_id", roleId)
        .eq("scope_type", "global");
      if (delErr) throw delErr;

      const bySlug: Record<string, ModuleRow> = Object.fromEntries(modules.map(m => [m.slug as string, m]));
      const rows = Object.entries(selections)
        .map(([slug, set]) => ({ slug, actions: Array.from(set) }))
        .filter(({ actions }) => actions.length > 0)
        .map(({ slug, actions }) => ({
          module_id: bySlug[slug]?.id,
          role_id: roleId,
          scope_type: "global" as const,
          allowed_actions: actions as PermissionAction[],
        }))
        .filter(r => r.module_id);

      if (rows.length > 0) {
        const { error: insErr } = await supabase.from("module_role_permissions").insert(rows as any[]);
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
