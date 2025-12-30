
import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { validatePromotion } from './rules.ts';
import { generateCertificate, uploadCertificate } from './certificate.ts';

// Helper for audit logging
async function logAudit(supabase: SupabaseClient, action: string, studentId: string | null, performedBy: string, metadata: any) {
    await supabase.from('bible_audit_logs').insert({
        action,
        student_id: studentId,
        performed_by: performedBy,
        metadata
    });
}

// 1. APPLY
export async function apply(supabase: SupabaseClient, user: any, data: any) {
    const { programId, branchId, remarks, applicationLetter } = data;

    // Check if already applied or student
    const { data: existing } = await supabase
        .from('bible_applications')
        .select('id')
        .eq('member_id', user.id)
        .eq('program_id', programId)
        .eq('status', 'pending')
        .single();

    if (existing) {
        return new Response(JSON.stringify({ error: 'Application already pending' }), { status: 400 });
    }

    const { data: application, error } = await supabase
        .from('bible_applications')
        .insert({
            member_id: user.id,
            program_id: programId,
            branch_id: branchId,
            remarks,
            application_letter: applicationLetter,
            status: 'pending'
        })
        .select()
        .single();

    if (error) throw error;

    await logAudit(supabase, 'APPLY', null, user.id, { applicationId: application.id, programId });

    return new Response(JSON.stringify({ success: true, id: application.id }));
}

