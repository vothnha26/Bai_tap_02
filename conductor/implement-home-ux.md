# Plan: Upgrade Home Page UX/UI

## Background & Motivation
The current `Home.jsx` provides a functional layout but exhibits standard "AI-generated" aesthetics (e.g., centered Hero gradients, generic shadows, standard card grids, and a single spinner for loading). To elevate PubliCast to a premium, high-agency design standard, we will apply the "Bento Grid", "Asymmetric Layouts", and "Perpetual Micro-Interactions" paradigms while integrating robust UX Feedback states.

## Scope & Impact
- **Target Files:**
  - `frontend/src/pages/Home.jsx`
  - `frontend/src/pages/Home/HomeSkeleton.jsx` (New)
  - `frontend/src/pages/Home/HeroSection.jsx` (New - extracted)
  - `frontend/src/pages/Home/CategoryBento.jsx` (New - extracted)

## Proposed Solution & Phased Implementation

### Phase 1: UX Feedback (The 4 Core States)
- **Loading State:** Build a `HomeSkeleton` component. Instead of a single spinning loader, render a full-page skeleton that exactly matches the structure of the Hero, Features, and Product Carousels. This prevents jarring layout shifts.
- **Error State:** Refine the current red error box into an inline, graceful error boundary with a clear "Retry" action that doesn't scream "broken".
- **Empty States:** Ensure carousels degrade gracefully with a friendly empty message if a specific product category returns an empty array.

### Phase 2: High-Agency Design (Anti-Slop Implementation)
- **Hero Section Redesign (Asymmetric Bias):** Remove the centered, purple-gradient background. Implement an asymmetric Split-Screen Hero: Left-aligned bold typography (`tracking-tighter`, high contrast) and a right-aligned, styled asset or abstract 3D visual placeholder (with Liquid Glass refraction).
- **Feature Cards Hardening:** Remove generic `shadow-xl`. Use minimalist containers (`rounded-[2.5rem]`, pure white, 1px subtle borders, diffusion shadows).
- **Category Bento Grid:** Transform the standard 6-column category grid into a Bento Grid. Categories with more weight/items span multiple columns/rows. 

### Phase 3: Motion & Micro-Interactions (Framer Motion)
- **Perpetual Motion:** Apply spring physics to buttons and category tiles. Add a subtle continuous floating effect or shimmer to the background of the Hero section.
- **Staggered Reveals:** Use `staggerChildren` to reveal the Feature Cards and Best Seller products sequentially on scroll.

## Verification & Testing
1. **Loading Test:** Set network to "Slow 3G" and verify the `HomeSkeleton` provides a smooth, layout-stable loading experience.
2. **Responsive Test:** Ensure the Asymmetric Hero and Bento Grid collapse safely to a single column on mobile screens without horizontal scrolling.
3. **Motion Check:** Verify that Framer Motion spring physics trigger smoothly on hover/tap without causing GPU spikes.
