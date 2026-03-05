import React, { useMemo, useState } from 'react';
import { Heart, MessageCircle, User, Search, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PrayerRequest } from '@/modules/events/types/engagement';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

// Mock Data
const MOCK_REQUESTS: PrayerRequest[] = [
  {
    id: 'p1',
    requestorName: 'Grace Owusu',
    category: 'healing',
    content: 'Requesting prayers for my mother who is undergoing surgery today.',
    timestamp: '12m ago',
    status: 'open',
    isPrivate: false,
    prayedCount: 12,
  },
  {
    id: 'p2',
    requestorName: 'Daniel Appiah',
    category: 'provision',
    content: 'Praying for a breakthrough in a business negotiation this week.',
    timestamp: '45m ago',
    status: 'prayed_for',
    isPrivate: false,
    prayedCount: 45,
  },
  {
    id: 'p3',
    requestorName: 'Anonymous',
    category: 'family',
    content: 'Urgent prayer for family reconciliation and peace.',
    timestamp: '2h ago',
    status: 'open',
    isPrivate: true,
    prayedCount: 5,
  },
  {
    id: 'p4',
    requestorName: 'Mercy Darko',
    category: 'salvation',
    content: 'Praying for my brother to accept Christ.',
    timestamp: '3h ago',
    status: 'open',
    isPrivate: false,
    prayedCount: 8,
  },
];

