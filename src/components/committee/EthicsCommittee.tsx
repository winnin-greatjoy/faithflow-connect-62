
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Shield, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Eye, 
  EyeOff,
  User,
  Search,
  Lock,
  CheckCircle,
  XCircle,
  Scale
} from 'lucide-react';
import { mockEthicsReports, mockInvestigations } from '@/data/mockCommitteeData';
import { EthicsReport, Investigation } from '@/types/committees';

interface EthicsCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const EthicsCommittee = ({ userRole, canManage }: EthicsCommitteeProps) => {
  const [reports] = useState<EthicsReport[]>(mockEthicsReports);
  const [investigations] = useState<Investigation[]>(mockInvestigations);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'triaged': return 'bg-yellow-100 text-yellow-800';
      case 'investigating': case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'resolved': case 'completed': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'misconduct': return <AlertTriangle className="h-4 w-4" />;
      case 'harassment': return <Shield className="h-4 w-4" />;
      case 'financial_impropriety': return <Scale className="h-4 w-4" />;
      case 'discrimination': return <User className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getConfidentialityIcon = (level: string) => {
    switch (level) {
      case 'restricted': return <Lock className="h-4 w-4 text-red-600" />;
      case 'committee_only': return <Eye className="h-4 w-4 text-yellow-600" />;
      case 'leadership_only': return <EyeOff className="h-4 w-4 text-orange-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  const ReportCard = ({ report }: { report: EthicsReport }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getCategoryIcon(report.category)}
            <div>
              <CardTitle className="text-sm">
                {report.isAnonymous ? 'Anonymous Report' : `Report by ${report.reporterName}`}
              </CardTitle>
              <CardDescription className="text-xs">
                Report #{report.id} • {report.category.replace('_', ' ')}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Badge className={getSeverityColor(report.severity)}>
              {report.severity}
            </Badge>
            <Badge className={getStatusColor(report.status)}>
              {report.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <h4 className="font-medium text-sm mb-1">{report.subject}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{report.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">Submitted:</span>
            <p>{new Date(report.submittedAt).toLocaleDateString()}</p>
          </div>
          {report.assignedInvestigator && (
            <div>
              <span className="font-medium">Investigator:</span>
              <p>{report.assignedInvestigator}</p>
            </div>
          )}
        </div>

        {report.involvedParties.length > 0 && (
          <div className="mb-3">
            <span className="font-medium text-xs">Involved Parties:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {report.involvedParties.map((party, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {party}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-1">
            {getConfidentialityIcon(report.confidentialityLevel)}
            <span className="text-xs text-gray-500 capitalize">
              {report.confidentialityLevel.replace('_', ' ')}
            </span>
          </div>
          
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {canManage && report.status === 'received' && (
              <Button size="sm" variant="outline">
                Assign Investigator
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const InvestigationCard = ({ investigation }: { investigation: Investigation }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">Investigation #{investigation.id}</CardTitle>
            <CardDescription className="text-xs">
              Report #{investigation.reportId} • {investigation.investigatorName}
            </CardDescription>
          </div>
          <Badge className={getStatusColor(investigation.status)}>
            {investigation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">Start Date:</span>
            <p>{new Date(investigation.startDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Expected Completion:</span>
            <p>{new Date(investigation.expectedCompletionDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gray-50 rounded">
          <div className="text-center">
            <p className="font-medium text-sm">{investigation.interviews.length}</p>
            <p className="text-xs text-gray-500">Interviews</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">{investigation.evidence.length}</p>
            <p className="text-xs text-gray-500">Evidence</p>
          </div>
          <div className="text-center">
            <p className="font-medium text-sm">
              {investigation.status === 'completed' ? '100%' : 
               investigation.status === 'in_progress' ? '60%' : '10%'}
            </p>
            <p className="text-xs text-gray-500">Progress</p>
          </div>
        </div>

        {investigation.findings && (
          <div className="mb-3">
            <h5 className="font-medium text-xs mb-1">Findings:</h5>
            <p className="text-xs text-gray-600">{investigation.findings}</p>
          </div>
        )}

        <div className="flex space-x-1">
          <Button size="sm" variant="outline">
            View Investigation
          </Button>
          {canManage && investigation.status === 'in_progress' && (
            <Button size="sm" variant="outline">
              Update Progress
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="reports" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="investigations">Investigations</TabsTrigger>
        <TabsTrigger value="policies">Policies</TabsTrigger>
        <TabsTrigger value="training">Training</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="reports" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Ethics Reports</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Submit Report
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">New Reports</p>
                  <p className="text-lg font-bold">
                    {reports.filter(r => r.status === 'received').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Under Investigation</p>
                  <p className="text-lg font-bold">
                    {reports.filter(r => r.status === 'investigating').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-lg font-bold">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <EyeOff className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Anonymous</p>
                  <p className="text-lg font-bold">
                    {reports.filter(r => r.isAnonymous).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="investigations" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Active Investigations</h3>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Start Investigation
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {investigations.map(investigation => (
            <InvestigationCard key={investigation.id} investigation={investigation} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="policies" className="space-y-4">
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Code of Conduct</h3>
          <p className="mt-1 text-sm text-gray-500">
            Ethics policies and conduct guidelines
          </p>
        </div>
      </TabsContent>

      <TabsContent value="training" className="space-y-4">
        <div className="text-center py-8">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ethics Training</h3>
          <p className="mt-1 text-sm text-gray-500">
            Training programs and compliance tracking
          </p>
        </div>
      </TabsContent>

      <TabsContent value="analytics" className="space-y-4">
        <div className="text-center py-8">
          <Scale className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Ethics Analytics</h3>
          <p className="mt-1 text-sm text-gray-500">
            Trends analysis and reporting metrics
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
