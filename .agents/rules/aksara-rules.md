# Aksara AI Assistant Rules

When assisting with the Aksara project, AI agents MUST adhere to the following rules:

## 1. Initial Context
*   **Always read `docs/PROJECT_CONTEXT.md` first**: This document contains the source of truth for the project's architecture, conventions, and UI/UX direction. Do not proceed without understanding it.

## 2. AI Editing Workflow
Before making any code edits, you must follow this strict workflow:
*   **Inspect**: Thoroughly inspect related files to understand the current state.
*   **Explain**: Briefly explain the existing implementation to the user so they know you understand the context.
*   **List Changes**: Explicitly list all the files that will be created, modified, or deleted.
*   **Wait**: STOP and wait for the user's explicit confirmation before proceeding to edit any files.
*   **Stay in Scope**: Do not modify unrelated files or features outside the user's request.

## 3. Backend Guidelines
*   **Follow the Go Microservices Architecture**: Adhere to the established pattern of using Go, Gin-Gonic, GORM, and PostgreSQL. Keep business logic and database operations decoupled using the `internal/handler` and `internal/repository` structure.
*   **Shared Logic**: Utilize the `pkg/` directory for shared code (database, logging, RabbitMQ broker, middleware) and avoid duplicating cross-cutting concerns in individual microservices.
*   **API Gateway**: Any new microservice endpoint must be routed and exposed via the central API Gateway (`api-gateway/cmd/main.go`).

## 4. Frontend Guidelines
*   **Follow the React + Vite Architecture**: Use React 19, Vite, React Router, Axios, and plain CSS. Do not introduce new frameworks or styling libraries (such as TailwindCSS) without explicit permission.
*   **Maintain UI/UX Direction**: Adhere strictly to the **premium monochrome SaaS style**. Use a primary color palette of black, white, and gray. Implement rounded cards, soft shadows, and clean typography. Avoid introducing bright or colorful UI elements unless explicitly requested by the user.

## 5. Documentation Maintenance
*   **Update Documentation**: If your changes affect the overall architecture, API routes, folder structure, database schema, or core business rules, you MUST update `docs/PROJECT_CONTEXT.md` and any other relevant documentation to reflect these changes.

## 6. Validation
*   **Run or Suggest Validation**: After making changes, run relevant checks if possible, such as `npm run dev`, `npm run build`, `go test`, or service-specific validation commands. If commands cannot be run, explain what the user should test manually.
