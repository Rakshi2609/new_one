# Development Log

## Recent Implementations

### 1. Authentication and Data Isolation (JWT & Role-Based Access)
We implemented a lightweight MVP authentication system to isolate patient data without requiring an external database migration.

- **Storage Architecture**: Added an `AuthRepository` that leverages the existing Fernet encryption system to securely store user credentials in `vault/users.json.enc`.
- **JWT Sessions**: Sessions are managed via JWT tokens. `PyJWT` is used to create and verify tokens across all `/api/patient/*` routes.
- **Roles**:
  - **Patients**: Can sign up, log in, and view their dashboard. The system automatically extracts their `patient_id` from their JWT token, guaranteeing that patients cannot access other patients' data.
  - **Doctors**: A `doctor` account (password: `doctor123`) is hardcoded. Doctors have access to a dedicated Doctor Dashboard where they can search for a patient by their ID and securely manage their records.

### 2. UI / UX Enhancements
- Created dedicated Login (`/login`) and Sign-up (`/signup`) pages.
- Built a specialized Doctor Dashboard (`/doctor`) restricted to the `DOCTOR` role.
- Refactored `App.tsx` routing to include `ProtectedRoute` wrappers, preventing unauthorized access.
- Updated API clients (`client.ts`) to seamlessly intercept and inject the Authorization bearer token into all outgoing requests.

### 3. Vault Security Updates
- Rotated the master `vault/.vault_key`.
- Re-encrypted all existing `.json.enc` files (`users.json.enc`, `demo.json.enc`) under the new vault key to maintain strict data privacy.
