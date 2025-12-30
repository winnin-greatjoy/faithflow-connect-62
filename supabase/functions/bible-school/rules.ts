
export interface PromotionContext {
    attendancePercentage: number;
    examsPassed: boolean;
    currentLevel: string;
    targetLevel: string;
    adminRole: string; // 'super_admin' | 'branch_admin' | 'district_admin' | 'member'
}

export function validatePromotion(ctx: PromotionContext) {
    if (ctx.attendancePercentage < 75) {
        throw new Error('Attendance below required threshold (75%)');
    }

    if (!ctx.examsPassed) {
        throw new Error('All exams must be passed');
    }

    const order = [
        'Foundation',
        'Discipleship',
        'Workers',
        'Leadership',
        'Pastoral',
    ];

    const currentIndex = order.indexOf(ctx.currentLevel);
    const targetIndex = order.indexOf(ctx.targetLevel);

    if (currentIndex === -1) throw new Error(`Invalid current level: ${ctx.currentLevel}`);
    if (targetIndex === -1) throw new Error(`Invalid target level: ${ctx.targetLevel}`);

    // Normal progression is +1
    if (targetIndex !== currentIndex + 1) {
        // Only super_admin can skip levels or demote? 
        // The blueprint checks this:
        if (ctx.adminRole !== 'super_admin') {
            throw new Error(`Invalid promotion jump from ${ctx.currentLevel} to ${ctx.targetLevel}`);
        }
    }

    // Pastoral requires super_admin approval
    if (ctx.targetLevel === 'Pastoral' && ctx.adminRole !== 'super_admin') {
        throw new Error('Only super admin can approve pastoral promotion');
    }

    return true;
}
