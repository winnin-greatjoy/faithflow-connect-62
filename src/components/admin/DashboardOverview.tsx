import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAdminContext } from '@/context/AdminContext';
import { useAuthz } from '@/hooks/useAuthz';
import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  UserCheck,
  Plus,
  MessageSquare,
  FileText,
  TrendingUp,
} from 'lucide-react';

export const DashboardOverview = () => {
  const { selectedBranchId } = useAdminContext();
  const { branchId: authBranchId, hasRole } = useAuthz();
  const isSuperadmin = hasRole('super_admin');
  const effectiveBranchId = isSuperadmin ? selectedBranchId : authBranchId;

  const [stats, setStats] = useState({
    members: 0,
    departments: 0,
    ministries: 0,
    firstTimers: 0,
  });

  const [branchName, setBranchName] = useState('your church');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        let mQuery = supabase.from('members').select('*', { count: 'exact', head: true });
        let dQuery = supabase.from('departments').select('*', { count: 'exact', head: true });
        let minQuery = supabase.from('ministries').select('*', { count: 'exact', head: true });
        let ftQuery = supabase.from('first_timers').select('*', { count: 'exact', head: true });

        if (effectiveBranchId) {
          mQuery = mQuery.eq('branch_id', effectiveBranchId);
          dQuery = dQuery.eq('branch_id', effectiveBranchId);
          minQuery = minQuery.eq('branch_id', effectiveBranchId);
          ftQuery = ftQuery.eq('branch_id', effectiveBranchId);

          // fetch branch name
          const { data: bData } = await supabase
            .from('church_branches')
            .select('name')
            .eq('id', effectiveBranchId)
            .single();
          if (bData) setBranchName(bData.name);
        } else {
          setBranchName('Global System');
        }

        const [mRes, dRes, minRes, ftRes] = await Promise.all([mQuery, dQuery, minQuery, ftQuery]);

        setStats({
          members: mRes.count || 0,
          departments: dRes.count || 0,
          ministries: minRes.count || 0,
          firstTimers: ftRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };
    fetchStats();
  }, [effectiveBranchId]);
  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
          Welcome back! Here's what's happening at {branchName}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Members</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.members}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active Members</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Departments</CardTitle>
            <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.departments}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
              Active Departments
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Ministries</CardTitle>
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.ministries}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">Active Ministries</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow min-h-[120px] sm:min-h-[140px] flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">First Timers</CardTitle>
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.firstTimers}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">New Visitors</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2"
        >
          <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-xs sm:text-sm">Add Member</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2"
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-xs sm:text-sm">Send Message</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2"
        >
          <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-xs sm:text-sm">Create Event</span>
        </Button>
        <Button
          variant="outline"
          className="h-20 sm:h-24 flex flex-col items-center justify-center gap-1 sm:gap-2 p-2"
        >
          <DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />
          <span className="text-xs sm:text-sm">Record Donation</span>
        </Button>
      </div>

      {/* Recent Activity */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Latest updates from your church.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-tight">
                      New member joined
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">John Doe joined the church today</p>
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap ml-2">
                    2h ago
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats Chart */}
      <Card>
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Attendance Overview</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Weekly attendance for the past month
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2 sm:p-4 pt-0">
          <div className="h-[200px] sm:h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center p-4 sm:p-6">
              <TrendingUp className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-2" />
              <h3 className="text-sm sm:text-base font-medium text-gray-500">Attendance Chart</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Visual representation of weekly attendance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
