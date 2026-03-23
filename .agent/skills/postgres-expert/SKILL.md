# PostgreSQL Expert Skill

Expert guidance for designing, optimizing, and maintaining PostgreSQL databases for full-stack SaaS applications.

## Core Best Practices

### 1. Schema Design
- **Normalization**: Aim for 3NF but denormalize (e.g., using `JSONB`) for read-heavy workloads where performance is critical.
- **Data Types**:
  - Prefer `TEXT` over `VARCHAR(N)` unless a limit is strictly required.
  - Use `UUID` for primary keys in distributed systems.
  - Use `TIMESTAMPTZ` for all timestamp fields.
  - Use `JSONB` for semi-structured data which needs to be queried.
- **Constraints**: Always use `NOT NULL`, `UNIQUE`, `CHECK`, and `FOREIGN KEY` constraints to enforce data integrity at the database level.

### 2. Indexing Strategies
- **B-Tree**: Default for most equality and range queries.
- **GIN Index**: Essential for optimized `JSONB` searches and full-text search.
- **Partial Indexes**: Create indexes on a subset of data (e.g., `WHERE active = true`) to save space and improve performance.
- **Composite Indexes**: Index multiple columns for queries that filter on both. Remember the "prefix rule."
- **Concurrent Indexing**: Use `CREATE INDEX CONCURRENTLY` in production to avoid locking tables.

### 3. Performance & Optimization
- **Query Analysis**: Use `EXPLAIN (ANALYZE, BUFFERS)` to understand query plans and identify bottlenecks.
- **Connection Pooling**: Always use a pooler (e.g., `pgbouncer` or `Prisma/Drizzle` internal pooling).
- **Vacuuming**: Keep `autovacuum` tuned to prevent bloat and maintain performance.
- **N+1 Queries**: Use `JOIN`s or optimized pre-fetching to avoid multiple database round-trips.

### 4. SaaS Patterns
- **Multi-tenancy**:
  - **Column-based**: Use a `tenant_id` column on all tables.
  - **RLS (Row Level Security)**: Highly recommended for strong isolation between tenants.
- **Soft Deletes**: Use a `deleted_at` column instead of deleting rows, allowing for easy data recovery.
- **Audit Logs**: Maintain a separate table to track changes to critical data.

## Integration with NestJS & Next.js
- Use **Drizzle ORM** for lightweight, type-safe SQL with minimal overhead.
- Use **Prisma** for a more feature-rich developer experience and automated migrations.
- Handle database transactions carefully, especially when performing multiple related writes.
