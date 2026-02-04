// src/data/interfaces/README.md

# Interfaces Documentation

This folder contains all TypeScript interfaces and type definitions used throughout the Tanak Prabha application.

## 📁 Structure

### `index.d.ts`

Main export file that re-exports all interfaces for easy importing.

### `profile.d.ts`

Contains interfaces related to user profiles and personal data:

- `UserProfile` - Complete user profile interface
- `PersonalDetails` - Personal information subset
- `LandDetails` - Land and crop information
- `LivestockDetails` - Livestock data

### `content.d.ts`

Contains interfaces for content and UI data:

- `Banner` - Home page banner data
- `QuickAction` - Quick action button data
- `Scheme` - Government scheme information

### `forms.d.ts`

Contains form-specific prop interfaces:

- `PersonalDetailsFormProps`
- `LandDetailsFormProps`
- `LivestockDetailsFormProps`

## 🚀 Usage

Import interfaces from the main index:

```typescript
import {
  UserProfile,
  Banner,
  PersonalDetailsFormProps,
} from "@/data/interfaces";
```

Or import from specific files:

```typescript
import { UserProfile } from "@/data/interfaces/profile";
import { Banner } from "@/data/interfaces/content";
```

## 📝 Guidelines

- All interfaces should be defined in `.d.ts` files
- Use descriptive names that clearly indicate their purpose
- Group related interfaces in the same file
- Keep interfaces focused and avoid overly complex types
- Document complex interfaces with comments
