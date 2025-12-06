import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  DollarSign,
  Calendar,
  Activity,
  Shield,
  Building,
  Globe,
  Server,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SuperAdminDashboardOverview = () => {
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="px-2 sm:px-0 flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">System Overview</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Global system monitoring and administration.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/system-config">System Config</Link>
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Shield className="w-4 h-4 mr-2" />
            System Audit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow border-purple-100 min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Branches</CardTitle>
            <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">12</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">3 new this month</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-100 min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">System Users</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">2,450</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Across all branches
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-100 min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">System Health</CardTitle>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">99.9%</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow border-purple-100 min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Sessions</CardTitle>
            <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">142</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Current active admins
            </p>
          </CardContent>
        </Card>
      </div>

      {/* System Resources & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-purple-600" />
              Resource Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Storage Used</span>
                  <span className="font-medium">450 GB / 1 TB</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 w-[45%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Database Load</span>
                  <span className="font-medium">24%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-[24%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>API Rate Limits</span>
                  <span className="font-medium">12%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-[12%]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Recent System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Activity className="h-4 w-4 text-blue-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Backup Completed Successfully</p>
                    <p className="text-xs text-gray-500">
                      System automated backup finished at 04:00 AM
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
