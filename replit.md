# Overview

This is a React-based R&D Tax Credit Calculator application that helps businesses estimate their potential R&D tax credits. The application features a multi-step wizard interface for collecting business information, expense data, and qualification criteria to calculate federal and state R&D tax credits. Built with modern web technologies including React, TypeScript, and a comprehensive UI component library.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18+ with TypeScript**: Modern React application using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **Multi-step Wizard Interface**: Progressive form with step-by-step data collection
- **Responsive Design**: Mobile-first approach using Tailwind CSS

## UI Component System
- **Shadcn/UI Components**: Comprehensive set of accessible, customizable UI components built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system variables
- **Component Architecture**: Modular, reusable components with consistent styling and behavior
- **Form Management**: React Hook Form integration for complex form validation and state management

## Backend Architecture
- **Express.js Server**: RESTful API server with TypeScript support
- **Modular Route System**: Clean separation of API endpoints and business logic
- **Development Tooling**: Hot reload support with Vite integration for seamless development experience

## Data Storage Solutions
- **Drizzle ORM**: Type-safe database interactions with schema validation
- **PostgreSQL Database**: Primary data store configured for production use with Neon serverless database
- **In-Memory Storage**: Development fallback using memory-based storage implementation
- **Migration System**: Database schema versioning and deployment management

## State Management
- **TanStack Query**: Server state management with caching, synchronization, and background updates
- **Local Component State**: React hooks for form state and UI interactions
- **Session Management**: PostgreSQL-based session storage for user persistence

## Development Features
- **TypeScript Configuration**: Strict type checking with path mapping for clean imports
- **ESBuild Integration**: Fast bundling for server-side code
- **Development Middleware**: Error overlay and debugging tools for enhanced developer experience
- **Replit Integration**: Native support for Replit development environment with cartographer plugin

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form for robust frontend functionality
- **Vite**: Modern build tool with TypeScript support and development server
- **Express.js**: Web framework for API server implementation

## Database & ORM
- **Drizzle ORM**: Modern TypeScript ORM with Zod integration for schema validation
- **@neondatabase/serverless**: Neon PostgreSQL serverless database driver
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives including dialogs, dropdowns, forms, and navigation components
- **Lucide React**: Modern icon library with consistent design
- **Tailwind CSS**: Utility-first CSS framework with PostCSS and Autoprefixer

## Form & Validation
- **React Hook Form**: Performant forms library with minimal re-renders
- **@hookform/resolvers**: Validation resolvers for form integration
- **Zod**: TypeScript-first schema validation (via drizzle-zod)

## Utility Libraries
- **class-variance-authority**: Utility for creating type-safe component variants
- **clsx**: Conditional className utility
- **date-fns**: Modern date utility library
- **TanStack Query**: Powerful data synchronization for React applications

## Development Tools
- **TypeScript**: Static type checking and enhanced developer experience
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Replit-specific development tooling