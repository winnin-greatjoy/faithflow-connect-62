# RBAC System Migration Guide for Administrators

_Version: 2.0 | Last Updated: November 26, 2025_

---

## Overview

FaithFlow Connect has upgraded from a basic enum-based permissions system (v1) to a powerful dynamic role-based access control system (v2). This guide will help you understand and use the new system.

### What Changed?

**Before (v1):** Fixed roles (admin, pastor, leader, worker, member) with preset permissions

**After (v2):** Create custom roles with flexible, granular permissions at any scope

### Why This Matters

- ✅ Create roles specific to your church structure
- ✅ Control access by branch, department, ministry, committee, or task
- ✅ Grant permissions at the feature level
- ✅ Easily audit who has access to what

---

## Accessing Role Management

1. Login to FaithFlow Connect as an administrator
2. Navigate to **Settings**
3. Select **Users & Permissions**
4. Click **Roles & Permissions** tab

---

## Understanding the Permission Model

### 1. Roles

A **role** is a job title or responsibility:

- Examples: "Choir Director", "Finance Committee Member", "Youth Leader"
- Each role has a **type**: account, member, leader, admin, pastor, worker

### 2. Permissions

Permissions control what actions a role can perform:

- **view**: See data
- **create**: Add new records
- **update**: Edit existing records
- **delete**: Remove records
- **manage**: Full control (all of the above)

### 3. Scopes

**Scope** determines where permissions apply:

| Scope      | Description          | Example                                         |
| ---------- | -------------------- | ----------------------------------------------- |
| **Global** | All branches         | Desktop Manager can manage across all locations |
| **Branch** | Specific branch only | Branch Admin manages only their location        |

### 4. Coverage

**Coverage** narrows permissions within a scope:

| Coverage       | Description           | Example                              |
| -------------- | --------------------- | ------------------------------------ |
| **Global**     | All modules/features  | Full access administrator            |
| **Department** | Single department     | Choir Director → Choir module only   |
| **Ministry**   | Single ministry       | Youth Pastor → Youth Ministry only   |
| **Committee**  | Single committee      | Finance Committee Member             |
| **Task**       | Specific project task | Project Lead for specific initiative |

---

## How to Create a Role

### StepStep 1: Create the Role

1. Click **"Create Role"** button
2. Fill in the form:
   - **Name**: Descriptive title (e.g., "Choir Director")
   - **Slug**: Auto-generated URL-safe name
   - **Role Type**: Select from dropdown (leader, admin, etc.)
   - **Description**: What this role does
   - **Active**: Toggle ON to enable
3. Click **Save**

### Step 2: Set Permissions

1. Find your new role in the list
2. Click **"Set Permissions"**
3. Configure scope and coverage:

**Example 1: Department Leader**

- Scope: **Global** (or select specific branch)
- Coverage: **Department** → Select "Choir"
- Permissions for Choir module:
  - ✅ view
  - ✅ create
  - ✅ update
  - ❌ delete (supervisor only)
  - ❌ manage

**Example 2: Branch Administrator**

- Scope: **Branch** → Select "Downtown Campus"
- Coverage: **Global** (all modules in that branch)
- Permissions for all modules:
  - ✅ view
  - ✅ create
  - ✅ update
  - ✅ delete
  - ✅ manage

4. Repeat for each module this role needs
5. Click **Save**

### Step 3: Assign to Users

1. Click **"Assign Role to User"**
2. Select the user from dropdown
3. Select the role
4. Match the scope/coverage:
   - If role is branch-scoped, select the branch
   - If coverage is department, select the department
   - Must match what you set in Step 2!
5. Click **Assign**

---

## Common Scenarios

### Scenario 1: Choir Director (Department-Level)

**Need:** Director manages choir members, schedules, and events

**Setup:**

1. Create role: "Choir Director" (type: leader)
2. Set permissions:
   - Scope: Global or specific branch
   - Coverage: Department → Choir

- Modules: Choir (all actions)

3. Assign to user with same department

**Result:** Director can manage choir, but not ushering or other departments

---

### Scenario 2: Youth Pastor (Ministry-Level)

**Need:** Pastor oversees all youth ministry activities

**Setup:**

1. Create role: "Youth Pastor" (type: pastor)
2. Set permissions:
   - Scope: Global
   - Coverage: Ministry → Youth
   - Modules: Youth Ministry (manage), Events (view, create)
3. Assign to user with Youth ministry

**Result:** Pastor has full youth ministry access, limited event access

---

### Scenario 3: Multi-Branch Directors

**Need:** Regional director oversees multiple branches

**Setup:**

1. Create role: "Regional Director" (type: admin)
2. Set permissions:
   - Scope: Global (all branches)
   - Coverage: Global (all modules)
   - Modules: All (manage)
3. Assign to user (no specific branch/department needed)

**Result:** Director has access across all locations

---

### Scenario 4: Committee Member (Task-Specific)

**Need:** Finance committee member reviews budgets only

