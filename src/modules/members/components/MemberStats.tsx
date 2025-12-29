// src/modules/members/components/MemberStats.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Award, Crown, User } from 'lucide-react';
import type { MemberStats as StatsType } from '../types';

interface MemberStatsProps {
    stats: StatsType;
    loading?: boolean;
}

export const MemberStats: React.FC<MemberStatsProps> = ({ stats, loading }) => {
    const statCards = [
        {
            icon: Users,
            label: 'Total Members',
            value: stats.totalMembers,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            icon: UserCheck,
            label: 'Workers',
            value: stats.workers,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            icon: Award,
            label: 'Disciples',
            value: stats.disciples,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            icon: Crown,
            label: 'Leaders',
            value: stats.leaders,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            icon: User,
            label: 'Converts',
            value: stats.converts,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
        },
        {
            icon: Users,
            label: 'First Timers',
            value: stats.firstTimers,
            color: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                {statCards.map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardContent className="p-4">
                            <div className="h-12 bg-gray-200 rounded"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            {statCards.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-full ${stat.bgColor}`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
