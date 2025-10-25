import React, { useEffect, useRef, useState } from 'react';
import { provisioningApi } from '@/services';
import type { ProvisioningJob } from '@/services/admin/provisioningApi';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthz } from '@/hooks/useAuthz';
import { Switch } from '@/components/ui/switch';

export const ProvisioningQueue: React.FC = () => {
  const { branchId } = useAuthz();
  const [jobs, setJobs] = useState<ProvisioningJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; full_name: string; email: string | null } | null>(null);
  const [newType, setNewType] = useState<ProvisioningJob['type']>('admin_initiated');
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimer = useRef<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ id: string; full_name: string; email: string | null; profile_photo: string | null; status: 'active' | 'inactive' | 'suspended' | 'transferred' | null }[]>([]);
  const [limitToBranch, setLimitToBranch] = useState<boolean>(!!branchId);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await provisioningApi.list(100);
    if (!res.error) setJobs(res.data);
    setLoading(false);
  };

  const createJob = async () => {
    if (!selectedMember?.id) return;
    setCreating(true);
    const res = await provisioningApi.create(selectedMember.id, newType);
    if (!res.error) {
      setSelectedMember(null);
      await load();
    }
    setCreating(false);
  };

  const runSearch = async (term: string) => {
    const q = term.trim();
    if (!q) {
      setResults([]);
      return;
    }
    setSearching(true);
    let query = supabase
      .from('members')
      .select('id, full_name, email, profile_photo, status')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
      .limit(10);
    if (branchId && limitToBranch) {
      query = query.eq('branch_id', branchId);
    }
    const { data, error } = await query;
    if (!error) setResults(data || []);
    setSearching(false);
  };

  useEffect(() => {
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => runSearch(searchTerm), 300) as unknown as number;
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [searchTerm]);

  useEffect(() => {
    load();
  }, []);

  const retry = async (id: string) => {
    setRetryingId(id);
    const res = await provisioningApi.retry(id);
    if (!res.error) await load();
    setRetryingId(null);
  };

  const StatusBadge = ({ status }: { status: ProvisioningJob['status'] }) => {
    const color =
      status === 'done' ? 'bg-green-100 text-green-700' :
      status === 'processing' ? 'bg-blue-100 text-blue-700' :
      status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
    return <span className={`px-2 py-1 rounded text-xs ${color}`}>{status}</span>;
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">Account Provisioning Queue</h2>
        <div className="flex items-center gap-2">
          <Popover open={pickerOpen} onOpenChange={(o) => { setPickerOpen(o); if (o) setTimeout(() => inputRef.current?.focus(), 0); }}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-64 justify-between"
                type="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPickerOpen(true);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }
                }}
              >
                {selectedMember ? (
                  <span className="truncate text-left">
                    {selectedMember.full_name} {selectedMember.email ? `· ${selectedMember.email}` : ''}
                  </span>
                ) : (
                  <span className="text-gray-500">Select member…</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80" align="start">
              <Command>
                <CommandInput ref={inputRef as any} placeholder="Search name, email, or phone…" value={searchTerm} onValueChange={setSearchTerm} />
                <CommandList>
                  {searching && <div className="p-3 text-sm text-gray-500">Searching…</div>}
                  <CommandEmpty>No members found.</CommandEmpty>
                  <CommandGroup>
                    {results.map(m => (
                      <CommandItem key={m.id} onSelect={() => { setSelectedMember(m); setPickerOpen(false); }}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.profile_photo || undefined} alt={m.full_name} />
                            <AvatarFallback>{m.full_name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{m.full_name}</span>
                            <span className="text-xs text-gray-600">{m.email || m.id}</span>
                          </div>
                          <span className={`ml-auto text-xs px-2 py-0.5 rounded ${
                            m.status === 'active' ? 'bg-green-100 text-green-700' :
                            m.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                            m.status === 'suspended' ? 'bg-red-100 text-red-700' :
                            m.status === 'transferred' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {m.status || 'unknown'}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedMember && (
            <Button size="sm" variant="ghost" onClick={() => setSelectedMember(null)}>Clear</Button>
          )}
          {branchId && (
            <div className="flex items-center gap-2 ml-2">
              <Switch checked={limitToBranch} onCheckedChange={setLimitToBranch} id="limit-branch" />
              <label htmlFor="limit-branch" className="text-sm text-gray-700">Limit to my branch</label>
            </div>
          )}
          <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin_initiated">Admin initiated</SelectItem>
              <SelectItem value="auto_baptized">Auto (baptized)</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={createJob} disabled={creating || !selectedMember?.id}>
            {creating ? 'Creating…' : 'Create Job'}
          </Button>
          <Button size="sm" variant="outline" onClick={load}>Refresh</Button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-2">ID</th>
              <th className="text-left px-4 py-2">Member</th>
              <th className="text-left px-4 py-2">Email</th>
              <th className="text-left px-4 py-2">Type</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Reason</th>
              <th className="text-left px-4 py-2">Created</th>
              <th className="text-left px-4 py-2">Processed</th>
              <th className="text-left px-4 py-2">Actions</th>
              <th className="text-left px-4 py-2">Profile</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(j => (
              <tr key={j.id} className="border-t">
                <td className="px-4 py-2 font-mono">{j.id.slice(0, 8)}…</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={j.member?.profile_photo || undefined} alt={j.member?.full_name || ''} />
                      <AvatarFallback>{j.member?.full_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <span>{j.member?.full_name || <span className="font-mono">{j.member_id.slice(0,8)}…</span>}</span>
                    {j.member?.status && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        j.member.status === 'active' ? 'bg-green-100 text-green-700' :
                        j.member.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                        j.member.status === 'suspended' ? 'bg-red-100 text-red-700' :
                        j.member.status === 'transferred' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {j.member.status}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2 text-gray-700">{j.member?.email || '-'}</td>
                <td className="px-4 py-2 capitalize">{j.type.replace('_', ' ')}</td>
                <td className="px-4 py-2"><StatusBadge status={j.status} /></td>
                <td className="px-4 py-2 text-gray-600 max-w-xs truncate" title={j.reason || ''}>{j.reason || '-'}</td>
                <td className="px-4 py-2">{j.created_at ? new Date(j.created_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-2">{j.processed_at ? new Date(j.processed_at).toLocaleString() : '-'}</td>
                <td className="px-4 py-2">
                  {j.status === 'error' && (
                    <Button size="sm" variant="outline" disabled={retryingId === j.id} onClick={() => retry(j.id)}>
                      {retryingId === j.id ? 'Retrying…' : 'Retry'}
                    </Button>
                  )}
                </td>
                <td className="px-4 py-2">
                  <a className="text-blue-600 hover:underline" href={`/admin/members?member=${j.member_id}`}>View</a>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-600" colSpan={8}>No jobs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