export const PrayerManagerModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('wall');
  const [requests, setRequests] = useState<PrayerRequest[]>(MOCK_REQUESTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [requestorName, setRequestorName] = useState('');
  const [requestCategory, setRequestCategory] = useState<PrayerRequest['category']>('other');
  const [isPrivateRequest, setIsPrivateRequest] = useState(false);
  const [showTestimonyDialog, setShowTestimonyDialog] = useState(false);
  const [testimonyForm, setTestimonyForm] = useState({
    name: '',
    content: '',
  });
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManagePrayer = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManagePrayer || !hasEventContext;

  const ensureActionAllowed = () => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Prayer Manager from an event dashboard.');
      return false;
    }
    if (actionsDisabled) {
      toast.error('You do not have permission to manage prayer actions.');
      return false;
    }
    return true;
  };

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((request) =>
      [request.requestorName, request.content, request.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [requests, searchQuery]);

  const handlePrayNow = (requestId: string) => {
    if (!ensureActionAllowed()) return;

    setRequests((prev) =>
      prev.map((request) =>
        request.id === requestId
          ? {
              ...request,
              prayedCount: request.prayedCount + 1,
              status: 'prayed_for',
            }
          : request
      )
    );
    toast.success('Prayer acknowledgement sent');
  };

  const handleShareTestimony = () => {
    if (!ensureActionAllowed()) return;
    setShowTestimonyDialog(true);
  };

  const handleSaveTestimony = () => {
    if (!ensureActionAllowed()) return;

    if (!testimonyForm.content.trim()) {
      toast.error('Testimony content is required.');
      return;
    }

    const testimony: PrayerRequest = {
      id: `testimony-${Date.now()}`,
      requestorName: testimonyForm.name.trim() || 'Anonymous',
      category: 'other',
      content: testimonyForm.content.trim(),
      timestamp: 'Just now',
      status: 'testimony_shared',
      prayedCount: 0,
      isPrivate: false,
    };

    setRequests((prev) => [testimony, ...prev]);
    setShowTestimonyDialog(false);
    setTestimonyForm({ name: '', content: '' });
    toast.success('Testimony shared successfully');
  };

  const handlePostRequest = () => {
    if (!ensureActionAllowed()) return;

    if (!message.trim()) {
      toast.error('Prayer request message is required.');
      return;
    }

    const request: PrayerRequest = {
      id: `request-${Date.now()}`,
      requestorName: requestorName.trim() || 'Anonymous',
      category: requestCategory,
      content: message.trim(),
      timestamp: 'Just now',
      status: 'open',
      prayedCount: 0,
      isPrivate: isPrivateRequest,
    };

    setRequests((prev) => [request, ...prev]);
    setMessage('');
    setRequestorName('');
    setRequestCategory('other');
    setIsPrivateRequest(false);
    toast.success('Prayer request posted');
  };

  const PrayerWallView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-40" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search prayer requests..."
            className="pl-10 h-11 rounded-2xl border-primary/5 bg-white shadow-sm font-medium"
          />
        </div>
        <Button
          disabled={actionsDisabled}
          onClick={handleShareTestimony}
          className="h-11 px-6 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 font-black text-[10px] uppercase tracking-widest w-full md:w-auto"
        >
          <Sparkles className="h-4 w-4 mr-2" /> Share Testimony
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req) => (
          <Card
            key={req.id}
            className="p-5 rounded-[24px] bg-white border border-primary/5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-black text-sm">
                  {req.isPrivate ? (
                    <User className="h-5 w-5 opacity-50" />
                  ) : (
                    req.requestorName.charAt(0)
                  )}
                </div>
                <div>
                  <h5 className="font-black text-sm">{req.requestorName}</h5>
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-2 bg-muted text-muted-foreground border-none font-bold uppercase tracking-widest mt-1"
                  >
                    {req.category}
                  </Badge>
                </div>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground opacity-40">
                {req.timestamp}
              </span>
            </div>

            <p className="text-sm font-medium text-foreground/80 leading-relaxed mb-6 pl-13">
              "{req.content}"
            </p>

            <div className="flex items-center justify-between border-t border-primary/5 pt-4">
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                <Heart className="h-4 w-4 fill-emerald-100" />
                <span>{req.prayedCount} Prayed</span>
              </div>
              <Button
                size="sm"
                disabled={actionsDisabled}
                onClick={() => handlePrayNow(req.id)}
                className="h-8 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white font-black text-[9px] uppercase tracking-widest"
              >
                Pray Now
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-destructive">
            Prayer Wall
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Intercession & Testimonies
          </p>
        </div>
        <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
          {['wall', 'my-requests', 'intercessors'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={!hasEventContext}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-destructive shadow-sm'
                  : 'text-muted-foreground hover:text-destructive'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 min-h-[500px]">
          {activeTab === 'wall' && <PrayerWallView />}
          {activeTab === 'my-requests' && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
              <MessageCircle className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">You haven't posted any requests yet.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6 bg-destructive rounded-[32px] text-white border-none shadow-2xl shadow-destructive/20 text-center">
            <h4 className="text-lg font-serif font-black mb-2">Need Prayer?</h4>
            <p className="text-xs font-medium opacity-80 mb-6">
              Share your request with the community or privately with our intercessors.
            </p>
            <Textarea
              aria-label="Prayer request message"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Type your prayer request here..."
              className="bg-white/10 border-none text-white placeholder:text-white/50 resize-none h-32 rounded-xl mb-4 text-sm"
            />
            <Input
              aria-label="Requestor name"
              value={requestorName}
              onChange={(event) => setRequestorName(event.target.value)}
              placeholder="Your name (optional)"
              className="bg-white/10 border-none text-white placeholder:text-white/60 h-10 rounded-xl mb-3"
            />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select
                aria-label="Request category"
                value={requestCategory}
                onChange={(event) =>
                  setRequestCategory(event.target.value as PrayerRequest['category'])
                }
                className="flex h-10 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-1 text-sm text-white"
              >
                <option value="healing">Healing</option>
                <option value="provision">Provision</option>
                <option value="guidance">Guidance</option>
                <option value="salvation">Salvation</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
              <label className="h-10 rounded-xl bg-white/10 border border-white/20 px-3 flex items-center gap-2 text-xs font-semibold text-white">
                <input
                  aria-label="Private request"
                  type="checkbox"
                  checked={isPrivateRequest}
                  onChange={(event) => setIsPrivateRequest(event.target.checked)}
                />
                Private
              </label>
            </div>
            <Button
              disabled={actionsDisabled}
              onClick={handlePostRequest}
              className="w-full bg-white text-destructive hover:bg-white/90 font-black text-xs h-10 rounded-xl uppercase tracking-widest"
            >
              Post Request
            </Button>
          </Card>

          <Card className="p-6 bg-white rounded-[32px] border-none shadow-xl shadow-primary/5">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <h4 className="text-sm font-black uppercase tracking-widest">Testimony Spotlight</h4>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-medium text-amber-900 leading-relaxed italic mb-2">
                "I requested prayer for my exam last week and I'm happy to report I passed with
                distinction! God is good!"
              </p>
              <p className="text-[10px] font-black text-amber-600 uppercase text-right">
                - Sarah K.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={showTestimonyDialog} onOpenChange={setShowTestimonyDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Testimony</DialogTitle>
            <DialogDescription>
              Encourage the prayer wall with a verified testimony.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input
              aria-label="Testimony name"
              placeholder="Name (optional)"
              value={testimonyForm.name}
              onChange={(event) =>
                setTestimonyForm((prev) => ({ ...prev, name: event.target.value }))
              }
            />
            <Textarea
              aria-label="Testimony content"
              placeholder="Share what God has done..."
              value={testimonyForm.content}
              onChange={(event) =>
                setTestimonyForm((prev) => ({ ...prev, content: event.target.value }))
              }
              className="min-h-28"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowTestimonyDialog(false);
                setTestimonyForm({ name: '', content: '' });
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveTestimony}>Post Testimony</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
