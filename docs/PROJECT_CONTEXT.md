# Aksara Project Context

## 1. Project Overview
Aksara is a modern personal and family productivity platform. It is structured as a monorepo that houses a React-based frontend application and a Go-based microservice backend. The project utilizes a centralized API Gateway to handle routing and authentication for various domain-specific services, ensuring a scalable and maintainable foundation for productivity tools.

## 2. Core Modules
Aksara is designed to support the following core modules for personal and family management:
*   **Task Management**: For tracking daily and recurring to-dos.
*   **Project Management**: For organizing larger, multi-step initiatives.
*   **Finance**: For tracking budgets, expenses, and financial goals.
*   **Learning Progress**: For monitoring educational milestones and skill development.
*   **Meeting Notes**: For documenting family discussions or personal logs.
*   **Document Repository**: For securely storing and organizing important files and records.

## 3. UI/UX Direction
The frontend must adhere strictly to a **premium monochrome SaaS style** to ensure a professional and highly readable interface:
*   **Layout**: A dark sidebar for navigation paired with a clean, white main content area.
*   **Components**: Use rounded cards for encapsulating content.
*   **Depth**: Apply soft, subtle shadows to create depth without cluttering the interface.
*   **Typography**: Clean, modern, and highly legible typography throughout all views.
*   **Color Palette**: Use black, white, and gray as the primary colors. Avoid introducing bright or colorful UI elements unless explicitly requested.

## 4. Task Board Convention
For all Kanban or task board features (e.g., using `@dnd-kit/core`), the application follows a standardized column progression:
1.  **Backlog**: Tasks that are planned but not yet prioritized.
2.  **To Do**: Tasks prioritized for the current work cycle.
3.  **In Progress**: Tasks actively being worked on.
4.  **Review**: Tasks completed but awaiting final validation or feedback.
5.  **Done**: Fully completed tasks.

Task cards may include the following fields:
*   Title
*   Description
*   Label
*   Status
*   Start date
*   Due date
*   Comments
*   Assignee
*   Priority

## 5. Folder Structure Summary
The monorepo is organized into the following primary directories:
*   **`api-gateway/`**: The central entry point for all incoming HTTP requests.
*   **`frontend-app/`**: The React client-side application.
*   **`infra/`**: Infrastructure configuration, including Docker Compose files for local development.
*   **`pkg/`**: Shared Go packages (e.g., database connection, logging, middleware, RabbitMQ broker) utilized across multiple backend services.
*   **`services/`**: The individual Go microservices (`comment-service`, `notification-service`, `project-service`, `task-service`, `user-service`).
*   **`go.work`**: The Go workspace file managing multi-module development.

## 6. Backend Architecture
The backend is built using a **Go Microservices Architecture**:
*   **Framework**: Each service uses **Gin-Gonic** for HTTP routing.
*   **ORM**: **GORM** is used for database interactions (specifically with PostgreSQL).
*   **Structure**: Services follow a layered pattern, isolating concerns inside an `internal/` directory. Typically, this includes:
    *   **`cmd/main.go`**: The entry point that wires dependencies and starts the server.
    *   **`internal/handler/`**: HTTP controllers that process requests and responses.
    *   **`internal/repository/`**: Abstractions for database operations.

## 7. Frontend Architecture
The client application is built for modern web standards:
*   **Core**: **React 19** powered by **Vite**.
*   **Routing**: `react-router-dom` for handling page views (e.g., Auth, Dashboard, Admin, Tasks).
*   **State & API**: `axios` is used for external API communication.
*   **Styling**: Plain CSS (`index.css`, `App.css`) combined with `lucide-react` for icons.
*   **Features**: Includes `@dnd-kit/core` to support drag-and-drop capabilities, such as for the Task Board.

## 8. API Gateway Role
The API Gateway (running on port `8000`) acts as the reverse proxy for the entire system. Its primary responsibilities include:
*   **CORS Management**: Enabling secure cross-origin requests.
*   **Authentication**: Validating JWT tokens via middleware for protected routes.
*   **Routing**: Forwarding requests to specific microservices:
    *   Auth/Users -> `user-service` (Port `8081`)
    *   Projects -> `project-service` (Port `8082`)
    *   Tasks -> `task-service` (Port `8083`)
    *   Comments -> `comment-service` (Port `8084`)

## 9. Database and Docker Setup
The local development environment relies on Docker, defined in `infra/docker-compose.yml`:
*   **PostgreSQL**: Runs on port `5433` locally (mapped to `5432` in the container). The database name is `aksara_db`.
*   **Auto-Migration**: Handled at the microservice level upon startup (e.g., GORM's `AutoMigrate`).
*   **Configuration**: Database credentials and environments are managed via `.env` files (loaded via `godotenv`).

## 10. RabbitMQ Usage
Asynchronous messaging and event-driven communication are supported via **RabbitMQ**:
*   **Docker Container**: Exposed on standard port `5672` (and `15672` for the management UI).
*   **Shared Logic**: Handled centrally via the `pkg/broker/` package, allowing microservices to publish and subscribe to events without duplicating integration logic.

## 11. Important Files and Their Purpose
*   **`api-gateway/cmd/main.go`**: The source of truth for all external API endpoints, routing logic, and protected vs. public route definitions.
*   **`go.work`**: Critical for the Go toolchain to understand how local packages (like `pkg`) resolve across different services.
*   **`infra/docker-compose.yml`**: The starting point for spinning up required local infrastructure.
*   **`frontend-app/package.json`**: Tracks frontend dependencies and execution scripts (`npm run dev`).

## 12. Coding Conventions
*   **Shared Code**: Cross-cutting concerns (DB connections, HTTP responses, middlewares) MUST be placed in `pkg/` and imported by microservices.
*   **Language**: Inline comments, logs, and Git commits are predominantly written in **Bahasa Indonesia**.
*   **Frontend Layouts**: Pages should be wrapped in reusable layout components (e.g., `DashboardLayout.jsx`) to maintain structural consistency.

## 13. Rules for Future AI-Assisted Development
*   **AI Editing Workflow Rules**: 
    1.  Inspect related files first before writing any code.
    2.  Explain the existing implementation to ensure context is understood.
    3.  Explain missing parts or what needs to be accomplished.
    4.  List the specific files to be changed.
    5.  Wait for the user's explicit confirmation before editing any files.
*   **Adhere to the Architecture**: Do not introduce new frameworks or styling libraries, such as TailwindCSS, without explicit permission. Stick to plain CSS/Vite and Gin/GORM.
*   **Documentation Update**: If changes affect architecture, API routes, folder structure, database schema, or core business rules, update this documentation accordingly.
*   **Use the Gateway**: When adding a new microservice endpoint, you MUST also update `api-gateway/cmd/main.go` to expose it to the frontend.
*   **DRY Principle**: Always check the `pkg/` directory before writing utility functions (e.g., standardized JSON responses, database connections, RabbitMQ publishers).
*   **Environment Variables**: Never hardcode credentials. Always rely on `os.Getenv` and `.env` setups.
*   **Microservice Isolation**: Services should not directly access each other's databases. Communication must happen via API Gateway (HTTP) or RabbitMQ (Events).
