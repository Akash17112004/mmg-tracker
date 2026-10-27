# Item document register

## Workflow

1. On **Register an item**, choose multiple files and enter separate remarks for each attachment.
2. To add files later, open the item from the Item Status Register, My Dashboard, or Activity & Audit Trail, then use **Document register**.
3. Registered files can be downloaded. Users with edit rights can change the remarks or replace a file. A replacement keeps the same document record and records the latest editor/time.
4. Old single-file attachments are imported into `item_documents` the first time an authorised user opens that item's document register, so they can follow the same permission policy.

## Role permissions

| Role | View/download | Upload | Edit remarks/replace | Delete |
|---|---:|---:|---:|---:|
| `JS_ADMIN` | Yes | Yes | Yes | Yes |
| `DIRECTOR_ADMIN` | Yes | Yes | Yes | Yes |
| `ADMIN` | Own/unassigned items | Own/unassigned items | Own/unassigned items | Own/unassigned items |
| `EMPLOYEE` | Assigned items | Assigned items | Assigned items | No |
| Store-only roles | No item-register access | No | No | No |

The backend enforces these rules on every request. The frontend reads the permission flags from `GET /api/items/{itemId}/documents` to decide which controls to show.

## Endpoints

- `GET /api/items/{itemId}/documents`: file listing and effective permissions.
- `POST /api/items/{itemId}/documents`: multipart fields `files` (repeated) and `remarks` (repeated in the same order).
- `GET /api/items/{itemId}/documents/{documentId}/download`: download a registered file.
- `PUT /api/items/{itemId}/documents/{documentId}`: multipart `remarks` and optional replacement `file`.
- `DELETE /api/items/{itemId}/documents/{documentId}`: delete a registered file if permitted.

Hibernate creates/updates the `item_documents` table using the existing `spring.jpa.hibernate.ddl-auto=update` configuration. Back up the database before deploying schema updates to a production instance.
