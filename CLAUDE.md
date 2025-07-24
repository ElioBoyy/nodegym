# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Gym API built with AdonisJS 6 that implements Clean Architecture and Hexagonal Architecture principles. It's a comprehensive fitness management system with role-based access for super admins, gym owners, and clients. This is an improved version following SOLID principles and custom coding standards.

## Development Commands

```bash
# Development
npm run dev              # Start development server with HMR
npm start               # Start production server

# Build and Deploy
npm run build           # Build the application

# Code Quality
npm run lint            # Run ESLint
npm run format          # Format code with Prettier
npm run typecheck       # TypeScript type checking

# Testing
npm test                # Run all tests
npm test -- --filter="unit"        # Run unit tests only
npm test -- --filter="functional"  # Run functional tests only
npm test -- --grep="badge"         # Run tests matching "badge"
```

## Architecture

The codebase follows **Clean Architecture** with clear separation of concerns:

### Domain Layer (`app/domain/`)

- **Entities**: Core business objects (User, Gym, Challenge, Badge, etc.)
- **Repositories**: Interface contracts for data access
- **Services**: Domain service interfaces

### Application Layer (`app/application/use_cases/`)

- Organized by domain contexts (admin, badge, challenge, client, etc.)
- Contains pure business logic and orchestration
- Each use case handles a single responsibility

### Infrastructure Layer (`app/infrastructure/`)

- **Database**: MongoDB connection and configuration
- **Repositories**: MongoDB implementations of domain repository interfaces
- **Services**: External service implementations (JWT, password hashing, notifications)

### Presentation Layer (`app/controllers/`)

- REST API controllers organized by domain
- Handle HTTP concerns and delegate to use cases

## Key Architecture Patterns

- **Dependency Injection**: Custom container bindings in `app/infrastructure/dependency_injection/`
- **Repository Pattern**: Abstract data access through interfaces
- **Use Case Pattern**: Each business operation is encapsulated in a use case class
- **Entity Pattern**: Rich domain models with business methods

## Database & Authentication

- **Database**: MongoDB with native driver (no ORM)
- **Auth**: Custom JWT service implementation
- **Roles**: Three-tier role system (super_admin, gym_owner, client)
- **Middleware**: Role-based route protection

## Import Aliases

The project uses TypeScript path mapping for clean imports:

```typescript
#controllers/*  -> ./app/controllers/*.js
#models/*        -> ./app/models/*.js
#middleware/*    -> ./app/middleware/*.js
#config/*        -> ./config/*.js
// ... see package.json imports for full list
```

## Testing Structure

- **Unit Tests**: Domain entities and business logic
- **Functional Tests**: Full API integration tests
- Located in `tests/unit/` and `tests/functional/`
- 46 test files covering comprehensive scenarios

## API Structure

The API follows RESTful conventions with role-based endpoints:

- `/api/auth/*` - Authentication (public + protected)
- `/api/admin/*` - Super admin operations
- `/api/owner/*` - Gym owner operations
- `/api/client/*` - Client operations
- `/api/{resource}` - General CRUD operations

## Environment & Docker

- MongoDB connection via Docker Compose
- Environment variables in `.env`
- Docker configuration includes MongoDB with persistence
- HMR enabled for development

## Code Conventions

- TypeScript strict mode enabled
- ESLint with AdonisJS config
- Prettier for formatting
- Clean Architecture folder structure
- Immutable domain entities with factory methods

## Custom Development Rules

### Code Quality Standards

- Never add comments or code summaries
- Do It Simple - avoid overcomplicating solutions
- Write humanized, readable code
- Always remove dead code and unused imports
- Follow hexagonal architecture
- SOLID principles
- Use best practices
- Use validator (adonis vine) for each objects
- Create DTOs for each data objects
- Use the @SyllabusDuProjet.pdf
