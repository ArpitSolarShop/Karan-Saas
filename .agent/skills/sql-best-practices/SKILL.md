# SQL Best Practices Skill

Universal guidelines and patterns for designing and interacting with SQL databases.

## Core Principles

### 1. Data Modeling
- **Normalization**: Follow 1NF, 2NF, and 3NF to minimize redundancy.
- **Constraints**: Use `PRIMARY KEY`, `FOREIGN KEY`, `UNIQUE`, and `NOT NULL` strings.
- **Naming Conventions**: Use `snake_case` for tables and columns.

### 2. Indexing
- **Prefix Rule**: Composite indexes `(a, b)` only work for queries on `a` or `(a, b)`, not `b` alone.
- **SARGability**: Ensure queries can use indexes (avoid functions on indexed columns in `WHERE` clauses).
- **Index Maintenance**: Drop unused or redundant indexes.

### 3. Query Writing
- **Avoid SELECT ***: Explicitly select the columns you need.
- **Transactions**: Use transactions for multi-row updates to ensure ACID compliance.
- **SQL Injection**: Always use parameterized queries or trusted ORMs.

### 4. Common Pitfalls
- **N+1 Queries**: Use `JOIN` or batch loading.
- **Large Transactions**: Avoid holding locks for long periods.
- **Missing FKeys**: Always define relationships explicitly.
