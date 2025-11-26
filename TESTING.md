# Testing Guide - FaithFlow Connect

## Overview

This project uses **Vitest** for unit and integration testing, with **React Testing Library** for component testing.

## Running Tests

```bash
# Run tests in watch mode (recommended during development)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI dashboard
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── hooks/
│   ├── useAuthz.tsx
│   └── useAuthz.test.tsx          ← Hook tests
├── services/
│   └── departments/
│       ├── choirApi.ts
│       └── choirApi.test.ts       ← Service tests
├── components/
│   └── ui/
│       ├── ErrorBoundary.tsx
│       └── ErrorBoundary.test.tsx ← Component tests
└── test/
    └── setup.ts                    ← Global test setup
```

## Writing Tests

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useYourHook } from '../useYourHook';

describe('useYourHook', () => {
  it('should return expected value', async () => {
    const { result } = renderHook(() => useYourHook());

    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YourComponent } from '../YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

### API Service Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { yourApi } from '../yourApi';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('yourApi', () => {
  it('should fetch data successfully', async () => {
    // Your test here
  });
});
```

## Mocking

### Supabase Client

Already configured in test setup. Use `vi.mock()` in individual tests:

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}));
```

### React Router

```typescript
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: '123' }),
}));
```

## Coverage Goals

- **Overall:** > 70%
- **Critical Hooks (useAuth, useAuthz):** > 80%
- **API Services:** > 75%
- **UI Components:** > 60%

## Best Practices

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **One assertion per test (when possible)**
4. **Mock external dependencies**
5. **Clean up after tests** (automatic with `cleanup()`)
6. **Test edge cases and error states**

## Common Patterns

### Testing Async Operations

```typescript
await waitFor(() => {
  expect(result.current.loading).toBe(false);
});
```

### Testing User Interactions

```typescript
import { userEvent } from '@testing-library/user-event';

const user = userEvent.setup();
await user.click(screen.getByRole('button'));
```

### Testing Forms

```typescript
await user.type(screen.getByLabelText('Email'), 'test@example.com');
await user.click(screen.getByRole('button', { name: 'Submit' }));
```

## Current Test Coverage

### ✅ Tested

- `useAuthz` hook - Permissions and role checking
- `choirApi` service - CRUD operations
- `ErrorBoundary` component - Error handling

### 🔄 To Be Tested (Priority)

1. `useAuth` hook
2. Other department APIs (ushering, prayer, evangelism, finance, technical)
3. Form components (MemberForm, etc.)
4. Critical business logic components

## Continuous Integration

Tests run automatically on:

- Pre-commit (via Husky) - Fast smoke tests
- Pull requests - Full test suite
- Main branch - Full suite + coverage report

## Troubleshooting

### Mock not working?

- Ensure mock is at top of file, before imports
- Use `vi.hoisted()` for hoisted mocks

### Async test timing out?

- Increase timeout: `it('test', () => {}, { timeout: 10000 })`
- Check for unresolved promises

### Component not rendering?

- Wrap in required providers (QueryClient, Router, etc.)
- Check console for errors

## Resources

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
