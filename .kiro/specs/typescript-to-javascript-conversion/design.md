# Design Document: TypeScript to JavaScript Conversion

## Overview

This design outlines the systematic conversion of a React + Vite application from TypeScript to JavaScript. The project contains approximately 50+ TypeScript files including React components (.tsx), utility modules (.ts), custom hooks, type definitions, and configuration files. The conversion will maintain all functionality while removing TypeScript-specific syntax, resulting in a pure JavaScript codebase that runs with Vite's native JavaScript support.

## Architecture

### Conversion Strategy

The conversion follows a bottom-up approach:

1. **Configuration Layer**: Convert build and tooling configuration files first
2. **Type Definitions Layer**: Remove type definition files (no direct conversion needed)
3. **Utilities Layer**: Convert utility functions and helper modules
4. **Hooks Layer**: Convert custom React hooks
5. **Components Layer**: Convert React components (UI components, then feature components)
6. **Integration Layer**: Convert context providers and integration modules
7. **Entry Points**: Convert main application entry points last

This order ensures dependencies are converted before their consumers, minimizing temporary inconsistencies.

### File Extension Mapping

- `.ts` → `.js` (for utility modules, hooks, and non-JSX files)
- `.tsx` → `.jsx` (for React components with JSX)
- `.d.ts` → Delete (type definition files)
- Config files: Keep `.js` extension (vite.config.ts → vite.config.js)

## Components and Interfaces

### 1. Configuration Files Conversion

**Files to Convert:**
- `vite.config.ts` → `vite.config.js`
- `eslint.config.js` (update to remove TypeScript plugins)

**Files to Remove:**
- `tsconfig.json`
- `tsconfig.app.json`
- `tsconfig.node.json`
- `src/vite-env.d.ts`

**Conversion Pattern:**
```javascript
// Before (TypeScript)
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // config
}));

// After (JavaScript) - Same structure, just .js extension
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  // config
}));
```

### 2. Type Definitions Removal

**Files to Remove:**
- `src/types/dashboard.ts` (contains all TypeScript interfaces and types)

**Strategy**: Type definitions have no runtime equivalent in JavaScript. All interfaces, types, and type aliases are simply removed. The actual data structures remain the same at runtime; we just lose compile-time type checking.

### 3. Utility Functions Conversion

**Files to Convert:**
- `src/lib/utils.ts` → `src/lib/utils.js`
- All files in `src/lib/utils/` and `src/lib/validations/`

**Conversion Pattern:**
```javascript
// Before (TypeScript)
export const validateResumeFile = (file: File): { isValid: boolean; error?: string } => {
  if (file.size > MAX_RESUME_SIZE) {
    return { isValid: false, error: 'File too large' };
  }
  return { isValid: true };
};

// After (JavaScript)
export const validateResumeFile = (file) => {
  if (file.size > MAX_RESUME_SIZE) {
    return { isValid: false, error: 'File too large' };
  }
  return { isValid: true };
};
```

**Key Changes:**
- Remove parameter type annotations
- Remove return type annotations
- Remove generic type parameters
- Keep all logic, validation, and return structures

### 4. Custom Hooks Conversion

**Files to Convert:**
- `src/hooks/useResume.ts` → `src/hooks/useResume.js`
- `src/hooks/useJobSettings.ts` → `src/hooks/useJobSettings.js`
- `src/hooks/useUserProfile.ts` → `src/hooks/useUserProfile.js`
- `src/hooks/use-toast.ts` → `src/hooks/use-toast.js`
- `src/hooks/use-mobile.tsx` → `src/hooks/use-mobile.jsx`

**Conversion Pattern:**
```javascript
// Before (TypeScript)
import { UseResumeReturn, ResumeData } from '@/types/dashboard';

export const useResume = (): UseResumeReturn => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  
  const { data: resume } = useQuery<ResumeData | null>({
    queryKey: ['resume', user?.id],
    queryFn: async (): Promise<ResumeData | null> => {
      // logic
    }
  });
  
  return { resume, uploadResume, deleteResume };
};

// After (JavaScript)
export const useResume = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { data: resume } = useQuery({
    queryKey: ['resume', user?.id],
    queryFn: async () => {
      // logic
    }
  });
  
  return { resume, uploadResume, deleteResume };
};
```

