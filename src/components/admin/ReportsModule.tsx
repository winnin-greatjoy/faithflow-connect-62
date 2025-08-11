
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, Users, DollarSign } from 'lucide-react';

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
  const getCategoryColor = (category: string) => {
    const colors = {
      'Attendance': 'bg-blue-100 text-blue-800',
      'Finance': 'bg-green-100 text-green-800',
      'Events': 'bg-purple-100 text-purple-800',
      'Ministries': 'bg-orange-100 text-orange-800',
      'Membership': 'bg-indigo-100 text-indigo-800',
      'Volunteers': 'bg-pink-100 text-pink-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive church reports.</p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Custom Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">This quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">Report generation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Requested</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Attendance</div>
            <p className="text-xs text-muted-foreground">42% of all reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>Generate standardized reports for your church operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <report.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          {report.description}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(report.category)}>
                      {report.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Frequency:</span>
                      <span>{report.frequency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Generated:</span>
                      <span>{report.lastGenerated}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1">
                        <FileText className="mr-1 h-4 w-4" />
                        Generate PDF
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Download className="mr-1 h-4 w-4" />
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
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Recently generated reports available for download</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{report.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                      <span>Generated: {report.generated}</span>
                      <span>Size: {report.size}</span>
                      <Badge variant="outline">{report.type}</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="mr-1 h-4 w-4" />
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
