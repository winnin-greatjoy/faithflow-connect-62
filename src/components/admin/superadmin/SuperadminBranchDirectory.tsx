import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Building,
  Search,
  MoreHorizontal,
  Edit,
  ArrowRightLeft,
  Star,
  StarOff,
  ExternalLink,
  Loader2,
  Users,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  district_id: string | null;
  district_name: string | null;
  is_district_hq: boolean;
  is_main: boolean;
  pastor_name: string | null;
  phone: string | null;
}

interface District {
  id: string;
  name: string;
}

export const SuperadminBranchDirectory: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [memberCounts, setMemberCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branchesRes, districtsRes, membersRes] = await Promise.all([
        supabase.from('church_branches').select('*').order('name'),
        supabase.from('districts').select('id, name').order('name'),
        supabase.from('members').select('branch_id'),
      ]);

      if (branchesRes.error) throw branchesRes.error;
      if (districtsRes.error) throw districtsRes.error;

      setBranches(branchesRes.data || []);
      setDistricts(districtsRes.data || []);

      // Calculate member counts per branch
      const counts: Record<string, number> = {};
      (membersRes.data || []).forEach((m) => {
        counts[m.branch_id] = (counts[m.branch_id] || 0) + 1;
      });
      setMemberCounts(counts);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load branches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetHQ = async (branchId: string, districtId: string | null, currentStatus: boolean) => {
    if (!districtId) {
      toast({
        title: 'Error',
        description: 'Branch must be assigned to a district first',
        variant: 'destructive',
      });
      return;
    }

    try {
      // If enabling HQ, disable others in this district first
      if (!currentStatus) {
        await supabase
          .from('church_branches')
          .update({ is_district_hq: false })
          .eq('district_id', districtId);
      }

      const { error } = await supabase
        .from('church_branches')
        .update({ is_district_hq: !currentStatus })
        .eq('id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `HQ status ${!currentStatus ? 'assigned' : 'removed'}`,
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleMoveDistrict = async (branchId: string, newDistrictId: string) => {
    try {
      const { error } = await supabase
        .from('church_branches')
        .update({ 
          district_id: newDistrictId === 'unassigned' ? null : newDistrictId,
          is_district_hq: false, // Reset HQ status when moving
        })
        .eq('id', branchId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Branch moved to new district',
      });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch = branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = districtFilter === 'all' ||
      (districtFilter === 'unassigned' && !branch.district_id) ||
      branch.district_id === districtFilter;
    return matchesSearch && matchesDistrict;
  });

  const getDistrictName = (districtId: string | null) => {
    if (!districtId) return 'Unassigned';
    return districts.find((d) => d.id === districtId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    total: branches.length,
    assigned: branches.filter((b) => b.district_id).length,
    unassigned: branches.filter((b) => !b.district_id).length,
    hqs: branches.filter((b) => b.is_district_hq).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Building className="h-7 w-7" />
            Branch Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Cross-district branch management
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Branches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.assigned}</div>
            <p className="text-xs text-muted-foreground">Assigned to District</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.unassigned}</div>
            <p className="text-xs text-muted-foreground">Unassigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600">{stats.hqs}</div>
            <p className="text-xs text-muted-foreground">District HQs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={districtFilter} onValueChange={setDistrictFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Districts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Districts</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {districts.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Branches Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Branches ({filteredBranches.length})</CardTitle>
          <CardDescription>
            Click actions to manage branch assignments and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Branch</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Pastor</TableHead>
                  <TableHead className="text-center">Members</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBranches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No branches found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBranches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {branch.name}
                            {branch.is_main && (
                              <Badge className="bg-blue-100 text-blue-700 text-[10px]">Main HQ</Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {branch.address}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={branch.district_id ? '' : 'bg-yellow-50 text-yellow-700 border-yellow-200'}
                        >
                          {getDistrictName(branch.district_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={branch.pastor_name ? '' : 'text-muted-foreground italic'}>
                          {branch.pastor_name || 'Not assigned'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {memberCounts[branch.id] || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        {branch.is_district_hq && (
                          <Badge className="bg-purple-100 text-purple-700">District HQ</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/branch-portal/${branch.id}`)}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Branch
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSetHQ(branch.id, branch.district_id, branch.is_district_hq)}>
                              {branch.is_district_hq ? (
                                <>
                                  <StarOff className="mr-2 h-4 w-4" />
                                  Remove HQ Status
                                </>
                              ) : (
                                <>
                                  <Star className="mr-2 h-4 w-4" />
                                  Set as District HQ
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Branch
                            </DropdownMenuItem>
                            {/* Move to District Submenu would go here */}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
