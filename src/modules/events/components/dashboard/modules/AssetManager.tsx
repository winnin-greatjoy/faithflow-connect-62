import React, { useState } from 'react';
import {
  Package,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  ArrowRightLeft,
  History,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Asset, AssetStatus } from '@/modules/events/types/assets';
import { useAdminContext } from '@/context/AdminContext';
import {
  useAssets,
  useCreateAsset,
  useUpdateAsset,
  useReportMaintenance,
} from '@/hooks/useEventModules';

// Mock Data (fallback when no backend)
const MOCK_ASSETS: Asset[] = [
  {
    id: 'a1',
    name: 'Soundcraft Vi3000',
    category: 'AV',
    location: 'Main Sanctuary',
    status: 'in_use',
    condition: 'good',
    serialNumber: 'SC-VI-001',
    assignedTo: 'Event: Sunday Service',
  },
  {
    id: 'a2',
    name: 'Pearl Reference Pure',
    category: 'Instruments',
    location: 'Stage Right',
    status: 'in_use',
    condition: 'good',
    serialNumber: 'PRP-DRUM-99',
    assignedTo: 'Worship Team',
  },
  {
    id: 'a3',
    name: 'Nikon Z9 Body',
    category: 'AV',
    location: 'Media Booth',
    status: 'available',
    condition: 'new',
    serialNumber: 'NK-Z9-554',
  },
  {
    id: 'a4',
    name: 'JBL VRX932LA',
    category: 'AV',
    location: 'Stage Front',
    status: 'maintenance',
    condition: 'fair',
    serialNumber: 'JBL-LA-22',
    assignedTo: 'Repair Shop',
  },
  {
    id: 'a5',
    name: 'Fender Jazz Bass',
    category: 'Instruments',
    location: 'Storage B',
    status: 'available',
    condition: 'good',
    serialNumber: 'FND-JB-1974',
  },
  {
    id: 'a6',
    name: 'MacBook Pro M2',
    category: 'IT',
    location: 'Tech Booth',
    status: 'in_use',
    condition: 'good',
    serialNumber: 'APL-MBP-22',
    assignedTo: 'Visuals Team',
  },
];

