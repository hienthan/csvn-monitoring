PROMPT 1 — Implement Backup Feature Pages (Overview + Detail) + RBAC

Context
You are working on an internal Monitoring App (React + Tailwind + HeroUI v2 + Recharts). This feature is Backup. Data is stored in PocketBase. Team is small, one main server, but UI is global overview across servers/apps.

Non-negotiable UI constraints

Use HeroUI v2 components (Table, Card, Chip, Tabs, Button, Tooltip, Input, Select, SelectItem, Accordion/Collapse if needed, Modal).

Dark mode primary. Follow existing “YouTrack-calm” theme tokens already used in the project.

Desktop-first; mobile must be readable but not optimized for heavy actions.

No horizontal overflow; tables must be responsive (truncate/tooltip for long text).

Provide consistent EmptyState and LoadingState components.

Security/RBAC (explicit)

Determine hasBackupAdmin on client:

hasBackupAdmin = currentUser?.username === "048466" || currentUser?.syno_username === "hien.than"

If NOT admin, everything is read-only:

“Run now”, “Enable/Disable”, “Edit schedule” buttons must be isDisabled={true} and show tooltip “You don’t have permission to perform this action.”

Still allow navigation to detail pages and log viewing.

Data model (PocketBase)
Collection: ma_backups (1 record = 1 backup target). Fields used on UI:

Relations: app_id (to ma_apps), server_id (to ma_servers)

Identity: name, description

Target: target_type, source_ref, backup_script

Schedule: schedule_type, schedule_spec, timezone, next_due_at

Retention/storage: storage_backend, storage_path_template, retention_keep_days, retention_keep_last_n, compression, encryption

Status: last_run_at, last_status (success|failed|running|skipped), last_success_at, last_duration_ms, last_backup_size_bytes, last_artifact_path, last_exit_code, last_error_summary, last_log_path

Control: is_enabled

Meta: meta (JSON) — may include flags like { category: "cctv" }

Computed status rules (must match exactly)

isDisabled = is_enabled === false → treat as “DISABLED” badge and exclude from overdue counts.

isRunning = last_status === "running"

isFailed = last_status === "failed"

isOverdue = is_enabled !== false && next_due_at != null && now > next_due_at
(No grace minutes. Overdue is purely time-based.)

“Healthy” definition in dashboard counts: last_status === "success" (even if next_due_at passed; but overdue logic still shows overdue badge if overdue is true. However counts must follow this precedence below.)

Badge precedence (visual + counts)

Disabled > Running > Failed > Overdue > Healthy > Unknown

Implement a getBackupHealth(record) that returns { key, label, severity } following that precedence.

Counts in summary cards must use the same precedence (each record counts in only one bucket).

Pages to implement

/backups — BackupOverviewPage (global dashboard)

/backups/:backupId — BackupDetailPage (target detail)

BackupOverviewPage requirements

Top summary (metric cards)
Show 5–6 cards:

Total Targets

Healthy

Overdue

Failed

Disabled

Running (optional if you have space; otherwise include in a “More” tooltip)

Each card shows count and a small label; clicking a card filters the list by that bucket.

Filters row

Server filter (Select single): “All servers” + server list

App filter (Select single): “All apps” + app list

Status filter (Select): All / Healthy / Overdue / Failed / Disabled / Running

Search input: searches across app name, server name, target name, source_ref

Toggle/checkbox: “Show heavy jobs only” (heavy means meta.category === "cctv" OR name contains "cctv" case-insensitive)

Sort: default sort by severity (Disabled/Running/Failed/Overdue first) then by next_due_at asc, then by app name.

Main list view (Hybrid grouping)

Group by App (primary) and show Server in the group header:

Group header displays: App name, Server name, and mini badges summary (e.g., number of failed/overdue in that app).

Groups are expandable/collapsible (Accordion or custom collapse). Default expanded: groups that have any Failed/Overdue/Running.

Inside each group: render a compact HeroUI Table of targets.

Table columns per target row
Must include the “field set you suggested” (adapted to hybrid view):

Target name (with optional description tooltip)

Status badge (Chip)

