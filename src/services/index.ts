// Base API utilities and types
export * from '@/utils/api';
export * from '@/types/api';

// Department API Services
export * from './departments';

// Ministry API Services
export * from './ministries';

// Admin Services
export { provisioningApi } from './admin/provisioningApi';

// Re-export individual services for convenience
export { choirApi } from './departments/choirApi';
export { usheringApi } from './departments/usheringApi';
export { prayerTeamApi } from './departments/prayerTeamApi';
export { evangelismApi } from './departments/evangelismApi';
export { financeApi } from './departments/financeApi';
export { technicalApi } from './departments/technicalApi';

export { mensMinistryApi } from './ministries/mensMinistryApi';
export { womensMinistryApi } from './ministries/womensMinistryApi';
export { youthMinistryApi } from './ministries/youthMinistryApi';
export { childrensMinistryApi } from './ministries/childrensMinistryApi';
