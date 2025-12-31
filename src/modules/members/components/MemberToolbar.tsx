// src/modules/members/components/MemberToolbar.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Mail, ArrowRightLeft, Upload, Search, FileDown } from 'lucide-react';

interface MemberToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onAddMember: () => void;
    onAddConvert: () => void;
    onAddFirstTimer: () => void;
    onSendMessage?: () => void;
    onBatchTransfer?: () => void;
    onImport?: () => void;
    activeTab: string;
    selectedCount: number;
    totalRecipients: number;
}

export const MemberToolbar: React.FC<MemberToolbarProps> = ({
    search,
    onSearchChange,
    onAddMember,
    onAddConvert,
    onAddFirstTimer,
    onSendMessage,
    onBatchTransfer,
    onImport,
    activeTab,
    selectedCount,
    totalRecipients,
}) => {
    const getAddButtonText = () => {
        if (activeTab === 'converts') return 'Add Convert';
        return 'Add Member';
    };

    const getAddHandler = () => {
        if (activeTab === 'converts') return onAddConvert;
        return onAddMember;
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                {onSendMessage && (
                    <Button
                        onClick={onSendMessage}
                        disabled={totalRecipients === 0}
                        variant="outline"
                        className="hidden sm:inline-flex"
                    >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Message {totalRecipients > 0 ? `(${totalRecipients})` : ''}
                    </Button>
                )}

                {onBatchTransfer && selectedCount > 0 && (
                    <Button
                        variant="outline"
                        onClick={onBatchTransfer}
                        className="hidden sm:inline-flex"
                    >
                        <ArrowRightLeft className="h-4 w-4 mr-2" />
                        Transfer ({selectedCount})
                    </Button>
                )}

                {onImport && (
                    <Button
                        variant="outline"
                        onClick={onImport}
                        className="hidden sm:inline-flex"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                    </Button>
                )}

                {/* Download Registration Form */}
                <Button
                    variant="outline"
                    onClick={() => window.open('/member-registration-form.html', '_blank')}
                    className="hidden sm:inline-flex"
                    title="Download printable member registration form"
                >
                    <FileDown className="h-4 w-4 mr-2" />
                    Print Form
                </Button>

                <Button onClick={getAddHandler()}>
                    <Plus className="h-4 w-4 mr-2" />
                    {getAddButtonText()}
                </Button>
            </div>
        </div>
    );
};
