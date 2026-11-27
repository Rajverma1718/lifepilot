# LifePilot

Private task, bill, document and family management app by Raj Verma. AI is intentionally deferred.

## Run

Use Node.js 22 or newer. Run `node serve.cjs` and open http://127.0.0.1:4195. This app uses Firebase CDN modules, so it needs an internet connection. No frontend package installation is needed.

Run `node --test model.test.mjs` for local tests. Run `node build.cjs` to create the public `dist` directory. The GitHub Pages workflow runs these checks before publishing.

## Implemented

- Firebase email/password authentication, Google sign-in, password reset and verification email.
- Separate private workspace per user, live Firestore updates, explicit connection errors and retry.
- Task and bill create/edit/delete, completion, recurring monthly/yearly bills, expiry tracking.
- Document upload/download/delete with type and 10 MB limits (requires active Firebase Storage).
- Family spaces with email-bound, seven-day invitation links; verified-email acceptance; member removal.
- Owner manages membership. Parents manage shared tasks, bills and documents. Members manage shared tasks. Viewers have read-only family access.
- Uploaded private files stay private. A file explicitly uploaded to a family vault is visible to current members.
- Browser reminders while the app is open, CSV reports, metadata backup/restore and responsive navigation.
- Rules prohibit cross-user private access and client-side role escalation. Revision checks detect conflicting private-workspace saves.

## Deployment status and limits

Firestore has been created and the rules deployed. Live tests passed for private reads/writes, denial of cross-user and anonymous access, shared-task permissions, role escalation denial and removal of family access. Local recurrence, report, reminder and text-escaping tests passed.

Firebase Storage still reports that it is not configured. Storage rules are prepared but cannot be activated until the bucket is set up. Upload/download and file-sharing flows are therefore not verified live.

Automatic email reminders are not active: they need a provider account, verified sender, backend credentials and explicit approval of the email data-processing design. Browser reminders do not run after the app is closed. Google popup completion and full multi-browser UI testing have not been verified by automation in this environment.

This release must not be described as all planned features complete while those blockers remain.

## Firebase deploy

Authenticate using your own Firebase CLI session. Run `node build.cjs`, then `firebase deploy --only firestore:rules,storage,hosting --project lifepilot-raj-2026` after Storage setup. Never commit CLI credentials, service-account JSON, email provider secrets or real passwords.

Firebase browser configuration is public project metadata; access control is enforced by Firebase Authentication and the deployed database/storage rules.

