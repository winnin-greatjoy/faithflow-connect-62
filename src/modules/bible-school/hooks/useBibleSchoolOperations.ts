// src/modules/bible-school/hooks/useBibleSchoolOperations.ts
// Hook for Bible School operations via Edge Function
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useBibleSchoolOperations() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const callOperation = async (command: string, payload: any) => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('Not authenticated');
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/bible-school-operations`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ command, payload }),
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Operation failed');
            }

            const result = await response.json();
            return { success: true, data: result };
        } catch (error: any) {
            console.error(`${command} error:`, error);
            toast({
                title: 'Operation Failed',
                description: error.message,
                variant: 'destructive',
            });
            return { success: false, error: error.message };
        } finally {
            setLoading(false);
        }
    };

    // Application operations
    const applyToBibleSchool = async (programId: string, remarks?: string, pastorRecommendation?: string) => {
        return await callOperation('APPLY_BIBLE_SCHOOL', {
            programId,
            remarks,
            pastorRecommendation,
        });
    };

    const approveApplication = async (applicationId: string, approved: boolean, remarks?: string) => {
        return await callOperation('APPROVE_APPLICATION', {
            applicationId,
            approved,
            remarks,
        });
    };

    // Enrollment operations
    const enrollStudent = async (memberId: string, cohortId: string) => {
        return await callOperation('ENROLL_STUDENT', {
            memberId,
            cohortId,
        });
    };

    // Attendance operations
    const recordAttendance = async (
        lessonId: string,
        studentId: string,
        cohortId: string,
        status: string,
        remarks?: string
    ) => {
        return await callOperation('RECORD_ATTENDANCE', {
            lessonId,
            studentId,
            cohortId,
            status,
            remarks,
        });
    };

    // Exam operations
    const gradeExam = async (
        examId: string,
        studentId: string,
        cohortId: string,
        score: number,
        remarks?: string
    ) => {
        return await callOperation('GRADE_EXAM', {
            examId,
            studentId,
            cohortId,
            score,
            remarks,
        });
    };

    // Promotion operations
    const promoteStudent = async (studentId: string, toProgramId: string, remarks?: string) => {
        return await callOperation('PROMOTE_STUDENT', {
            studentId,
            toProgramId,
            remarks,
        });
    };

    // Graduation operations
    const graduateStudent = async (
        studentId: string,
        programId: string,
        cohortId: string,
        graduationDate?: string
    ) => {
        return await callOperation('GRADUATE_STUDENT', {
            studentId,
            programId,
            cohortId,
            graduationDate,
        });
    };

    return {
        loading,
        applyToBibleSchool,
        approveApplication,
        enrollStudent,
        recordAttendance,
        gradeExam,
        promoteStudent,
        graduateStudent,
    };
}
