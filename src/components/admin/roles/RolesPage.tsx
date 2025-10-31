import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Enums } from "@/integrations/supabase/types";
import { RolePermissionForm } from "./RolePermissionForm";
import { useToast } from "@/hooks/use-toast";

type AppRole = Enums<'app_role'>;

type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

type MrpRow = Database["public"]["Tables"]["module_role_permissions"]["Row"];

const ALL_ROLES: AppRole[] = ["super_admin", "admin", "pastor", "leader", "worker", "member"];

export function RolesPage() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editRole, setEditRole] = useState<AppRole | null>(null);
  const [profiles, setProfiles] = useState<Pick<ProfileRow, "id" | "role">[]>([]);
  const [userRoles, setUserRoles] = useState<Pick<UserRoleRow, "user_id" | "role">[]>([]);
  const [mrps, setMrps] = useState<Pick<MrpRow, "role">[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [{ data: pr, error: pe }, { data: ur, error: ue }, { data: mp, error: me }] = await Promise.all([
        supabase.from("profiles").select("id, role"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("module_role_permissions").select("role"),
      ]);
      if (pe) throw pe;
      if (ue) throw ue;
      if (me) throw me;
      setProfiles((pr || []) as any);
      setUserRoles((ur || []) as any);
      setMrps((mp || []) as any);
    } catch (e: any) {
      toast({ title: "Failed to load roles data", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const rows = useMemo(() => {
    const mrpByRole = new Set(mrps.map(m => m.role));
    return ALL_ROLES.map(role => {
      const profileIds = new Set((profiles || []).filter(p => p.role === role).map(p => p.id));
      (userRoles || []).filter(u => u.role === role).forEach(u => profileIds.add(u.user_id));
      return {
        role,
        users: profileIds.size,
        configured: mrpByRole.has(role),
      };
    });
  }, [profiles, userRoles, mrps]);

  const handleReset = async (role: AppRole) => {
    if (!confirm(`Remove all permissions for role \"${role}\"?`)) return;
    const { error } = await supabase
      .from("module_role_permissions")
      .delete()
      .eq("role", role)
      .eq("scope_type", "global");
    if (error) {
      toast({ title: "Reset failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Permissions cleared" });
      refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Roles & Permissions</h2>
        <Button onClick={() => { setEditRole(null); setOpen(true); }}>+ Add Role</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Role</th>
                <th className="p-3">Users</th>
                <th className="p-3">Configured</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.role} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{r.role}</td>
                  <td className="p-3">{loading ? "-" : r.users}</td>
                  <td className="p-3">{r.configured ? "Yes" : "No"}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditRole(r.role); setOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleReset(r.role)}>Reset</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {open && (
        <RolePermissionForm
          open={open}
          onClose={() => { setOpen(false); refresh(); }}
          initialRole={editRole}
        />
      )}
    </div>
  );
}
