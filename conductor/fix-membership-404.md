# Plan: Fix 404 Error for New User Membership

## Background & Motivation
Currently, when a new user visits the Profile page (which fetches `/api/rewards/my-membership`), the backend returns a `404 Not Found` if the user does not yet have a record in the `Membership` collection. This HTTP 404 response causes Axios to throw an error, breaking the UI in `Profile.jsx`.

## Scope & Impact
- **Backend (`tier.controller.js`):** Modify `getMyMembership` to return a default membership object (`200 OK`) instead of a `404` error for users without existing membership data. 

## Proposed Solution
Instead of treating an empty membership as an error, we will treat it as a valid state (i.e., a new user with 0 points).

### Code Changes
**File:** `backend/src/controllers/tier.controller.js`
Replace:
```javascript
if (!membership) return res.status(404).json({ status: 'error', message: 'Membership not found' });
```
With:
```javascript
if (!membership) {
  return res.json({ 
    status: 'success', 
    data: { rollingPoints: 0, currentPoints: 0, tierId: null } 
  });
}
```

## Verification
- Create a new user account.
- Navigate to the Profile page (`/profile`) and check the "Ưu đãi & Hạng" tab.
- The page should render normally showing 0 points without throwing a 404 error in the console.
