# Cleanup Plan

## Component Organization
- [x] Remove duplicate TeamChat components
- [x] Standardize TeamChat exports
- [ ] Audit all component locations
- [ ] Standardize export patterns
- [ ] Consolidate shared types

## File Structure
### /shared
- Components used across multiple features
- Layout components
- Common UI elements

### /features
- Feature-specific components
- Feature-specific logic
- Feature-specific types

### /lib
- Supabase configuration
- API utilities
- Helper functions

### /types
- Global type definitions
- Shared interfaces
- Type utilities

## Priority Tasks
1. ✅ Fix TeamChat circular dependencies
2. ✅ Clean up auth flow
3. [ ] Remove unused imports
4. [ ] Standardize barrel files
5. [ ] Clean up unused components