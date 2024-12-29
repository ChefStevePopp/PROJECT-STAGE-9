# Kitchen AI Core Package

This package contains the core components, hooks, types and utilities used across Kitchen AI modules.

## Installation

```bash
npm install @kitchen-ai/core
```

## Usage

```typescript
import { Card, useAuth, type Organization } from '@kitchen-ai/core';

// Use components
<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
</Card>

// Use hooks
const { user, isDev } = useAuth();

// Use types
const org: Organization = {
  // ... organization data
};
```

## Features

- Shared UI components
- Authentication hooks
- Type definitions
- Theme configuration
- Constants and routes
- Supabase integration

## Development

```bash
npm run dev    # Watch mode
npm run build  # Production build
```