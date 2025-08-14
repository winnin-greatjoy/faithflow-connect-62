
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Heart, 
  User, 
  Calendar, 
  MapPin, 
  Clock, 
  Phone, 
  Home,
  CheckCircle,
  AlertTriangle,
  Eye,
  FileText,
  DollarSign
} from 'lucide-react';
import { mockWelfareCases, mockCaseVisits } from '@/data/mockCommitteeData';
import { WelfareCase, CaseVisit } from '@/types/committees';

interface WelfareCommitteeProps {
  userRole: string;
  canManage: boolean;
}

export const WelfareCommittee = ({ userRole, canManage }: WelfareCommitteeProps) => {
  const [cases] = useState<WelfareCase[]>(mockWelfareCases);
  const [visits] = useState<CaseVisit[]>(mockCaseVisits);

  const getCasesByStatus = (status: WelfareCase['status']) => {
    return cases.filter(case => case.status === status);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: WelfareCase['status']) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assessment': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'disbursed': return 'bg-purple-100 text-purple-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCaseTypeIcon = (caseType: string) => {
    switch (caseType) {
      case 'illness': return <Heart className="h-4 w-4" />;
      case 'bereavement': return <User className="h-4 w-4" />;
      case 'hardship': return <DollarSign className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const CaseCard = ({ case: welfareCase }: { case: WelfareCase }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getCaseTypeIcon(welfareCase.caseType)}
            <div>
              <CardTitle className="text-sm">{welfareCase.requesterName}</CardTitle>
              <CardDescription className="text-xs capitalize">
                {welfareCase.caseType} • ID: {welfareCase.id}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-1">
            <Badge className={getUrgencyColor(welfareCase.urgency)}>
              {welfareCase.urgency}
            </Badge>
            <Badge className={getStatusColor(welfareCase.status)}>
              {welfareCase.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-gray-600 mb-3">{welfareCase.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-3">
          <div>
            <span className="font-medium">Submitted:</span>
            <p>{new Date(welfareCase.submittedAt).toLocaleDateString()}</p>
          </div>
          {welfareCase.assignedTo && (
            <div>
              <span className="font-medium">Assigned to:</span>
              <p>{welfareCase.assignedTo}</p>
            </div>
          )}
          {welfareCase.estimatedAmount && (
            <div>
              <span className="font-medium">Est. Amount:</span>
              <p>£{welfareCase.estimatedAmount}</p>
            </div>
          )}
          {welfareCase.approvedAmount && (
            <div>
              <span className="font-medium">Approved:</span>
              <p>£{welfareCase.approvedAmount}</p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className={
            welfareCase.privacyLevel === 'leadership_only' ? 'border-red-300 text-red-700' :
            welfareCase.privacyLevel === 'committee_only' ? 'border-yellow-300 text-yellow-700' :
            'border-green-300 text-green-700'
          }>
            <Eye className="h-3 w-3 mr-1" />
            {welfareCase.privacyLevel.replace('_', ' ')}
          </Badge>
          
          <div className="flex space-x-1">
            <Button size="sm" variant="outline">
              View Details
            </Button>
            {canManage && welfareCase.status === 'new' && (
              <Button size="sm" variant="outline">
                Assign
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Tabs defaultValue="cases" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="cases">Cases</TabsTrigger>
        <TabsTrigger value="visits">Visits</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
      </TabsList>

      <TabsContent value="cases" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Welfare Cases</h3>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Case
            </Button>
          )}
        </div>

        {/* Status Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {['new', 'assessment', 'approved', 'disbursed', 'closed', 'rejected'].map((status) => {
            const statusCases = getCasesByStatus(status as WelfareCase['status']);
            return (
              <div key={status} className="min-h-96">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm capitalize">{status}</h4>
                  <Badge variant="secondary">{statusCases.length}</Badge>
                </div>
                <div className="space-y-2">
                  {statusCases.map(welfareCase => (
                    <CaseCard key={welfareCase.id} case={welfareCase} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </TabsContent>

      <TabsContent value="visits" className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Case Visits</h3>
          {canManage && (
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Visit
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {visits.map((visit) => (
            <Card key={visit.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium">Case #{visit.caseId} Visit</h4>
                    <p className="text-sm text-gray-600">by {visit.visitorName}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(visit.visitDate).toLocaleDateString()}</span>
                    <Badge variant="outline" className="ml-2">
                      {visit.visitType === 'home' && <Home className="h-3 w-3 mr-1" />}
                      {visit.visitType === 'phone' && <Phone className="h-3 w-3 mr-1" />}
                      {visit.visitType === 'hospital' && <Heart className="h-3 w-3 mr-1" />}
                      {visit.visitType === 'office' && <User className="h-3 w-3 mr-1" />}
                      {visit.visitType}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-sm mb-1">Findings</h5>
                    <p className="text-sm text-gray-600">{visit.findings}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-1">Recommendations</h5>
                    <p className="text-sm text-gray-600">{visit.recommendations}</p>
                  </div>

                  {visit.followUpRequired && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Follow-up required</span>
                      {visit.followUpDate && (
                        <span className="text-gray-500">
                          by {new Date(visit.followUpDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="reports" className="space-y-4">
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Welfare Reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Generate case summaries and impact reports
          </p>
        </div>
      </TabsContent>

      <TabsContent value="resources" className="space-y-4">
        <div className="text-center py-8">
          <Heart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Care Resources</h3>
          <p className="mt-1 text-sm text-gray-500">
            Resource directory and care packages
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};
