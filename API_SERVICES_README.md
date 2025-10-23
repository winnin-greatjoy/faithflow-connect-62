# Department & Ministry API Services

This directory contains comprehensive API service files for all departments and ministries in the FaithFlow Connect application. These services provide a complete interface for managing church operations through Supabase backend integration.

## 📁 Directory Structure

```
src/
├── services/
│   ├── departments/
│   │   ├── choirApi.ts          # Choir department management
│   │   ├── usheringApi.ts       # Ushering department management
│   │   ├── prayerTeamApi.ts     # Prayer team department management
│   │   ├── evangelismApi.ts     # Evangelism department management
│   │   ├── financeApi.ts        # Finance department management
│   │   ├── technicalApi.ts      # Technical department management
│   │   └── index.ts             # Department exports
│   ├── ministries/
│   │   ├── mensMinistryApi.ts   # Men's ministry management
│   │   ├── womensMinistryApi.ts # Women's ministry management
│   │   ├── youthMinistryApi.ts  # Youth ministry management
│   │   ├── childrensMinistryApi.ts # Children's ministry management
│   │   └── index.ts             # Ministry exports
│   └── index.ts                 # Master exports
├── types/
│   └── api.ts                   # TypeScript interfaces
└── utils/
    └── api.ts                   # Base API utilities
```

## 🚀 Quick Start

### Import Services

```typescript
// Import individual services
import { choirApi } from '@/services/departments/choirApi';
import { prayerTeamApi } from '@/services/departments/prayerTeamApi';

// Or import from index files
import { choirApi, prayerTeamApi } from '@/services/departments';
import { mensMinistryApi, youthMinistryApi } from '@/services/ministries';

// Import all services
import * as services from '@/services';
```

### Basic Usage Example

```typescript
import { choirApi } from '@/services/departments/choirApi';

// Get choir members
const membersResult = await choirApi.getChoirMembers({
  pagination: { page: 1, limit: 20 },
  sort: { field: 'member.full_name', direction: 'asc' }
});

if (membersResult.error) {
  console.error('Error fetching members:', membersResult.error.message);
} else {
  console.log('Members:', membersResult.data);
}

// Add new choir member
const newMemberResult = await choirApi.addChoirMember({
  member_id: 'member-uuid',
  voice_part: 'soprano',
  years_experience: 5
});

if (newMemberResult.error) {
  console.error('Error adding member:', newMemberResult.error.message);
} else {
  console.log('New member added:', newMemberResult.data);
}
```

## 📋 Available Services

### Department Services

#### 🎵 Choir API (`choirApi`)
- **getChoirMembers()** - Get all choir members with filtering and pagination
- **getChoirStats()** - Get choir statistics and KPIs
- **addChoirMember()** - Add new member to choir
- **updateChoirMember()** - Update member details
- **getChoirMemberById()** - Get specific member details
- **removeChoirMember()** - Remove member from choir
- **getPerformanceHistory()** - Get member's performance history
- **getRepertoire()** - Get choir song repertoire
- **recordAttendance()** - Record attendance for performances

#### 🎯 Ushering API (`usheringApi`)
- **getUsherMembers()** - Get ushering team members
- **getUsheringStats()** - Get ushering statistics
- **addUsherMember()** - Add new usher
- **getUsherStations()** - Get available stations
- **getUpcomingSchedule()** - Get upcoming service schedule
- **assignUsherToService()** - Assign usher to service
- **recordServiceAttendance()** - Record service attendance
- **getMemberServiceHistory()** - Get member's service history

#### 🙏 Prayer Team API (`prayerTeamApi`)
- **getPrayerMembers()** - Get prayer team members
- **getPrayerRequests()** - Get prayer requests with filtering
- **createPrayerRequest()** - Create new prayer request
- **assignPrayerRequest()** - Assign request to team member
- **updatePrayerRequestStatus()** - Update request status
- **getPrayerSessions()** - Get prayer sessions
- **getPrayerStats()** - Get prayer team statistics
- **addFollowUpNote()** - Add follow-up notes

#### 📢 Evangelism API (`evangelismApi`)
- **getEvangelismMembers()** - Get evangelism team members
- **getOutreachEvents()** - Get outreach events
- **createOutreachEvent()** - Create new outreach event
- **getFollowUpContacts()** - Get follow-up contacts
- **createFollowUpContact()** - Create new follow-up contact
- **updateFollowUpStatus()** - Update contact status
- **recordOutreachResults()** - Record event results
- **getEvangelismStats()** - Get evangelism statistics

