import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

export const ProfilePage: React.FC = () => {
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data } = await supabase
          .from('profiles')
          .select('first_name, last_name, phone, profile_photo')
          .eq('id', user.id)
          .maybeSingle();
        if (data) {
          setForm({ first_name: data.first_name || '', last_name: data.last_name || '', phone: data.phone || '' });
          setPhotoUrl((data as any).profile_photo || null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      if (!form.first_name.trim() || !form.last_name.trim()) {
        toast({ title: 'Validation', description: 'First and last name are required.', variant: 'destructive' });
        setSaving(false);
        return;
      }
      const { error } = await supabase
        .from('profiles')
        .update({ first_name: form.first_name.trim(), last_name: form.last_name.trim(), phone: form.phone.trim() })
        .eq('id', user.id);
      if (error) {
        toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Saved', description: 'Profile updated.' });
      }
    }
    setSaving(false);
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 2MB.', variant: 'destructive' });
      return;
    }
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from('profile-photos').upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      toast({ title: 'Upload failed', description: upErr.message, variant: 'destructive' });
      setUploading(false);
      return;
    }
    const { data: pub } = supabase.storage.from('profile-photos').getPublicUrl(path);
    const publicUrl = pub?.publicUrl || null;
    if (publicUrl) {
      await supabase.from('profiles').update({ profile_photo: publicUrl }).eq('id', user.id);
      setPhotoUrl(publicUrl);
      toast({ title: 'Photo updated' });
    }
    setUploading(false);
  };

  if (loading) return <div>Loading…</div>;

  return (
    <Card className="p-4 space-y-4">
      <div className="text-lg font-semibold">My Profile</div>
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={photoUrl || undefined} alt={form.first_name} />
          <AvatarFallback>{(form.first_name || email)?.[0] || '?'}</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef as any} type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : 'Change Photo'}
          </Button>
          {photoUrl && (
            <Button variant="ghost" size="sm" onClick={() => setPhotoUrl(null)}>Remove</Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>First name</Label>
          <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
        </div>
        <div>
          <Label>Last name</Label>
          <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} disabled />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>
      <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</Button>
    </Card>
  );
}