**Key Changes:**
- Remove return type annotations
- Remove generic type parameters from hooks (useState, useQuery, etc.)
- Remove type imports from `@/types/dashboard`
- Remove type annotations from async functions
- Keep all hook logic, dependencies, and return objects

### 5. React Components Conversion

**Files to Convert:**
- All `.tsx` files in `src/components/` → `.jsx`
- All `.tsx` files in `src/pages/` → `.jsx`
- `src/App.tsx` → `src/App.jsx`
- `src/contexts/AuthContext.tsx` → `src/contexts/AuthContext.jsx`

**Conversion Pattern:**
```javascript
// Before (TypeScript)
import { FC } from 'react';
import { ResumeSectionProps } from '@/types/dashboard';

const ResumeSection: FC<ResumeSectionProps> = ({
  resume,
  onUpload,
  onDelete,
  isLoading
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ResumeSection;

// After (JavaScript)
const ResumeSection = ({
  resume,
  onUpload,
  onDelete,
  isLoading
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default ResumeSection;
```

**Key Changes:**
- Remove `FC` (FunctionComponent) type imports
- Remove prop type annotations
- Remove event type annotations (React.ChangeEvent, etc.)
- Remove type imports
- Keep all JSX, hooks, and component logic
- Maintain prop destructuring patterns

### 6. Entry Points Conversion

**Files to Convert:**
- `src/main.tsx` → `src/main.jsx`

**Conversion Pattern:**
```javascript
// Before (TypeScript)
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// After (JavaScript)
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(<App />);
```

**Key Changes:**
- Remove non-null assertion operator (!)
- Update import paths to use .jsx extension
- Keep all rendering logic

### 7. Import Path Updates

All import statements referencing converted files must be updated:

```javascript
// Before
import { useResume } from '@/hooks/useResume';
import Dashboard from '@/pages/Dashboard';

// After (Vite handles extension resolution, but explicit is clearer)
import { useResume } from '@/hooks/useResume';
import Dashboard from '@/pages/Dashboard';
```

**Note**: Vite's module resolution will handle .js/.jsx extensions automatically, so import paths don't need explicit extensions in most cases. The `@/` alias will continue to work as configured in vite.config.js.

## Data Models

### Runtime Data Structures

While TypeScript interfaces are removed, the actual data structures remain unchanged:

**User Profile** (from Supabase):
```javascript
{
  id: string,
  name: string,
  email: string,
  created_at: string,
  updated_at: string
}
```

**Resume Data**:
```javascript
{
  id: string,
  user_id: string,
  file_name: string,
  file_path: string,
  file_size: number,
  upload_date: string,
  status: 'active' | 'processing' | 'error',
  created_at: string,
  updated_at: string
}
```

**Job Settings**:
```javascript
{
  id: string,
  user_id: string,
  difficulty_level: 'easy' | 'medium' | 'difficult',
  question_count: number,
  preferences: {
    job_types: string[],
    industries: string[]
  },
  created_at: string,
  updated_at: string
}
```

These structures are enforced by the Supabase database schema and application logic, not by TypeScript types.

## Error Handling

### Type-Related Error Handling

**TypeScript Errors to Remove:**
- Type assertion errors (using `as` keyword)
- Non-null assertions (using `!` operator)
- Generic type errors

**Conversion Pattern:**
```javascript
// Before (TypeScript)
const user = data as User;
const element = document.getElementById("root")!;
const items = response.data as Array<Item>;

// After (JavaScript)
const user = data;
const element = document.getElementById("root");
const items = response.data;
```

### Runtime Error Handling (Preserved)

All runtime error handling remains unchanged:
- try/catch blocks
- Error boundaries in React
- API error responses
- Validation errors
- Toast notifications for user-facing errors

## Testing Strategy

### Validation Approach

Since this is a pure conversion without logic changes, testing focuses on:

1. **Build Verification**
   - Run `npm run build` to ensure no compilation errors
   - Verify build output is generated correctly
   - Check bundle size (should be similar or smaller without TypeScript)

