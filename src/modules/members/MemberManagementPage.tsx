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
import { ConvertFormDialog } from './components/dialogs/ConvertFormDialog';
import { MemberImportDialog } from '@/components/admin/MemberImportDialog';
import { SendNotificationDialog } from '@/components/admin/SendNotificationDialog';
import type { Member } from '@/types/membership';
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

    // CRUD actions
    const actions = useMemberActions();

    // Dialog state
    const [showMemberForm, setShowMemberForm] = useState(false);
    const [showConvertForm, setShowConvertForm] = useState(false);
    const [showImportDialog, setShowImportDialog] = useState(false);
    const [showSendMessage, setShowSendMessage] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);

    // Selection state for batch operations
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

    // Filter members and first-timers
    const filteredMembers = useMemo(
        () => filters.getFilteredMembers(members),
        [members, filters.getFilteredMembers]
    );

    // Calculate statistics
    const stats = useMemo(
        () => filters.calculateStats(members, []),
        [members, filters.calculateStats]
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

    const handleConvertSubmit = async (data: ConvertFormData) => {
        // Handle convert submission logic here
        setShowConvertForm(false);
        setEditingMember(null);
        await reloadMembers();
    };



    const loading = membersLoading;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Member Management</h1>
                <p className="text-sm text-gray-600 mt-1">
                    Manage church members
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
                onAddFirstTimer={undefined}
                onSendMessage={() => setShowSendMessage(true)}
                onImport={() => setShowImportDialog(true)}
                activeTab={filters.activeTab}
                selectedCount={selectedMemberIds.length}
                totalRecipients={selectedMemberIds.length}
            />

            {/* Table */}
            <MemberTable
                members={filteredMembers}
                selectedIds={selectedMemberIds}
                onSelectionChange={setSelectedMemberIds}
                onView={handleViewMember}
                onEdit={handleEditMember}
                onDelete={handleDeleteMember}
                getBranchName={getBranchName}
            />

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
                recipientIds={selectedMemberIds}
                recipientCount={selectedMemberIds.length}
                onSuccess={() => {
                    setShowSendMessage(false);
                    setSelectedMemberIds([]);
                }}
            />
        </div>
    );
};

