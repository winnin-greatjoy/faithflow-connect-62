// src/modules/bible-school/components/ProgramCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Calendar, MapPin } from 'lucide-react';
import type { BibleProgram } from '../types';

interface ProgramCardProps {
    program: BibleProgram;
    enrolledCount?: number;
    onApply?: (programId: string) => void;
    onViewDetails?: (programId: string) => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({
    program,
    enrolledCount = 0,
    onApply,
    onViewDetails,
}) => {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            {program.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Level {program.level_order} • {program.duration_weeks} weeks
                        </CardDescription>
                    </div>
                    {program.is_centralized ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <MapPin className="h-3 w-3 mr-1" />
                            Central
                        </Badge>
                    ) : (
                        <Badge variant="outline">Branch-Level</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {program.description && (
                    <p className="text-sm text-muted-foreground">{program.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {program.duration_weeks} weeks
                    </div>
                    <div className="flex items-center gap-1">
                        {enrolledCount > 0 && (
                            <span className="text-primary font-medium">{enrolledCount} enrolled</span>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    {onApply && (
                        <Button onClick={() => onApply(program.id)} size="sm" className="flex-1">
                            Apply Now
                        </Button>
                    )}
                    {onViewDetails && (
                        <Button
                            onClick={() => onViewDetails(program.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                        >
                            View Details
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
