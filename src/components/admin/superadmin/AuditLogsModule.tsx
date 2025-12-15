import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
import { Shield, Search, Download, Clock, User, AlertCircle, Info, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_id: string | null;
  action: string;
  resource: string;
  details: string | null;
  severity: 'info' | 'warning' | 'critical' | null;
  ip_address: string | null;
  profile?: {
    first_name: string;
    last_name: string;
  } | null;
}

export const AuditLogsModule: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const {
    data: logs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select(`
          id,
          timestamp,
          user_id,
          action,
          resource,
          details,
          severity,
          ip_address
        `)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Audit logs error:', error);
        throw error;
      }

      // Fetch profile names separately for user_ids
      const userIds = [...new Set((data || []).map(d => d.user_id).filter(Boolean))];
      let profileMap: Record<string, { first_name: string; last_name: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', userIds);
        
        if (profiles) {
          profileMap = profiles.reduce((acc, p) => {
            acc[p.id] = { first_name: p.first_name, last_name: p.last_name };
            return acc;
          }, {} as Record<string, { first_name: string; last_name: string }>);
        }
      }

      return (data || []).map(log => ({
        ...log,
        profile: log.user_id ? profileMap[log.user_id] || null : null
      })) as AuditLogEntry[];
    },
  });

  const getSeverityBadge = (severity: string | null) => {
    const s = severity || 'info';
    const config = {
      info: { icon: Info, class: 'bg-blue-100 text-blue-700 border-blue-200' },
      warning: { icon: AlertCircle, class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      critical: { icon: AlertCircle, class: 'bg-red-100 text-red-700 border-red-200' },
    };
    const c = config[s as keyof typeof config] || config.info;
    const Icon = c.icon;

    return (
      <Badge variant="outline" className={c.class}>
        <Icon className="h-3 w-3 mr-1" />
        {s.toUpperCase()}
      </Badge>
    );
  };

  const filteredLogs = logs.filter((log) => {
    const userName = log.profile
      ? `${log.profile.first_name} ${log.profile.last_name}`
      : 'Unknown User';

    const matchesSearch =
      searchTerm === '' ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === 'all' || (log.severity || 'info') === severityFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;

    return matchesSearch && matchesSeverity && matchesAction;
  });

  const uniqueActions = [...new Set(logs.map((l) => l.action))];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
            <div className="text-2xl font-bold">{logs.length}</div>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">
              {logs.filter((l) => l.severity === 'info' || !l.severity).length}
            </div>
            <p className="text-xs text-muted-foreground">Info Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">
              {logs.filter((l) => l.severity === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">
              {logs.filter((l) => l.severity === 'critical').length}
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
                          <span className="text-sm">
                            {log.profile
                              ? `${log.profile.first_name} ${log.profile.last_name}`
                              : 'System / Unknown'}
                          </span>
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
