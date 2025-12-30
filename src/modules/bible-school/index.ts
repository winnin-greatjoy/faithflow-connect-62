// src/modules/bible-school/index.ts
// Barrel export for Bible School module

// Main page and router
export { BibleSchoolPage } from './BibleSchoolPage';
export { BibleSchoolRouter } from './BibleSchoolRouter';
export { CohortDetailPage } from './CohortDetailPage';

// Types
export type * from './types';

// Hooks
export { usePrograms } from './hooks/usePrograms';
export { useCohorts } from './hooks/useCohorts';
export { useStudents } from './hooks/useStudents';
export { useApplications } from './hooks/useApplications';

// Components will be exported here as they're created
