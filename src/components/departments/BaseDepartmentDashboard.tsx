import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Settings,
  FileText,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface DepartmentStats {
  totalMembers: number;
  activeMembers: number;
  upcomingEvents: number;
  completedActivities: number;
  monthlyGrowth: number;
  budgetUtilization?: number;
}

export interface DepartmentMember {
  id: number;
  name: string;
  role: string;
  status: 'active' | 'inactive';
  joinDate: string;
  email?: string;
  phone?: string;
  skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  voice_part?: string;
}

export interface DepartmentEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  attendees: number;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export interface BaseDepartmentDashboardProps {
  departmentName: string;
  departmentDescription: string;
  stats: DepartmentStats;
  members: DepartmentMember[];
  recentEvents: DepartmentEvent[];
  quickActions?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
    variant?: 'default' | 'outline';
  }>;
  onBack?: () => void;
}

export const BaseDepartmentDashboard: React.FC<BaseDepartmentDashboardProps> = ({
  departmentName,
  departmentDescription,
  stats,
  members,
  recentEvents,
  quickActions = [],
  onBack,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/admin/departments');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{departmentName} Dashboard</h1>
          <p className="text-gray-600 mt-1">{departmentDescription}</p>
        </div>
        <Button>
          <Settings className="mr-2 h-4 w-4" />
          Department Settings
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-muted/50 p-2.5 rounded-xl group-hover:bg-blue-500/10 transition-colors duration-300">
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  Total Members
                </p>
                <p className="text-xl font-black text-foreground leading-none mt-0.5">
                  {stats.totalMembers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-muted/50 p-2.5 rounded-xl group-hover:bg-emerald-500/10 transition-colors duration-300">
                <Users className="h-4 w-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  Active
                </p>
                <p className="text-xl font-black text-foreground leading-none mt-0.5">
                  {stats.activeMembers}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-muted/50 p-2.5 rounded-xl group-hover:bg-amber-500/10 transition-colors duration-300">
                <Calendar className="h-4 w-4 text-muted-foreground group-hover:text-amber-600 transition-colors" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  Events
                </p>
                <p className="text-xl font-black text-foreground leading-none mt-0.5">
                  {stats.upcomingEvents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-muted/50 p-2.5 rounded-xl group-hover:bg-violet-500/10 transition-colors duration-300">
                <Activity className="h-4 w-4 text-muted-foreground group-hover:text-violet-600 transition-colors" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  Activities
                </p>
                <p className="text-xl font-black text-foreground leading-none mt-0.5">
                  {stats.completedActivities}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-muted/50 p-2.5 rounded-xl group-hover:bg-indigo-500/10 transition-colors duration-300">
                <TrendingUp className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  Growth
                </p>
                <p className="text-xl font-black text-foreground leading-none mt-0.5">
                  +{stats.monthlyGrowth}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {stats.budgetUtilization !== undefined && (
          <Card className="border-primary/5 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="bg-muted/50 p-2.5 rounded-xl group-hover:bg-rose-500/10 transition-colors duration-300">
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-rose-600 transition-colors" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                    Budget
                  </p>
                  <p className="text-xl font-black text-foreground leading-none mt-0.5">
                    {stats.budgetUtilization}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'outline'}
              className="h-20 flex-col space-y-2"
              onClick={action.onClick}
            >
              <action.icon className="h-6 w-6" />
              <span className="text-sm">{action.label}</span>
            </Button>
          ))}
        </div>
      )}

      {/* Members Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Members</CardTitle>
          <CardDescription>Latest members who joined the department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                    {member.status}
                  </Badge>
                  <span className="text-xs text-gray-500">{member.joinDate}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events and activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    event.status === 'upcoming'
                      ? 'bg-blue-500'
                      : event.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="font-medium">{event.title}</p>
                  <p className="text-sm text-gray-600">
                    {event.date} • {event.attendees} attendees
                  </p>
                </div>
                <Badge variant="outline">{event.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
