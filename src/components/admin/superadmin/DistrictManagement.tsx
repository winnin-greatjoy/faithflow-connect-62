import React, { useState, useEffect } from 'react';
import { CreateUserDialog } from './CreateUserDialog';
import { MultiBranchView } from './MultiBranchView';
import { DistrictDashboard } from '@/components/admin/district/DistrictDashboard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Building,
  Plus,
  Edit,
  Trash2,
  Users,
  Network,
  UserCog,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface District {
  id: string;
  name: string;
  head_admin_id: string | null;
  created_at: string;
  location: string | null;
}

interface Branch {
  id: string;
  name: string;
  district_id: string | null;
  is_district_hq: boolean | null;
  address: string;
  pastor_name: string | null;
}

interface Member {
  id: string;
  full_name: string;
  email: string | null;
  role: string | null;
}

export const DistrictManagement: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [districts, setDistricts] = useState<District[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [newDistrictName, setNewDistrictName] = useState('');
  const [newDistrictLocation, setNewDistrictLocation] = useState('');

  // Determine active district from URL

  // Determine active district from URL
  const districtIdFromUrl = location.pathname.split('/admin/districts/')[1];
  const activeDistrict = districts.find((d) => d.id === districtIdFromUrl);
  const isUnassignedView = districtIdFromUrl === 'unassigned';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [districtsRes, branchesRes, membersRes] = await Promise.all([
        supabase.from('districts').select('*').order('name'),
        supabase
          .from('church_branches')
          .select('id, name, district_id, is_district_hq, address, pastor_name')
          .order('name'),
        supabase.from('profiles').select('id, first_name, last_name, role').order('first_name'),
      ]);

      if (districtsRes.error) throw districtsRes.error;
      if (branchesRes.error) throw branchesRes.error;

      setDistricts(districtsRes.data || []);
      setBranches(branchesRes.data || []);

      if (membersRes.data) {
        setMembers(
          membersRes.data.map((p) => ({
            id: p.id,
            full_name: `${p.first_name} ${p.last_name}`,
            email: null,
            role: p.role,
          }))
        );
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load district data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { name: newDistrictName, location: newDistrictLocation };

      const { error } = await supabase.from('districts').insert([payload]);

      if (error) throw error;

      toast({ title: 'Success', description: 'District created successfully' });
      setIsCreateOpen(false);
      setNewDistrictName('');
      setNewDistrictLocation('');
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateDistrict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDistrict) return;

    try {
      const payload: any = { name: newDistrictName, location: newDistrictLocation };

      const { error } = await supabase
        .from('districts')
        .update(payload)
        .eq('id', selectedDistrict.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'District updated successfully' });
      setIsEditOpen(false);
      setSelectedDistrict(null);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteDistrict = async (id: string, name: string) => {
    if (
      !confirm(`Are you sure you want to delete district "${name}"? This action cannot be undone.`)
    )
      return;

    try {
      const { error } = await supabase.from('districts').delete().eq('id', id);
      if (error) throw error;

      toast({ title: 'Success', description: 'District deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Could not delete district. Ensure no branches are assigned.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (district: District) => {
    setSelectedDistrict(district);
    setNewDistrictName(district.name);
    setNewDistrictLocation(district.location || '');
    setIsEditOpen(true);
  };

  if (loading)
    return <div className="p-8 text-center text-muted-foreground">Loading districts...</div>;

  // Unassigned Branches Detail View
  if (isUnassignedView) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin/districts')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Network className="h-6 w-6" /> Unassigned Branches
            </h2>
            <p className="text-muted-foreground">Branches not currently assigned to any district</p>
          </div>
        </div>

        <MultiBranchView
          filterType="unassigned"
          defaultDistrictName="Unassigned Branches"
          allDistricts={districts}
        />
      </div>
    );
  }

  // Generic District Detail View
  if (activeDistrict) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" onClick={() => navigate('/admin/districts')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Districts
          </Button>
        </div>

        <DistrictDashboard districtId={activeDistrict.id} />
      </div>
    );
  }

  // Dashboard View
  const unassignedBranches = branches.filter((b) => !b.district_id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Network className="h-6 w-6" />
            District Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage districts and their regional settings</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create District
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New District</DialogTitle>
              <DialogDescription>
                Create a new regional district to group branches.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDistrict} className="space-y-4">
              <div>
                <Label htmlFor="create-name">District Name *</Label>
                <Input
                  id="create-name"
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  required
                  placeholder="e.g. Northern Region"
                />
              </div>
              <div>
                <Label htmlFor="create-location">Location/Region</Label>
                <Input
                  id="create-location"
                  value={newDistrictLocation}
                  onChange={(e) => setNewDistrictLocation(e.target.value)}
                  placeholder="e.g. Northern Zone"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create District</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {districts.map((district) => {
          const districtBranches = branches.filter((b) => b.district_id === district.id);
          const hqBranch = districtBranches.find((b) => b.is_district_hq);

          return (
            <Card key={district.id} className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{district.name}</CardTitle>
                    {district.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building className="h-3 w-3" /> {district.location}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEditDialog(district)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteDistrict(district.id, district.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  {districtBranches.length} Branch{districtBranches.length !== 1 ? 'es' : ''} •
                  Created {new Date(district.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    Headquarters
                  </div>
                  {hqBranch ? (
                    <div className="flex items-center gap-2 p-2 bg-muted/40 rounded-md border text-sm">
                      <Building className="h-4 w-4 text-primary" />
                      <span className="font-medium">{hqBranch.name}</span>
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] border-primary/20 text-primary"
                      >
                        HQ
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-sm text-yellow-600 italic flex items-center gap-2">
                      <Users className="h-4 w-4" /> No HQ Assigned
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">
                    District Overseer
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <UserCog className="h-4 w-4" />
                    {district.head_admin_id ? (
                      members.find((m) => m.id === district.head_admin_id)?.full_name ||
                      'Unknown User'
                    ) : (
                      <span className="text-muted-foreground italic">Unassigned</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-auto">
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => navigate(`/district-portal/${district.id}`)}
                  >
                    Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Unassigned Branches Card */}
        <Card className="h-full flex flex-col border-dashed border-2 bg-muted/5">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg flex items-center gap-2">
                <Network className="h-5 w-5 text-muted-foreground" />
                Unassigned
              </CardTitle>
            </div>
            <CardDescription>Branches not in any district</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <p className="text-4xl font-bold text-muted-foreground mb-2">
                {unassignedBranches.length}
              </p>
              <p className="text-sm text-muted-foreground">Unassigned Branches</p>
            </div>
            <div className="pt-4 mt-auto">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigate(`/superadmin/districts/unassigned`)}
              >
                Manage Unassigned <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {districts.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg bg-muted/10">
            <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Districts Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first district hierarchy.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create District
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit District</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDistrict} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">District Name *</Label>
              <Input
                id="edit-name"
                value={newDistrictName}
                onChange={(e) => setNewDistrictName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-location">Location/Region</Label>
              <Input
                id="edit-location"
                value={newDistrictLocation}
                onChange={(e) => setNewDistrictLocation(e.target.value)}
                placeholder="e.g. Northern Zone"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update District</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
