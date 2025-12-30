// src/modules/members/components/TabNavigation.tsx
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TabType } from '../types';

interface TabNavigationProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    return (
        <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as TabType)}>
            <TabsList className="mb-4">
                <TabsTrigger value="all">All Members</TabsTrigger>
                <TabsTrigger value="workers">Workers</TabsTrigger>
                <TabsTrigger value="disciples">Disciples</TabsTrigger>
                <TabsTrigger value="leaders">Leaders</TabsTrigger>
                <TabsTrigger value="pastors">Pastors</TabsTrigger>
                <TabsTrigger value="converts">Converts</TabsTrigger>
            </TabsList>
        </Tabs>
    );
};
