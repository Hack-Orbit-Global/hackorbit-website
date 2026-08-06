# 05 — Data Model

Privacy classification key: **Public** (rendered on public pages) · **Private** (member/admin only) · **Internal** (system/admin only, never member-facing).

## Members
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| member_id | string (`HO-000001`) | Yes | Permanent unique ID | Public |
| google_sub | string | Yes | Google account subject ID, identity anchor | Internal |
| email | string | Yes | Google account email | Private |
| display_name | string | Yes | Public-facing name, need not be legal name | Public |
| avatar_url | string | No | Profile image | Public |
| bio | string | No | Short bio | Public |
| skills | string[] | No | Self-declared skills/technologies | Public |
| github_username | string | No (Yes once verified) | Linked GitHub handle | Public |
| discord_id | string | No (Yes once verified) | Linked Discord account ID | Internal |
| linkedin_url / other_links | string[] | No | Optional professional links | Public |
| status | enum(pending, verified, deleted) | Yes | Verification lifecycle state | Internal |
| is_founder | boolean | Yes (default false) | Founder flag | Public (via Founder badge) |
| created_at | datetime | Yes | Account creation timestamp | Internal |
| verified_at | datetime | No | Full-verification timestamp | Internal |

## Identity Connections
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| member_id | string | Yes | FK → Members | Internal |
| provider | enum(google, github, discord) | Yes | OAuth provider | Internal |
| provider_account_id | string | Yes | Provider's unique account ID | Internal |
| linked_at | datetime | Yes | When connected | Internal |
| access_token / refresh_token | encrypted string | No | Server-side only, never returned by any API | Internal |

## Projects
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| project_id | string | Yes | Unique ID | Public |
| name | string | Yes | Project name | Public |
| description | string | Yes | Short description | Public |
| type | enum(official, community) | Yes | Ownership classification | Public |
| repo_url | string | No | Linked GitHub repo (org repo if official) | Public |
| owner_member_id | string | No | Proposing/lead member, if community | Public |
| status | enum(proposed, active, archived) | Yes | Lifecycle state | Public |
| created_at | datetime | Yes | Creation timestamp | Internal |

## Contributions
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| contribution_id | string | Yes | Unique ID (idempotency key, e.g. GitHub delivery ID) | Internal |
| member_id | string | Yes | FK → Members | Internal (aggregate shown Public) |
| project_id | string | No | FK → Projects, if applicable | Public |
| type | enum(pr_merged, issue, review, doc, other) | Yes | Contribution type | Public (aggregate) |
| repo | string | Yes | Source repo | Public |
| reference_url | string | No | Link to PR/issue | Public |
| occurred_at | datetime | Yes | Event timestamp | Public |
| source | enum(webhook, reconciliation, manual) | Yes | Ingestion source | Internal |

## Badges (definitions)
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| badge_id | string | Yes | Unique ID | Public |
| name | string | Yes | e.g. "Open Source Contributor" | Public |
| description | string | Yes | What it represents | Public |
| icon_url | string | No | Badge icon | Public |
| award_type | enum(automatic, manual) | Yes | Awarding mechanism | Internal |
| trigger_condition | string | No | Machine-readable rule, if automatic | Internal |

## Member Badges (awards / achievements)
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| award_id | string | Yes | Unique ID | Internal |
| member_id | string | Yes | FK → Members | Public |
| badge_id | string | Yes | FK → Badges | Public |
| awarded_by | string | Yes | `system` or admin member_id | Internal |
| awarded_at | datetime | Yes | Timestamp | Public |
| status | enum(active, revoked) | Yes | Current state | Public (revoked shown distinctly, not hidden) |
| revoke_reason | string | No | Set if revoked | Internal |

## Certificates
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| certificate_id | string (`HO-CERT-2026-000001`) | Yes | Unique ID | Public |
| member_id | string | Yes | FK → Members | Public |
| type | enum(participation, winner, finalist, volunteer, organiser, contributor) | Yes | Certificate category | Public |
| event_name | string | No | Related event | Public |
| achievement_description | string | Yes | What it certifies | Public |
| issued_by | string | Yes (default "Hack Orbit") | Issuing org | Public |
| collaborating_org | string | No | Co-issuer, if any | Public |
| issue_date | date | Yes | Date issued | Public |
| status | enum(valid, revoked) | Yes | Current validity | Public |
| file_generated | boolean | Yes | Whether a certificate file exists for emailing | Internal |
| emailed_at | datetime | No | When founder sent it | Internal |

## Events / History (lightweight, links to external event sites)
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| event_id | string | Yes | Unique ID | Public |
| name | string | Yes | Event name | Public |
| external_url | string | No | Link to the event's own site, if separate | Public |
| date_range | string | Yes | When it happened/happens | Public |
| summary | string | No | Short description/history entry | Public |

## Admin Records
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| admin_id | string | Yes | FK → Members with admin role | Internal |
| role | enum(founder, admin) | Yes | Permission level | Internal |
| granted_at | datetime | Yes | When granted | Internal |

## Audit Records
| Field | Type | Required | Description | Privacy |
|---|---|---|---|---|
| audit_id | string | Yes | Unique ID | Internal |
| actor | string | Yes | member_id or `system` | Internal |
| action | string | Yes | e.g. `badge.award`, `certificate.revoke`, `member.delete` | Internal |
| target | string | Yes | Affected entity ID | Internal |
| timestamp | datetime | Yes | When it happened | Internal |
| metadata | JSON | No | Additional context | Internal |

## Google Sheets ↔ Future Database
Each entity above maps 1:1 to a Google Sheet tab in v1 (see 12-GOOGLE-SHEETS-ARCHITECTURE.md), with `member_id`, `badge_id`, `certificate_id`, etc. acting as the join keys — exactly as they would as primary/foreign keys in a relational schema. This means the eventual migration to Postgres/MySQL is a structural lift-and-shift (one table per sheet, same keys, same field types), not a redesign. Internal-only fields (tokens, audit metadata) should be the first candidates moved off Sheets if/when Sheets' row-level access control becomes a limiting factor, even before a full migration.
