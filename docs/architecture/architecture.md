# HomeQuote Link - Architecture & Gap Analysis

## 1. Project Overview
HomeQuote Link is a Lovable Native application built with React, Vite, TypeScript, Tailwind CSS, and Shadcn UI. It serves as a lead generation and routing platform connecting homeowners with service providers (plumbers, HVAC, landscaping, electrical). Data and authentication are powered by Supabase.

## 2. Core Architecture
- **Frontend Framework**: React 18 / Vite / TypeScript
- **State Management & Data Fetching**: React Query (`@tanstack/react-query`)
- **Styling UI**: Tailwind CSS + Shadcn UI components + Framer Motion for animations
- **Routing**: `react-router-dom` (Public landing pages, Service pages, Blog, Provider/Admin Dashboards)
- **Database & Backend**: Supabase (PostgreSQL). Types are auto-generated and reside in `src/integrations/supabase/types.ts`.

## 3. Database Schema Overview
The database supports three core pillars:
1. **Lead Generation & Routing**: `leads`, `lead_events`, `lead_nurture_emails`, `lead_feedback`, `routing_settings`, `buyers`, `buyer_profiles`.
2. **Content Management**: `posts`, `post_versions`, `post_metrics`, `media_assets`.
3. **Admin & Analytics**: `admin_users`, `admin_settings`, `analytics_events`, `blocked_emails`, `blocked_phones`, `reviews`, `homeowner_profiles`.

## 4. Gap Analysis (Against best practices & current state)
- **Environment Structure**: This repository was just cloned into the workspace. The working model needs to be mapped to the `docs/architecture/CONTEXT.md` standards.
- **Testing**: Vitest and React Testing Library are installed, but test coverage for specific routing logic and Supabase endpoints may need verification as we proceed.
- **Security Check**: Spam monitoring exists (`blocked_emails`, `blocked_phones`), but further gap analysis may be needed if new IP banning features are deployed.

## 5. Next Steps
- Implement any required DB changes via dead-drop migrations into `supabase/migrations/`.
- Ensure new features adhere to the Lovable bidirectional sync (frontend is open, Supabase auto-generated folder is forbidden).
