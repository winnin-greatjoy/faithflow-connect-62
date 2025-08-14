
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  Search,
  Filter,
  Eye,
  Download,
  Target,
  TrendingUp
} from 'lucide-react';
import { mockAuditExceptions, mockAuditFindings } from '@/data/mockCommitteeData';
import { AuditException, AuditFinding } from '@/types/committees';

interface AuditCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const AuditCommittee = ({ userRole, canManage }: AuditCommitteeProps) => {
  const [exceptions] = useState<AuditException[]>(mockAuditExceptions);
  const [findings] = useState<AuditFinding[]>(mockAuditFindings);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'investigating': case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'overdue': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'false_positive': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'investigating': case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'open': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'false_positive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ExceptionCard = ({ exception }: { exception: AuditException }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm flex items-center space-x-2">
              {getStatusIcon(exception.status)}
              <span>Exception #{exception.id}</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {exception.type.replace('_', ' ')} • {exception.entityType} #{exception.entityId}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Badge className={getSeverityColor(exception.severity)}>
              {exception.severity}
            </Badge>
            <Badge className={getStatusColor(exception.status)}>
              {exception.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3">{exception.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">Detected:</span>
            <p>{new Date(exception.detectedAt).toLocaleDateString()}</p>
          </div>
          {exception.assignedTo && (
            <div>
              <span className="font-medium">Assigned to:</span>
              <p>{exception.assignedTo}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Entity: {exception.entityType} #{exception.entityId}
          </div>
          
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              <Eye className="h-3 w-3 mr-1" />
              Investigate
            </Button>
            {canManage && exception.status === 'open' && (
              <Button size="sm" variant="outline">
                Assign
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const FindingCard = ({ finding }: { finding: AuditFinding }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm">{finding.title}</CardTitle>
            <CardDescription className="text-xs">
              {finding.category} • {finding.affectedArea}
            </CardDescription>
          </div>
          <div className="flex space-x-1">
            <Badge className={getSeverityColor(finding.severity)}>
              {finding.severity}
            </Badge>
            <Badge className={getStatusColor(finding.status)}>
              {finding.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3">{finding.description}</p>
        
        <div className="space-y-2 mb-3">
          <div>
            <h5 className="font-medium text-xs">Recommendations:</h5>
            <ul className="text-xs text-gray-600 ml-4">
              {finding.recommendations.map((rec, index) => (
                <li key={index} className="list-disc">{rec}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">Due Date:</span>
            <p>{new Date(finding.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <span className="font-medium">Assigned to:</span>
            <p>{finding.assignedTo}</p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Created: {new Date(finding.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              View Evidence
            </Button>
            {canManage && (
              <Button size="sm" variant="outline">
                Update Status
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="exceptions" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        <TabsTrigger value="findings">Findings</TabsTrigger>
        <TabsTrigger value="checklists">Checklists</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="rules">Rules</TabsTrigger>
      </TabsList>

      <TabsContent value="exceptions" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Audit Exceptions</h3>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-lg font-bold">
                    {exceptions.filter(e => e.status === 'open').length}
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
                  <p className="text-sm text-gray-600">Investigating</p>
                  <p className="text-lg font-bold">
                    {exceptions.filter(e => e.status === 'investigating').length}
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
                    {exceptions.filter(e => e.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-lg font-bold">{exceptions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {exceptions.map(exception => (
            <ExceptionCard key={exception.id} exception={exception} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="findings" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Audit Findings</h3>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Finding
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {findings.map(finding => (
            <FindingCard key={finding.id} finding={finding} />
          ))}
        </div>
      </TabsContent>

      <TabsContent value="checklists" className="space-y-4">
        <div className="text-center py-8">
          <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Audit Checklists</h3>
          <p className="mt-1 text-sm text-gray-500">
            Monthly and quarterly compliance checklists
          </p>
        </div>
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Audit Reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate comprehensive audit reports
          </p>
        </div>
      </TabsContent>

      <TabsContent value="rules" className="space-y-4">
        <div className="text-center py-8">
          <Shield className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Audit Rules</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure automated audit rules and thresholds
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
