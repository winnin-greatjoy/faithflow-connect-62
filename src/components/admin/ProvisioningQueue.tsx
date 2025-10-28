'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
  CommandEmpty,
} from '@/components/ui/command';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCcw, Search } from 'lucide-react';
import { provisioningApi, type ProvisioningJob } from '@/services/admin/provisioningApi';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type Member = {
  id: string;
  full_name: string;
  email: string | null;
  phone?: string | null;
  branch?: { name?: string | null } | null;
  membership_level?: string | null;
};

const isBaptizedLevel = (level?: string | null) => level?.toLowerCase() === 'baptized';

export function ProvisioningQueue() {
  const [jobs, setJobs] = useState<ProvisioningJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<ProvisioningJob[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'invite' | 'temp_password'>('temp_password');
  const [emailEdit, setEmailEdit] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'done' | 'error' | 'processing'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [retryingId, setRetryingId] = useState<string | null>(null);

  useEffect(() => {
    loadJobs();
    loadMembers();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, statusFilter, page]);

  async function loadJobs() {
    const res = await provisioningApi.list(200);
    if (res.error) {
      toast.error(res.error.message ?? 'Failed to load provisioning jobs');
      return;
    }

    setJobs((res.data ?? []) as ProvisioningJob[]);
  }

  async function loadMembers() {
    // Load only baptized members with worker or disciple sub-level
    const res: any = await supabase
      .from('members')
      .select('id, full_name, email, phone, membership_level, baptized_sub_level, branch:church_branches(name)')
      .eq('membership_level', 'baptized')
      .in('baptized_sub_level', ['worker', 'disciple'])
      .order('full_name');

    if (res.error) {
      console.error('Failed to load members:', res);
      toast.error('Failed to load members');
      return;
    }

    setMembers((res.data || []) as Member[]);
  }

  async function createProvisioningJob() {
    if (!selectedMember) {
      toast.error('Please select a member first');
      return;
    }

    if (!isBaptizedLevel(selectedMember.membership_level)) {
      toast.error('Only baptized members can be provisioned');
      return;
    }

    setLoading(true);
    const res = await provisioningApi.create(selectedMember.id, 'admin_initiated', deliveryMethod);
    setLoading(false);

    if (res.error) {
      toast.error(res.error.message ?? 'Failed to create provisioning job');
      return;
    }

    toast.success('Provisioning job created successfully');
    setSelectedMember(null);
    setEmailEdit('');
    loadJobs();
  }

  async function saveEmail() {
    if (!selectedMember || !emailEdit.trim()) return;

    const { error } = await supabase
      .from('members')
      .update({ email: emailEdit })
      .eq('id', selectedMember.id);

    if (error) {
      toast.error('Failed to save email');
      return;
    }

    toast.success('Email saved');
    setSelectedMember({ ...selectedMember, email: emailEdit });
    setEmailEdit('');
  }

  async function retryJob(jobId: string) {
    setRetryingId(jobId);
    const res = await provisioningApi.retry(jobId);
    if (res.error) {
      toast.error(res.error.message ?? 'Retry failed');
      setRetryingId(null);
      return;
    }

    toast.success('Retry successful');
    await loadJobs();
    setRetryingId(null);
  }

  async function manageAuth(action: 'resend' | 'reset', email: string, jobId: string) {
    if (!email) {
      toast.error('Email required');
      return;
    }

    const { error } = await supabase.functions.invoke('manage-auth', {
      body: { action, email, jobId },
    });

    if (error) {
      toast.error('Failed to send request');
      return;
    }

    toast.success(`Auth ${action} email sent`);
  }

  function filterJobs() {
    const filtered = statusFilter === 'all' ? jobs : jobs.filter(job => job.status === statusFilter);
    const startIndex = (page - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);
    setFilteredJobs(paginated);
  }

  function handlePageChange(direction: 'next' | 'prev') {
    setPage(prev => {
      const total = statusFilter === 'all' ? jobs.length : jobs.filter(job => job.status === statusFilter).length;
      const maxPage = Math.ceil(total / pageSize) || 1;

      if (direction === 'next' && prev < maxPage) return prev + 1;
      if (direction === 'prev' && prev > 1) return prev - 1;
      return prev;
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provision Member Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[250px] justify-between">
                  {selectedMember ? selectedMember.full_name : 'Select Member'}
                  <Search className="w-4 h-4 ml-2 opacity-70" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[300px]">
                <Command>
                  <CommandInput placeholder="Search member..." />
                  <CommandList>
                    <CommandEmpty>No members found</CommandEmpty>
                    {members.map(member => (
                      <CommandItem
                        key={member.id}
                        onSelect={() => {
                          setSelectedMember(member);
                          setEmailEdit(member.email || '');
                        }}
                      >
                        {member.full_name}
                        <Badge className="ml-auto" variant="outline">
                          {member.branch?.name || 'N/A'}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedMember && !selectedMember.email && (
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email"
                  value={emailEdit}
                  onChange={e => setEmailEdit(e.target.value)}
                />
                <Button onClick={saveEmail}>Save</Button>
              </div>
            )}

            <Select
              value={deliveryMethod}
              onValueChange={value => setDeliveryMethod(value as typeof deliveryMethod)}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Delivery method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="temp_password">Temporary Password</SelectItem>
                <SelectItem value="invite">Invitation Link</SelectItem>
              </SelectContent>
            </Select>

            <Button disabled={!selectedMember || loading} onClick={createProvisioningJob}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Job'}
            </Button>
          </div>

          {selectedMember && (
            <div className="text-sm text-muted-foreground">
              Selected: <span className="font-medium">{selectedMember.full_name}</span>{' '}
              ({selectedMember.membership_level || 'membership unknown'})
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <CardTitle>Provisioning Jobs Queue</CardTitle>
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onValueChange={value => {
                setStatusFilter(value as typeof statusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={loadJobs}>
              <RefreshCcw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No provisioning jobs found
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map(job => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={job.member?.profile_photo ?? undefined} alt={job.member?.full_name ?? 'Member avatar'} />
                          <AvatarFallback>
                            {(job.member?.full_name ?? job.member_id)?.charAt(0)?.toUpperCase() ?? 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{job.member?.full_name ?? job.member_id}</span>
                      </div>
                    </TableCell>
                    <TableCell>{job.member?.email ?? '—'}</TableCell>
                    <TableCell className="capitalize">{job.type.replace(/_/g, ' ')}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'capitalize',
                          job.status === 'done' && 'bg-emerald-100 text-emerald-700 border-0',
                          job.status === 'processing' && 'bg-blue-100 text-blue-700 border-0',
                          job.status === 'error' && 'bg-red-100 text-red-700 border-0',
                          job.status !== 'done' && job.status !== 'processing' && job.status !== 'error' && 'bg-gray-100 text-gray-700 border-0'
                        )}
                        variant="secondary"
                      >
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.reason || '—'}</TableCell>
                    <TableCell>
                      {job.created_at ? new Date(job.created_at).toLocaleString() : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {job.status === 'error' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => retryJob(job.id)}
                            disabled={retryingId === job.id}
                          >
                            {retryingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Retry'}
                          </Button>
                        )}
                        {job.member?.email && job.status === 'done' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => manageAuth('resend', job.member!.email!, job.id)}
                            >
                              <Mail className="w-4 h-4 mr-1" /> Resend Invite
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => manageAuth('reset', job.member!.email!, job.id)}
                            >
                              <RefreshCcw className="w-4 h-4 mr-1" /> Reset Password
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => handlePageChange('prev')}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {
                Math.ceil(
                  (statusFilter === 'all'
                    ? jobs.length
                    : jobs.filter(job => job.status === statusFilter).length) / pageSize,
                ) || 1
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={
                page >=
                Math.ceil(
                  (statusFilter === 'all'
                    ? jobs.length
                    : jobs.filter(job => job.status === statusFilter).length) / pageSize,
                )
              }
              onClick={() => handlePageChange('next')}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
