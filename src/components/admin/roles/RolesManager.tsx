import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AddEditRoleForm, RoleRecord } from "./AddEditRoleForm";
import { RolePermissionsDynamicForm } from "./RolePermissionsDynamicForm";
import { AssignRoleToUser } from "./AssignRoleToUser";

export function RolesManager() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [assignments, setAssignments] = useState<{ role_id: string | null }[]>([]);
  const [loading, setLoading] = useState(false);

  const [openRoleForm, setOpenRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);

  const [openPerms, setOpenPerms] = useState(false);
  const [permsRoleId, setPermsRoleId] = useState<string>("");
  const [permsRoleName, setPermsRoleName] = useState<string>("");

  const [openAssign, setOpenAssign] = useState(false);
  const [assignRole, setAssignRole] = useState<RoleRecord | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [{ data: rs, error: re }, { data: ur, error: ue }] = await Promise.all([
        supabase.from("roles").select("id, name, slug, role_type, description, is_active"),
        supabase.from("user_roles").select("role_id").not("role_id", "is", null),
      ]);
      if (re) throw re;
      if (ue) throw ue;
      setRoles((rs as any) || []);
      setAssignments((ur as any) || []);
    } catch (e: any) {
      toast({ title: "Failed to load roles", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const countByRoleId = useMemo(() => {
    const map = new Map<string, number>();
    (assignments || []).forEach(a => {
      if (!a.role_id) return;
      map.set(a.role_id, (map.get(a.role_id) || 0) + 1);
    });
    return map;
  }, [assignments]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Custom Roles</h2>
        <Button onClick={() => { setEditingRole(null); setOpenRoleForm(true); }}>+ Add Role</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Existing Roles</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3">Role Name</th>
                <th className="p-3">Role Type</th>
                <th className="p-3">Users</th>
                <th className="p-3">Active</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3 capitalize">{r.role_type}</td>
                  <td className="p-3">{loading ? "-" : (r.id ? (countByRoleId.get(r.id) || 0) : 0)}</td>
                  <td className="p-3">{(r as any).is_active === false ? "No" : "Yes"}</td>
                  <td className="p-3 text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => { setPermsRoleId(r.id!); setPermsRoleName(r.name); setOpenPerms(true); }}>Permissions</Button>
                    <Button variant="outline" size="sm" onClick={() => { setEditingRole(r); setOpenRoleForm(true); }}>Edit</Button>
                    <Button variant="outline" size="sm" onClick={() => { setAssignRole(r); setOpenAssign(true); }}>Assign</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {openRoleForm && (
        <AddEditRoleForm
          open={openRoleForm}
          onClose={() => { setOpenRoleForm(false); refresh(); }}
          role={editingRole}
          onSaved={refresh}
        />
      )}

      {openPerms && permsRoleId && (
        <RolePermissionsDynamicForm
          open={openPerms}
          onClose={() => { setOpenPerms(false); refresh(); }}
          roleId={permsRoleId}
          roleName={permsRoleName}
        />
      )}

      {openAssign && assignRole && (
        <AssignRoleToUser
          open={openAssign}
          onClose={() => { setOpenAssign(false); refresh(); }}
          role={assignRole}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
