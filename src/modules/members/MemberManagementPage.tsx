import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Note: useAuthContext not needed - forms handle their own branch scoping
import { useBranches } from '@/hooks/useBranches';
import { useMembers } from './hooks/useMembers';
import { useMemberFilters } from './hooks/useMemberFilters';
import { useMemberActions } from './hooks/useMemberActions';
import { MemberStats } from './components/MemberStats';
import { TabNavigation } from './components/TabNavigation';
import { MemberToolbar } from './components/MemberToolbar';
import { MemberTable } from './components/MemberTable';
import { MemberFormDialog } from './components/dialogs/MemberFormDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, UserPlus, Send, ArrowDownToLine, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConvertFormDialog } from './components/dialogs/ConvertFormDialog';
import { FirstTimerFormDialog } from './components/dialogs/FirstTimerFormDialog';
import { MemberImportDialog } from '@/components/admin/MemberImportDialog';
import { SendNotificationDialog } from '@/components/admin/SendNotificationDialog';
import { SpecializedMemberTable } from './components/SpecializedMemberTable';
import { FirstTimerTable } from '@/components/departments/FirstTimerTable';
import { useFirstTimers } from '@/hooks/useFirstTimers';
import type { Member, FirstTimer } from '@/types/membership';
import type { ConvertFormData } from '@/components/admin/ConvertForm';

