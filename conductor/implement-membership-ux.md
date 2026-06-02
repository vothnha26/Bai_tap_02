# Plan: Implement Membership UX/UI Enhancements

## Background & Motivation
The current `Profile.jsx` and `TierProgressBar.jsx` components handle user membership and reward data but lack high-end visual design, perpetual micro-interactions, and robust UX feedback states (Loading, Empty, Error). As a premium feature, the Membership tab should feel engaging, fast, and visually sophisticated, adhering to "Bento Grid" and "Liquid Glass" design paradigms.

## Scope & Impact
- **Target Files:**
  - `frontend/src/pages/Profile.jsx` (Extract Membership tab logic into a dedicated component).
  - `frontend/src/pages/Profile/MembershipTab.jsx` (New Component).
  - `frontend/src/pages/Profile/TierProgressBar.jsx` (Refactor for better motion and layout).
- **UX/UI Improvements:**
  - Introduce Framer Motion for perpetual micro-interactions (e.g., pulsing tier badges, smooth progress bar filling).
  - Implement Bento Grid layout for the Membership and Rewards sections.
  - Implement robust UX Feedback: Skeletal Loaders for fetching data, polished Empty States for new users, and graceful Error handling.
- **Security & Integrity:**
  - Ensure isolated Client Components (`"use client"`) for animations to prevent performance degradation.
  - No exposure of sensitive token data; handle 401/403 API errors gracefully with inline recovery options.

## Proposed Solution & Phased Implementation

### Phase 1: Scaffold `MembershipTab` Component
Create a dedicated, modular component for the Membership tab to reduce bloat in `Profile.jsx`.
- **Props:** `membership` (object), `tiers` (array), `isLoading` (boolean), `error` (string/null).
- **Internal State:** Framer Motion layout IDs and animation variants.

### Phase 2: Implement UX Feedback States (The 4 Core States)
- **Loading State:** Create a `MembershipSkeleton` component mimicking the Bento Grid layout.
- **Empty State:** If `membership.tierId` is null (new user), render an engaging "Welcome to PubliCast Rewards" card emphasizing the first tier benefits.
- **Error State:** If `error` exists (e.g., network failure), show a localized retry button without crashing the entire Profile page.
- **Success State:** Render the actual `TierProgressBar` and Benefits Grid.

### Phase 3: High-Agency Visual Design (Bento Grid & Motion)
- **Layout:** Use Tailwind CSS Grid (`grid-cols-1 lg:grid-cols-3 gap-6`) for an asymmetric Bento layout.
- **Styling:** Apply pure white cards with `shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]` and `rounded-[2.5rem]`.
- **Motion:** 
  - Add staggered reveals (`staggerChildren`) for benefits list.
  - Add a "Liquid Glass" effect (inner borders `border-white/10` and subtle backdrop blur) to the "Tiến trình thăng hạng" card.

## Verification & Testing
1. **Empty State Test:** Login with a brand-new account (0 points, no tier). Verify the welcoming empty state.
2. **Loading Test:** Throttle network in DevTools to "Slow 3G" and verify the `MembershipSkeleton` renders accurately without jumping layout.
3. **Success State Test:** Login with an account having points. Verify the Progress Bar animates smoothly and the Bento grid aligns perfectly across mobile (`sm`) and desktop (`lg`).
4. **Console Audit:** Ensure zero React warnings regarding missing keys, DOM nesting, or invalid DOM properties.
