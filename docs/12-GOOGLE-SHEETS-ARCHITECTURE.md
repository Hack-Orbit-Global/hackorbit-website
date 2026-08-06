# 12 — Google Sheets Architecture

All sheets live in a single Google Sheets spreadsheet (one tab per entity), owned by the founder's Google account, **never shared publicly**. Only the Apps Script Web App (running as the owner) reads/writes it. Columns below mirror the entities in 05-DATA-MODEL.md.

Editing access: **Founder only** (owner). Apps Script mediates all writes, including member-initiated ones — the frontend never writes to Sheets directly.

## `Members`
| Column | Type | Example | Public via API? |
|---|---|---|---|
| member_id | text | HO-000001 | Yes |
| google_sub | text | 10987654... | No |
| email | text | sabarna@example.com | No |
| display_name | text | Ash Vane | Yes |
| avatar_url | text | https://... | Yes |
| bio | text | "Builder & writer" | Yes |
| skills | text (comma list) | "Python, Flask" | Yes |
| github_username | text | sabarna-dev | Yes |
| discord_id | text | 4587xxxx | No |
| linkedin_url | text | https://... | Yes |
| status | text | verified | No (internal) |
| is_founder | boolean | TRUE | Yes (derived) |
| created_at | datetime | 2026-07-26T... | No |
| verified_at | datetime | 2026-07-26T... | No |

## `IdentityConnections`
| Column | Type | Notes |
|---|---|---|
| member_id | text | FK |
| provider | text | google / github / discord |
| provider_account_id | text | Unique per provider |
| linked_at | datetime | |
| refresh_token_ref | text | Reference/pointer only — actual token stays server-side in Vercel session storage, **not** stored in the sheet in plaintext |

## `Projects`
| Column | Type | Notes |
|---|---|---|
| project_id | text | |
| name | text | |
| description | text | |
| type | text | official / community |
| repo_url | text | |
| owner_member_id | text | |
| status | text | proposed / active / archived |
| created_at | datetime | |

## `Contributions`
| Column | Type | Notes |
|---|---|---|
| contribution_id | text | Idempotency key (GitHub delivery ID / hash) |
| member_id | text | |
| project_id | text | |
| type | text | pr_merged / issue / review / doc / other |
| repo | text | |
| reference_url | text | |
| occurred_at | datetime | |
| source | text | webhook / reconciliation / manual |

## `Badges`
| Column | Type | Notes |
|---|---|---|
| badge_id | text | |
| name | text | |
| description | text | |
| icon_url | text | |
| award_type | text | automatic / manual |
| trigger_condition | text | e.g. `first_merged_pr` |

## `MemberBadges`
| Column | Type | Notes |
|---|---|---|
| award_id | text | |
| member_id | text | |
| badge_id | text | |
| awarded_by | text | `system` or admin member_id |
| awarded_at | datetime | |
| status | text | active / revoked |
| revoke_reason | text | |

## `Certificates`
| Column | Type | Notes |
|---|---|---|
| certificate_id | text | HO-CERT-2026-000001 |
| member_id | text | |
| type | text | |
| event_name | text | |
| achievement_description | text | |
| issued_by | text | default "Hack Orbit" |
| collaborating_org | text | |
| issue_date | date | |
| status | text | valid / revoked |
| file_generated | boolean | |
| emailed_at | datetime | |

## `Events`
| Column | Type | Notes |
|---|---|---|
| event_id | text | |
| name | text | |
| external_url | text | link to separate event site |
| date_range | text | |
| summary | text | |

## `AdminRecords`
| Column | Type | Notes |
|---|---|---|
| admin_id | text | member_id |
| role | text | founder / admin |
| granted_at | datetime | |

## `AuditLog`
| Column | Type | Notes |
|---|---|---|
| audit_id | text | |
| actor | text | |
| action | text | |
| target | text | |
| timestamp | datetime | |
| metadata | text (JSON string) | |

## `Counters` (system)
| Column | Type | Notes |
|---|---|---|
| counter_name | text | `member_id`, `certificate_id_2026`, etc. |
| current_value | number | Incremented via `LockService` for atomicity |

## Relationships
`member_id` is the primary join key across `IdentityConnections`, `Contributions`, `MemberBadges`, `Certificates`, `Projects.owner_member_id`, and `AdminRecords`. `badge_id`, `project_id`, and `certificate_id` are the other join keys — functionally identical to foreign keys in a relational DB, which is what enables a clean future migration (05-DATA-MODEL.md).

## Public vs Private
Nothing in this spreadsheet is ever public directly. "Public via API?" above indicates only which fields the Apps Script layer is *permitted* to return through public-facing endpoints (see 13 and 14) — the sheet itself stays fully private at all times.