export const MemberManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { branches } = useBranches();

  // Initialize filters
  const filters = useMemberFilters();

  // Fetch data using hooks
  const {
    members,
    loading: membersLoading,
    reload: reloadMembers,
  } = useMembers({
    branchFilter: filters.branchFilter,
    search: filters.search,
  });

  const {
    firstTimers,
    loading: firstTimersLoading,
    updateFirstTimer,
    deleteFirstTimer,
  } = useFirstTimers(filters.branchFilter !== 'all' ? filters.branchFilter : undefined);

  // CRUD actions
  const actions = useMemberActions();

  // Dialog state
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [showFirstTimerForm, setShowFirstTimerForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showSendMessage, setShowSendMessage] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [editingFirstTimer, setEditingFirstTimer] = useState<FirstTimer | null>(null);

  // Selection state for batch operations
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Filter members and first-timers
  const filteredMembers = useMemo(
    () => filters.getFilteredMembers(members),
    [members, filters.getFilteredMembers]
  );

  const filteredFirstTimers = useMemo(
    () => filters.getFilteredFirstTimers(firstTimers),
    [firstTimers, filters.getFilteredFirstTimers]
  );

  // Calculate statistics
  const stats = useMemo(
    () => filters.calculateStats(members, firstTimers),
    [members, firstTimers, filters.calculateStats]
  );

  // Branch lookup helper
  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name || 'Unknown';
  };

  // Action handlers
  const handleAddMember = () => {
    setEditingMember(null);
    if (filters.activeTab === 'converts') {
      setShowConvertForm(true);
    } else if (filters.activeTab === 'first_timers') {
      setEditingFirstTimer(null);
      setShowFirstTimerForm(true);
    } else {
      setShowMemberForm(true);
    }
  };

  const handleAddConvert = () => {
    setEditingMember({ membershipLevel: 'convert' } as Member);
    setShowConvertForm(true);
  };

  const handleViewMember = (member: Member) => {
    if (member.id) {
      navigate(`/admin/member/${member.id}`);
    }
  };

  const handleEditFirstTimer = (ft: any) => {
    setEditingFirstTimer(ft);
    setShowFirstTimerForm(true);
  };

  const handleDeleteFirstTimer = async (id: string) => {
    if (confirm('Are you sure you want to delete this first-timer?')) {
      await deleteFirstTimer({ id });
    }
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    if (member.membershipLevel === 'convert') {
      setShowConvertForm(true);
    } else {
      setShowMemberForm(true);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm('Are you sure you want to delete this member?')) {
      await actions.deleteMember(id);
      await reloadMembers();
    }
  };

  const handleMemberSubmit = async (formData: any) => {
    // Transform camelCase form data to snake_case for database
    // Note: Only include fields that exist in the 'members' table
    const dbData: Record<string, any> = {
      full_name: formData.fullName,
      profile_photo: formData.profilePhoto || null,
      date_of_birth: formData.dateOfBirth || null,
      gender: formData.gender || null,
      marital_status: formData.maritalStatus || null,
      spouse_name: formData.spouseName || null,
      number_of_children: formData.numberOfChildren || 0,
      email: formData.email || null,
      phone: formData.phone || null,
      community: formData.community || null,
      area: formData.area || null,
      street: formData.street || null,
      public_landmark: formData.publicLandmark || null,
      branch_id: formData.branchId || null,
      membership_level: formData.membershipLevel || 'visitor',
      baptized_sub_level: formData.baptizedSubLevel || null,
      leader_role: formData.leaderRole || null,
      baptism_date: formData.baptismDate || null,
      date_joined: formData.joinDate || new Date().toISOString().split('T')[0],
      baptism_officiator: formData.baptismOfficiator || null,
      spiritual_mentor: formData.spiritualMentor || null,
      assigned_department: formData.assignedDepartment || null,
      discipleship_class_1: formData.discipleshipClass1 || false,
      discipleship_class_2: formData.discipleshipClass2 || false,
      discipleship_class_3: formData.discipleshipClass3 || false,
      status: formData.status || 'active',
      last_attendance: formData.lastAttendance || null,
      prayer_needs: formData.prayerNeeds || null,
      pastoral_notes: formData.pastoralNotes || null,
    };

    // For create operation, include account creation and children data
    const createData = {
      ...dbData,
      createAccount: formData.createAccount,
      username: formData.username,
      password: formData.password,
      children: formData.children,
    };

    let result;
    if (editingMember?.id) {
      // For update, only send DB-compatible fields
      result = await actions.updateMember(editingMember.id, dbData);
    } else {
      // For create, include account and children data
      result = await actions.createMember(createData);
    }

    if (result.success) {
      setShowMemberForm(false);
      setShowConvertForm(false);
      setEditingMember(null);
      await reloadMembers();
    }
  };

  const handleConvertSubmit = async (formData: ConvertFormData) => {
    // Transform to DB schema (similar to handleMemberSubmit but specific to converts)
    const dbData = {
      full_name: formData.fullName,
      phone: formData.phone || null,
      email: formData.email || null,
      community: formData.community || null,
      area: formData.area || null,
      branch_id: formData.branchId,
      membership_level: 'convert',
      status: 'active',
      date_joined: new Date().toISOString().split('T')[0],
    };

    let result;
    if (editingMember?.id) {
      result = await actions.updateMember(editingMember.id, dbData);
    } else {
      result = await actions.createMember(dbData);
    }

    if (result.success) {
      setShowConvertForm(false);
      setEditingMember(null);
      await reloadMembers();
    }
  };

  const handleStatClick = (type: string) => {
    if (type === 'first_timers') {
      filters.setActiveTab('first_timers');
      return;
    }

    // Map stat type to tab
    const tabMap: Record<string, any> = {
      members: 'all',
      workers: 'workers',
      disciples: 'disciples',
      leaders: 'leaders',
      converts: 'converts',
    };

    if (tabMap[type]) {
      filters.setActiveTab(tabMap[type]);
    }
  };

  const loading = membersLoading;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-foreground">
            Member <span className="text-primary">Intelligence</span>
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary opacity-60" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest leading-none">
              Global Roster • Digital Records • Community Analytics
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowImportDialog(true)}
            variant="outline"
            className="glass h-11 px-5 rounded-xl font-semibold border-primary/20 hover:bg-primary/5 transition-all text-xs"
          >
            <ArrowDownToLine className="mr-2 h-4 w-4 text-primary" /> Import Matrix
          </Button>
          {filters.activeTab !== 'first_timers' && (
            <Button
              onClick={handleAddMember}
              className="bg-vibrant-gradient h-11 px-6 rounded-xl font-bold text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all text-xs"
            >
              {filters.activeTab === 'converts' ? (
                <>
                  <Plus className="mr-2 h-4 w-4" /> Add Convert
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" /> Enlist Member
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Statistics */}
      <motion.div variants={itemVariants}>
        <MemberStats stats={stats} loading={loading} onCardClick={handleStatClick} />
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Tab Navigation */}
          {/* <div className="w-full lg:w-auto">
                        <TabNavigation
                            activeTab={filters.activeTab}
                            onTabChange={filters.setActiveTab}
                        />
                    </div> */}

          {/* Toolbar Search/Actions */}
          <div className="flex-1">
            <MemberToolbar
              search={filters.search}
              onSearchChange={filters.setSearch}
              onAddMember={handleAddMember}
              onAddConvert={handleAddConvert}
              onSendMessage={() => setShowSendMessage(true)}
              onImport={() => setShowImportDialog(true)}
              activeTab={filters.activeTab}
              selectedCount={selectedMemberIds.length}
              totalRecipients={selectedMemberIds.length}
            />
          </div>
        </div>

        {/* Table */}
        <div className="glass border-primary/5 rounded-[2rem] overflow-hidden shadow-xl">
          {filters.activeTab === 'disciples' ||
          filters.activeTab === 'leaders' ||
          filters.activeTab === 'converts' ? (
            <SpecializedMemberTable
              members={filteredMembers}
              type={
                filters.activeTab === 'disciples'
                  ? 'disciple'
                  : filters.activeTab === 'leaders'
                    ? 'leader'
                    : 'convert'
              }
              selectedIds={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
              onView={handleViewMember}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              getBranchName={getBranchName}
            />
          ) : filters.activeTab === 'first_timers' ? (
            <FirstTimerTable
              firstTimers={filteredFirstTimers}
              selectedIds={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
              onEdit={handleEditFirstTimer}
              onDelete={handleDeleteFirstTimer}
              getBranchName={getBranchName}
            />
          ) : (
            <MemberTable
              members={filteredMembers}
              selectedIds={selectedMemberIds}
              onSelectionChange={setSelectedMemberIds}
              onView={handleViewMember}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              getBranchName={getBranchName}
            />
          )}
        </div>
      </motion.div>

      {/* Dialogs */}
      <MemberFormDialog
        key="member-form-dialog"
        open={showMemberForm}
        onOpenChange={setShowMemberForm}
        member={editingMember}
        onSubmit={handleMemberSubmit}
      />

      <ConvertFormDialog
        key="convert-form-dialog"
        open={showConvertForm}
        onOpenChange={setShowConvertForm}
        convert={editingMember}
        branches={branches}
        onSubmit={handleConvertSubmit}
      />

      <FirstTimerFormDialog
        key="first-timer-form-dialog"
        open={showFirstTimerForm}
        onOpenChange={setShowFirstTimerForm}
        firstTimer={editingFirstTimer}
        onSubmit={() => {
          setShowFirstTimerForm(false);
        }}
      />

      <MemberImportDialog
        key="member-import-dialog"
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        branchId={branches[0]?.id || ''}
        onSuccess={() => {
          setShowImportDialog(false);
          reloadMembers();
        }}
      />

      <SendNotificationDialog
        key="send-notification-dialog"
        open={showSendMessage}
        onOpenChange={setShowSendMessage}
        recipientIds={selectedMemberIds}
        recipientCount={selectedMemberIds.length}
        onSuccess={() => {
          setShowSendMessage(false);
          setSelectedMemberIds([]);
        }}
      />
    </motion.div>
  );
};
