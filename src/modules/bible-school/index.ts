// src/modules/bible-school/index.ts
// Barrel export for Bible School module

// Main page
export { BibleSchoolPage } from './BibleSchoolPage';

// Types
export type * from './types';

// Hooks
export { usePrograms } from './hooks/usePrograms';
export { useCohorts } from './hooks/useCohorts';
export { useStudents } from './hooks/useStudents';
export { useApplications } from './hooks/useApplications';

// Components will be exported here as they're created
