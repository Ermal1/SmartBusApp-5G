# Routing Refactor Status

## ✅ Completed
1. **BottomNavigation**: Now uses Next.js `Link` and `usePathname()` for routing
2. **AppHeader**: Uses `usePathname()` directly, removed `currentPage` prop dependency
3. **TopTabs**: Updated to use `Link` components with pathname-based active state
4. **HomeTab**: "View Map" button now uses `router.push('/map')` instead of custom event

## ⏳ Remaining Tasks
1. Create `/map` route page with MapTab content
2. Create `/stats` route page with StatsTab content  
3. Create `/schedule` route page with ScheduleTab content
4. Update `/` (home) page to only show HomeTab content (remove tab switching logic)
5. Update `/about` page to use SharedPageLayout
6. Update `/performance` page to use SharedPageLayout

## Notes
- The data fetching logic from `app/page.tsx` needs to be extracted into each route page
- Consider creating a shared data hook/context to avoid duplication
- SharedPageLayout component created but not yet integrated
