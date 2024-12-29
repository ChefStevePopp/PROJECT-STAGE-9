# Data Flow Documentation

## Authentication Flow
1. User enters credentials in SignIn component
2. Credentials passed to Supabase auth
3. On success:
   - Session stored in localStorage
   - User data cached
   - Redirect to dashboard
4. On failure:
   - Error displayed to user
   - Form reset for retry

## Component Communication
### MainLayout
- Controls overall layout structure
- Manages TeamChat visibility
- Handles responsive design

### TeamChat
- Receives props from parent
- Manages own state for messages
- Handles message submission

### Auth Context
- Provides user session data
- Handles role-based access
- Manages auth state

## State Management
### Auth State (Supabase)
- User session
- Authentication status
- User roles and permissions

### Application State (Zustand)
- Team data
- Inventory data
- Recipe data

### UI State (React)
- Component visibility
- Form values
- Loading states