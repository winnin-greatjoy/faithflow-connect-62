import React, { useState } from 'react';
import {
  ShieldCheck,
  FileCheck,
  UserCheck,
  AlertCircle,
  Calendar,
  Clock,
  ChevronRight,
  Search,
  Filter,
  Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClearanceRecord } from '@/modules/events/types/safety';

// Mock Data
const MOCK_CLEARANCE: ClearanceRecord[] = [
  {
    id: 'c1',
    userId: 'u1',
    userName: 'Kwadwo Asare',
    checkType: 'DBS',
    issueDate: '2023-01-15',
    expiryDate: '2026-01-15',
    status: 'cleared',
  },
  {
    id: 'c2',
    userId: 'u2',
    userName: 'Abena Mansa',
    checkType: 'Reference',
    issueDate: '2022-12-01',
    expiryDate: '2023-12-01',
    status: 'expired',
  },
  {
    id: 'c3',
    userId: 'u3',
    userName: 'John Peterson',
    checkType: 'DBS',
    issueDate: '2023-06-20',
    expiryDate: '2026-06-20',
    status: 'cleared',
  },
  {
    id: 'c4',
    userId: 'u4',
    userName: 'Esther Kim',
    checkType: 'Training',
    issueDate: '2024-01-05',
    status: 'pending',
  },
];

export const SafeguardingManagerModule = () => {
  const [activeTab, setActiveTab] = useState('compliance');

  const ComplianceView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            placeholder="Search staff by name or reference ID..."
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
            New Check
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_CLEARANCE.map((record, i) => (
          <div
            key={record.id}
            className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-3xl border border-primary/5 hover:border-primary/20 transition-all bg-white shadow-sm group"
          >
            <div className="flex items-center gap-5 mb-4 md:mb-0">
              <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center font-black text-primary text-sm">
                {record.userName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div>
                <h5 className="text-sm font-black text-foreground">{record.userName}</h5>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="text-[8px] h-5 px-2 border-none uppercase tracking-widest"
                  >
                    {record.checkType}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                    Issued: {record.issueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest">Expiry Date</p>
                <p className="text-[10px] font-bold text-muted-foreground opacity-60">
                  {record.expiryDate || 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    'h-8 rounded-full border-none font-black text-[9px] uppercase tracking-widest px-4',
                    record.status === 'cleared'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : record.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-600'
                        : 'bg-red-500/10 text-red-600'
                  )}
                >
                  {record.status}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Safeguarding
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Compliance & Vetting Management
          </p>
        </div>
        <div className="flex bg-muted/30 p-1 rounded-xl">
          {['compliance', 'reports', 'settings'].map((tab) => (
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Cleared Staff',
            count: 154,
            status: 'Active',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
          },
          {
            label: 'Pending Checks',
            count: 12,
            status: 'Warning',
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
          },
          {
            label: 'Expired',
            count: 3,
            status: 'Critical',
            color: 'text-red-500',
            bg: 'bg-red-500/10',
          },
          {
            label: 'Reports',
            count: 0,
            status: 'Good',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
          },
        ].map((item, i) => (
          <Card
            key={i}
            className="p-4 bg-white rounded-[24px] border border-primary/5 shadow-sm flex items-center gap-4"
          >
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', item.bg)}>
              <ShieldCheck className={cn('h-5 w-5', item.color)} />
            </div>
            <div>
              <h3 className="text-xl font-black">{item.count}</h3>
              <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                {item.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'compliance' && <ComplianceView />}
        {activeTab === 'reports' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <Lock className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Confidential Report Log is locked</p>
            <Button variant="link" className="text-xs">
              Authenticate to view
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
