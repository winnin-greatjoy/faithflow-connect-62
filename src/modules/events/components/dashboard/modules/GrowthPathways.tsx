import React, { useMemo, useState } from 'react';
import {
  Target,
  Users,
  CheckCircle2,
  Star,
  Timer,
  ChevronRight,
  GraduationCap,
  ArrowUpRight,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Milestone } from '@/modules/events/types/engagement';
import { toast } from 'sonner';
import { useAuthz } from '@/hooks/useAuthz';
import { useParams } from 'react-router-dom';

// Mock Data
const MOCK_MILESTONES: Milestone[] = [
  {
    id: 'm1',
    name: "Believer's Foundation",
    description: 'Core doctrines class',
    targetCount: 100,
    currentCount: 75,
    stage: 'new_believer',
  },
  {
    id: 'm2',
    name: 'Water Baptism',
    description: 'Public declaration of faith',
    targetCount: 50,
    currentCount: 12,
    stage: 'convert',
  },
  {
    id: 'm3',
    name: 'Workforce Induction',
    description: 'Volunteer training',
    targetCount: 30,
    currentCount: 24,
    stage: 'worker',
  },
  {
    id: 'm4',
    name: 'Leadership Summit',
    description: 'Strategic training for leaders',
    targetCount: 20,
    currentCount: 8,
    stage: 'leader',
  },
];

type EnrollmentStatus = 'active' | 'graduated' | 'at_risk';
type Enrollment = {
  id: string;
  memberName: string;
  milestoneId: string;
  status: EnrollmentStatus;
};

const MOCK_ENROLLMENTS: Enrollment[] = [
  { id: 'e1', memberName: 'Amina K.', milestoneId: 'm1', status: 'active' },
  { id: 'e2', memberName: 'Kwesi T.', milestoneId: 'm2', status: 'at_risk' },
  { id: 'e3', memberName: 'Isaac B.', milestoneId: 'm3', status: 'graduated' },
];