#### 💰 Finance API (`financeApi`)
- **getFinanceMembers()** - Get finance team members
- **getTransactions()** - Get financial transactions
- **createTransaction()** - Create new transaction
- **approveTransaction()** - Approve pending transaction
- **getBudgetCategories()** - Get budget categories
- **getFinancialSummary()** - Get financial summary
- **getFinanceStats()** - Get finance statistics

#### 🔧 Technical API (`technicalApi`)
- **getTechnicalMembers()** - Get technical team members
- **getEquipment()** - Get equipment inventory
- **getSupportTickets()** - Get support tickets
- **createSupportTicket()** - Create new support ticket
- **updateTicketStatus()** - Update ticket status
- **getMaintenanceSchedule()** - Get maintenance schedule
- **getTechnicalStats()** - Get technical statistics

### Ministry Services

#### 👨‍👩‍👧‍👦 Men's Ministry API (`mensMinistryApi`)
- **getMensMembers()** - Get men's ministry members
- **getMensEvents()** - Get men's ministry events
- **createMensEvent()** - Create new men's event
- **recordEventAttendance()** - Record event attendance
- **getMensStats()** - Get men's ministry statistics

#### 👩‍👩‍👧‍👦 Women's Ministry API (`womensMinistryApi`)
- **getWomensMembers()** - Get women's ministry members
- **getWomensEvents()** - Get women's ministry events
- **createWomensEvent()** - Create new women's event
- **getWomensStats()** - Get women's ministry statistics

#### 👦👧 Youth Ministry API (`youthMinistryApi`)
- **getYouthMembers()** - Get youth ministry members
- **getYouthEvents()** - Get youth ministry events
- **createYouthEvent()** - Create new youth event
- **getYouthStats()** - Get youth ministry statistics

#### 🧒 Children's Ministry API (`childrensMinistryApi`)
- **getChildrensMembers()** - Get children's ministry members
- **getChildrensEvents()** - Get children's ministry events
- **createChildrensEvent()** - Create new children's event
- **recordChildCheckIn()** - Record child check-in
- **recordChildCheckOut()** - Record child check-out
- **getChildrensStats()** - Get children's ministry statistics

## 📊 API Response Format

All API methods return a consistent response format:

```typescript
interface ApiResponse<T = any> {
  data: T;
  error: null;
}

interface ApiError {
  data: null;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
}

type ApiResult<T = any> = ApiResponse<T> | ApiError;
```

### Success Response
```typescript
{
  data: [/* your data */],
  error: null
}
```

### Error Response
```typescript
{
  data: null,
  error: {
    message: "Error description",
    code: "ERROR_CODE",
    details: {/* additional error info */}
  }
}
```

## 🔍 Filtering and Pagination

### List Requests
```typescript
interface ListRequest {
  filters?: FilterOptions;
  sort?: SortOptions;
  pagination?: {
    page: number;
    limit: number;
  };
}

interface FilterOptions {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
  branchId?: string;
}

interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}
```

### Example Usage
```typescript
// Get prayer requests with filters
const requests = await prayerTeamApi.getPrayerRequests({
  filters: {
    status: 'new',
    category: 'health',
    urgency: 'urgent'
  },
  sort: {
    field: 'date_received',
    direction: 'desc'
  },
  pagination: {
    page: 1,
    limit: 10
  }
});
```

## 🛠️ Database Integration

The services are designed to work with the existing Supabase schema and can be easily adapted for other backends. Key tables used:

- `departments` - Department information
- `department_assignments` - Member-department relationships
- `members` - Member profiles
- `ministry_members` - Ministry member relationships
- `ministry_events` - Ministry events
- `events` - General events
- `finance_records` - Financial transactions
- `prayer_requests` - Prayer requests (custom)
- `outreach_events` - Outreach events (custom)
- `support_tickets` - Support tickets (custom)
- `equipment` - Equipment inventory (custom)

## 🔄 Real-time Subscriptions

For real-time updates, use the subscription utilities:

