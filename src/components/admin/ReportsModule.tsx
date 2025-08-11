
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign, Eye, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const availableReports = [
  {
    id: 1,
    title: 'Attendance Report',
    description: 'Weekly and monthly attendance statistics',
    icon: Users,
    lastGenerated: '2024-01-07',
    frequency: 'Weekly',
    category: 'Attendance'
  },
  {
    id: 2,
    title: 'Giving Report',
    description: 'Financial contributions and trends',
    icon: DollarSign,
    lastGenerated: '2024-01-06',
    frequency: 'Monthly',
    category: 'Finance'
  },
  {
    id: 3,
    title: 'Event Participation Report',
    description: 'Event attendance and engagement metrics',
    icon: Calendar,
    lastGenerated: '2024-01-05',
    frequency: 'Monthly',
    category: 'Events'
  },
  {
    id: 4,
    title: 'Ministry Activity Report',
    description: 'Department and ministry performance',
    icon: TrendingUp,
    lastGenerated: '2024-01-04',
    frequency: 'Quarterly',
    category: 'Ministries'
  },
  {
    id: 5,
    title: 'Member Growth Report',
    description: 'New members and retention statistics',
    icon: Users,
    lastGenerated: '2024-01-03',
    frequency: 'Monthly',
    category: 'Membership'
  },
  {
    id: 6,
    title: 'Volunteer Hours Report',
    description: 'Volunteer participation and hours logged',
    icon: Users,
    lastGenerated: '2024-01-02',
    frequency: 'Monthly',
    category: 'Volunteers'
  }
];

const recentReports = [
  { id: 1, name: 'January Attendance Summary', type: 'PDF', generated: '2024-01-07 14:30', size: '2.3 MB' },
  { id: 2, name: 'Q4 2023 Giving Report', type: 'Excel', generated: '2024-01-06 09:15', size: '1.8 MB' },
  { id: 3, name: 'December Events Summary', type: 'PDF', generated: '2024-01-05 16:45', size: '3.1 MB' },
  { id: 4, name: 'Ministry Performance Q4', type: 'PDF', generated: '2024-01-04 11:20', size: '4.2 MB' },
];

export const ReportsModule = () => {
  const { toast } = useToast();

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Attendance': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Events': 'bg-purple-100 text-purple-800',
      'Ministries': 'bg-orange-100 text-orange-800',
      'Membership': 'bg-indigo-100 text-indigo-800',
      'Volunteers': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateCustomReport = () => {
    toast({
      title: "Custom Report",
      description: "Opening custom report builder...",
    });
    console.log('Creating custom report');
  };

  const handleGeneratePDF = (reportId: number) => {
    toast({
      title: "Generating PDF",
      description: `Generating PDF report for ID: ${reportId}...`,
    });
    console.log('Generating PDF for report:', reportId);
  };

  const handleGenerateExcel = (reportId: number) => {
    toast({
      title: "Generating Excel",
      description: `Generating Excel report for ID: ${reportId}...`,
    });
    console.log('Generating Excel for report:', reportId);
  };

  const handleDownloadReport = (reportId: number) => {
    toast({
      title: "Downloading Report",
      description: `Downloading report ID: ${reportId}...`,
    });
    console.log('Downloading report:', reportId);
  };

  const handleViewReport = (reportId: number) => {
    toast({
      title: "View Report",
      description: `Opening report ID: ${reportId} in preview mode...`,
    });
    console.log('Viewing report:', reportId);
  };

  const handleShareReport = (reportId: number) => {
    toast({
      title: "Share Report",
      description: `Sharing report ID: ${reportId}...`,
    });
    console.log('Sharing report:', reportId);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Generate and download comprehensive church reports.</p>
        </div>
        <Button onClick={handleCreateCustomReport} className="w-full sm:w-auto">
          <FileText className="mr-2 h-4 w-4" />
          Custom Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg. Response Time</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Report generation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Most Requested</CardTitle>
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">Attendance</div>
            <p className="text-xs text-muted-foreground">42% of all reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Available Reports</CardTitle>
          <CardDescription className="text-sm">Generate standardized reports for your church operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {availableReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <report.icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base sm:text-lg truncate">{report.title}</CardTitle>
                        <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(report.category)} variant="secondary">
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600">Last Generated:</span>
                      <span>{report.lastGenerated}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => handleGeneratePDF(report.id)}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        PDF
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => handleGenerateExcel(report.id)}
                      >
                        <Download className="mr-1 h-3 w-3" />
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

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Reports</CardTitle>
          <CardDescription className="text-sm">Recently generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 gap-4">
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{report.name}</h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1 gap-1 sm:gap-0">
                      <span>Generated: {report.generated}</span>
                      <span>Size: {report.size}</span>
                      <Badge variant="outline" className="w-fit">{report.type}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleViewReport(report.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleShareReport(report.id)}
                  >
                    <Share className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Share</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadReport(report.id)}
                  >
                    <Download className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
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
