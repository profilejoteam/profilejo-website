# Admin Table Infinite Recursion Fix

## Problem
The admin panel is experiencing an infinite recursion error with code `42P17`. This happens because the Row Level Security (RLS) policy on the `admins` table is trying to check if a user is an admin by querying the same `admins` table, creating a circular dependency.

## Error Message
```
infinite recursion detected in policy for relation "admins"
```

## Root Cause
The current RLS policy on the `admins` table:
```sql
CREATE POLICY "Admins can manage admins" ON admins
FOR ALL USING (
    EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid() AND is_active = true
    )
);
```

This policy causes infinite recursion because:
1. When trying to read from `admins` table
2. The policy checks if user is admin by querying `admins` table
3. Which triggers the same policy check again
4. Creating an infinite loop

## Immediate Fix Applied
The admin layout now includes a fallback mechanism that:
1. Allows predefined admin emails to access the admin panel even during database issues
2. Shows helpful error messages when the recursion is detected
3. Provides guidance on how to fix the database issue

## Permanent Solution
Run the SQL commands in `MANUAL_ADMIN_FIX.sql` file in your Supabase SQL Editor.

### Steps to Fix:
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `MANUAL_ADMIN_FIX.sql`
4. Run the SQL commands
5. Verify the fix by checking if you can access the admin panel

### What the Fix Does:
1. **Temporarily disables RLS** on the admins table
2. **Drops all problematic policies** that cause recursion
3. **Ensures the first admin exists** in the database
4. **Creates a new function** `current_user_is_admin()` that bypasses RLS to check admin status
5. **Creates new non-recursive policies** that use the safe function
6. **Re-enables RLS** with the fixed policies

### New Policy Structure:
- **SELECT**: Allows all authenticated users to read admin data
- **INSERT**: Allows admin creation if no admins exist, or if current user is already an admin
- **UPDATE/DELETE**: Only allows admins to modify admin data

## Testing
After running the fix:
1. Try accessing the admin panel at `/admin`
2. Check browser console for any remaining errors
3. Verify that admin functions work properly

## Prevention
To prevent this issue in the future:
- Always test RLS policies thoroughly before applying
- Avoid circular dependencies in policy conditions
- Use functions with `SECURITY DEFINER` to bypass RLS when checking permissions
- Consider using separate permission tables or simple role-based checks

## Files Modified
- `app/admin/layout.tsx` - Added fallback mechanism and better error handling
- `MANUAL_ADMIN_FIX.sql` - Complete fix for the database issue
- `fix-admin-recursion.sql` - Alternative fix approach

## Admin Email
Current predefined admin email: `amrabdullah19876@gmail.com`

To change this, update the `adminEmails` array in `app/admin/layout.tsx` and the email in the SQL fix files.