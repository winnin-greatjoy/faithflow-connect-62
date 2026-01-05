import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  DollarSign,
  Building,
  BarChart3,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * System Reports Module - Superadmin Only
 * Cross-branch analytics and system-wide reports
 */

const systemReports = [
  {
    id: 1,
    title: 'Cross-Branch Comparison',
    description: 'Compare metrics across all church branches',
    icon: Building,
    lastGenerated: '2024-01-07',
    frequency: 'Monthly',
    category: 'System',
  },
  {
    id: 2,
    title: 'Global Membership Trends',
    description: 'System-wide member growth and retention',
    icon: Users,
    lastGenerated: '2024-01-07',
    frequency: 'Monthly',
    category: 'Membership',
  },
  {
    id: 3,
    title: 'Financial Consolidation',
    description: 'Consolidated financial report across all branches',
    icon: DollarSign,
    lastGenerated: '2024-01-06',
    frequency: 'Monthly',
    category: 'Finance',
  },
  {
    id: 4,
    title: 'Branch Performance Scorecard',
    description: 'KPIs and performance metrics for each branch',
    icon: BarChart3,
    lastGenerated: '2024-01-05',
    frequency: 'Quarterly',
    category: 'Performance',
  },
  {
    id: 5,
    title: 'System Health Report',
    description: 'Database stats, user activity, system usage',
    icon: Activity,
    lastGenerated: '2024-01-04',
    frequency: 'Weekly',
    category: 'System',
  },
  {
    id: 6,
    title: 'Inter-Branch Transfers',
    description: 'Member transfers between branches analysis',
    icon: TrendingUp,
    lastGenerated: '2024-01-03',
    frequency: 'Monthly',
    category: 'Operations',
  },
];

const recentSystemReports = [
  {
    id: 1,
    name: 'Q4 2023 Cross-Branch Analysis',
    type: 'PDF',
    generated: '2024-01-07 10:30',
    size: '8.7 MB',
  },
  {
    id: 2,
    name: 'December Global Giving Summary',
    type: 'Excel',
    generated: '2024-01-06 14:15',
    size: '5.3 MB',
  },
  {
    id: 3,
    name: 'Branch Performance Metrics Q4',
    type: 'PDF',
    generated: '2024-01-05 09:45',
    size: '6.8 MB',
  },
];

export const SystemReportsModule: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      System: 'bg-purple-100 text-purple-800',
      Membership: 'bg-indigo-100 text-indigo-800',
      Finance: 'bg-green-100 text-green-800',
      Performance: 'bg-blue-100 text-blue-800',
      Operations: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['system-reports-stats'],
    queryFn: async () => {
      const [{ count: branchCount }, { count: memberCount }, { data: financeData }] =
        await Promise.all([
          supabase.from('church_branches').select('id', { count: 'exact', head: true }),
          supabase.from('members').select('id', { count: 'exact', head: true }),
          supabase.from('finance_records').select('amount'),
        ]);

      const totalGiving =
        financeData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      return {
        branches: branchCount || 0,
        members: memberCount || 0,
        giving: totalGiving,
        reports: systemReports.length,
      };
    },
  });

  const handleGenerateReport = (reportId: number, format: 'PDF' | 'Excel') => {
    toast({
      title: `Generating ${format}`,
      description: `Generating system report ID: ${reportId}...`,
    });
    console.log('Generating system report:', reportId, format);
  };

  const handleDownloadReport = (reportId: number) => {
    toast({
      title: 'Downloading Report',
      description: `Downloading system report ID: ${reportId}...`,
    });
    console.log('Downloading system report:', reportId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            System Reports & Analytics
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Cross-branch analytics and system-wide reports (Superadmin Only)
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Custom System Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                  ) : (
                    stats?.branches
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total Branches</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                  ) : (
                    stats?.members.toLocaleString()
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Total Members</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                  ) : (
                    `$${(stats?.giving || 0).toLocaleString()}`
                  )}
                </div>
                <p className="text-xs text-muted-foreground">System-Wide Giving</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin opacity-20" />
                  ) : (
                    stats?.reports
                  )}
                </div>
                <p className="text-xs text-muted-foreground">System Reports</p>
              </div>
              <FileText className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available System Reports</CardTitle>
          <CardDescription>Generate cross-branch and system-wide analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {systemReports.map((report) => (
              <Card
                key={report.id}
                className="group relative overflow-hidden bg-card border border-primary/5 hover:border-primary/10 hover:shadow-xl transition-all duration-500 cursor-pointer rounded-3xl"
                onClick={() => navigate(`/superadmin/reports/${report.id}`)}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />

                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start space-x-4 min-w-0">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-transparent group-hover:shadow-primary/20">
                        <report.icon className="h-6 w-6 transition-transform group-hover:scale-110" />
                      </div>
                      <div className="min-w-0 pt-1">
                        <CardTitle className="text-lg font-serif font-black tracking-tight group-hover:text-primary transition-colors">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-[11px] font-medium leading-relaxed opacity-60 line-clamp-2">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        'rounded-lg px-2 py-0.5 font-bold text-[9px] uppercase tracking-widest border-none shadow-sm',
                        getCategoryColor(report.category)
                      )}
                    >
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-2">
                  <div className="space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="opacity-40">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span className="opacity-40">Last Matrix Generation:</span>
                      <span>{report.lastGenerated}</span>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 rounded-xl h-10 font-bold text-[10px] uppercase tracking-wider bg-primary/5 hover:bg-primary/10 text-primary border-none shadow-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/superadmin/reports/${report.id}`);
                        }}
                      >
                        <FileText className="mr-2 h-3.5 w-3.5" />
                        Detail Analysis
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors group/ai"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/superadmin/reports/${report.id}`, { state: { autoAI: true } });
                        }}
                      >
                        <Sparkles className="h-4 w-4 group-hover/ai:scale-125 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent System Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent System Reports</CardTitle>
          <CardDescription>Recently generated system-wide reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSystemReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{report.name}</h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                      <span>Generated: {report.generated}</span>
                      <span>•</span>
                      <span>Size: {report.size}</span>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleDownloadReport(report.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
