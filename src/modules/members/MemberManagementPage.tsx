import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
// Note: useAuthContext not needed - forms handle their own branch scoping
import { useBranches } from '@/hooks/useBranches';
import { useMembers } from './hooks/useMembers';
import { useFirstTimers } from './hooks/useFirstTimers';
import { useMemberFilters } from './hooks/useMemberFilters';
import { useMemberActions } from './hooks/useMemberActions';
import { MemberStats } from './components/MemberStats';
import { TabNavigation } from './components/TabNavigation';
import { MemberToolbar } from './components/MemberToolbar';
import { MemberTable } from './components/MemberTable';
import { FirstTimerTable } from './components/FirstTimerTable';
import { MemberFormDialog } from './components/dialogs/MemberFormDialog';
import { ConvertFormDialog } from './components/dialogs/ConvertFormDialog';
import { FirstTimerFormDialog } from './components/dialogs/FirstTimerFormDialog';
import { MemberImportDialog } from '@/components/admin/MemberImportDialog';
import { SendNotificationDialog } from '@/components/admin/SendNotificationDialog';
import type { Member, FirstTimer } from '@/types/membership';
import type { ConvertFormData } from '@/components/admin/ConvertForm';

export const MemberManagementPage: React.FC = () => {
    const navigate = useNavigate();
    const { branches } = useBranches();

    // Initialize filters
    const filters = useMemberFilters();

    // Fetch data using hooks
    const { members, loading: membersLoading, reload: reloadMembers } = useMembers({
        branchFilter: filters.branchFilter,
        search: filters.search,
    });

    const { firstTimers, loading: firstTimersLoading, reload: reloadFirstTimers } = useFirstTimers({
        branchFilter: filters.branchFilter,
        search: filters.search,
    });

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
    const [selectedFirstTimerIds, setSelectedFirstTimerIds] = useState<string[]>([]);

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
        return branches.find(b => b.id === branchId)?.name || 'Unknown';
    };

    // Action handlers
    const handleAddMember = () => {
        setEditingMember(null);
        setShowMemberForm(true);
    };

    const handleAddConvert = () => {
        setEditingMember({ membershipLevel: 'convert' } as Member);
        setShowConvertForm(true);
    };

    const handleAddFirstTimer = () => {
        setEditingFirstTimer(null);
        setShowFirstTimerForm(true);
    };

    const handleViewMember = (member: Member) => {
        if (member.id) {
            navigate(`/admin/member/${member.id}`);
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

    const handleEditFirstTimer = (firstTimer: FirstTimer) => {
        setEditingFirstTimer(firstTimer);
        setShowFirstTimerForm(true);
    };

    const handleDeleteMember = async (id: string) => {
        if (confirm('Are you sure you want to delete this member?')) {
            await actions.deleteMember(id);
            await reloadMembers();
        }
    };

    const handleDeleteFirstTimer = async (id: string) => {
        if (confirm('Are you sure you want to delete this first-timer?')) {
            await actions.deleteFirstTimer(id);
            await reloadFirstTimers();
        }
    };

    const handleMemberSubmit = async () => {
        setShowMemberForm(false);
        setShowConvertForm(false);
        setEditingMember(null);
        await reloadMembers();
    };

    const handleConvertSubmit = async (data: ConvertFormData) => {
        // Handle convert submission logic here
        setShowConvertForm(false);
        setEditingMember(null);
        await reloadMembers();
    };

    const handleFirstTimerSubmit = async () => {
        setShowFirstTimerForm(false);
        setEditingFirstTimer(null);
        await reloadFirstTimers();
    };

    const loading = membersLoading || firstTimersLoading;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Manage church members and first-time visitors
                </p>
            </div>

            {/* Statistics */}
            <MemberStats stats={stats} loading={loading} />

            {/* Tab Navigation */}
            <TabNavigation
                activeTab={filters.activeTab}
                onTabChange={filters.setActiveTab}
            />

            {/* Toolbar */}
            <MemberToolbar
                search={filters.search}
                onSearchChange={filters.setSearch}
                onAddMember={handleAddMember}
                onAddConvert={handleAddConvert}
                onAddFirstTimer={handleAddFirstTimer}
                onSendMessage={() => setShowSendMessage(true)}
                onImport={() => setShowImportDialog(true)}
                activeTab={filters.activeTab}
                selectedCount={
                    filters.activeTab === 'first_timers'
                        ? selectedFirstTimerIds.length
                        : selectedMemberIds.length
                }
                totalRecipients={selectedMemberIds.length + selectedFirstTimerIds.length}
            />

            {/* Table */}
            {filters.activeTab === 'first_timers' ? (
                <FirstTimerTable
                    firstTimers={filteredFirstTimers}
                    selectedIds={selectedFirstTimerIds}
                    onSelectionChange={setSelectedFirstTimerIds}
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

            {/* Dialogs */}
            <MemberFormDialog
                open={showMemberForm}
                onOpenChange={setShowMemberForm}
                member={editingMember}
                onSubmit={handleMemberSubmit}
            />

            <ConvertFormDialog
                open={showConvertForm}
                onOpenChange={setShowConvertForm}
                convert={editingMember}
                branches={branches}
                onSubmit={handleConvertSubmit}
            />

            <FirstTimerFormDialog
                open={showFirstTimerForm}
                onOpenChange={setShowFirstTimerForm}
                firstTimer={editingFirstTimer}
                onSubmit={handleFirstTimerSubmit}
            />

            <MemberImportDialog
                open={showImportDialog}
                onOpenChange={setShowImportDialog}
                branchId={branches[0]?.id || ''}
                onSuccess={() => {
                    setShowImportDialog(false);
                    reloadMembers();
                }}
            />

            <SendNotificationDialog
                open={showSendMessage}
                onOpenChange={setShowSendMessage}
                recipientIds={[...selectedMemberIds, ...selectedFirstTimerIds]}
                recipientCount={selectedMemberIds.length + selectedFirstTimerIds.length}
                onSuccess={() => {
                    setShowSendMessage(false);
                    setSelectedMemberIds([]);
                    setSelectedFirstTimerIds([]);
                }}
            />
        </div>
    );
};

