
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  GraduationCap, 
  Users, 
  Award, 
  DollarSign, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Upload,
  Download,
  Eye,
  Edit,
  Trophy,
  BookOpen,
  Settings
} from 'lucide-react';
import { 
  mockEducationStats, 
  mockReportCards, 
  mockRankings, 
  mockAwardPackages,
  mockAwards,
  mockStudents,
  mockAcademicYears
} from '@/data/mockEducationData';

interface EducationCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const EducationCommittee = ({ userRole, canManage }: EducationCommitteeProps) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLevel, setSelectedLevel] = useState('all');
  
  const stats = mockEducationStats;
  const currentYear = mockAcademicYears[0];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'ranked': return 'bg-blue-100 text-blue-800';
      case 'awarded': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'under_review': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'ranked': return <Trophy className="h-4 w-4 text-blue-600" />;
      case 'awarded': return <Award className="h-4 w-4 text-purple-600" />;
      case 'rejected': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const levels = ['Primary', 'JSS1', 'JSS2', 'JSS3', 'SSS1', 'SSS2', 'SSS3', 'Year 1', 'Year 2', 'Year 3', 'Year 4'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Education Committee</h2>
          <p className="text-gray-600 mt-1">Academic Excellence Recognition Program</p>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant="outline">{currentYear.label}</Badge>
            <Badge variant={currentYear.isOpenForSubmissions ? 'default' : 'secondary'}>
              {currentYear.isOpenForSubmissions ? 'Submissions Open' : 'Submissions Closed'}
            </Badge>
          </div>
        </div>
        {canManage && (
          <div className="flex space-x-2">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Open Submissions
            </Button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Submissions</p>
                <p className="text-lg font-bold">{stats.totalSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Verified</p>
                <p className="text-lg font-bold">{stats.verifiedSubmissions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Avg Score</p>
                <p className="text-lg font-bold">{stats.averageScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Awardees</p>
                <p className="text-lg font-bold">{stats.totalAwardees}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Requested</p>
                <p className="text-lg font-bold">GH₵{stats.budgetRequested.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold">GH₵{stats.budgetApproved.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-gray-600">Spent</p>
                <p className="text-lg font-bold">GH₵{stats.budgetSpent.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold">{stats.pendingReviews}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="awards">Awards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>Latest report card submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockReportCards.slice(0, 5).map((report) => {
                    const student = mockStudents.find(s => s.id === report.studentId);
                    return (
                      <div key={report.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{student?.name}</p>
                          <p className="text-sm text-gray-600">{report.level} • {report.schoolName}</p>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusIcon(report.status)}
                          <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Current year rankings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRankings.slice(0, 5).map((ranking) => {
                    const student = mockStudents.find(s => s.id === ranking.studentId);
                    return (
                      <div key={ranking.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                            {ranking.rank}
                          </div>
                          <div>
                            <p className="font-medium">{student?.name}</p>
                            <p className="text-sm text-gray-600">{ranking.level}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{ranking.score}%</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Report Card Submissions</h3>
            <div className="flex space-x-2">
              <Input placeholder="Search students..." className="w-64" />
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReportCards.map((report) => {
                    const student = mockStudents.find(s => s.id === report.studentId);
                    const ranking = mockRankings.find(r => r.studentId === report.studentId);
                    
                    return (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{student?.name}</TableCell>
                        <TableCell>{report.schoolName}</TableCell>
                        <TableCell>{report.level}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {ranking ? `${ranking.score}%` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="outline" size="sm">
                              <Eye className="h-3 w-3" />
                            </Button>
                            {canManage && (
                              <Button variant="outline" size="sm">
                                <Edit className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboards" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Academic Leaderboards</h3>
            <div className="flex space-x-2">
              <select 
                value={selectedLevel} 
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Rankings
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {['Secondary', 'Tertiary'].map((category) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GraduationCap className="h-5 w-5" />
                    <span>{category} Level</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRankings
                      .filter(r => category === 'Secondary' ? r.level.startsWith('SSS') || r.level.startsWith('JSS') : r.level.startsWith('Year'))
                      .slice(0, 5)
                      .map((ranking, index) => {
                        const student = mockStudents.find(s => s.id === ranking.studentId);
                        const award = mockAwards.find(a => a.studentId === ranking.studentId);
                        
                        return (
                          <div key={ranking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {ranking.rank}
                              </div>
                              <div>
                                <p className="font-medium">{student?.name}</p>
                                <p className="text-sm text-gray-600">{ranking.level}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{ranking.score}%</p>
                              {award && (
                                <Badge variant="outline" className="text-xs">
                                  {mockAwardPackages.find(p => p.id === award.packageId)?.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="packages">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Award Packages</h3>
              {canManage && (
                <Button>
                  <Award className="mr-2 h-4 w-4" />
                  Create Package
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mockAwardPackages.map((pkg) => (
                <Card key={pkg.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{pkg.name}</span>
                      <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                        {pkg.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Min Score:</span>
                        <span className="font-medium">{pkg.minScore}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Max Recipients:</span>
                        <span className="font-medium">{pkg.maxRecipients}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Budget Cap:</span>
                        <span className="font-medium">GH₵{pkg.budgetCap.toLocaleString()}</span>
                      </div>
                      <div className="pt-2">
                        <p className="text-sm font-medium mb-2">Benefits:</p>
                        <div className="text-xs text-gray-600">
                          {pkg.benefitJson.type === 'choice' ? (
                            <ul className="list-disc list-inside space-y-1">
                              {pkg.benefitJson.options?.map((option: string, idx: number) => (
                                <li key={idx}>{option}</li>
                              ))}
                            </ul>
                          ) : (
                            <ul className="list-disc list-inside space-y-1">
                              {pkg.benefitJson.items?.map((item: string, idx: number) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                      {canManage && (
                        <Button variant="outline" className="w-full mt-4">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit Package
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="budget">
          <div className="text-center py-8">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Budget Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage budget proposals for awards
            </p>
          </div>
        </TabsContent>

        <TabsContent value="awards">
          <div className="text-center py-8">
            <Award className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Awards Management</h3>
            <p className="mt-1 text-sm text-gray-500">
              Track award proposals and fulfillment
            </p>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Reports & Analytics</h3>
            <p className="mt-1 text-sm text-gray-500">
              Generate comprehensive education reports
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