export const GrowthPathwaysModule = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollments, setEnrollments] = useState<Enrollment[]>(MOCK_ENROLLMENTS);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [enrollmentForm, setEnrollmentForm] = useState({
    memberName: '',
    milestoneId: MOCK_MILESTONES[0]?.id || '',
  });
  const { hasRole, can, loading: authzLoading } = useAuthz();
  const hasEventContext = Boolean(eventId);
  const canManageGrowth = useMemo(
    () =>
      hasRole('super_admin', 'district_admin', 'admin', 'pastor') ||
      can('events', 'manage') ||
      can('events', 'update'),
    [can, hasRole]
  );
  const actionsDisabled = authzLoading || !canManageGrowth || !hasEventContext;

  const ensureActionAllowed = () => {
    if (!hasEventContext) {
      toast.error('Missing event context. Open Growth Pathways from an event dashboard.');
      return false;
    }
    if (actionsDisabled) {
      toast.error('You do not have permission to manage growth pathways.');
      return false;
    }
    return true;
  };

  const handleOpenEnrollments = () => {
    if (!ensureActionAllowed()) return;
    setShowEnrollmentDialog(true);
  };

  const handleCreateEnrollment = () => {
    if (!ensureActionAllowed()) return;

    if (!enrollmentForm.memberName.trim() || !enrollmentForm.milestoneId) {
      toast.error('Member name and milestone are required.');
      return;
    }

    const newEnrollment: Enrollment = {
      id: `enroll-${Date.now()}`,
      memberName: enrollmentForm.memberName.trim(),
      milestoneId: enrollmentForm.milestoneId,
      status: 'active',
    };

    setEnrollments((prev) => [newEnrollment, ...prev]);
    setEnrollmentForm((prev) => ({ ...prev, memberName: '' }));
    setShowEnrollmentDialog(false);
    toast.success('Enrollment added');
  };

  const totalEnrolled = enrollments.length;
  const totalGraduated = enrollments.filter((item) => item.status === 'graduated').length;
  const totalAtRisk = enrollments.filter((item) => item.status === 'at_risk').length;
  const conversionRate =
    totalEnrolled > 0 ? `${Math.round((totalGraduated / totalEnrolled) * 100)}%` : '0%';

  const FunnelView = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-4">
        {MOCK_MILESTONES.map((milestone, i) => {
          const progress = (milestone.currentCount / milestone.targetCount) * 100;
          return (
            <div key={milestone.id} className="relative">
              <div className="flex items-center gap-6 p-5 rounded-2xl bg-white border border-primary/5 shadow-sm z-10 relative group hover:shadow-md transition-all">
                <div
                  className={cn(
                    'h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-lg',
                    milestone.stage === 'new_believer'
                      ? 'bg-blue-500'
                      : milestone.stage === 'convert'
                        ? 'bg-emerald-500'
                        : milestone.stage === 'worker'
                          ? 'bg-amber-500'
                          : 'bg-primary'
                  )}
                >
                  {milestone.stage === 'leader' ? (
                    <Star className="h-6 w-6" />
                  ) : milestone.stage === 'convert' ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    <Users className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <h5 className="font-black text-foreground text-sm">{milestone.name}</h5>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                        {milestone.description}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-primary/10 bg-primary/5 text-primary text-[9px] font-black uppercase tracking-widest"
                    >
                      {milestone.stage.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress
                      value={progress}
                      className="h-2 flex-1"
                      indicatorClassName={cn(
                        milestone.stage === 'new_believer'
                          ? 'bg-blue-500'
                          : milestone.stage === 'convert'
                            ? 'bg-emerald-500'
                            : milestone.stage === 'worker'
                              ? 'bg-amber-500'
                              : 'bg-primary'
                      )}
                    />
                    <span className="text-[10px] font-black text-muted-foreground whitespace-nowrap">
                      {milestone.currentCount} / {milestone.targetCount}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={actionsDisabled}
                  onClick={() => guardAction(`Opened milestone: ${milestone.name}`)}
                  className="opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              {i < MOCK_MILESTONES.length - 1 && (
                <div className="absolute left-11 top-12 bottom-0 w-0.5 h-12 bg-muted-foreground/20 -z-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-serif font-black tracking-tight text-primary">
            Growth Pathways
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Discipleship & Member Maturity
          </p>
        </div>
        <div className="flex flex-wrap bg-muted/30 p-1 rounded-xl">
          {['overview', 'members', 'curriculum'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              disabled={!hasEventContext}
              className={cn(
                'px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all',
                activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-primary',
                !hasEventContext && 'cursor-not-allowed opacity-60'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Enrolled', count: totalEnrolled, icon: Users, color: 'text-primary' },
          {
            label: 'Graduated',
            count: totalGraduated,
            icon: GraduationCap,
            color: 'text-emerald-500',
          },
          { label: 'At Risk', count: totalAtRisk, icon: Timer, color: 'text-destructive' },
          {
            label: 'Conversion Rate',
            count: conversionRate,
            icon: ArrowUpRight,
            color: 'text-blue-500',
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="p-4 bg-white rounded-[24px] border border-primary/5 shadow-sm flex items-center gap-4"
          >
            <div
              className={cn(
                'h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center',
                stat.color
              )}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-black">{stat.count}</h3>
              <p className="text-[9px] font-bold text-muted-foreground opacity-60 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'overview' && <FunnelView />}
        {activeTab === 'members' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <Users className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Member roster view</p>
            <Button
              variant="link"
              disabled={actionsDisabled}
              onClick={handleOpenEnrollments}
              className="text-xs"
            >
              Manage Enrollments
            </Button>
          </div>
        )}
        {activeTab === 'curriculum' && (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-in fade-in">
            <GraduationCap className="h-12 w-12 mb-4 opacity-20" />
            <p className="font-medium">Class materials & Resources</p>
          </div>
        )}
      </div>

      <Dialog open={showEnrollmentDialog} onOpenChange={setShowEnrollmentDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Enrollments</DialogTitle>
            <DialogDescription>Add members to growth milestones for this event.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Input
              aria-label="Member name"
              placeholder="Member name"
              value={enrollmentForm.memberName}
              onChange={(event) =>
                setEnrollmentForm((prev) => ({ ...prev, memberName: event.target.value }))
              }
            />
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Milestone
              </label>
              <select
                aria-label="Milestone"
                value={enrollmentForm.milestoneId}
                onChange={(event) =>
                  setEnrollmentForm((prev) => ({ ...prev, milestoneId: event.target.value }))
                }
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {MOCK_MILESTONES.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    {milestone.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded-xl max-h-48 overflow-auto">
            {enrollments.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No enrollments yet.</div>
            ) : (
              <ul className="divide-y">
                {enrollments.map((item) => (
                  <li key={item.id} className="p-3 flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold">{item.memberName}</p>
                      <p className="text-xs text-muted-foreground">
                        {MOCK_MILESTONES.find((m) => m.id === item.milestoneId)?.name ||
                          'Milestone'}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase tracking-widest">
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEnrollmentDialog(false);
                setEnrollmentForm((prev) => ({ ...prev, memberName: '' }));
              }}
            >
              Close
            </Button>
            <Button onClick={handleCreateEnrollment}>Add Enrollment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