export const AssetManagerModule = () => {
  const [activeTab, setActiveTab] = useState('inventory');
  const { selectedBranchId } = useAdminContext();

  // Backend Integration - uses React Query when branchId available
  const { data: backendAssets, isLoading, isError } = useAssets(selectedBranchId || '');
  const createAssetMutation = useCreateAsset(selectedBranchId || '');
  const updateAssetMutation = useUpdateAsset(selectedBranchId || '');
  const reportMaintenanceMutation = useReportMaintenance(selectedBranchId || '');

  // Use backend data if available, otherwise fall back to mock
  const useBackend = !!selectedBranchId && !isError && backendAssets;

  /* State - local state for mock mode, backend for real mode */
  const [localAssets, setLocalAssets] = useState<Asset[]>(MOCK_ASSETS);
  const assets = useBackend
    ? (backendAssets as any[]).map((a: any) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        location: a.location || '',
        status: a.status,
        condition: a.condition,
        serialNumber: a.serial_number,
        assignedTo: a.current_checkout?.[0]?.user?.full_name,
      }))
    : localAssets;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  /* Handlers */
  const handleSaveAsset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    const assetData = {
      name: formData.get('name') as string,
      category: formData.get('category') as any,
      serial_number: formData.get('serialNumber') as string,
      location: formData.get('location') as string,
      condition: formData.get('condition') as any,
    };

    if (useBackend) {
      // Use backend
      if (editingAsset) {
        await updateAssetMutation.mutateAsync({ assetId: editingAsset.id, updates: assetData });
      } else {
        await createAssetMutation.mutateAsync({
          ...assetData,
          branch_id: selectedBranchId!,
          status: 'available',
        } as any);
      }
    } else {
      // Use local state
      if (editingAsset) {
        setLocalAssets(
          localAssets.map((a) =>
            a.id === editingAsset.id
              ? { ...a, ...assetData, serialNumber: assetData.serial_number }
              : a
          )
        );
        toast.success('Asset updated');
      } else {
        const newAsset: Asset = {
          id: `a${Date.now()}`,
          status: 'available',
          name: assetData.name,
          category: assetData.category,
          serialNumber: assetData.serial_number,
          location: assetData.location,
          condition: assetData.condition,
        };
        setLocalAssets([...localAssets, newAsset]);
        toast.success('New asset added to inventory');
      }
    }
    setIsDialogOpen(false);
    setEditingAsset(null);
  };

  const handleStatusChange = async (id: string, newStatus: AssetStatus, assignedTo?: string) => {
    if (useBackend) {
      if (newStatus === 'maintenance') {
        await reportMaintenanceMutation.mutateAsync({
          asset_id: id,
          issue_description: 'Reported for maintenance',
          priority: 'medium',
        } as any);
      } else {
        await updateAssetMutation.mutateAsync({
          assetId: id,
          updates: { status: newStatus } as any,
        });
      }
    } else {
      setLocalAssets(
        localAssets.map((a) => (a.id === id ? { ...a, status: newStatus, assignedTo } : a))
      );
      toast.success(`Asset marked as ${newStatus.replace('_', ' ')}`);
    }
  };

  const openAddDialog = () => {
    setEditingAsset(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (asset: Asset) => {
    setEditingAsset(asset);
    setIsDialogOpen(true);
  };

  const InventoryView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            placeholder="Search assets by name, serial, or category..."
            className="pl-12 h-12 rounded-2xl border-primary/5 bg-white shadow-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-muted-foreground"
          >
            <Filter className="h-4 w-4 mr-2 opacity-60" /> Filter
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest"
              >
                New Asset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveAsset} className="space-y-4">
                <div className="grid gap-2">
                  <Label>Asset Name</Label>
                  <Input
                    name="name"
                    required
                    defaultValue={editingAsset?.name}
                    placeholder="e.g. Shure SM58"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <select
                      name="category"
                      defaultValue={editingAsset?.category || 'AV'}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="AV">AV</option>
                      <option value="Instruments">Instruments</option>
                      <option value="IT">IT</option>
                      <option value="Furniture">Furniture</option>
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Serial Number</Label>
                    <Input
                      name="serialNumber"
                      defaultValue={editingAsset?.serialNumber}
                      placeholder="SN-12345"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Location</Label>
                    <Input
                      name="location"
                      required
                      defaultValue={editingAsset?.location}
                      placeholder="e.g. Stage Left"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Condition</Label>
                    <select
                      name="condition"
                      defaultValue={editingAsset?.condition || 'good'}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="new">New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                      <option value="broken">Broken</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingAsset ? 'Save Changes' : 'Add Asset'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card
            key={asset.id}
            onClick={() => openEditDialog(asset)}
            className="p-6 bg-white rounded-[28px] border border-primary/5 shadow-xl shadow-primary/5 group hover:shadow-primary/10 transition-all cursor-pointer relative"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center">
                {asset.category === 'Instruments' ? (
                  <Package className="h-6 w-6 text-primary" />
                ) : asset.category === 'IT' ? (
                  <Package className="h-6 w-6 text-blue-500" />
                ) : (
                  <Package className="h-6 w-6 text-purple-500" />
                )}
              </div>
              <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                {asset.status === 'available' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleStatusChange(asset.id, 'in_use', 'Event Staff')}
                  >
                    Check Out
                  </Button>
                )}
                {asset.status === 'in_use' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => handleStatusChange(asset.id, 'available')}
                  >
                    Return
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={() => handleStatusChange(asset.id, 'maintenance')}
                >
                  <Wrench className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 mb-4">
              <h5 className="font-black text-foreground text-lg">{asset.name}</h5>
              <div className="flex items-center gap-2">
                <Badge
                  variant="secondary"
                  className="h-5 text-[8px] font-black uppercase tracking-widest border-none px-2"
                >
                  {asset.category}
                </Badge>
                <span className="text-[10px] font-bold text-muted-foreground opacity-60">
                  SN: {asset.serialNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> {asset.location}
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-3 w-3" /> {asset.condition}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-primary/5 pt-3 mt-1">
                <Badge
                  variant="outline"
                  className={cn(
                    'h-7 rounded-sm px-2 text-[9px] font-black uppercase tracking-widest border-none',
                    asset.status === 'available'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : asset.status === 'maintenance'
                        ? 'bg-red-500/10 text-red-600'
                        : 'bg-blue-500/10 text-blue-600'
                  )}
                >
                  {asset.status.replace('_', ' ')}
                </Badge>
                {asset.assignedTo && (
                  <span className="text-[9px] font-bold text-primary truncate max-w-[100px]">
                    {asset.assignedTo}
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  /* Maintenance State */
  const maintenanceAssets = assets.filter(
    (a) => a.status === 'maintenance' || a.condition === 'broken'
  );
  const operationalCount = assets.length - maintenanceAssets.length;
  const operationalRate = Math.round((operationalCount / assets.length) * 100) || 0;

  const MaintenanceView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          {maintenanceAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[28px] border border-primary/5">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mb-4 opacity-50" />
              <h3 className="font-bold text-lg text-emerald-900">All Systems Go</h3>
              <p className="text-muted-foreground text-sm">
                No assets currently reported for maintenance.
              </p>
            </div>
          ) : (
            maintenanceAssets.map((asset) => (
              <Card
                key={asset.id}
                className="p-6 bg-white rounded-[28px] border border-primary/5 flex flex-col md:flex-row items-start md:items-center gap-6"
              >
                <div className="h-16 w-16 rounded-3xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Wrench className="h-8 w-8 text-amber-600" />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-lg font-black text-foreground">{asset.name}</h5>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        Ticket #MN-{new Date().getFullYear()}-{asset.id.substring(1)} •{' '}
                        {asset.condition === 'broken' ? 'Critical' : 'Routine'}
                      </p>
                    </div>
                    <Badge
                      className={cn(
                        'text-white',
                        asset.condition === 'broken' ? 'bg-red-500' : 'bg-amber-500'
                      )}
                    >
                      {asset.condition === 'broken' ? 'Broken' : 'In Repair'}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    "Asset reported as {asset.condition}. Flagged for inspection."
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <span>Logged: Just now</span>
                    <Button
                      size="sm"
                      variant="link"
                      className="h-auto p-0 text-emerald-600 font-bold"
                      onClick={() => handleStatusChange(asset.id, 'available')}
                    >
                      Resolve Ticket & Return to Inventory
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 rounded-[32px] bg-white border border-primary/5 shadow-xl">
            <h5 className="font-serif font-black mb-4">Health Overview</h5>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-emerald-600">Operational</span>
                <span className="font-black">{operationalRate}%</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-amber-600">Maintenance</span>
                <span className="font-black">{100 - operationalRate}%</span>
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${operationalRate}%` }}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Asset Manager
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Inventory & Resource Tracking
          </p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {['inventory', 'maintenance', 'movements'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'maintenance' && <MaintenanceView />}
        {activeTab === 'movements' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <History className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">No recent asset movements logged</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Utility
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
