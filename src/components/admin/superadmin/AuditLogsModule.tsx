import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  Search,
  Download,
  Clock,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

// Placeholder audit log data structure
interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
  ipAddress: string;
}

// Placeholder data - in production, this would come from a database
const placeholderLogs: AuditLogEntry[] = [
  {
    id: '1',
    timestamp: new Date().toISOString(),
    user: 'admin@church.org',
    action: 'ROLE_ASSIGNED',
    resource: 'user_roles',
    details: 'Assigned admin role to user john@church.org for branch Main Campus',
    severity: 'warning',
    ipAddress: '192.168.1.1',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    user: 'superadmin@church.org',
    action: 'DISTRICT_CREATED',
    resource: 'districts',
    details: 'Created new district: Northern Region',
    severity: 'info',
    ipAddress: '192.168.1.2',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    user: 'admin@church.org',
    action: 'ROLE_REVOKED',
    resource: 'user_roles',
    details: 'Revoked pastor role from user jane@church.org',
    severity: 'critical',
    ipAddress: '192.168.1.1',
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    user: 'superadmin@church.org',
    action: 'BRANCH_REASSIGNED',
    resource: 'church_branches',
    details: 'Moved branch West Campus from District A to District B',
    severity: 'warning',
    ipAddress: '192.168.1.2',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    user: 'admin@church.org',
    action: 'LOGIN_SUCCESS',
    resource: 'auth',
    details: 'User logged in successfully',
    severity: 'info',
    ipAddress: '192.168.1.3',
  },
];

export const AuditLogsModule: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const getSeverityBadge = (severity: string) => {
    const config = {
      info: { icon: Info, class: 'bg-blue-100 text-blue-700 border-blue-200' },
      warning: { icon: AlertCircle, class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      critical: { icon: AlertCircle, class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const c = config[severity as keyof typeof config] || config.info;
    return (
      <Badge variant="outline" className={c.class}>
        <c.icon className="h-3 w-3 mr-1" />
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const filteredLogs = placeholderLogs.filter((log) => {
    const matchesSearch =
      searchTerm === '' ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || log.severity === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesSeverity && matchesAction;
  });

  const uniqueActions = [...new Set(placeholderLogs.map((l) => l.action))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-7 w-7" />
            Audit Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            Immutable record of system activities and changes
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Audit Log Information</p>
              <p className="text-sm text-blue-700 mt-1">
                These logs are immutable and cannot be edited or deleted. They provide a complete
                record of all administrative actions, role changes, and system modifications for
                compliance and security purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{placeholderLogs.length}</div>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {placeholderLogs.filter((l) => l.severity === 'info').length}
            </div>
            <p className="text-xs text-muted-foreground">Info Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {placeholderLogs.filter((l) => l.severity === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {placeholderLogs.filter((l) => l.severity === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">Critical Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {uniqueActions.map((action) => (
                  <SelectItem key={action} value={action}>
                    {action.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log ({filteredLogs.length})</CardTitle>
          <CardDescription>Recent system activities and administrative changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No log entries found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-sm">{log.user}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{log.details}</span>
                      </TableCell>
                      <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
