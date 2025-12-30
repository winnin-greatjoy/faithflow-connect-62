import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BibleSchoolRequest {
    command:
    | 'APPLY_BIBLE_SCHOOL'
    | 'APPROVE_APPLICATION'
    | 'ENROLL_STUDENT'
    | 'RECORD_ATTENDANCE'
    | 'GRADE_EXAM'
    | 'PROMOTE_STUDENT'
    | 'GRADUATE_STUDENT';
    payload: any;
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // Auth validation
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'Missing authorization' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const token = authHeader.replace('Bearer ', '');

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });

        // Verify user
        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: 'Invalid token' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Get profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, role, branch_id, district_id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return new Response(
                JSON.stringify({ error: 'Profile not found' }),
                { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { command, payload }: BibleSchoolRequest = await req.json();

        let result;
        switch (command) {
            case 'APPLY_BIBLE_SCHOOL':
                result = await applyToBibleSchool(supabase, user.id, payload);
                break;
            case 'APPROVE_APPLICATION':
                result = await approveApplication(supabase, profile, payload);
                break;
            case 'ENROLL_STUDENT':
                result = await enrollStudent(supabase, profile, payload);
                break;
            case 'RECORD_ATTENDANCE':
                result = await recordAttendance(supabase, profile, payload);
                break;
            case 'GRADE_EXAM':
                result = await gradeExam(supabase, profile, payload);
                break;
            case 'PROMOTE_STUDENT':
                result = await promoteStudent(supabase, profile, payload);
                break;
            case 'GRADUATE_STUDENT':
                result = await graduateStudent(supabase, profile, payload);
                break;
            default:
                throw new Error(`Unknown command: ${command}`);
        }

        return new Response(
            JSON.stringify(result),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Bible School Error:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

// ============================================
// COMMAND HANDLERS
// ============================================

async function applyToBibleSchool(supabase: any, userId: string, payload: any) {
    const { programId, remarks, pastorRecommendation } = payload;

    // Get member record
    const { data: member } = await supabase
        .from('members')
        .select('id, branch_id')
        .eq('account_id', userId)
        .single();

    if (!member) {
        throw new Error('Member record not found');
    }

    // Check if already applied
    const { data: existing } = await supabase
        .from('bible_applications')
        .select('id')
        .eq('member_id', member.id)
        .eq('program_id', programId)
        .eq('status', 'pending')
        .maybeSingle();

    if (existing) {
        throw new Error('Application already submitted');
    }

    // Create application
    const { data, error } = await supabase
        .from('bible_applications')
        .insert({
            member_id: member.id,
            program_id: programId,
            branch_id: member.branch_id,
            application_letter: remarks,
            pastor_recommendation: pastorRecommendation,
            status: 'pending',
        })
        .select()
        .single();

    if (error) throw error;
    return { success: true, application: data };
}

async function approveApplication(supabase: any, profile: any, payload: any) {
    const { applicationId, approved, remarks } = payload;

    // Get application
    const { data: app } = await supabase
        .from('bible_applications')
        .select('*, program:bible_programs(is_centralized, name)')
        .eq('id', applicationId)
        .single();

    if (!app) throw new Error('Application not found');

    // Check permissions
    const canApprove = checkApprovalPermission(profile, app);
    if (!canApprove) {
        throw new Error('Insufficient permissions to approve this application');
    }

    // Update application
    const { error } = await supabase
        .from('bible_applications')
        .update({
            status: approved ? 'approved' : 'rejected',
            remarks,
            reviewed_by: profile.id,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', applicationId);

    if (error) throw error;

    return { success: true, approved };
}

async function enrollStudent(supabase: any, profile: any, payload: any) {
    const { memberId, cohortId } = payload;

    // Get cohort details
    const { data: cohort } = await supabase
        .from('bible_cohorts')
        .select('*, program:bible_programs(*)')
        .eq('id', cohortId)
        .single();

    if (!cohort) throw new Error('Cohort not found');

    // Check permissions
    if (cohort.program.is_centralized) {
        if (!['district_admin', 'super_admin'].includes(profile.role)) {
            throw new Error('Only central admins can enroll in centralized programs');
        }
    } else {
        if (profile.role === 'branch_admin' && profile.branch_id !== cohort.branch_id) {
            throw new Error('Can only enroll students in your branch');
        }
    }

    // Check if student record exists
    let { data: student } = await supabase
        .from('bible_students')
        .select('id')
        .eq('member_id', memberId)
        .maybeSingle();

    // Create student record if doesn't exist
    if (!student) {
        const { data: newStudent, error: studentError } = await supabase
            .from('bible_students')
            .insert({
                member_id: memberId,
                current_program_id: cohort.program_id,
                current_cohort_id: cohortId,
                status: 'enrolled',
            })
            .select()
            .single();

        if (studentError) throw studentError;
        student = newStudent;
    }

    // Create enrollment record
    const { data: enrollment, error: enrollError } = await supabase
        .from('bible_enrollments')
        .insert({
            student_id: student.id,
            cohort_id: cohortId,
            status: 'active',
        })
        .select()
        .single();

    if (enrollError) throw enrollError;

    return { success: true, enrollment };
}

async function recordAttendance(supabase: any, profile: any, payload: any) {
    const { lessonId, studentId, cohortId, status, remarks } = payload;

    // Admins only
    if (!['branch_admin', 'district_admin', 'super_admin'].includes(profile.role)) {
        throw new Error('Only admins can record attendance');
    }

    // Upsert attendance
    const { data, error } = await supabase
        .from('bible_attendance')
        .upsert({
            lesson_id: lessonId,
            student_id: studentId,
            cohort_id: cohortId,
            attended_date: new Date().toISOString().split('T')[0],
            status,
            remarks,
            recorded_by: profile.id,
        }, { onConflict: 'lesson_id,student_id,cohort_id' })
        .select()
        .single();

    if (error) throw error;
    return { success: true, attendance: data };
}

async function gradeExam(supabase: any, profile: any, payload: any) {
    const { examId, studentId, cohortId, score, remarks } = payload;

    // Admins only
    if (!['branch_admin', 'district_admin', 'super_admin'].includes(profile.role)) {
        throw new Error('Only admins can grade exams');
    }

    // Get exam details for validation
    const { data: exam } = await supabase
        .from('bible_exams')
        .select('total_marks, pass_mark')
        .eq('id', examId)
        .single();

    if (!exam) throw new Error('Exam not found');
    if (score > exam.total_marks) throw new Error('Score exceeds total marks');

    // Upsert exam result
    const { data, error } = await supabase
        .from('bible_exam_results')
        .upsert({
            exam_id: examId,
            student_id: studentId,
            cohort_id: cohortId,
            score,
            remarks,
            graded_by: profile.id,
            graded_at: new Date().toISOString(),
        }, { onConflict: 'exam_id,student_id,cohort_id' })
        .select()
        .single();

    if (error) throw error;
    return { success: true, result: data };
}

async function promoteStudent(supabase: any, profile: any, payload: any) {
    const { studentId, toProgramId, remarks } = payload;

    // Get student and program details
    const { data: student } = await supabase
        .from('bible_students')
        .select('*, current_program:bible_programs(*)')
        .eq('id', studentId)
        .single();

    if (!student) throw new Error('Student not found');

    const { data: toProgram } = await supabase
        .from('bible_programs')
        .select('*')
        .eq('id', toProgramId)
        .single();

    if (!toProgram) throw new Error('Target program not found');

    // Check promotion authority
    const canPromote = checkPromotionPermission(profile, toProgram.level_order);
    if (!canPromote) {
        throw new Error('Insufficient authority for this promotion level');
    }

    // Validate promotion eligibility
    const eligibility = await checkPromotionEligibility(supabase, studentId);
    if (!eligibility.eligible) {
        throw new Error(`Student not eligible: ${eligibility.reason}`);
    }

    // Update student record
    const { error: updateError } = await supabase
        .from('bible_students')
        .update({
            current_program_id: toProgramId,
            highest_completed_level: student.current_program?.level_order || 0,
        })
        .eq('id', studentId);

    if (updateError) throw updateError;

    // Record promotion
    const { data: promotion, error: promError } = await supabase
        .from('bible_promotions')
        .insert({
            student_id: studentId,
            from_program_id: student.current_program_id,
            to_program_id: toProgramId,
            approved_by: profile.id,
            effective_date: new Date().toISOString().split('T')[0],
            remarks,
            attendance_percentage: eligibility.attendancePercentage,
            exam_average: eligibility.examAverage,
        })
        .select()
        .single();

    if (promError) throw promError;

    // Update member record based on level
    await updateMemberLevel(supabase, student.member_id, toProgram.name);

    return { success: true, promotion };
}

async function graduateStudent(supabase: any, profile: any, payload: any) {
    const { studentId, programId, cohortId, graduationDate } = payload;

    // Check eligibility
    const eligibility = await checkPromotionEligibility(supabase, studentId);
    if (!eligibility.eligible) {
        throw new Error(`Student not eligible for graduation: ${eligibility.reason}`);
    }

    // Generate certificate number
    const certNumber = `CERT-${new Date().getFullYear()}-${String(Math.random()).slice(2, 8)}`;

    // Create graduation record
    const { data: graduation, error } = await supabase
        .from('bible_graduations')
        .insert({
            student_id: studentId,
            program_id: programId,
            cohort_id: cohortId,
            graduation_date: graduationDate || new Date().toISOString().split('T')[0],
            certificate_number: certNumber,
            issued_by: profile.id,
        })
        .select()
        .single();

    if (error) throw error;

    // Update student status
    await supabase
        .from('bible_students')
        .update({ status: 'completed' })
        .eq('id', studentId);

    // Update enrollment
    await supabase
        .from('bible_enrollments')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            final_attendance_percentage: eligibility.attendancePercentage,
            final_grade: eligibility.examAverage,
        })
        .eq('student_id', studentId)
        .eq('cohort_id', cohortId);

    // Get program name for member update
    const { data: program } = await supabase
        .from('bible_programs')
        .select('name')
        .eq('id', programId)
        .single();

    // Update member record
    const { data: student } = await supabase
        .from('bible_students')
        .select('member_id')
        .eq('id', studentId)
        .single();

    await updateMemberLevel(supabase, student.member_id, program.name);

    return { success: true, graduation };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function checkApprovalPermission(profile: any, application: any): boolean {
    if (profile.role === 'super_admin') return true;

    if (application.program.is_centralized) {
        return ['district_admin', 'super_admin'].includes(profile.role);
    } else {
        return profile.branch_id === application.branch_id;
    }
}

function checkPromotionPermission(profile: any, targetLevel: number): boolean {
    if (profile.role === 'super_admin') return true;
    if (profile.role === 'district_admin' && targetLevel <= 4) return true; // Up to Leadership
    if (profile.role === 'branch_admin' && targetLevel <= 3) return true; // Up to Workers
    return false;
}

async function checkPromotionEligibility(supabase: any, studentId: string) {
    // Get attendance percentage
    const { data: attendance } = await supabase
        .from('bible_attendance')
        .select('status')
        .eq('student_id', studentId);

    const total = attendance?.length || 0;
    const present = attendance?.filter((a: any) => a.status === 'present').length || 0;
    const attendancePercentage = total > 0 ? (present / total) * 100 : 0;

    // Get exam results
    const { data: exams } = await supabase
        .from('bible_exam_results')
        .select('score, status')
        .eq('student_id', studentId);

    const examAverage = exams?.length > 0
        ? exams.reduce((sum: number, e: any) => sum + e.score, 0) / exams.length
        : 0;

    const allPassed = exams?.every((e: any) => e.status === 'pass') ?? false;

    // Validation
    if (attendancePercentage < 75) {
        return {
            eligible: false,
            reason: `Attendance ${attendancePercentage.toFixed(1)}% is below required 75%`
        };
    }

    if (!allPassed) {
        return {
            eligible: false,
            reason: 'Not all exams passed'
        };
    }

    return {
        eligible: true,
        attendancePercentage,
        examAverage
    };
}

async function updateMemberLevel(supabase: any, memberId: string, programName: string) {
    const updates: any = {};

    switch (programName) {
        case 'Workers':
            updates.membership_level = 'baptized';
            updates.baptized_sub_level = 'worker';
            break;
        case 'Leadership':
            updates.baptized_sub_level = 'leader';
            break;
        case 'Pastoral':
            updates.baptized_sub_level = 'pastor';
            updates.leader_role = 'pastor';
            break;
    }

    if (Object.keys(updates).length > 0) {
        await supabase
            .from('members')
            .update(updates)
            .eq('id', memberId);
    }
}
