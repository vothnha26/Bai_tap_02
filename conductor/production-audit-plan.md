# Production Code Audit Report & Implementation Plan

**Project:** PubliCast
**Date:** 03/06/2026
**Overall Grade:** B

## Executive Summary
The PubliCast codebase demonstrates a solid MERN stack architecture with good adherence to SOLID principles, separation of concerns (Controllers, Services, Repositories), and modern security features (Rate limiting, Helmet, Bcrypt). However, there are significant deviations from the project's own mandates, primarily regarding logging, and several performance bottlenecks (N+1 queries and missing database indexes) that must be addressed before the application can be considered fully production-ready.

**Critical Issues:** 2
**High Priority:** 2
**Medium Priority:** 2
**Recommendation:** Implement the fixes in 3 phases to ensure stability.

---

## Findings by Category

### Architecture (Grade: B)
- **Issue 1 (Medium):** Minor bleeding of business logic into repositories. For example, `product.repository.js` parses special category slugs (`khuyen-mai`, `ban-chay`), which should ideally be handled by the Service layer before passing clean filters to the Repository.

### Security (Grade: A-)
- **Issue 1 (Medium):** General frontend exception logging. There are many `console.error` calls scattered across the frontend React components instead of a centralized error reporting mechanism (like Sentry).
- *Positives:* Excellent use of `bcryptjs` (12 rounds), `helmet`, `express-rate-limit`, `HttpOnly/Secure/SameSite` cookies for JWTs, and `express-validator`.

### Performance (Grade: C)
- **Issue 1 (Critical): N+1 Query in Product Filtering.** In `product.repository.js` (`searchAndFilter`), when filtering by category slugs, the code loops over an array of slugs and performs `await Category.findOne({ slug: input })` sequentially.
  - *Fix:* Replace the loop with a single query using `$in` operator: `await Category.find({ slug: { $in: slugs } })`.
- **Issue 2 (High): Missing Database Indexes.** While `_id` and unique fields are indexed, the `Order` model lacks compound indexes for frequently queried fields like `userId`, `status`, and `createdAt` (used heavily in `findByUserId`).
  - *Fix:* Add `orderSchema.index({ userId: 1, createdAt: -1 })` and `orderSchema.index({ status: 1 })`.

### Code Quality (Grade: C+)
- **Issue 1 (Critical): Widespread Console Logging in Backend.** Despite the explicit mandate in `GEMINI.md` ("Logging: KHÔNG sử dụng console.log/error. Bắt buộc dùng utils/logger.js (Winston)"), there are over 100 instances of `console.log` and `console.error` across workers, controllers, and services.
  - *Fix:* Replace all `console.*` calls with `logger.info`, `logger.warn`, or `logger.error` using the existing Winston setup.
- **Issue 2 (High): Hardcoded Strings.** There might be some strings not using `utils/constants.js`.

---

## Proposed Implementation Plan

### Phase 1: Security & Compliance Fixes
1. **Enforce Winston Logger:** Replace all `console.log` and `console.error` occurrences in `backend/src/` with `logger.info` and `logger.error` to comply with the project mandates.
2. **Review Constants:** Ensure status codes and event names use `utils/constants.js`.

### Phase 2: Performance Optimizations
1. **Fix N+1 Query in Products:** Refactor `product.repository.js` to batch query categories by slug rather than querying in a loop.
2. **Add MongoDB Indexes:** Update `Order.js` (and any other heavily queried models) to include appropriate single and compound indexes for frequent query patterns.

### Phase 3: Code Quality Improvements (Frontend)
1. **Clean up Frontend Logs:** Remove or centralize `console.error` logs in the frontend React components to prevent sensitive error leakage in the production console.

## Verification
- Run `npm test` in backend to ensure business logic remains intact.
- Verify that `winston` captures all logs and `console` output is silenced.
- Monitor execution time of `productApi.search` after the N+1 fix.

## Approval Request
Please review the findings and the proposed plan above. Let me know if you approve this plan, and I will proceed with the implementation.