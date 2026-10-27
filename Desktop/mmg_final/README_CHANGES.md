# MMG Tracker: Updated Project

## What changed

- Replaced the old `SUPER_ADMIN` access role with `JS_ADMIN` and added `DIRECTOR_ADMIN`. Both executive roles receive the same broad privileges for dashboard visibility, team ownership, user administration, Store oversight, item assignment, and password resets.
- Added a startup compatibility migration: existing `SUPER_ADMIN` accounts become `JS_ADMIN`; old `VENDOR` accounts become `EMPLOYEE`; legacy `STORE` accounts become `BILLING`. The obsolete roles are then removed.
- Removed vendor selection, vendor columns, vendor filters, vendor management, and the separate vendor portal from the general item-tracking workflow. Vendor/supplier names remain available only in the Store ledger. The item upload endpoint is now `POST /api/items/upload` and is available to Admin and executive roles.
- Added persistent Store category subfields. New categories start with three subfields (Serial number, Specification, and Remarks), and the catalogue form has an **Add subfield** control. Existing categories without fields are backfilled at startup.
- Refreshed the interface with the existing navy/teal colour language and restrained motion, now framed as an internal government operations portal with an institutional masthead, module breadcrumb ribbon, grouped navigation, access-level panel, account menu, and responsive mobile navigation. The item registration and document record dialogs have also been redesigned.
- Included the Maven Wrapper scripts so Maven can be invoked without a separate global Maven install.

## Run on Windows

### 1. Start the backend

Open PowerShell in the project root:

```powershell
cd C:\Users\Akash\Desktop\mmg_final
.\mvnw.cmd clean spring-boot:run
```

The first run may need an internet connection so Maven Wrapper can download Maven. Check `src/main/resources/application.properties` for the MySQL connection settings and make sure the `mmg_tracker` database is running.

### 2. Start the frontend

Open a second terminal:

```powershell
cd C:\Users\Akash\Desktop\mmg_final\mmg-frontend
npm install
npm run dev
```

Vite will print the local development URL, normally `http://localhost:5173`.

## Database notes

The application uses `spring.jpa.hibernate.ddl-auto=update`, so the new `store_category_fields` and `item_documents` tables are created automatically on startup. Role migration and default Store category fields are also handled by `RoleInitializer`. `STORE_REBUILD_MIGRATION.sql` has been updated for teams that prefer to run the SQL migration explicitly. Do not run migrations against a production database without first taking a backup.

## Multi-document register and permissions

- An item can have multiple files, and each file has its own remarks, original filename, uploader, upload timestamp, and last-editor metadata.
- Files can be uploaded while registering a new item or later from the item's **Document register**.
- Executive roles (`JS_ADMIN`, `DIRECTOR_ADMIN`) can upload, edit remarks, replace, download, and delete item documents.
- `ADMIN` can manage documents for unassigned items and items owned by their team. `EMPLOYEE` can view/download and add or edit attachments on assigned items, but cannot delete them. The server checks item ownership on every request; the UI permission flags are only a reflection of those server rules.
- Existing single-file attachments are migrated into `item_documents` when an authorised user first opens the item record. Files are stored under `uploads/`; max size is 20 MB per file and 100 MB per multipart request.

## Validation

The 20 frontend JavaScript/JSX files were syntax-checked and the CSS brace balance was checked successfully. A full Vite production build could not be completed in this environment because the available dependency bundle is Windows-specific and the install attempt could not finish. Maven is not installed in this environment, and the Maven Wrapper distribution could not be downloaded here, so the backend compile still needs to be verified on Windows using the included wrapper.

## Dashboard analytics and readability update

The latest dashboard revision replaces the row of plain status totals with a chart-led operational view. The admin dashboard, office overview, and employee dashboard now show large metric panels, a status-distribution doughnut chart, and a horizontal workload view. The office overview also includes inventory position cards and a workload table with allocation bars.

- Status chart values come from the signed-in user's accessible dashboard summary. Staff workload bars are derived from the accessible item register and grouped by assigned employee; they do not fabricate historical trends.
- The item and employee register pages have clear section headings, context copy, view counts, and more prominent search, export, and registration actions.
- Global typography and navigation sizing have been increased for readability, including table rows, form controls, supporting text, and the multi-document register.
- Layouts are responsive and retain the existing colour palette, theme switcher, and motion styling.

Validation performed in this environment: all 21 frontend JavaScript/JSX files parsed successfully, relative imports and imported Lucide icon exports were checked, and the stylesheet parsed successfully. A production build could not be completed here because the available node_modules bundle contained Windows-only Rollup binaries and downloading the Linux optional dependency timed out. Run `npm install` and `npm run build` on the target Windows machine to verify the final build locally.
