# MMG Tracker - Store Module Rebuild

This package preserves the existing MMG Tracker application and replaces the old Store dashboard/controller with a new Store workflow.

## Roles
- JS_ADMIN and DIRECTOR_ADMIN: identical executive access, including full Store control and direct ledger deletion.
- ADMIN: Store read-only/search access, plus can create demands.
- OIC_STORE: full Store operational access and correction review/approval.
- BILLING: full normal Store operational access, raises corrections and applies OIC-approved corrections.

Legacy STORE accounts should be migrated to BILLING or OIC_STORE. The supplied SQL migration maps old STORE accounts to BILLING.

## Category subfields
Each Store category starts with at least three metadata fields (Serial number, Specification, and Remarks). Store staff can add additional fields while creating a category. Existing categories are backfilled with the same three defaults at startup.

## Store modules
1. Dashboard summary
2. Store categories
3. Store item catalogue
4. Receipt/Issue ledger
5. Search across ledger fields
6. Demands from Admin/executive admin
7. Demand fulfilment by Store staff
8. Billing correction requests
9. OIC review and instructions
10. Recalculation of balances after approved corrections

## Ledger columns
- DATE
- PARTICULARS: Vendor Name + User Unit Name
- BILL NO. / ISSUE VOUCHER NO.
- UNIT PRICE
- RECEIPT
- ISSUE
- BALANCE: quantity + monetary value
- REMARKS

Balance value is maintained using weighted-average valuation for issue transactions. The ledger is recalculated chronologically whenever a correction is applied.

## Database
The application uses `spring.jpa.hibernate.ddl-auto=update` for development. `STORE_REBUILD_MIGRATION.sql` is also included for explicit database migration and role creation.

## Start
Backend:
```bash
./mvnw spring-boot:run
```

Frontend:
```bash
cd mmg-frontend
npm install
npm run dev
```
