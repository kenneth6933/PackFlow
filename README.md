# PackFlow v0.15
PC Admin login uses the fixed ADMIN account: enter its existing password only. This is a sign-in UI change, not an authentication bypass; Firebase permissions are unchanged. Other Admin IDs can still use the mobile entry. Mobile retains assigned ID and password.
The Admin login uses a dark card with orange accent and K&H Wholesale Trading company text. Show/hide password and browser password-manager preference remain.

Payroll/My earnings date filtering uses Today, Yesterday, This Month (default), Last Month, Custom Range. Custom Range has inclusive From/To dates and Apply. Dates follow Asia/Singapore and actual collection occurredAt, not confirmation time. Totals, records and payroll export use the applied range. Changing the filter does not change stored service months or statements. Close month remains a separate month-based accounting action with an explicit month input.
Only the Packer My earnings screen removes Pending amount and Monthly status cards; Admin keeps them.
Packer menu: Outstanding → To confirm → My earnings → History.

Launch Start-Admin.bat or Start-Mobile.bat with Node.js 22+. Development: npm ci, npm test. Firestore emulator checks separately: npm run test:rules.
Existing v0.14 Admin menu groups, quantity-only Damage & Loss actions, imports and historical records remain. Firebase config and Firestore Rules unchanged; no re-publication required if v0.12 Rules already published.
