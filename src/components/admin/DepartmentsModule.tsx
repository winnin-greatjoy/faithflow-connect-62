
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Activity, Plus, Settings, ExternalLink } from 'lucide-react';

interface DepartmentsModuleProps {
  onMinistrySelect?: (ministryId: string) => void;
}

const departments = [
  { id: 1, name: 'Choir', leader: 'Mary Thompson', members: 24, activities: 8, status: 'Active' },
  { id: 2, name: 'Ushering', leader: 'James Wilson', members: 12, activities: 4, status: 'Active' },
  { id: 3, name: 'Prayer Team', leader: 'Ruth Johnson', members: 18, activities: 12, status: 'Active' },
  { id: 4, name: 'Evangelism', leader: 'Paul Smith', members: 15, activities: 6, status: 'Active' },
  { id: 5, name: 'Finance', leader: 'David Brown', members: 5, activities: 3, status: 'Active' },
  { id: 6, name: 'Technical', leader: 'Mike Davis', members: 8, activities: 5, status: 'Active' },
];

const ministries = [
  { 
    id: 'mens-ministry', 
    name: 'Men\'s Ministry', 
    leader: 'John Anderson', 
    members: 45, 
    activities: 6, 
    status: 'Active', 
    description: 'Fellowship and discipleship for men' 
  },
  { 
    id: 'womens-ministry', 
    name: 'Women\'s Ministry', 
    leader: 'Sarah Williams', 
    members: 52, 
    activities: 8, 
    status: 'Active', 
    description: 'Empowering women in faith and service' 
  },
  { 
    id: 'youth-ministry', 
    name: 'Youth Ministry', 
    leader: 'Daniel Martinez', 
    members: 28, 
    activities: 12, 
    status: 'Active', 
    description: 'Engaging young people aged 13-25' 
  },
  { 
    id: 'childrens-ministry', 
    name: 'Children\'s Ministry', 
    leader: 'Emma Wilson', 
    members: 38, 
    activities: 10, 
    status: 'Active', 
    description: 'Nurturing children in their faith journey' 
  },
];

export const DepartmentsModule = ({ onMinistrySelect }: DepartmentsModuleProps) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Departments & Ministries</h1>
          <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">Organize and manage church departments and ministries.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add New Department
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Departments</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Ministries</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Growing strong</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Monthly Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">74</div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Departments and Ministries Tabs */}
      <Tabs defaultValue="departments" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="ministries">Ministries</TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Church Departments</CardTitle>
              <CardDescription>Operational departments that support church services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {departments.map((department) => (
                  <Card key={department.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-base sm:text-lg truncate">{department.name}</CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            Led by {department.leader}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0 ml-2">
                          {department.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Members:</span>
                          <span className="font-medium">{department.members}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Activities this month:</span>
                          <span className="font-medium">{department.activities}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Users className="mr-1 h-4 w-4" />
                            <span className="hidden sm:inline">Manage </span>Members
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ministries" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Church Ministries</CardTitle>
              <CardDescription>Life-focused ministries for different demographics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {ministries.map((ministry) => (
                  <Card key={ministry.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg truncate">{ministry.name}</CardTitle>
                          <CardDescription className="mt-1 text-sm">
                            Led by {ministry.leader}
                          </CardDescription>
                          <p className="text-sm text-muted-foreground mt-2">{ministry.description}</p>
                        </div>
                        <Badge className="bg-green-100 text-green-800 flex-shrink-0 ml-2">
                          {ministry.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Members:</span>
                          <span className="font-medium">{ministry.members}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Activities this month:</span>
                          <span className="font-medium">{ministry.activities}</span>
                        </div>
                        <div className="flex flex-col gap-2 mt-4">
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              <Users className="mr-1 h-4 w-4" />
                              <span className="hidden sm:inline">Manage </span>Members
                            </Button>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Activity className="mr-1 h-4 w-4" />
                              <span className="hidden sm:inline">View </span>Activities
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              className="flex-1"
                              onClick={() => onMinistrySelect?.(ministry.id)}
                            >
                              <ExternalLink className="mr-1 h-4 w-4" />
                              Open Dashboard
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Settings className="h-4 w-4" />
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
        </TabsContent>
      </Tabs>
    </div>
  );
};