// 2. APPROVE APPLICATION
export async function approveApplication(supabase: SupabaseClient, user: any, data: any) {
    const { applicationId, cohortId } = data;

    // Verify admin permissions (RLS helps, but good to check)
    // ...

    // Update application
    const { data: app, error: appError } = await supabase
        .from('bible_applications')
        .update({ status: 'approved', reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq('id', applicationId)
        .select('member_id, program_id')
        .single();

    if (appError) throw appError;

    // Create or update Student record
    let studentId: string;
    const { data: existingStudent } = await supabase
        .from('bible_students')
        .select('id')
        .eq('member_id', app.member_id)
        .single();

    if (existingStudent) {
        studentId = existingStudent.id;
        await supabase.from('bible_students').update({
            current_program_id: app.program_id,
            current_cohort_id: cohortId,
            status: 'enrolled'
        }).eq('id', studentId);
    } else {
        const { data: newStudent, error: studError } = await supabase
            .from('bible_students')
            .insert({
                member_id: app.member_id,
                current_program_id: app.program_id,
                current_cohort_id: cohortId,
                highest_completed_level: 0,
                status: 'enrolled'
            })
            .select()
            .single();
        if (studError) throw studError;
        studentId = newStudent.id;
    }

    // Create Enrollment
    await supabase.from('bible_enrollments').insert({
        student_id: studentId,
        cohort_id: cohortId,
        status: 'active'
    });

    await logAudit(supabase, 'APPROVE_APPLICATION', studentId, user.id, { applicationId, cohortId });

    return new Response(JSON.stringify({ success: true }));
}

// 3. RECORD ATTENDANCE
export async function recordAttendance(supabase: SupabaseClient, user: any, data: any) {
    const { lessonId, studentId, cohortId, status, date } = data;

    const { error } = await supabase
        .from('bible_attendance')
        .upsert({
            lesson_id: lessonId,
            student_id: studentId,
            cohort_id: cohortId,
            attended_date: date || new Date().toISOString().split('T')[0],
            status: status, // present, absent, etc
            recorded_by: user.id
        }, { onConflict: 'lesson_id, student_id, cohort_id' });

    if (error) throw error;

    // We don't log every single attendance record to avoid spamming audit logs, 
    // or we can log if necessary. Blueprint asks for "Log every promotion & graduation".
    // So we skip detailed audit for attendance unless critical.

    return new Response(JSON.stringify({ success: true }));
}

// 4. SUBMIT EXAM RESULT
export async function submitExam(supabase: SupabaseClient, user: any, data: any) {
    const { examId, studentId, cohortId, score, remarks } = data;

    const { error } = await supabase
        .from('bible_exam_results')
        .upsert({
            exam_id: examId,
            student_id: studentId,
            cohort_id: cohortId,
            score: score,
            remarks: remarks,
            graded_by: user.id,
            graded_at: new Date().toISOString()
        }, { onConflict: 'exam_id, student_id, cohort_id' });

    if (error) throw error;

    await logAudit(supabase, 'SUBMIT_EXAM', studentId, user.id, { examId, score });

    return new Response(JSON.stringify({ success: true }));
}

// 5. PROMOTE STUDENT
export async function promoteStudent(supabase: SupabaseClient, user: any, data: any) {
    const { studentId, targetProgramId, targetProgramName, attendance, examsPassed } = data;

    const { data: profile } = await supabase
        .from('profiles')
        .select('role') // assuming 'role' column exists or handled via user_roles
        .eq('id', user.id)
        .single();

    // If profile.role doesn't exist directly (it might be in user_roles), we might need to fetch it differently.
    // For now assuming profile has role or we fetch from user_roles
    let adminRole = 'member';
    if (!profile?.role) {
        const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
        if (roles && roles.length > 0) {
            if (roles.some((r: any) => r.role === 'super_admin')) adminRole = 'super_admin';
            else if (roles.some((r: any) => r.role === 'branch_admin')) adminRole = 'branch_admin';
        }
    } else {
        adminRole = profile.role;
    }

    const { data: student } = await supabase
        .from('bible_students')
        .select(`
      id,
      current_program: bible_programs(name, id)
    `)
        .eq('id', studentId)
        .single();

    if (!student) throw new Error('Student not found');

    validatePromotion({
        attendancePercentage: attendance, // passed from client or we could calc it
        examsPassed: examsPassed,
        currentLevel: student.current_program?.name || 'Foundation', // Default if null
        targetLevel: targetProgramName,
        adminRole: adminRole,
    });

    const { error } = await supabase.from('bible_promotions').insert({
        student_id: studentId,
        from_program_id: student.current_program?.id,
        to_program_id: targetProgramId,
        approved_by: user.id,
        remarks: data.remarks,
        attendance_percentage: attendance,
        exam_average: data.examAverage
    });

    if (error) throw error;

    // Update student status/program
    await supabase.from('bible_students').update({
        current_program_id: targetProgramId,
        // status could remain enrolled or change
    }).eq('id', studentId);

    await logAudit(supabase, 'PROMOTE_STUDENT', studentId, user.id, { from: student.current_program?.name, to: targetProgramName });

    return new Response(JSON.stringify({ success: true }));
}

// 6. GRADUATE STUDENT
export async function graduateStudent(supabase: SupabaseClient, user: any, data: any) {
    const { studentId, programId, programName, cohortId, districtName } = data;

    const { data: student } = await supabase
        .from('bible_students')
        .select('*, member: members(full_name, id)')
        .eq('id', studentId)
        .single();

    if (!student) throw new Error('Student not found');

    // Generate PDF
    const pdfBlob = await generateCertificate({
        fullName: student.member.full_name,
        programName: programName,
        graduationDate: new Date().toDateString(),
        signatures: [
            { title: 'Principal', name: 'Bible School Director' },
            { title: 'District Overseer', name: districtName || 'District Overseer' },
        ],
    });

    // Upload
    const publicUrl = await uploadCertificate(supabase, studentId, pdfBlob);

    // Record Graduation
    const { error } = await supabase.from('bible_graduations').insert({
        student_id: studentId,
        program_id: programId,
        cohort_id: cohortId,
        certificate_url: publicUrl,
        issued_by: user.id,
        graduation_date: new Date().toISOString() // or passed date
    });

    if (error) throw error;

    // Mark student as completed (or upgrade level)
    await supabase.from('bible_students').update({
        status: 'completed',
        highest_completed_level: data.levelOrder // Assuming passed in data or fetched
    }).eq('id', studentId);

    // Close enrollment
    await supabase.from('bible_enrollments').update({
        status: 'completed',
        completed_at: new Date().toISOString()
    }).eq('student_id', studentId).eq('cohort_id', cohortId);

    // 4️⃣ Automatic Member Role Upgrade (Integration)
    if (programName === 'Leadership') {
        await supabase.from('members')
            .update({ baptized_sub_level: 'leader' }) // Assuming this column exists, likely 'spiritual_maturity_level' or similar in actual schema, assume user knows
            .eq('id', student.member.id);
    }

    if (programName === 'Pastoral') {
        await supabase.from('members')
            .update({ baptized_sub_level: 'pastor' })
            .eq('id', student.member.id);
    }

    await logAudit(supabase, 'GRADUATE_STUDENT', studentId, user.id, { programName, certificateUrl: publicUrl });

    return new Response(JSON.stringify({ success: true, certificate: publicUrl }));
}