```typescript
import { subscribeToTable } from '@/utils/api';

// Subscribe to prayer request changes
const subscription = subscribeToTable('prayer_requests', (payload) => {
  console.log('Prayer request updated:', payload);
  // Update your UI state here
});

// Don't forget to unsubscribe when component unmounts
// subscription.unsubscribe();
```

## 📁 Custom Tables Required

To fully utilize these services, create these additional Supabase tables:

### prayer_requests
```sql
CREATE TABLE prayer_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  requester_name TEXT,
  requester_contact TEXT,
  category TEXT NOT NULL,
  urgency TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id),
  date_received TIMESTAMPTZ DEFAULT NOW(),
  date_updated TIMESTAMPTZ DEFAULT NOW(),
  answered_date TIMESTAMPTZ,
  follow_up_notes TEXT[],
  branch_id UUID REFERENCES church_branches(id)
);
```

### outreach_events
```sql
CREATE TABLE outreach_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  location TEXT,
  type TEXT NOT NULL,
  target_audience TEXT,
  expected_attendees INTEGER,
  actual_attendees INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  led_by UUID REFERENCES profiles(id),
  team_members UUID[],
  materials_used TEXT[],
  follow_up_required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  branch_id UUID REFERENCES church_branches(id)
);
```

### follow_up_contacts
```sql
CREATE TABLE follow_up_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_name TEXT NOT NULL,
  contact_info TEXT NOT NULL,
  source_event UUID REFERENCES outreach_events(id),
  status TEXT NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES profiles(id),
  last_contact_date TIMESTAMPTZ DEFAULT NOW(),
  next_contact_date TIMESTAMPTZ,
  notes TEXT[],
  conversion_date TIMESTAMPTZ,
  church_integration TEXT,
  branch_id UUID REFERENCES church_branches(id)
);
```

### support_tickets
```sql
CREATE TABLE support_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  requester UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  equipment_id UUID,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  resolved_date TIMESTAMPTZ,
  resolution_notes TEXT,
  estimated_time INTEGER,
  actual_time INTEGER,
  branch_id UUID REFERENCES church_branches(id)
);
```

### equipment
```sql
CREATE TABLE equipment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  model TEXT,
  serial_number TEXT,
  purchase_date DATE,
  warranty_expiry DATE,
  status TEXT NOT NULL DEFAULT 'operational',
  location TEXT NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  last_maintenance TIMESTAMPTZ,
  next_maintenance TIMESTAMPTZ,
  notes TEXT,
  specifications JSONB,
  branch_id UUID REFERENCES church_branches(id)
);
```

## 🔧 Error Handling

All API methods include comprehensive error handling:

```typescript
try {
  const result = await choirApi.getChoirMembers();

  if (result.error) {
    // Handle error
    console.error('API Error:', result.error.message);
    // Show error to user
    toast({
      title: 'Error',
      description: result.error.message,
      variant: 'destructive'
    });
  } else {
    // Handle success
    setMembers(result.data);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

## 🚀 Performance Optimization

- **Caching**: Built-in caching for frequently accessed data
- **Batch Operations**: Support for batch API operations
- **Retry Logic**: Automatic retry for failed operations
- **Pagination**: Efficient data loading with pagination
- **Filtering**: Client-side and server-side filtering options

## 📝 Usage in Components

```typescript
// In a React component
import { useState, useEffect } from 'react';
import { choirApi } from '@/services/departments/choirApi';
import type { ChoirMember } from '@/types/api';

export const ChoirManagement = () => {
  const [members, setMembers] = useState<ChoirMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMembers = async () => {
      const result = await choirApi.getChoirMembers({
        sort: { field: 'member.full_name', direction: 'asc' }
      });

      if (result.error) {
        console.error('Failed to load members:', result.error.message);
      } else {
        setMembers(result.data);
      }
      setLoading(false);
    };

    loadMembers();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {members.map(member => (
        <div key={member.id}>
          {member.member.full_name} - {member.voice_part}
        </div>
      ))}
    </div>
  );
};
```

## 🔒 Authentication & Authorization

All API services respect the current user's authentication state and branch access permissions through Supabase RLS (Row Level Security) policies.

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Guide](https://www.typescriptlang.org/docs/)
- [React Query](https://react-query.tanstack.com/) - For advanced state management
- [Zustand](https://zustand-demo.pmnd.rs/) - For client-side state management
