// src/modules/bible-school/components/CohortCard.tsx
// Clickable card for cohort display (replaces CohortTable)
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, MapPin, Play, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Cohort {
    id: string;
    cohort_name: string;
    program_id: string;
    branch_id: string;
    start_date: string;
    end_date: string;
    status: string;
    max_students?: number;
}

interface CohortCardProps {
    cohort: Cohort;
    programName: string;
    branchName: string;
    onClick?: (cohort: Cohort) => void;
    onActivate?: (cohort: Cohort) => void;
    onComplete?: (cohort: Cohort) => void;
    onCancel?: (cohort: Cohort) => void;
    showActions?: boolean;
}

export const CohortCard: React.FC<CohortCardProps> = ({
    cohort,
    programName,
    branchName,
    onClick,
    onActivate,
    onComplete,
    onCancel,
    showActions = true,
}) => {
    const handleClick = () => {
        if (onClick) {
            onClick(cohort);
        }
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            planned: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            active: 'bg-green-100 text-green-800 border-green-300',
            completed: 'bg-blue-100 text-blue-800 border-blue-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300',
        };
        return (
            <Badge className={`${variants[status] || 'bg-gray-100'} border`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50 group"
            onClick={handleClick}
        >
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {cohort.cohort_name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{programName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {getStatusBadge(cohort.status)}
                        {showActions && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    {cohort.status === 'planned' && onActivate && (
                                        <DropdownMenuItem onClick={() => onActivate(cohort)}>
                                            <Play className="mr-2 h-4 w-4" />
                                            Activate Cohort
                                        </DropdownMenuItem>
                                    )}
                                    {cohort.status === 'active' && onComplete && (
                                        <DropdownMenuItem onClick={() => onComplete(cohort)}>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Mark Complete
                                        </DropdownMenuItem>
                                    )}
                                    {(cohort.status === 'planned' || cohort.status === 'active') && onCancel && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                onClick={() => onCancel(cohort)}
                                                className="text-red-600"
                                            >
                                                <XCircle className="mr-2 h-4 w-4" />
                                                Cancel Cohort
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(cohort.start_date)} - {formatDate(cohort.end_date)}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {branchName}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Max: {cohort.max_students || 'Unlimited'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
