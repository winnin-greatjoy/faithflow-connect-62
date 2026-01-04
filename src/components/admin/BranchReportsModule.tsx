import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Eye,
  Share,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminContext } from '@/context/AdminContext';
import { Loader2, RefreshCw, Sparkles } from 'lucide-react';

const availableReports = [
  {
    id: 1,
    title: 'Attendance Report',
    description: 'Weekly and monthly attendance statistics',
    icon: Users,
    lastGenerated: '2024-01-07',
    frequency: 'Weekly',
    category: 'Attendance',
  },
  {
    id: 2,
    title: 'Giving Report',
    description: 'Financial contributions and trends',
    icon: DollarSign,
    lastGenerated: '2024-01-06',
    frequency: 'Monthly',
    category: 'Finance',
  },
  {
    id: 3,
    title: 'Event Participation Report',
    description: 'Event attendance and engagement metrics',
    icon: Calendar,
    lastGenerated: '2024-01-05',
    frequency: 'Monthly',
    category: 'Events',
  },
  {
    id: 4,
    title: 'Ministry Activity Report',
    description: 'Department and ministry performance',
    icon: TrendingUp,
    lastGenerated: '2024-01-04',
    frequency: 'Quarterly',
    category: 'Ministries',
  },
  {
    id: 5,
    title: 'Member Growth Report',
    description: 'New members and retention statistics',
    icon: Users,
    lastGenerated: '2024-01-03',
    frequency: 'Monthly',
    category: 'Membership',
  },
  {
    id: 6,
    title: 'Volunteer Hours Report',
    description: 'Volunteer participation and hours logged',
    icon: Users,
    lastGenerated: '2024-01-02',
    frequency: 'Monthly',
    category: 'Volunteers',
  },
];

const recentReports = [
  {
    id: 1,
    name: 'January Attendance Summary',
    type: 'PDF',
    generated: '2024-01-07 14:30',
    size: '2.3 MB',
  },
  {
    id: 2,
    name: 'Q4 2023 Giving Report',
    type: 'Excel',
    generated: '2024-01-06 09:15',
    size: '1.8 MB',
  },
  {
    id: 3,
    name: 'December Events Summary',
    type: 'PDF',
    generated: '2024-01-05 16:45',
    size: '3.1 MB',
  },
  {
    id: 4,
    name: 'Ministry Performance Q4',
    type: 'PDF',
    generated: '2024-01-04 11:20',
    size: '4.2 MB',
  },
];

