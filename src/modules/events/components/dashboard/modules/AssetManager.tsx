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
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Asset, AssetStatus } from '@/modules/events/types/assets';

// Mock Data
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
          <Button className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest">
            New Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ASSETS.map((asset) => (
          <Card
            key={asset.id}
            className="p-6 bg-white rounded-[28px] border border-primary/5 shadow-xl shadow-primary/5 group hover:shadow-primary/10 transition-all"
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
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
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

  const MaintenanceView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-6 bg-white rounded-[28px] border border-primary/5 flex items-center gap-6">
            <div className="h-16 w-16 rounded-3xl bg-amber-50 flex items-center justify-center">
              <Wrench className="h-8 w-8 text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="text-lg font-black text-foreground">JBL VRX932LA</h5>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Ticket #MN-2025-004 • High Priority
                  </p>
                </div>
                <Badge className="bg-amber-500 text-white">In Repair</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                "High frequency driver intermittent failure. Sent to authorized service center for
                diagnostic."
              </p>
              <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                <span>Logged: 2 days ago</span>
                <span>Est. Return: Jan 12</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 rounded-[32px] bg-white border border-primary/5 shadow-xl">
            <h5 className="font-serif font-black mb-4">Health Overview</h5>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-emerald-600">Operational</span>
                <span className="font-black">92%</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-amber-600">Maintenance</span>
                <span className="font-black">5%</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-red-600">Retired/Lost</span>
                <span className="font-black">3%</span>
              </div>
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
