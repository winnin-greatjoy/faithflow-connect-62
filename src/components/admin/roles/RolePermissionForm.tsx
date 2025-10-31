import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Enums } from "@/integrations/supabase/types";

type AppRole = Enums<'app_role'>;

type PermissionAction = Enums<'permission_action'>;

type ModuleRow = Database["public"]["Tables"]["modules"]["Row"];

type RolePermissionFormProps = {
  open: boolean;
  onClose: () => void;
  initialRole?: AppRole | null;
};

const ALL_ACTIONS: PermissionAction[] = ["view", "create", "update", "delete", "manage"];

export function RolePermissionForm({ open, onClose, initialRole }: RolePermissionFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [selectedRole, setSelectedRole] = useState<AppRole | "">(initialRole || "");
  const [selections, setSelections] = useState<Record<string, Set<PermissionAction>>>({});

  const isEdit = useMemo(() => Boolean(initialRole), [initialRole]);

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
      setModules(((mods || []) as any));
    })();
    return () => {
      active = false;
    };
  }, [toast]);

  useEffect(() => {
    if (!initialRole) return;
    let active = true;
    (async () => {
      const { data, error } = await supabase
        .from("module_role_permissions")
        .select("module_id, allowed_actions, module:modules(slug)")
        .eq("role", initialRole)
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
        next[slug] = new Set<PermissionAction>(row.allowed_actions || []);
      });
      setSelections(next);
    })();
    return () => {
      active = false;
    };
  }, [initialRole, toast]);

  const roleOptions: AppRole[] = ["super_admin", "admin", "pastor", "leader", "worker", "member"];

  const toggle = (slug: string, action: PermissionAction) => {
    setSelections(prev => {
      const next = { ...prev };
      const current = new Set<PermissionAction>(next[slug] || []);
      if (current.has(action)) current.delete(action);
      else current.add(action);
      next[slug] = current;
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
    const role = selectedRole as AppRole;
    if (!role) {
      toast({ title: "Select a role", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error: delErr } = await supabase
        .from("module_role_permissions")
        .delete()
        .eq("role", role)
        .eq("scope_type", "global");
      if (delErr) throw delErr;

      const bySlug: Record<string, ModuleRow> = Object.fromEntries(modules.map(m => [m.slug as string, m]));
      const rows = Object.entries(selections)
        .map(([slug, set]) => ({ slug, actions: Array.from(set) }))
        .filter(({ actions }) => actions.length > 0)
        .map(({ slug, actions }) => ({
          module_id: bySlug[slug]?.id,
          role,
          scope_type: "global" as const,
          allowed_actions: actions as PermissionAction[],
        }))
        .filter(r => r.module_id);

      if (rows.length > 0) {
        const { error: insErr } = await supabase.from("module_role_permissions").insert(rows as any[]);
        if (insErr) throw insErr;
      }

      toast({ title: isEdit ? "Role updated" : "Role permissions saved" });
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
          <DialogTitle>{isEdit ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-h-[70vh] overflow-y-auto">
          {!isEdit && (
            <div>
              <Label>Role</Label>
              <div className="mt-2">
                <Select value={selectedRole || ""} onValueChange={(v) => setSelectedRole(v as AppRole)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-5">
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
                      <Checkbox
                        checked={allChecked}
                        onCheckedChange={(v) => setAllForModule(slug, Boolean(v))}
                      />
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
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
