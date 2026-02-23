# Specification

## Summary
**Goal:** Implement a hidden keyboard shortcut (Ctrl + Q) that allows users to navigate to the Admin dashboard, with role-based access control enforced by the backend.

**Planned changes:**
- Add global keyboard listener for Ctrl + Q that navigates to /admin when user is authenticated and inside the application
- Block shortcut when focus is on input fields, textareas, or contenteditable elements
- Navigate silently for Admin and SuperAdmin users without any visual feedback
- For Patient and Doctor users, allow backend to validate role and redirect unauthorized users to their dashboard with "Access Denied." toast
- Remove all visible Admin navigation links from Header and sidebar for all user roles
- Ensure smooth route transitions consistent with existing light medical theme design system
- No visible indicators or hints of the shortcut's existence in the UI

**User-visible outcome:** Admin and SuperAdmin users can quickly access the Admin dashboard using Ctrl + Q without visible navigation links. Unauthorized users (Patient/Doctor) attempting the shortcut will be redirected to their dashboard with clear feedback. The UI remains clean with no visible admin navigation elements.
