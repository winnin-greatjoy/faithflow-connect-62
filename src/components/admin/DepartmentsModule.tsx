'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Activity, Settings } from 'lucide-react';
import { AddDepartmentForm } from './AddDepartmentForm'; // 👈 import the form

export const DepartmentsModule = () => {
  // ✅ State now controls the department list
  const [departments, setDepartments] = useState([
    { id: 1, name: 'Choir', leader: 'Mary Thompson', members: 24, activities: 8, status: 'Active' },
    { id: 2, name: 'Ushering', leader: 'James Wilson', members: 12, activities: 4, status: 'Active' },
    { id: 3, name: 'Prayer Team', leader: 'Ruth Johnson', members: 18, activities: 12, status: 'Active' },
    { id: 4, name: 'Evangelism', leader: 'Paul Smith', members: 15, activities: 6, status: 'Active' },
    { id: 5, name: 'Finance', leader: 'David Brown', members: 5, activities: 3, status: 'Active' },
    { id: 6, name: 'Technical', leader: 'Mike Davis', members: 8, activities: 5, status: 'Active' },
  ]);

  const ministries = [
    { id: 1, name: 'Men\'s Ministry', leader: 'John Anderson', members: 45, activities: 6, status: 'Active', description: 'Fellowship and discipleship for men' },
    { id: 2, name: 'Women\'s Ministry', leader: 'Sarah Williams', members: 52, activities: 8, status: 'Active', description: 'Empowering women in faith and service' },
    { id: 3, name: 'Youth Ministry', leader: 'Daniel Martinez', members: 28, activities: 12, status: 'Active', description: 'Engaging young people aged 13-25' },
    { id: 4, name: 'Children\'s Ministry', leader: 'Emma Wilson', members: 38, activities: 10, status: 'Active', description: 'Nurturing children in their faith journey' },
  ];

  // ✅ Function to handle new department addition
  const handleAddDepartment = (newDept: any) => {
    setDepartments((prev) => [...prev, newDept]);
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Departments & Ministries</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">
            Organize and manage church departments and ministries.
          </p>
        </div>
        {/* 👇 Replace old button with AddDepartmentForm */}
        <AddDepartmentForm onAdd={handleAddDepartment} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">{departments.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">All active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Ministries</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">{ministries.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Growing strong</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">
              {departments.reduce((sum, d) => sum + d.members, 0) + ministries.reduce((sum, m) => sum + m.members, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Across all departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-3 sm:p-4 pb-0 sm:pb-0">
            <div className="flex flex-row items-center justify-between">
              <CardTitle className="text-xs sm:text-sm font-medium">Monthly Activities</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-2 sm:pt-2">
            <div className="text-xl sm:text-2xl font-bold">
              {departments.reduce((sum, d) => sum + d.activities, 0) + ministries.reduce((sum, m) => sum + m.activities, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="departments" className="space-y-4 sm:space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-2">
          <TabsTrigger value="departments" className="text-xs sm:text-sm py-2 px-4">Departments</TabsTrigger>
          <TabsTrigger value="ministries" className="text-xs sm:text-sm py-2 px-4">Ministries</TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0">
              <CardTitle className="text-lg sm:text-xl">Church Departments</CardTitle>
              <CardDescription>Operational departments that support church services</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {departments.map((dept) => (
                  <Card key={dept.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-base sm:text-lg">{dept.name}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Led by {dept.leader}</p>
                        </div>
                        <Badge className="bg-green-50 text-green-700 text-xs sm:text-sm">{dept.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Members:</span>
                          <span className="font-medium">{dept.members}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Activities:</span>
                          <span className="font-medium">{dept.activities}</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm">
                            <Users className="mr-1.5 h-4 w-4" />
                            Members
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
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

        {/* Ministries Tab */}
        <TabsContent value="ministries">
          <Card>
            <CardHeader className="p-4 sm:p-6 pb-0">
              <CardTitle className="text-lg sm:text-xl">Church Ministries</CardTitle>
              <CardDescription>Ministries focused on different groups and activities</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ministries.map((m) => (
                  <Card key={m.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <CardTitle className="text-base sm:text-lg">{m.name}</CardTitle>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{m.description}</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-700 text-xs sm:text-sm">{m.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Leader:</span>
                          <span className="font-medium">{m.leader}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Members:</span>
                          <span className="font-medium">{m.members}</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-muted-foreground">Activities:</span>
                          <span className="font-medium">{m.activities}</span>
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
