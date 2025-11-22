# Design Document

## Overview

The post-login dashboard feature will transform the current Index page to show a personalized dashboard when users are authenticated, while maintaining the existing landing page for unauthenticated users. The design leverages the existing React + TypeScript + Supabase + shadcn/ui architecture to create a cohesive user experience with resume management, job configuration settings, and comprehensive user profile management.

## Architecture

### Component Hierarchy
```
Index (Page)
├── Navbar (existing, enhanced with user menu)
├── Dashboard (new, authenticated users)
│   ├── DashboardHeader (greeting + quick actions)
│   ├── ResumeSection (upload/manage resume)
│   ├── JobConfigSection (difficulty + questions)
│   └── UserProfileModal (settings access)
└── LandingPage (existing content, unauthenticated users)
```

### State Management
- **Authentication State**: Existing AuthContext provides user session and profile data
- **Dashboard State**: Local component state for dashboard-specific data
- **Resume State**: Custom hook for resume management with Supabase storage
- **Settings State**: Custom hook for user preferences with Supabase database
- **Profile State**: Custom hook for user profile management

### Data Flow
1. AuthContext provides user authentication state
2. Dashboard components consume user data from context
3. Resume and settings data fetched via React Query hooks
4. Profile updates trigger context refresh and UI updates
5. All data persistence handled through Supabase client

## Components and Interfaces

### Core Components

#### Dashboard Component
```typescript
interface DashboardProps {
  user: User;
}

interface DashboardState {
  resumeStatus: 'none' | 'uploaded' | 'processing';
  jobSettings: JobSettings;
  showProfileModal: boolean;
}
```

#### DashboardHeader Component
```typescript
interface DashboardHeaderProps {
  userName: string;
  onSettingsClick: () => void;
}
```

#### ResumeSection Component
```typescript
interface ResumeSectionProps {
  resumeData: ResumeData | null;
  onUpload: (file: File) => Promise<void>;
  onUpdate: () => void;
}

interface ResumeData {
  id: string;
  fileName: string;
  uploadDate: Date;
  fileSize: number;
  status: 'active' | 'processing' | 'error';
}
```

#### JobConfigSection Component
```typescript
interface JobConfigSectionProps {
  settings: JobSettings;
  onSettingsChange: (settings: JobSettings) => void;
}

interface JobSettings {
  difficultyLevel: 'easy' | 'medium' | 'difficult';
  questionCount: number; // 6-15 range
  preferences: {
    jobTypes: string[];
    industries: string[];
  };
}
```

#### UserProfileModal Component
```typescript
interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

interface UserProfile {
  name: string;
  email: string;
  resumeInfo: ResumeData | null;
  activityHistory: ActivityRecord[];
  preferences: UserPreferences;
}

interface ActivityRecord {
  id: string;
  type: 'resume_upload' | 'settings_change' | 'job_application';
  timestamp: Date;
  description: string;
}
```

### Custom Hooks

#### useResume Hook
```typescript
interface UseResumeReturn {
  resume: ResumeData | null;
  uploadResume: (file: File) => Promise<void>;
  deleteResume: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

#### useJobSettings Hook
```typescript
interface UseJobSettingsReturn {
  settings: JobSettings;
  updateSettings: (settings: Partial<JobSettings>) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

#### useUserProfile Hook
```typescript
interface UseUserProfileReturn {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  activityHistory: ActivityRecord[];
  isLoading: boolean;
  error: string | null;
}
```

## Data Models

### Database Schema Extensions

#### user_profiles Table
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### resumes Table
```sql
CREATE TABLE resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'processing', 'error')),
  UNIQUE(user_id) -- One resume per user
);
```

#### job_settings Table
```sql
CREATE TABLE job_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'difficult')),
  question_count INTEGER DEFAULT 10 CHECK (question_count >= 6 AND question_count <= 15),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### activity_history Table
```sql
CREATE TABLE activity_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### File Storage Structure
```
supabase-storage/
└── resumes/
    └── {user_id}/
        └── {resume_id}.{extension}
```

## Error Handling

### Error Categories
1. **Authentication Errors**: Handle session expiry and unauthorized access
2. **File Upload Errors**: Handle file size limits, format validation, storage failures
3. **Validation Errors**: Handle form validation for settings and profile updates
4. **Network Errors**: Handle connection issues and API failures
5. **Database Errors**: Handle constraint violations and data consistency issues

### Error Handling Strategy
- Use React Error Boundaries for component-level error catching
- Implement toast notifications for user-facing error messages
- Log errors to console in development, external service in production
- Provide fallback UI states for failed data loads
- Implement retry mechanisms for transient failures

### Error UI Components
```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

## Testing Strategy

### Unit Testing
- Test custom hooks with React Testing Library
- Test utility functions for data validation and formatting
- Test error handling logic and edge cases
- Mock Supabase client for isolated testing

### Integration Testing
- Test component interactions with authentication context
- Test file upload flow end-to-end
- Test settings persistence and retrieval
- Test profile update workflows

### Component Testing
- Test Dashboard component with different user states
- Test ResumeSection with various resume states
- Test JobConfigSection form validation
- Test UserProfileModal interactions

### E2E Testing Scenarios
- Complete user registration and dashboard access flow
- Resume upload and management workflow
- Settings configuration and persistence
- Profile management and password change

## Performance Considerations

### Optimization Strategies
- Lazy load dashboard components for faster initial page load
- Implement file upload progress indicators and chunked uploads
- Use React Query for efficient data caching and background updates
- Optimize image assets and implement proper loading states
- Implement virtual scrolling for activity history if needed

### Caching Strategy
- Cache user profile data with React Query (5-minute stale time)
- Cache job settings with React Query (10-minute stale time)
- Cache resume metadata but not file content
- Implement optimistic updates for settings changes

### Bundle Optimization
- Code split dashboard components from landing page
- Lazy load profile modal and settings components
- Optimize shadcn/ui component imports to reduce bundle size