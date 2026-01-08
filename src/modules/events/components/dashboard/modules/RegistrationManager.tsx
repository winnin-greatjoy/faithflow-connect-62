import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  FileText,
  Settings,
  PieChart,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  PenSquare,
  Ban,
  Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FormBuilder } from '@/modules/events/components/registration/FormBuilder';

export const RegistrationManagerModule = () => {
  const [view, setView] = useState<'registrants' | 'reports'>('registrants');
  const [showFormBuilder, setShowFormBuilder] = useState(false);

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Registration Manager</h2>
          <p className="text-muted-foreground">Manage capacity, forms, and attendee lists.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowFormBuilder(true)}>
            <Settings className="h-4 w-4 mr-2" /> Form Designer
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Add Attendee
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Total Registrations
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">1,248</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              +12%
            </Badge>
          </div>
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Capacity Used</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">83%</span>
            <span className="text-xs text-muted-foreground font-medium">1248/1500</span>
          </div>
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-1">
            <div className="h-full bg-primary w-[83%]" />
          </div>
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">
            Pending Approval
          </span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">34</span>
            <Settings className="h-4 w-4 text-orange-400" />
          </div>
        </Card>
        <Card className="p-4 flex flex-col gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase">Revenue</span>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-black">$12.4k</span>
            <PieChart className="h-4 w-4 text-emerald-500" />
          </div>
        </Card>
      </div>

      {/* Main Content Info */}
      <Card className="flex-1 border p-6 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <Button
              variant={view === 'registrants' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('registrants')}
              className={view === 'registrants' ? 'bg-white shadow-sm' : ''}
            >
              <Users className="h-4 w-4 mr-2" /> Registrants
            </Button>
            <Button
              variant={view === 'reports' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('reports')}
              className={view === 'reports' ? 'bg-white shadow-sm' : ''}
            >
              <FileText className="h-4 w-4 mr-2" /> Reports
            </Button>
          </div>
          <div className="relative">
            <input
              placeholder="Search attendees..."
              className="h-9 w-64 rounded-md border text-sm px-3 bg-muted/30 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {view === 'registrants' ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/40 font-semibold text-xs text-muted-foreground uppercase tracking-wider rounded-t-lg">
              <div className="col-span-4">Name / ID</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-y-auto">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-4 px-4 py-4 border-b hover:bg-muted/50 transition-colors items-center text-sm"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">Attendee Name {i}</span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        REG-00{i}-X9
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Badge variant="secondary" className="font-normal text-xs">
                      {i % 3 === 0 ? 'Volunteer' : 'Attendee'}
                    </Badge>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    {i % 4 === 0 ? (
                      <span className="flex items-center text-orange-600 text-xs font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                        <AlertCircle className="h-3 w-3 mr-1" /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center text-emerald-600 text-xs font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Confirmed
                      </span>
                    )}
                  </div>
                  <div className="col-span-2 text-muted-foreground text-xs">
                    Oct {10 + i}, 10:4{i} AM
                  </div>
                  <div className="col-span-2 text-right flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <PenSquare className="mr-2 h-4 w-4" /> Edit Registration
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" /> Manual Check-In
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                          <Ban className="mr-2 h-4 w-4" /> Revoke Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <FileText className="h-16 w-16 opacity-20 mb-4" />
            <h3 className="text-lg font-semibold">Reports & Analytics</h3>
            <p className="max-w-md text-center text-sm mt-2 opacity-70">
              Detailed registration breakdown, demographics, and export tools will be displayed
              here.
            </p>
          </div>
        )}
      </Card>

      {/* Form Builder Dialog */}
      <Dialog open={showFormBuilder} onOpenChange={setShowFormBuilder}>
        <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b bg-muted/20">
            <DialogTitle>Form Designer: Conference 2024</DialogTitle>
          </DialogHeader>
          <div className="flex-1 bg-background overflow-hidden">
            <FormBuilder />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
