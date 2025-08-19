# Secure AI Project

## Overview

The Secure AI Project is a comprehensive security scanning and AI-powered code fixing platform. It enables developers to scan codebases for security vulnerabilities, generate AI-powered fixes, and manage the deployment lifecycle of secure code changes. The application provides a dashboard for monitoring projects, analyzing security issues, reviewing AI-generated fixes, and tracking deployments across different environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and implements a modern single-page application (SPA) architecture:

- **Routing**: Uses Wouter for lightweight client-side routing
- **State Management**: React Query (TanStack Query) for server state management with built-in caching and synchronization
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Form Handling**: React Hook Form with Zod schema validation
- **Build Tool**: Vite for fast development and optimized production builds

The client-side structure follows a modular approach with pages, components, and utilities organized separately. The application supports multiple themes and responsive design patterns.

### Backend Architecture
The backend implements a REST API using Express.js with TypeScript:

- **API Design**: RESTful endpoints organized by resource (projects, issues, fixes, deployments)
- **Request Handling**: Express middleware for logging, error handling, and request parsing
- **Validation**: Zod schemas shared between frontend and backend for type safety
- **Development Setup**: Hot reloading with Vite integration for seamless development experience

### Data Storage Solutions
The application uses a PostgreSQL database with Drizzle ORM:

- **ORM**: Drizzle ORM provides type-safe database operations and schema management
- **Schema Design**: Relational schema with projects as the central entity, connected to issues, function blocks, LLM fixes, git commits, deployments, and history
- **Migrations**: Drizzle Kit handles database migrations and schema evolution
- **Connection**: Neon serverless PostgreSQL for scalable cloud database hosting

### Authentication and Authorization
The system includes user management capabilities:

- **User Model**: Basic user entity with username/password authentication
- **Session Management**: Express sessions with PostgreSQL session storage via connect-pg-simple
- **Security**: Password hashing and secure session management

### External Service Integrations
The platform integrates with multiple external services:

- **Source Code Analysis**: SonarQube integration for security vulnerability scanning
- **Version Control**: Git repository integration for code management and commit tracking
- **AI Services**: LLM integration for automated security fix generation
- **Deployment Platforms**: Support for staging and production deployment tracking

### Core Business Logic
The application implements a comprehensive security workflow:

1. **Project Management**: Create and manage security scanning projects with different input types (Git repositories or file uploads)
2. **Vulnerability Scanning**: Integration with security scanning tools to identify issues with severity levels and categorization
3. **AI-Powered Fixes**: Generate automated security fixes using LLM technology with approval workflows
4. **Code Review**: Diff viewer for comparing original and fixed code with merge capabilities
5. **Deployment Tracking**: Monitor deployments across different environments with status tracking
6. **History and Audit**: Complete audit trail of all security-related actions and changes

The system supports filtering, searching, and real-time status updates across all major features. The architecture is designed to handle multiple concurrent projects with different scanning and fixing workflows.