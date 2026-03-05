

## Plan: Enhance Attendance Manager UI and Fix Build Errors

### Build Errors to Fix (Attendance-related)

1. **AttendanceManager.tsx line 132** — `toast.success()` returns `string | number`, but `guardAction` expects `() => void | Promise<void>`. Fix: wrap toast call so it doesn't return the toast ID.

2. **CheckInConsole.tsx lines 319, 593** — `metadata` property doesn't exist on the `recordAttendance` payload type. Fix: update the type in `useAttendanceSync` to include an optional `metadata` field.

3. **Pre-existing errors** in other files (AssignRoleToUser, StreamControlRoom, EventRegistrationForm, EventCalendar, GrowthPathways, InteractionHub, ProfilePage, test files) — these are unrelated to attendance but will be fixed where straightforward (missing imports, type mismatches).

### UI Enhancements

**Scanner Mode Card (CheckInConsole):**
- Fix the layout alignment in the dark scanner card — the inner grid (`grid-cols-[1.1fr_0.9fr]`) causes misalignment on smaller viewports. Restructure to stack vertically on medium screens and use proper padding/gap consistency.
- Ensure the QR icon header, zone selector, scan input, and camera preview are properly aligned with consistent spacing.

**Dispatch Button (AttendanceManager):**
- Already functional — the `handleDispatch` fires a toast notification. The build error preventing it from compiling will be fixed (the `toast.success` return type issue).

**Register New Attendee Button (Manual Search Card):**
- Already wired to open `showManualRegistration` dialog. The dialog and `handleManualRegistration` logic are complete. No code change needed beyond ensuring the build compiles so the button renders.

### Files to Modify

| File | Changes |
|------|---------|
| `AttendanceManager.tsx` | Fix `guardAction` toast return type (line 132) |
| `CheckInConsole.tsx` | Fix scanner card layout alignment; no metadata type fix needed here (fix in hook) |
| `useAttendanceSync.ts` | Add `metadata` to the record type |
| `AssignRoleToUser.tsx` | Add missing Select imports |
| `InteractionHub.tsx` | Add missing Badge/Radio imports |
| `GrowthPathways.tsx` | Fix undefined `guardAction` reference |
| `member-operations/index.ts` | Fix `profile_id` access (line 430) |

