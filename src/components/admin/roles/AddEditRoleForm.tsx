import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type RoleRecord = {
  id?: string;
  name: string;
  slug: string;
  role_type: "account" | "member" | "leader" | "admin" | "pastor" | "worker";
  description?: string | null;
  is_active?: boolean;
};

export function AddEditRoleForm({ open, onClose, role, onSaved }: { open: boolean; onClose: () => void; role?: RoleRecord | null; onSaved: () => void; }) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [roleType, setRoleType] = useState<RoleRecord["role_type"]>("account");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const isEdit = useMemo(() => Boolean(role?.id), [role]);

  useEffect(() => {
    if (!role) {
      setName("");
      setSlug("");
      setRoleType("account");
      setDescription("");
      return;
    }
    setName(role.name || "");
    setSlug(role.slug || "");
    setRoleType(role.role_type || "account");
    setDescription(role.description || "");
  }, [role]);

  useEffect(() => {
    if (!isEdit) {
      const s = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      setSlug(s);
    }
  }, [name, isEdit]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (isEdit) {
        const { error } = await (supabase as any)
          .from("roles")
          .update({ name, slug, role_type: roleType, description })
          .eq("id", role!.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("roles")
          .insert([{ name, slug, role_type: roleType, description }]);
        if (error) throw error;
      }
      toast({ title: isEdit ? "Role updated" : "Role created" });
      onSaved();
      onClose();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Role Name *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Financial Secretary" />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="financial-secretary" />
          </div>
          <div>
            <Label>Role Type</Label>
            <Select value={roleType} onValueChange={(v) => setRoleType(v as any)}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="account">Account</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="leader">Leader</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pastor">Pastor</SelectItem>
                <SelectItem value="worker">Worker</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Description</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
