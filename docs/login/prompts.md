Prompt: Implement Login Feature (Internal Monitoring App)

Implement a Login feature for the monitoring app with the following requirements.
Focus on correctness, clean architecture, and future extensibility. Do not add any unnecessary features.

1. Login Flow

Default app entry (/) must redirect to Login page if user is not authenticated.

Login page includes:

Username / Email input

Password input

Submit button with loading state

Error message area

2. Authentication Logic

Use existing internal login API (do NOT create a new auth system).

On submit:

Call login API

Receive response including user profile (example fields: id, name, email, dept, token, etc.)

3. Access Control Rule

Only users with

"dept": "TIT00302"


are allowed to access the app.

If login succeeds but dept is NOT TIT00302:

Do NOT allow access

Clear any stored auth data

Show this exact message (use this wording):

"You do not have permission to access this application. Please contact your system administrator."

4. Auth State & User Storage

After successful login and dept validation:

Store currentUser in a centralized auth state (context/store)

Store token in a secure, reasonable place (prefer memory or session-based storage)

currentUser must be globally accessible for future features:

ticket creation (requester info)

audit logs

app / server actions

Do NOT implement business logic for tickets yet — only ensure currentUser is structured and reusable.

5. Route Protection

Protect all main routes (/dashboard, /servers, /apps, /tickets, etc.)

If user is not authenticated → redirect to /login

If token exists but user data is invalid → force logout

6. UI & Component Guidelines

Use HeroUI components only

Recommended structure:

Centered Card

Input for credentials

Button (full width)

Keep UI minimal, internal-app style (no signup, no forgot password, no social login).

7. Code Quality

Separate concerns:

auth service (API calls)

auth store/context

route guard

Avoid hardcoding values outside config/constants.

Add basic error handling and loading states.

Deliver a clean, production-ready login foundation suitable for an internal IT-only monitoring application.