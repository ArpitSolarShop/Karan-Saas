# Neon PostgreSQL Skill

Expert guidance for working with Neon, the serverless PostgreSQL platform.

## Key Features & Triggers
- **Database Branching**: Use branching for isolated development and testing environments.
- **Connection Pooling**: Use the Neon connection string with `-pooler` for serverless environments.
- **Prisma/Drizzle Setup**: Optimized configurations for Neon.
- **Autoscaling**: Understanding how Neon scales storage and compute.

## Best Practices
- **Branching Workflows**: Create a new branch for every feature or migration.
- **Serverless Connections**: Always use pooled connections in serverless functions (Next.js, AWS Lambda).
- **Migration Strategies**: Test migrations on a branch before applying to `main`.
- **Latency Optimization**: Select the region closest to your application server.

## Use Cases
- Implementing CI/CD with database branching.
- Setting up a serverless backend with Prisma/Drizzle.
- Managing multi-tenant applications with isolated branches.
