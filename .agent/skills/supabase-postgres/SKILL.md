# Supabase PostgreSQL Performance Skill

Comprehensive guidelines for optimizing PostgreSQL performance on the Supabase platform.

## Priority Categories

### 1. Query Performance (Critical)
- Use `EXPLAIN ANALYZE` to identify slow sequential scans.
- Avoid large `OR` clauses; prefer `IN` or `UNION ALL`.
- Optimize full-text search with GIN indexes.

### 2. Connection Management (Critical)
- Use **Supabase Realtime** for live updates.
- Monitor connection limits and use `pgbouncer` for high-concurrency apps.

### 3. Schema Design (High)
- Implement **Row-Level Security (RLS)** for every table.
- Use appropriate data types (e.g., `CITEXT` for case-insensitive text).
- Avoid N+1 queries by using `JOIN`s or the Supabase JavaScript client's `.select('*, items(*)')`.

### 4. Security & RLS (Medium-High)
- Use broad RLS policies for common operations.
- Leverage `auth.uid()` to filter data by the current user.

## Best Practices
- **Indexing**: Always index columns used in `WHERE`, `ORDER BY`, and `JOIN` clauses.
- **RLS Performance**: Avoid calling expensive functions in RLS policies.
- **Scaling**: Monitor CPU/Memory usage via the Supabase Dashboard.