2. **Development Server**
   - Run `npm run dev` to start development server
   - Verify no console errors on startup
   - Check hot module replacement still works

3. **Runtime Verification**
   - Navigate to all routes (/, /auth, /dashboard, /profile)
   - Test authentication flow (login, logout, signup)
   - Test resume upload and deletion
   - Test job settings configuration
   - Test profile updates
   - Verify all UI components render correctly

4. **Integration Points**
   - Supabase authentication works
   - Supabase database queries work
   - Supabase storage (resume uploads) works
   - React Query caching works
   - React Router navigation works
   - Form validation works

### Manual Testing Checklist

- [ ] Application builds without errors
- [ ] Development server starts without errors
- [ ] Home page renders correctly
- [ ] Authentication pages work (login/signup)
- [ ] Dashboard loads with user data
- [ ] Resume upload functionality works
- [ ] Resume deletion works
- [ ] Job settings can be updated
- [ ] Profile page displays correctly
- [ ] Profile updates work
- [ ] Password change works
- [ ] Navigation between pages works
- [ ] Toast notifications appear correctly
- [ ] All UI components render properly
- [ ] No console errors during normal usage

### Rollback Strategy

If critical issues are discovered:
1. Git revert to previous TypeScript version
2. Identify specific problematic conversions
3. Fix issues in isolated branches
4. Re-test before merging

## Dependencies Update

### package.json Changes

**Remove from devDependencies:**
```json
{
  "typescript": "^5.8.3",
  "typescript-eslint": "^8.38.0",
  "@types/node": "^22.16.5",
  "@types/react": "^18.3.23",
  "@types/react-dom": "^18.3.7"
}
```

**Keep all runtime dependencies** (no changes needed):
- React, React DOM, React Router
- Supabase client
- TanStack Query
- Radix UI components
- All other runtime libraries

### ESLint Configuration Update

**eslint.config.js changes:**
```javascript
// Before
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    // ...
  }
);

// After
export default [
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended],
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
];
```

## Implementation Notes

### Conversion Order

Execute conversions in this specific order to minimize broken imports:

1. Configuration files (vite.config, eslint.config)
2. Remove TypeScript config files
3. Utility functions in src/lib
4. Custom hooks in src/hooks
5. UI components in src/components/ui
6. Dashboard components in src/components/dashboard
7. Feature components in src/components
8. Context providers in src/contexts
9. Integration modules in src/integrations
10. Page components in src/pages
11. App.tsx and main.tsx
12. Update package.json and install dependencies
13. Remove src/types directory

### Special Considerations

**Non-null Assertions**: TypeScript's `!` operator must be removed. In most cases, the code will work fine without it. If null checks are actually needed, add explicit checks:

```javascript
// Before (TypeScript)
const element = document.getElementById("root")!;

// After (JavaScript) - if null check is needed
const element = document.getElementById("root");
if (!element) throw new Error("Root element not found");
```

**Optional Chaining**: Keep all optional chaining (`?.`) as it's valid JavaScript.

**Nullish Coalescing**: Keep all nullish coalescing (`??`) as it's valid JavaScript.

**Async/Await**: All async/await syntax remains unchanged.

**Destructuring**: All destructuring patterns remain unchanged.

### Vite Configuration

Vite natively supports JavaScript and JSX without additional configuration. After conversion:
- No TypeScript plugin needed
- JSX transformation handled by @vitejs/plugin-react-swc
- Path aliases (@/) continue to work
- Hot module replacement continues to work
- Build optimization remains the same

## Success Criteria

The conversion is successful when:

1. ✅ All .ts files converted to .js
2. ✅ All .tsx files converted to .jsx
3. ✅ All TypeScript config files removed
4. ✅ All TypeScript dependencies removed from package.json
5. ✅ `npm run build` completes without errors
6. ✅ `npm run dev` starts without errors
7. ✅ Application runs in browser without console errors
8. ✅ All features function identically to TypeScript version
9. ✅ ESLint runs without TypeScript-related errors
10. ✅ No TypeScript syntax remains in any file
