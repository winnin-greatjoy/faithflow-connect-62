// src/modules/bible-school/BibleSchoolRouter.tsx
// Router wrapper for Bible School module to handle nested routes
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { BibleSchoolPage } from './BibleSchoolPage';
import { CohortDetailPage } from './CohortDetailPage';

export const BibleSchoolRouter: React.FC = () => {
    return (
        <Routes>
            <Route index element={<BibleSchoolPage />} />
            <Route path="cohorts/:cohortId" element={<CohortDetailPage />} />
        </Routes>
    );
};

// Re-export for convenience
export { BibleSchoolPage } from './BibleSchoolPage';
export { CohortDetailPage } from './CohortDetailPage';
