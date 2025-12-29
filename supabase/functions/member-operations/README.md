# Member Operations Edge Function

Secure server-side function for handling member and first-timer CRUD operations.

## Features

- ✅ Authentication verification
- ✅ Role-based access control (RBAC)
- ✅ Branch isolation for branch admins
- ✅ Server-side validation
- ✅ Audit logging
- ✅ CORS support

## Supported Operations

### Create
```typescript
{
  operation: 'create',
  target: 'members' | 'first_timers',
  data: { ...memberData }
}
```

### Update
```typescript
{
  operation: 'update',
  target: 'members' | 'first_timers',
  id: 'uuid',
  data: { ...updatedFields }
}
```

### Delete
```typescript
{
  operation: 'delete',
  target: 'members' | 'first_timers',
  id: 'uuid'
}
```

### Bulk Transfer
```typescript
{
  operation: 'bulk_transfer',
  target: 'members' | 'first_timers',
  ids: ['uuid1', 'uuid2'],
  targetBranchId: 'branch-uuid'
}
```

## Permissions

- **Superadmins**: Full access to all operations and all branches
- **Branch Admins**: Can create/update/delete only within their assigned branch
- **Members**: No write access

## Audit Logging

All operations are logged to the `audit_logs` table with:
- User ID
- Action performed
- Table name
- Record ID
- Operation details
- Timestamp