export const BranchReportsModule = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBranchId } = useAdminContext();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['branch-reports-stats', selectedBranchId],
    queryFn: async () => {
      if (!selectedBranchId) return null;

      const [{ count: memberCount }, { data: financeData }, { data: attendanceData }] =
        await Promise.all([
          supabase
            .from('members')
            .select('id', { count: 'exact', head: true })
            .eq('branch_id', selectedBranchId),
          supabase.from('finance_records').select('amount').eq('branch_id', selectedBranchId),
          supabase.from('attendance').select('id').eq('branch_id', selectedBranchId),
        ]);

      const totalGiving =
        financeData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;

      return {
        reports: availableReports.length,
        responseTime: '1.8s',
        mostRequested: 'Attendance',
        downloads: 124,
        members: memberCount || 0,
        giving: totalGiving,
        attendance: attendanceData?.length || 0,
      };
    },
    enabled: !!selectedBranchId,
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Attendance: 'bg-blue-100 text-blue-800',
      Finance: 'bg-green-100 text-green-800',
      Events: 'bg-purple-100 text-purple-800',
      Ministries: 'bg-orange-100 text-orange-800',
      Membership: 'bg-indigo-100 text-indigo-800',
      Volunteers: 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateCustomReport = () => {
    toast({
      title: 'Custom Report',
      description: 'Opening custom report builder...',
    });
    console.log('Creating custom report');
  };

  const handleGeneratePDF = (reportId: number) => {
    toast({
      title: 'Generating PDF',
      description: `Generating PDF report for ID: ${reportId}...`,
    });
    console.log('Generating PDF for report:', reportId);
  };

  const handleGenerateExcel = (reportId: number) => {
    toast({
      title: 'Generating Excel',
      description: `Generating Excel report for ID: ${reportId}...`,
    });
    console.log('Generating Excel for report:', reportId);
  };

  const handleDownloadReport = (reportId: number) => {
    toast({
      title: 'Downloading Report',
      description: `Downloading report ID: ${reportId}...`,
    });
    console.log('Downloading report:', reportId);
  };

  const handleViewReport = (reportId: number) => {
    toast({
      title: 'View Report',
      description: `Opening report ID: ${reportId} in preview mode...`,
    });
    console.log('Viewing report:', reportId);
  };

  const handleShareReport = (reportId: number) => {
    toast({
      title: 'Share Report',
      description: `Sharing report ID: ${reportId}...`,
    });
    console.log('Sharing report:', reportId);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
            Branch Reports & Analytics
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">
            Generate reports for your branch operations.
          </p>
        </div>
        <Button
          onClick={handleCreateCustomReport}
          className="w-full sm:w-auto h-10 sm:h-9 text-sm sm:text-base"
          size="sm"
        >
          <FileText className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
          <span>Custom Report</span>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-medium leading-tight">
                Reports Available
              </CardTitle>
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {statsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats?.reports || 6}
            </div>
            <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5">System Standard</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-medium leading-tight">
                Branch Members
              </CardTitle>
              <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                stats?.members.toLocaleString()
              )}
            </div>
            <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5">Active on Roster</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-medium leading-tight">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold truncate">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `$${(stats?.giving || 0).toLocaleString()}`
              )}
            </div>
            <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5">Cumulative Total</p>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="p-3 sm:p-4 space-y-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] xs:text-xs sm:text-sm font-medium leading-tight">
                Attendance Log
              </CardTitle>
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {statsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                (stats?.attendance || 0).toLocaleString()
              )}
            </div>
            <p className="text-[10px] xs:text-xs text-muted-foreground mt-0.5">
              Total Visits Records
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Available Reports</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Generate standardized reports for your church operations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {availableReports.map((report) => (
              <Card
                key={report.id}
                className="hover:shadow-md transition-shadow h-full flex flex-col"
              >
                <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start space-x-2 sm:space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <report.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-sm sm:text-base font-semibold truncate">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="mt-0.5 text-xs sm:text-sm line-clamp-2 text-gray-500">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={`${getCategoryColor(report.category)} text-[10px] sm:text-xs h-5 px-1.5 sm:px-2`}
                      variant="secondary"
                    >
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm">
                      <span className="text-gray-500">Frequency:</span>
                      <span className="font-medium">{report.frequency}</span>
                    </div>
                    <div className="flex justify-between text-[10px] xs:text-xs sm:text-sm">
                      <span className="text-gray-500">Last Generated:</span>
                      <span className="font-medium">{report.lastGenerated}</span>
                    </div>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        size="sm"
                        className="w-full h-10 rounded-xl font-bold text-xs"
                        onClick={() => {
                          const basePath = location.pathname.endsWith('/')
                            ? location.pathname
                            : `${location.pathname}/`;
                          navigate(`${basePath}${report.id}`);
                        }}
                      >
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Detail Analysis
                      </Button>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="flex-1 h-9 rounded-xl font-bold text-[10px]"
                          onClick={() => handleGeneratePDF(report.id)}
                        >
                          <FileText className="mr-1.5 h-3 w-3" />
                          PDF
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1 h-9 rounded-xl font-bold text-[10px] border border-primary/5"
                          onClick={() => handleGenerateExcel(report.id)}
                        >
                          <Download className="mr-1.5 h-3 w-3" />
                          Excel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Recently generated reports available for download
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="space-y-2 sm:space-y-3">
            {recentReports.map((report) => (
              <div
                key={report.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 gap-3 transition-colors"
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm sm:text-base leading-tight truncate">
                      {report.name}
                    </h4>
                    <div className="mt-1 flex flex-col xs:flex-row xs:items-center xs:flex-wrap gap-x-3 gap-y-1 text-[10px] xs:text-xs text-gray-500">
                      <span className="truncate">Generated: {report.generated}</span>
                      <span className="hidden xs:inline text-gray-300">•</span>
                      <span>Size: {report.size}</span>
                      <Badge variant="outline" className="ml-0 xs:ml-1.5 text-[10px] h-5 mt-0.5">
                        {report.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end sm:justify-start gap-1.5 sm:gap-2 mt-2 sm:mt-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    title="View report"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 sm:h-9 sm:w-9 p-0"
                    title="Share report"
                    onClick={() => handleShareReport(report.id)}
                  >
                    <Share className="h-4 w-4" />
                    <span className="sr-only">Share</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-initial max-w-[120px] sm:max-w-none"
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    <span>Download</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
