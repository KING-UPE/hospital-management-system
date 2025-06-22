# Hospital Management System

## Overview

This is a full-stack hospital management system built with Express.js and React. The application provides a comprehensive platform for managing hospital operations including patient registration, doctor management, appointment scheduling, and administrative functions. The system supports multiple user roles (admin, doctor, receptionist, patient) with role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with custom hospital-themed color variables
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: In-memory storage with potential for PostgreSQL session store
- **Development Setup**: Development server with hot module replacement via Vite

### Database Schema
The system uses a relational database structure with the following main entities:
- **Users**: Base user information with role-based differentiation
- **Doctors**: Extended user profile with medical specialization and licensing
- **Patients**: Extended user profile with medical history and demographics
- **Appointments**: Scheduling system linking patients and doctors
- **Specializations**: Medical specialization catalog

### Authentication and Authorization
- **User Roles**: Admin, Doctor, Receptionist, Patient
- **ID Generation**: Custom ID format (ADM0001, DOC0001, PAT0001, etc.)
- **Session Management**: Client-side session storage with server-side validation
- **Role-based Access**: Different UI and functionality based on user role

## Key Components

### User Management
- User registration and authentication system
- Role-based user creation (patients can self-register, admin creates doctors)
- Profile management with role-specific information
- Custom ID generation for different user types

### Appointment System
- Appointment scheduling with doctor and patient selection
- Status tracking (scheduled, confirmed, in-progress, completed, cancelled)
- Time slot management with 30-minute default duration
- Appointment filtering by date, status, and doctor

### Medical Specializations
- Configurable medical specialization catalog
- Doctor-specialization mapping
- Specialization-based filtering and search

### Dashboard and Analytics
- Role-specific dashboards with relevant statistics
- Real-time data updates using React Query
- Activity monitoring and recent appointment tracking

## Data Flow

### Authentication Flow
1. User submits credentials via login form
2. Server validates credentials against database
3. User object returned to client and stored in localStorage
4. Role-based navigation and component rendering

### Appointment Management Flow
1. User selects appointment creation
2. Form populated with available doctors and time slots
3. Appointment data validated and submitted to server
4. Database updated and client state refreshed via React Query
5. Real-time updates to dashboard and appointment lists

### Data Synchronization
- React Query handles caching and synchronization
- Optimistic updates for better user experience
- Automatic background refetching for data consistency

## External Dependencies

### Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Accessible UI component primitives
- **wouter**: Lightweight client-side routing
- **react-hook-form**: Form handling and validation
- **date-fns**: Date manipulation and formatting
- **tailwindcss**: Utility-first CSS framework

### Backend Dependencies
- **drizzle-orm**: Type-safe SQL query builder
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **express**: Web application framework
- **tsx**: TypeScript execution for development

### Development Tools
- **vite**: Build tool and development server
- **typescript**: Type safety and enhanced developer experience
- **tailwindcss**: CSS framework with PostCSS processing

## Deployment Strategy

### Development Environment
- Replit-based development with hot module replacement
- PostgreSQL 16 database provisioned in Replit environment
- Environment variable configuration for database connectivity
- Development server runs on port 5000 with Vite middleware

### Production Build
- Vite builds optimized React application
- esbuild bundles Node.js server for production
- Static assets served from Express with proper caching headers
- Database migrations managed through Drizzle Kit

### Database Management
- Drizzle Kit handles schema migrations
- PostgreSQL database with connection pooling
- Environment-based configuration for different deployment stages
- Schema definitions shared between client and server

### Replit Configuration
- Node.js 20 runtime with web and PostgreSQL modules
- Autoscale deployment target for production
- Parallel workflow for development and production modes
- Hidden files and directories for clean project structure

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```