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
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">12</div>
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
                <div className="text-2xl font-bold">3,847</div>
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
                <div className="text-2xl font-bold">$248K</div>
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
                <div className="text-2xl font-bold">94</div>
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
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-start space-x-3 min-w-0">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <report.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base font-semibold truncate">
                          {report.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-xs line-clamp-2">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge
                      className={`${getCategoryColor(report.category)} text-xs`}
                      variant="secondary"
                    >
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Frequency:</span>
                      <span className="font-medium">{report.frequency}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Last Generated:</span>
                      <span className="font-medium">{report.lastGenerated}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => handleGenerateReport(report.id, 'PDF')}
                      >
                        <FileText className="mr-1.5 h-3 w-3" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleGenerateReport(report.id, 'Excel')}
                      >
                        <Download className="mr-1.5 h-3 w-3" />
                        Excel
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
