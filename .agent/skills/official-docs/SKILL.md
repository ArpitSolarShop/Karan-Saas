# Official Documentation Skill

This skill provides quick access to the official documentation and core concepts for NestJS and Next.js, optimized for full-stack SaaS development.

## NestJS Documentation
- **Official Docs**: [https://docs.nestjs.com/](https://docs.nestjs.com/)
- **Core Concepts**:
  - **Modules**: Organize code into closely related sets of capabilities.
  - **Controllers**: Handle incoming requests and return responses.
  - **Providers**: Can be injected as dependencies (Services, Repositories, etc.).
  - **Middleware**: Functions called before the route handler.
  - **Pipes**: Used for transformation and validation.
  - **Guards**: Determine if a request should be handled by the route handler (Authentication/Authorization).
  - **Interceptors**: Bind extra logic before or after method execution.

## Next.js Documentation
- **Official Docs**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Core Concepts**:
  - **App Router**: Modern routing system using the `app` directory.
  - **Server Components**: Rendered on the server by default for better performance.
  - **Client Components**: Used for interactivity (`'use client'`).
  - **Data Fetching**: `fetch` with caching and revalidation.
  - **Server Actions**: Mutate data on the server without manual API endpoints.
  - **Optimization**: Built-in Image, Font, and Script optimization.
  - **Middleware**: Run code before a request is completed.

## Enterprise SaaS Best Practices
- Use **Drizzle ORM** or **Prisma** for type-safe database access.
- Implement **Role-Based Access Control (RBAC)** using NestJS Guards.
- Use **Zod** for schema validation in both frontend and backend.
- Leverage **Next.js Streaming** and **Suspense** for responsive UIs.
