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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export const ProvisioningQueue: React.FC = () => {
  const { branchId } = useAuthz();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<ProvisioningJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<{ id: string; full_name: string; email: string | null; membership_level?: 'visitor'|'convert'|'baptized'|'baptised' } | null>(null);
  const [emailEdit, setEmailEdit] = useState('');
  const [editingEmail, setEditingEmail] = useState(false);
  const [newType, setNewType] = useState<ProvisioningJob['type']>('admin_initiated');
  const [deliveryMethod, setDeliveryMethod] = useState<'invite' | 'temp_password'>('temp_password');
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const searchTimer = useRef<number | null>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ id: string; full_name: string; email: string | null; phone: string | null; branch_id: string; profile_photo: string | null; status: 'active' | 'inactive' | 'suspended' | 'transferred' | null; membership_level?: 'visitor' | 'convert' | 'baptized' }[]>([]);
  const isBaptizedLevel = (lvl?: string | null) => (lvl === 'baptized');
  const [limitToBranch, setLimitToBranch] = useState<boolean>(!!branchId);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [editMemberId, setEditMemberId] = useState<string | null>(null);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const [newMember, setNewMember] = useState<{ full_name: string; email: string; phone: string; membership_level: 'visitor'|'convert'|'baptized'; branch_id: string }>({ full_name: '', email: '', phone: '', membership_level: 'baptized', branch_id: '' });
  const [autoCreateJob, setAutoCreateJob] = useState(true);
  const [dialogDelivery, setDialogDelivery] = useState<'invite'|'temp_password'>('invite');
  const emailValid = !newMember.email || /[^@\s]+@[^@\s]+\.[^@\s]+/.test(newMember.email);

  const load = async () => {
    setLoading(true);
    const res = await provisioningApi.list(100);
    if (!res.error) setJobs(res.data);
    setLoading(false);
  };

  const createJob = async () => {
    if (!selectedMember?.id) return;
    if (!isBaptizedLevel(selectedMember.membership_level)) {
      toast({ title: 'Job not allowed', description: 'Provisioning jobs can only be created for baptized members.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    const res = await provisioningApi.create(selectedMember.id, newType, deliveryMethod);
    if (!res.error) {
      setSelectedMember(null);
      await load();
      toast({ title: 'Create Job', description: 'Provisioning job created. Open Provisioning Queue.', action: { label: 'Open', onClick: () => { window.location.href = `/admin/provisioning`; } } as any });
    } else {
      toast({ title: 'Create Job failed', description: res.error?.message || 'Unknown error', variant: 'destructive' });
    }
    setCreating(false);
  };

  const loadDefaultMembers = async () => {
    setSearching(true);
    let query = supabase
      .from('members')
      .select('id, full_name, email, phone, branch_id, profile_photo, status, membership_level, baptized_sub_level')
      .eq('membership_level', 'baptized')
      .in('baptized_sub_level', ['worker','disciple'] as any)
      .order('full_name')
      .limit(10);
    if (branchId && limitToBranch) {
      query = query.eq('branch_id', branchId);
    }
    const { data, error } = await query;
    if (!error) {
      if ((data || []).length > 0 || !limitToBranch) {
        setResults(data || []);
      } else {
        // Retry without branch filter as a fallback to surface any baptized members
        const { data: anyBranch, error: e2 } = await supabase
          .from('members')
          .select('id, full_name, email, phone, branch_id, profile_photo, status, membership_level')
          .eq('membership_level', 'baptized')
          .order('full_name')
          .limit(10);
        if (!e2) setResults(anyBranch || []);
      }
    }
    setSearching(false);
  };

  const runSearch = async (term: string) => {
    const q = term.trim();
    if (!q) { await loadDefaultMembers(); return; }
    setSearching(true);
    let query = supabase
      .from('members')
      .select('id, full_name, email, phone, branch_id, profile_photo, status, membership_level, baptized_sub_level')
      .or(`full_name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
      .eq('membership_level', 'baptized')
      .in('baptized_sub_level', ['worker','disciple'] as any)
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
    // Preload default baptized members so picker is instant on first open
    loadDefaultMembers();
  }, []);

  useEffect(() => {
    if (pickerOpen && !searchTerm) {
      loadDefaultMembers();
    }
  }, [pickerOpen, branchId, limitToBranch, deliveryMethod]);

  useEffect(() => {
    if (!editMemberId && autoCreateJob && newMember.membership_level !== 'baptized') {
      setNewMember(prev => ({ ...prev, membership_level: 'baptized' }));
    }
  }, [autoCreateJob, editMemberId]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('church_branches').select('id, name').order('name');
      setBranches(data || []);
      const def = (branchId as any) || (data as any)?.[0]?.id;
      if (!newMember.branch_id && def) setNewMember(prev => ({ ...prev, branch_id: def }));
    })();
  }, []);

  const retry = async (id: string) => {
    setRetryingId(id);
    const res = await provisioningApi.retry(id);
    if (!res.error) await load();
    setRetryingId(null);
  };

  const manageAuth = async (action: 'resend_invite' | 'send_password_reset', email: string, jobId: string) => {
    if (!email) return;
    await fetch('/functions/v1/manage-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, email })
    });
    const suffix = action === 'resend_invite' ? `;resent:${new Date().toISOString()}` : `;reset_sent:${new Date().toISOString()}`;
    await supabase.from('account_provisioning_jobs').update({ reason: (supabase as any).sql`coalesce(reason,'') || ${suffix}` } as any).eq('id', jobId);
    await load();
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
                    {selectedMember.full_name} {selectedMember.email ? `· ${selectedMember.email}` : ''} {!isBaptizedLevel(selectedMember.membership_level) ? '· (not baptized)' : ''}
                  </span>
                ) : (
                  <span className="text-gray-500">Select member…</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80" align="start">
              <Command>
                <CommandInput
                  ref={inputRef as any}
                  placeholder="Search name, email, or phone…"
                  value={searchTerm ?? ''}
                  onValueChange={setSearchTerm}
                  onFocus={() => { if (!searchTerm) { loadDefaultMembers(); } }}
                />
                <CommandList>
                  {searching && <div className="p-3 text-sm text-gray-500">Searching…</div>}
                  <CommandEmpty>
                    <div className="p-3 text-sm text-gray-600 space-y-2">
                      <div>No members found.</div>
                      <div className="flex items-center gap-3">
                        <button className="text-blue-600 hover:underline" type="button" onClick={() => { loadDefaultMembers(); }}>Load baptized list</button>
                        <button className="text-blue-600 hover:underline" type="button" onClick={() => { setEditMemberId(null); setShowCreateMember(true); setPickerOpen(false); }}>Create a new member</button>
                      </div>
                    </div>
                  </CommandEmpty>
                  <CommandGroup>
                    {results.map(m => (
                      <CommandItem key={`member-${m.id}`} value={m.id} onSelect={() => { setSelectedMember(m); setPickerOpen(false); if (deliveryMethod === 'invite' && (!m.email || m.email === '')) { setDeliveryMethod('temp_password'); } }}>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m.profile_photo || undefined} alt={m.full_name} />
                            <AvatarFallback>{m.full_name?.[0] || '?'}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{m.full_name}</span>
                            <span className="text-xs text-gray-600">{m.email || m.id} · {m.membership_level || 'unknown'}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="ml-auto" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditMemberId(m.id); setNewMember({ full_name: m.full_name, email: m.email || '', phone: m.phone || '', membership_level: (m.membership_level as any) || 'visitor', branch_id: m.branch_id || branches[0]?.id || '' }); setShowCreateMember(true); }}>Edit</Button>
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
                  <CommandGroup>
                    <CommandItem key={`create-new-member`} value="__create_new__" onSelect={() => { setEditMemberId(null); setShowCreateMember(true); setPickerOpen(false); }}>
                      <div className="w-full text-left">Create a new member</div>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedMember && (
            <>
              <Button size="sm" variant="ghost" onClick={() => setSelectedMember(null)}>Clear</Button>
              {!selectedMember.email ? (
                <div className="flex items-center gap-2 ml-2">
                  {!editingEmail ? (
                    <Button size="sm" variant="outline" onClick={() => { setEditingEmail(true); setEmailEdit(''); }}>Add email</Button>
                  ) : (
                    <>
                      <input className="border rounded px-2 py-1 text-sm" placeholder="Enter email" value={emailEdit} onChange={e => setEmailEdit(e.target.value)} />
                      <Button size="sm" onClick={async () => {
                        if (!/[^@\s]+@[^@\s]+\.[^@\s]+/.test(emailEdit)) { toast({ title: 'Invalid email', description: 'Enter a valid email', variant: 'destructive' }); return; }
                        const { data, error } = await supabase.from('members').update({ email: emailEdit }).eq('id', selectedMember.id).select('id, full_name, email, membership_level').single();
                        if (!error && data) {
                          setSelectedMember({ ...selectedMember, email: data.email, membership_level: data.membership_level });
                          setEditingEmail(false);
                          toast({ title: 'Email updated', description: 'Member email saved.' });
                        }
                      }}>Save</Button>
                    </>
                  )}
                </div>
              ) : null}
            </>
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
          <Select value={deliveryMethod} onValueChange={(v: any) => setDeliveryMethod(v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Delivery" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="invite">Invite link</SelectItem>
              <SelectItem value="temp_password">Temp password</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={createJob} disabled={creating || !selectedMember?.id || (deliveryMethod === 'invite' && !selectedMember?.email)}>
            {creating ? 'Creating…' : 'Create Job'}
          </Button>
          {selectedMember && deliveryMethod === 'invite' && !selectedMember.email && (
            <div className="text-xs text-red-600">Selected member has no email; add an email to enable invite delivery.</div>
          )}
          {selectedMember && !isBaptizedLevel(selectedMember.membership_level) && (
            <div className="text-xs text-amber-700">Provisioning allowed only for baptized members.</div>
          )}
          <Button size="sm" variant="outline" onClick={load}>Refresh</Button>
          <Button size="sm" variant="secondary" onClick={() => setShowCreateMember(true)}>Quick add member</Button>
          <Button size="sm" onClick={() => { setShowCreateJob(true); if (!searchTerm) loadDefaultMembers(); }}>New job</Button>
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
                  <div className="flex items-center gap-2">
                    {j.status === 'error' && (
                      <Button size="sm" variant="outline" disabled={retryingId === j.id} onClick={() => retry(j.id)}>
                        {retryingId === j.id ? 'Retrying…' : 'Retry'}
                      </Button>
                    )}
                    {j.member?.email && String(j.reason || '').startsWith('invited:') && (
                      <Button size="sm" variant="outline" onClick={() => manageAuth('resend_invite', j.member!.email!, j.id)}>Resend invite</Button>
                    )}
                    {j.member?.email && String(j.reason || '').startsWith('temp_password:') && (
                      <Button size="sm" variant="outline" onClick={() => manageAuth('send_password_reset', j.member!.email!, j.id)}>Reset password</Button>
                    )}
                  </div>
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

      <Dialog open={showCreateMember} onOpenChange={(o) => { setShowCreateMember(o); if (!o) { setEditMemberId(null); } if (o && !newMember.branch_id) { const def = (branchId as any) || branches[0]?.id; if (def) setNewMember(prev => ({ ...prev, branch_id: def })); } if (o && !editMemberId) { setNewMember(prev => ({ ...prev, membership_level: 'baptized' })); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editMemberId ? 'Edit member' : 'Quick add member'}</DialogTitle>
            <DialogDescription>Minimal details now; you can complete the profile later in Members.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Full name</label>
              <input className="mt-1 w-full border rounded px-2 py-1" value={newMember.full_name ?? ''} onChange={e => setNewMember({ ...newMember, full_name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input className={`mt-1 w-full border rounded px-2 py-1 ${emailValid ? '' : 'border-red-500'}`} value={newMember.email ?? ''} onChange={e => setNewMember({ ...newMember, email: e.target.value })} />
              {!emailValid && <div className="text-xs text-red-600 mt-1">Enter a valid email address</div>}
            </div>
            <div>
              <label className="text-sm text-gray-700">Phone</label>
              <input className="mt-1 w-full border rounded px-2 py-1" value={newMember.phone ?? ''} onChange={e => setNewMember({ ...newMember, phone: e.target.value })} />
            </div>
            <div>
              <label className="text-sm text-gray-700">Branch</label>
              <select className="mt-1 w-full border rounded px-2 py-1" value={newMember.branch_id ?? ''} onChange={e => setNewMember({ ...newMember, branch_id: e.target.value })}>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-700">Membership level</label>
              <select className="mt-1 w-full border rounded px-2 py-1 disabled:bg-gray-100" value={newMember.membership_level ?? 'visitor'} onChange={e => setNewMember({ ...newMember, membership_level: e.target.value as any })} disabled={autoCreateJob && !editMemberId}>
                <option value="visitor">Visitor</option>
                <option value="convert">Convert</option>
                <option value="baptized">Baptized</option>
              </select>
              {autoCreateJob && (
                <div className="text-xs text-gray-600 mt-1">Auto-create is on, so membership level is set to Baptized.</div>
              )}
            </div>
            {!editMemberId && (
              <div className="flex items-center gap-3">
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <input type="checkbox" checked={autoCreateJob} onChange={(e) => setAutoCreateJob(e.target.checked)} />
                  Create provisioning job now
                </label>
                <Select value={dialogDelivery} onValueChange={(v: any) => setDialogDelivery(v)}>
                  <SelectTrigger className="w-44">
                    <SelectValue placeholder="Delivery" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invite">Invite link</SelectItem>
                    <SelectItem value="temp_password">Temp password</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowCreateMember(false)}>Cancel</Button>
              <Button
                type="button"
                onClick={async () => {
                  const today = new Date().toISOString().slice(0, 10);
                  const base: any = {
                    full_name: newMember.full_name,
                    email: newMember.email || null,
                    profile_photo: null,
                    date_of_birth: '2000-01-01',
                    gender: 'male',
                    marital_status: 'single',
                    spouse_name: null,
                    number_of_children: 0,
                    phone: newMember.phone || '-',
                    community: '-',
                    area: '-',
                    street: '-',
                    public_landmark: null,
                    branch_id: newMember.branch_id,
                    date_joined: today,
                    membership_level: newMember.membership_level,
                    baptized_sub_level: newMember.membership_level === 'baptized' ? 'worker' : null,
                    leader_role: null,
                  };
                  try {
                    if (editMemberId) {
                      const { data, error } = await supabase.functions.invoke('admin-create-member', {
                        body: { action: 'update', id: editMemberId, data: base }
                      } as any);
                      if (error) {
                        toast({ title: 'Update failed', description: error.message || 'Edge function error', variant: 'destructive' });
                        return;
                      }
                      const payload = data as any;
                      const row = (payload?.data ?? payload) as any;
                      setSelectedMember(row as any);
                      setResults([row as any, ...results.filter(r => r.id !== row.id)]);
                      setShowCreateMember(false);
                    } else {
                      if (newMember.email) {
                        const { data: dup } = await supabase
                          .from('members')
                          .select('id')
                          .ilike('email', newMember.email)
                          .limit(1);
                        if ((dup || []).length > 0) {
                          toast({ title: 'Duplicate email', description: 'A member with this email already exists.', variant: 'destructive' });
                          return;
                        }
                      }
                      const { data, error } = await supabase.functions.invoke('admin-create-member', {
                        body: { action: 'insert', data: base }
                      } as any);
                      if (error) {
                        toast({ title: 'Create failed', description: error.message || 'Edge function error', variant: 'destructive' });
                        return;
                      }
                      const payload = data as any;
                      const row = (payload?.data ?? payload) as any;
                      setSelectedMember(row as any);
                      setResults([row as any]);
                      setShowCreateMember(false);
                      try {
                        const mmPayload = {
                          id: Date.now(),
                          fullName: row.full_name || newMember.full_name,
                          email: row.email || newMember.email || '',
                          phone: row.phone || newMember.phone || '',
                          membershipLevel: (row.membership_level || newMember.membership_level) as any,
                          baptizedSubLevel: (row.baptized_sub_level || (newMember.membership_level === 'baptized' ? 'worker' : 'none')) as any,
                          branchId: 1,
                          status: 'active',
                        };
                        sessionStorage.setItem('mm:newMember', JSON.stringify(mmPayload));
                        window.dispatchEvent(new CustomEvent('member:created', { detail: mmPayload }));
                      } catch {}
                      if (autoCreateJob) {
                        if ((row as any).membership_level === 'baptized') {
                          const res = await provisioningApi.create((row as any).id, newType, dialogDelivery);
                          await load();
                          toast({ title: 'Create Job', description: 'Provisioning job created.' });
                        } else {
                          toast({ title: 'Job not created', description: 'Jobs can only be created for baptized members.', variant: 'destructive' });
                        }
                      }
                      setSearchTerm('');
                      await loadDefaultMembers();
                      setPickerOpen(true);
                    }
                  } catch (e: any) {
                    toast({ title: 'Save failed', description: String(e?.message || e), variant: 'destructive' });
                  }
                }}
                disabled={!newMember.full_name || !newMember.branch_id || !emailValid}
              >
                Save
              </Button>
            </div>
            <div className="text-xs text-gray-500">Defaults are applied for required fields; you can complete the profile later in Members.</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Job Dialog */}
      <Dialog open={showCreateJob} onOpenChange={(o) => { setShowCreateJob(o); if (o && !searchTerm) loadDefaultMembers(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Provisioning Job</DialogTitle>
            <DialogDescription>Select a baptized member and create a job.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700">Find member</label>
              <input className="mt-1 w-full border rounded px-2 py-1" placeholder="Search name, email, or phone…" value={searchTerm ?? ''} onChange={(e) => setSearchTerm(e.target.value)} onFocus={() => { if (!searchTerm) loadDefaultMembers(); }} />
            </div>
            <div className="max-h-64 overflow-auto border rounded">
              {(results || []).map(m => (
                <button key={m.id} type="button" className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-50 ${selectedMember?.id === m.id ? 'bg-blue-50' : ''}`} onClick={() => setSelectedMember(m)}>
                  <Avatar className="h-6 w-6"><AvatarImage src={m.profile_photo || undefined} alt={m.full_name} /><AvatarFallback>{m.full_name?.[0] || '?'}</AvatarFallback></Avatar>
                  <span className="font-medium">{m.full_name}</span>
                  <span className="text-xs text-gray-600">{m.email || m.id} · {m.membership_level || 'unknown'}</span>
                </button>
              ))}
              {results.length === 0 && (
                <div className="p-3 text-sm text-gray-600 space-y-2">
                  <div>No members found.</div>
                  <div className="flex items-center gap-3">
                    <button className="text-blue-600 hover:underline" type="button" onClick={() => { loadDefaultMembers(); }}>Load baptized list</button>
                    <button className="text-blue-600 hover:underline" type="button" onClick={() => { setShowCreateMember(true); setShowCreateJob(false); }}>Create a new member</button>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-sm text-gray-700">Delivery method</label>
                <select className="mt-1 w-full border rounded px-2 py-1" value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as any)}>
                  <option value="invite">Invite link</option>
                  <option value="temp_password">Temp password</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-700">Type</label>
                <select className="mt-1 w-full border rounded px-2 py-1" value={newType} onChange={(e) => setNewType(e.target.value as any)}>
                  <option value="admin_initiated">Admin initiated</option>
                  <option value="auto_baptized">Auto (baptized)</option>
                </select>
              </div>
            </div>
            {selectedMember && deliveryMethod === 'invite' && !selectedMember.email && (
              <div className="text-xs text-red-600">Selected member has no email; switch to Temp password or add an email.</div>
            )}
            {selectedMember && !isBaptizedLevel(selectedMember.membership_level) && (
              <div className="text-xs text-amber-700">Provisioning allowed only for baptized members.</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" type="button" onClick={() => setShowCreateJob(false)}>Cancel</Button>
              <Button type="button" onClick={async () => { await createJob(); if (!creating) setShowCreateJob(false); }} disabled={creating || !selectedMember?.id || (deliveryMethod === 'invite' && !selectedMember?.email)}>Create Job</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
