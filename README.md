# SanoCare Portal - Next.js Application

A comprehensive telemedicine platform built with Next.js, Supabase, and TypeScript supporting Doctor, Field Node, Patient, and Admin portals.

## 🚀 Project Status

### ✅ Core Infrastructure Complete
- **Frontend Framework:** Next.js 14+ with App Router
- **Backend:** Supabase (Authentication + PostgreSQL Database + RLS)
- **State Management:** Zustand + React Context
- **Design System:** Custom design tokens + Tailwind CSS
- **API Integration:** RESTful via Supabase client library

### ✅ Authentication & Authorization
- Supabase JWT-based authentication (magic link + password)
- Role-based access control (RBAC) via RLS policies
- Protected API routes with middleware
- Session persistence across refreshes

### ✅ Core Services Layer (700+ lines)
All services fully typed and production-ready:
- **Doctor Services:** Queue management, vitals, SOAP notes, case closure
- **Field Node Services:** Dispatch, vitals capture, GPS tracking, live location
- **Patient Services:** Booking, status tracking, health records
- **Admin Services:** Case analytics, medic management, assignments
- **Auth Services:** Login, logout, profile management

### ✅ React Hooks Layer (800+ lines)
18 custom hooks with full state management:
- Auto-loading/error states
- Real-time subscriptions
- Memoized callbacks
- Zustand integration ready

### ✅ Wired Components (3 Complete)
1. **Doctor Queue Component** - Lists cases, filters by priority/location, updates real-time
2. **Field Node Job Alerts** - Shows dispatch notifications, accepts/rejects cases
3. **Patient Booking Modal** - Form with real-time availability check, Supabase writes

---

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── (patient)/                # Patient portal routes
│   ├── doctor/                   # Doctor portal routes
│   ├── field-node/               # Field node portal routes
│   └── admin/                    # Admin portal routes
├── components/
│   ├── doctor/                   # Wired doctor components
│   │   └── DoctorQueue.tsx      ✅ COMPLETE
│   ├── field-node/
│   │   └── FieldNodeJobAlerts.tsx ✅ COMPLETE
│   ├── patient/
│   │   └── BookingModal.tsx      ✅ COMPLETE
│   └── admin/
├── hooks/
│   └── useSupabaseIntegration.ts # 18 custom hooks
├── lib/
│   ├── supabaseServices.ts       # Business logic layer
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # Utilities
├── store/                        # Zustand stores
└── design-system/                # Design tokens
```

---

## 🔧 Getting Started

### Prerequisites
- Node.js 18+
- npm/yarn/pnpm
- Supabase project (free tier available)

### Installation

```bash
# Install dependencies
npm install

# Create .env.local with your Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔌 How to Wire Components

### Step 1: Use the Custom Hook in Your Component
```tsx
import { useDoctorQueue } from '@/hooks/useSupabaseIntegration';

export default function MyComponent() {
  const { cases, loading, error } = useDoctorQueue();
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {cases && cases.map(c => <CaseCard key={c.id} case={c} />)}
    </div>
  );
}
```

### Step 2: Call Mutation Hooks for Changes
```tsx
const { updateStatus, loading } = useUpdateCaseStatus();

const handleAccept = async (caseId) => {
  const result = await updateStatus(caseId, 'accepted');
  if (result.success) {
    // Data automatically updates!
  }
};
```

### Step 3: Real-Time Updates Included
All query hooks automatically subscribe to Supabase real-time changes. No additional setup needed.

---

## ✅ What's Complete & Ready to Use

### Fully Wired Components (Production-Ready)
1. ✅ **DoctorQueue.tsx** - Lists cases with filtering, pagination, real-time updates
2. ✅ **FieldNodeJobAlerts.tsx** - Dispatch notifications with accept/reject actions
3. ✅ **BookingModal.tsx** - Patient booking form with Supabase integration

### Available Hooks (Ready for Any Component)
| Category | Hooks | Status |
|----------|-------|--------|
| **Doctor** | useDoctorQueue, useDoctorVitals, useSaveSOAPNotes, useCloseCase | ✅ |
| **Field Node** | useDispatchQueue, useAcceptCase, useSubmitVitals, useGPSTracking | ✅ |
| **Patient** | useCreateBooking, useBookingStatus, useHealthRecords | ✅ |
| **Admin** | useAllCases, useAvailableMedics, useForceAssignCase | ✅ |
| **Auth** | useLogin, useLogout, useAuthUser | ✅ |

---

## 📚 Documentation Files

- **[INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md)** - Real code examples for every component hook
- **[SUPABASE_SETUP_GUIDE.md](./SUPABASE_SETUP_GUIDE.md)** - Database schema and RLS setup
- **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete hook and service API documentation
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Common tasks and snippets
- **[design_system.md](./design_system.md)** - Design tokens and component guidelines

---

## 🛠️ Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 📋 Remaining Work

### High Priority (Impact Everything)
- [ ] Wire remaining patient components (Tracking, History, Home)
- [ ] Wire remaining doctor components (Dashboard, SOAP notes, Case summary)
- [ ] Wire remaining admin components (Heatmap, Operations, Assign)
- [ ] Wire remaining field node components (Dashboard, Vital capture, Video call)

### Medium Priority
- [ ] Implement error boundaries for all portals
- [ ] Add toast notifications for user feedback
- [ ] Implement loading skeletons for better UX
- [ ] Add infinite scroll/pagination to list components
- [ ] Implement search and advanced filtering

### Lower Priority
- [ ] Mobile responsiveness refinements
- [ ] Analytics integration
- [ ] Performance optimization (code splitting, caching)
- [ ] E2E tests with Playwright/Cypress
- [ ] Storybook stories for all components

---

## 🐛 Troubleshooting

### "Supabase key not found"
Ensure `.env.local` has both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "Data not updating in real-time"
Check Supabase RLS policies allow your user role to access the table

### "Hook returns undefined"
Ensure component is a Client Component (add `'use client'` at top)

---

## 📞 Support

For component-specific integration help, refer to [INTEGRATION_EXAMPLES.md](./INTEGRATION_EXAMPLES.md) for your use case.

---

## 🔐 Security Notes
- All database queries respect RLS policies automatically
- Sensitive operations (case assignment, vital submission) require proper user roles
- Environment variables are not exposed to client in production
- JWT tokens expire and refresh automatically

---

**Last Updated:** November 2024  
**Framework Version:** Next.js 14+  
**Node Version:** 18+  
**Status:** Early Production (Core features stable, ongoing feature completion)
