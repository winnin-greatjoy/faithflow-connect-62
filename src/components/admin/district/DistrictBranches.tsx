import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Building, Plus, MapPin, Edit, Trash2, Phone, UserCog, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthz } from '@/hooks/useAuthz';

interface District {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string | null;
  pastor_name: string | null;
  is_district_hq: boolean;
  created_at: string;
  // status?: 'Active' | 'Inactive'; // To be implemented with real data
}

interface DistrictBranchesProps {
  district: District;
  branches: Branch[];
  onRefresh: () => void;
}

export const DistrictBranches: React.FC<DistrictBranchesProps> = ({
  district,
  branches,
  onRefresh,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasRole } = useAuthz();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [branchForm, setBranchForm] = useState({
    name: '',
    address: '',
    slug: '',
    phone: '',
    pastor_name: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slug =
        branchForm.slug ||
        branchForm.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

      const { error } = await supabase.from('church_branches').insert([
        {
          name: branchForm.name,
          address: branchForm.address,
          phone: branchForm.phone || null,
          pastor_name: branchForm.pastor_name || null,
          slug,
          district_id: district.id,
          branch_type: 'local',
          is_district_hq: false,
        },
      ]);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch created successfully' });
      setIsCreateOpen(false);
      setBranchForm({ name: '', address: '', slug: '', phone: '', pastor_name: '' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEditBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    try {
      const { error } = await supabase
        .from('church_branches')
        .update({
          name: branchForm.name,
          address: branchForm.address,
          phone: branchForm.phone || null,
          pastor_name: branchForm.pastor_name || null,
          slug: branchForm.slug,
        })
        .eq('id', selectedBranch.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch updated successfully' });
      setIsEditOpen(false);
      setSelectedBranch(null);
      setBranchForm({ name: '', address: '', slug: '', phone: '', pastor_name: '' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteBranch = async (branchId: string) => {
    try {
      const { error } = await supabase.from('church_branches').delete().eq('id', branchId);

      if (error) throw error;

      toast({ title: 'Success', description: 'Branch deleted successfully' });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete branch',
        variant: 'destructive',
      });
    }
  };

  const handleSetHQ = async (branchId: string, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        const { error: resetError } = await supabase
          .from('church_branches')
          .update({ is_district_hq: false })
          .eq('district_id', district.id);
        if (resetError) throw resetError;
      }

      const { error } = await supabase
        .from('church_branches')
        .update({ is_district_hq: !currentStatus })
        .eq('id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: !currentStatus ? 'Branch set as District HQ' : 'District HQ status removed',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update HQ status',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setBranchForm({
      name: branch.name,
      address: branch.address,
      slug: branch.slug,
      phone: branch.phone || '',
      pastor_name: branch.pastor_name || '',
    });
    setIsEditOpen(true);
  };

  const filteredBranches = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.pastor_name && b.pastor_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search branches..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Branch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Branch</DialogTitle>
              <DialogDescription>Add a new local branch to {district.name}.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              <div>
                <Label>Branch Name *</Label>
                <Input
                  value={branchForm.name}
                  onChange={(e) =>
                    setBranchForm({
                      ...branchForm,
                      name: e.target.value,
                      slug: e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, ''),
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label>Slug</Label>
                <Input
                  value={branchForm.slug}
                  onChange={(e) => setBranchForm({ ...branchForm, slug: e.target.value })}
                />
              </div>
              <div>
                <Label>Address *</Label>
                <Textarea
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Pastor Name</Label>
                  <Input
                    value={branchForm.pastor_name}
                    onChange={(e) => setBranchForm({ ...branchForm, pastor_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Branch</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => (
          <Card
            key={branch.id}
            className={branch.is_district_hq ? 'border-primary/50 bg-primary/5' : ''}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {branch.name}
                    {branch.is_district_hq && (
                      <Badge variant="default" className="text-xs">
                        HQ
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="h-3 w-3" /> {branch.address}
                  </CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(branch)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Branch?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{branch.name}". This action cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {branch.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-3 w-3" /> {branch.phone}
                </div>
              )}
              <div className="text-sm">
                <span className="text-muted-foreground">Pastor:</span>{' '}
                {branch.pastor_name || 'Unassigned'}
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`hq-${branch.id}`} className="text-sm cursor-pointer">
                    District HQ
                  </Label>
                  <Switch
                    id={`hq-${branch.id}`}
                    checked={branch.is_district_hq}
                    onCheckedChange={() => handleSetHQ(branch.id, branch.is_district_hq)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const to = hasRole('super_admin')
                      ? `/superadmin/district-portal/branch/${branch.id}`
                      : `/district-portal/branch/${branch.id}`;
                    navigate(to, {
                      state: {
                        from: `/district-portal/${district.id}`,
                        fromState: { activeModule: 'branches' },
                      },
                    });
                  }}
                >
                  <Building className="h-3 w-3 mr-1" /> View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredBranches.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed">
            No branches found.
          </div>
        )}
      </div>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditBranch} className="space-y-4">
            <div>
              <Label>Branch Name *</Label>
              <Input
                value={branchForm.name}
                onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={branchForm.slug}
                onChange={(e) => setBranchForm({ ...branchForm, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Address *</Label>
              <Textarea
                value={branchForm.address}
                onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={branchForm.phone}
                  onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Pastor Name</Label>
                <Input
                  value={branchForm.pastor_name}
                  onChange={(e) => setBranchForm({ ...branchForm, pastor_name: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
