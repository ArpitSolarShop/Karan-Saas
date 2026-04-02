# 🛡️ Phase 2: High Value Modules Implementation Plan

## Overview
Phase 2 tackles heavy-lifting architectural differentiators. We will introduce Document Storage, advanced dedup algorithms, Sales/Purchase cycles, and Project Task tracking.

## Technical Execution Plan

### 1. Prisma DB Updates
*   Add `Document` and `DocumentFolder` models.
*   Add Commerce models: `Vendor`, `SalesOrder`, `PurchaseOrder` and `Contract`.
*   Add Project tracking: `Project`, `ProjectMilestone`.
*   Add Pipeline architecture: `Pipeline`, `PipelineStage`.
*   Add Quality Control: `ClosingReason`, `DedupeRule`, `DedupePair`. 

### 2. NestJS Specific Logic
*   **Document Manager**: The `documents` module will wrap the existing MinIO (S3 compatibility) utility to securely manage multi-tenant folder trees and sign pre-signed download URLs.
*   **Deduplication Engine**: Create a cron job inside a new `deduplication.service.ts` that runs nightly scanning for duplicate Leads/Contacts using a fuzzy match on Name, and exact match on Email/Phone mapping to `DedupePair` table for human review.
*   **Audit Trail Middleware (MongoDB Integration)**:
    *   We will introduce our first major MongoDB schema here. 
    *   We will write an Interceptor or Prisma Middleware that traps ALL CRUD operations (`INSERT`, `UPDATE`, `DELETE`) across the system, strips PII, and bulk inserts them into a `AuditLog` NoSQL document store to prevent relational DB bloat.

### 3. Frontend App Additions (From UI/UX Ideas)
*   **Modular Widget Dashboard**: Replace the static dashboard with a draggable grid of widgets (Leaderboard, Revenue Trend, Pipeline Funnel).
*   **Unified Timeline Component**: A chronological feed component to sit on Lead/Deal pages fetching from the MongoDB Audit log (Calls, WhatsApps, Notes, Status changes).
*   **List Views Upgrade**: Configurable column selectors and inline cell editing for main lists.
*   **Document Manager**: Build a Finder-like Document manager `/documents`.
*   **Kanban Upgrades**: Support dynamically querying by `pipelineId` and fetching stage columns dynamically.
*   **Deduplication UI**: Build a side-by-side Merge User Interface (`/settings/deduplication`) to let supervisors hit an "Accept Merge" button.