**Setup:**

1. Create role: "Finance Committee Member" (type: member)
2. Set permissions:
   - Scope: Global
   - Coverage: Committee → Finance Committee
   - Modules: Finance (view only)
3. Assign to user with Finance committee

**Result:** Member can view finances for their committee only

---

## Migrating from v1 Roles

If you're currently using the old enum-based roles (admin, pastor, leader, worker, member), follow these steps:

### Step 1: Review Current Assignments

1. List all users and their v1 roles
2. Document what each person actually needs access to

### Step 2: Create Equivalent v2 Roles

Map old roles to new:

| Old v1 Role | New v2 Role Example                                        |
| ----------- | ---------------------------------------------------------- |
| admin       | "Branch Administrator" (scope: branch, coverage: global)   |
| pastor      | "Senior Pastor" (scope: global, coverage: global)          |
| leader      | "Department Leader" (scope: depends, coverage: department) |
| worker      | "Department Worker" (scope: branch, coverage: department)  |
| member      | "Member" (scope: branch, coverage: specific permissions)   |

### Step 3: Test with One User

1. Create a v2 role
2. Assign to a test user
3. Have them verify they can access what they need
4. Adjust permissions if needed

### Step 4: Migrate All Users

1. Create all necessary v2 roles
2. Assign users to new roles
3. **Do not remove v1 roles yet** - both systems work together
4. Monitor for issues over 1-2 weeks
5. Once confident, you can optionally remove v1 assignments

### Step 5: Communicate Changes

Send an email to all users explaining:

- What changed
- What they need to test
- Who to contact with issues

---

## Troubleshooting

### "User X Can't Access Module Y"

**Check:**

1. Is the user assigned a role? (Settings → Users & Permissions → View user)
2. Does the role have permissions for module Y? (Check role permissions)
3. Does the scope match? (Branch-scoped role needs matching branch assignment)
4. Does the coverage match? (Department role needs matching department)

**Fix:**

- Add missing permission to role, OR
- Adjust scope/coverage match, OR
- Assign additional role for that specific access

### "Permission Shows in Wrong Scope"

**Cause:** Scope/coverage mismatch between role definition and user assignment

**Fix:**

1. Check role permissions dialog - note scope (global/branch) and coverage
2. Check user's role assignment - must match exactly
3. Update user assignment to match

### "Can't Save Role Permissions"

**Common causes:**

- No branch selected when scope = branch
- No department selected when coverage = department
- No permissions checked (must select at least one action)

**Fix:** Select all required fields before saving

### "Duplicate Permission Entry"

**Cause:** Trying to assign same scope+coverage+module combo twice

**Fix:**

1. Delete existing permission entry
2. Recreate with desired settings

---

## Best Practices

### 1. Start Small

- Create 2-3 essential roles first
- Test thoroughly
- Expand gradually

### 2. Use Descriptive Names

- ✅ "Choir Director - Downtown"
- ❌ "Leader 1"

### 3. Document Your Roles

Keep a spreadsheet of:

- Role name
- Who should have it
- What permissions it grants
- Any special notes

### 4. Regular Audits

Every quarter:

- Review who has which roles
- Remove outdated assignments
- Update permissions as needs change

### 5. Principle of Least Privilege

- Grant minimum permissions needed
- Easier to add later than remove
- Reduces security risk

---

## Feature-Level Permissions (Advanced)

Some modules have **features** - specific capabilities within the module.

**Example:** Events module has features like:

- Event creation
- Attendance tracking
- Streaming integration

You can grant permission to a module but restrict specific features:

- ✅ Events module: view, create
- ❌ Events → Streaming Integration feature

**When to use:**

- Training new staff (grant incrementally)
- Temporary restrictions
- Compliance requirements

---

## Support

### I Need Help

**For technical issues:**
Contact developer/IT support - they have access to logs and database

**For permission questions:**

1. Check this guide first
2. Test in a sandbox if available
3. Contact church administrator

**For feature requests:**
Submit feedback through the app or contact development team

---

## Glossary

- **Role**: A job title with associated permissions
- **Permission**: An action + module combination (e.g., "view members")
- **Scope**: Geographic boundary (global or specific branch)
- **Coverage**: Organizational boundary (department, ministry, etc.)
- **Action**: What you can do (view, create, update, delete, manage)
- **Module**: A feature area (Members, Events, Finance, etc.)
- **Feature**: Specific capability within a module

---

## Quick Reference Card

| When You Want To...         | Use This Coverage |
| --------------------------- | ----------------- |
| Give access to everything   | Global            |
| Limit to one department     | Department        |
| Limit to one ministry       | Ministry          |
| Limit to a committee        | Committee         |
| Limit to a specific project | Task              |

| When You Want To Affect... | Use This Scope |
| -------------------------- | -------------- |
| All branches               | Global         |
| One specific branch        | Branch         |

---

_For additional support or to report issues with this guide, contact your system administrator._