Last run (relative time + exact on hover)

Next due (exact date time; if null show “Manual”)

Size (format bytes)

Retention (e.g., “3 days” or “keep last N”)

Storage backend (local_fs/nas/s3/remote as label)

Actions (icons): View log, Copy error, Run now (admin only enabled)

Row interaction

Clicking anywhere on the row navigates to /backups/:backupId

Action icons must NOT trigger row navigation (stopPropagation).

For non-admin: actions disabled with tooltip.

Log preview

If record has last_log_path, show “View log” icon:

Opens a Modal with:

header: App / target / last status

body: a “Log viewer” area (initially show last_error_summary + link to open full log)

Since PB doesn’t store log content, implement:

If there is an internal endpoint in this project for logs, call it.

If not available, just show last_error_summary and last_log_path as text + copy button.

Error copy

If last_error_summary exists, show Copy icon that copies to clipboard and toast “Copied”.

Empty/Loading

Loading: skeleton cards + skeleton table rows.

Empty: show EmptyState with hints “No backups found. Adjust filters or create backup targets.”

BackupDetailPage requirements

Header

Breadcrumb: Backups → App → Target (compact)

Title: {app.name} / {backup.name}

Right actions:

Run now (disabled if not admin)

Enable/Disable toggle (optional in detail only; disabled if not admin)

Copy artifact path (if exists)

Detail layout
Use Tabs:

Overview

Configuration

Logs

Tab “Overview” shows:

Status chip (using same precedence) + last_run_at + duration + size

Next due + schedule summary

Storage summary + retention

Server + app info

Tab “Configuration” shows read-only fields (or editable for admin later, but MVP can be read-only):

target_type, source_ref, script paths, schedule fields, retention fields, storage template, meta JSON pretty

Tab “Logs” shows:

last_error_summary prominently if failed

last_log_path + copy

If you have an API endpoint, load tail logs on demand (button “Load full log”); otherwise keep it static.

Due/Overdue hinting

If overdue, show a subtle warning banner in Overview tab.

Implementation details (must follow)

Create a feature folder: src/features/backups/

pages/BackupOverviewPage.tsx

pages/BackupDetailPage.tsx

components/BackupSummaryCards.tsx

components/BackupFilters.tsx

components/BackupTargetsTable.tsx

components/BackupLogModal.tsx

hooks/useBackups.ts (list)

hooks/useBackupDetail.ts (single)

utils/backupStatus.ts (precedence + formatters)

types.ts

Use PocketBase SDK service already used elsewhere in project (follow existing patterns).

Expand relations for app_id and server_id so you can display names:

expand=app_id,server_id (and use record.expand)

Add route entries in the app router.

Quality checks

No hardcoded mock data.

No unused components.

No console spam.

Ensure table doesn’t overflow; use truncate + tooltip for paths.

Add small unit-like helper functions for formatting time and bytes.

Now implement these pages and components accordingly.

PROMPT 2 — Add “Run Now” action wiring (UI-first, safe placeholder)

Context
We may not have the actual runner API yet. Still implement the UI action in a safe, non-breaking way.

Requirement

Add a runBackupNow(backupId) function in src/features/backups/services/backupActions.ts.

If VITE_BACKUP_RUN_ENDPOINT exists, call it with POST and body { backupId }.

Otherwise:

Show a toast: “Run triggered (stub). Configure VITE_BACKUP_RUN_ENDPOINT to execute real backups.”

Update UI optimistically to last_status="running" in local state for that record (do not persist to PB), then revert after 10 seconds.

RBAC

If not admin, action disabled.

UX

Confirm modal before running:

“Run backup now?” show app/target and last run time.

Confirm/Cancel.

Implement this without breaking the app even if backend endpoint does not exist.

PROMPT 3 — Enable/Disable behavior on UI (Detail page only)

Requirement

On BackupDetailPage, add Enable/Disable toggle bound to is_enabled.

If admin:

Toggle updates PocketBase record (ma_backups) field is_enabled.

If not admin:

Toggle disabled with tooltip.

When disabled:

UI should show “Disabled” badge immediately (using precedence).

Overdue banner must not display.