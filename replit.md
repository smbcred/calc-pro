# Overview

This is a React-based R&D Tax Credit Calculator application that helps businesses estimate their potential R&D tax credits. The application features a sophisticated multi-step wizard interface for collecting business information, expense data, and qualification criteria to calculate federal and state R&D tax credits. Built with modern web technologies including React, TypeScript, and a comprehensive design system featuring advanced typography, motion design, and interactive animations. The application now includes a world-class component system with 5-level card elevations, comprehensive motion design with spring physics, professional micro-interactions optimized for conversion, and a unified interactive states system with consistent focus, hover, and transition effects across all elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React 18+ with TypeScript**: Modern React application using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **Multi-step Wizard Interface**: Progressive form with step-by-step data collection featuring stagger animations and progress celebrations
- **Responsive Design**: Mobile-first approach using advanced Tailwind CSS with custom design system
- **Motion Design System**: Comprehensive animation framework with natural easing functions and spring physics
- **Interactive Component Library**: 5-level card elevation system with glass morphism and micro-interactions

## UI Component System
- **Advanced Design System**: Professional-grade component library with fluid typography (Inter + SF Pro Display), enhanced color palette with warmer neutrals, and comprehensive spacing system based on 8px grid
- **Primary Component Classes**: Structured CSS component system with `.btn-primary` for main CTAs, `.btn-secondary` for alternate actions, `.card-results` for output displays, `.form-field` for all inputs, and `.status-badge` for indicators
- **Consolidated Gradient System**: Three primary gradient patterns - `gradient-primary` for CTAs/headers, `gradient-secondary` for subtle backgrounds, and status-specific gradients for indicators
- **Unified Interactive States**: Comprehensive system with consistent focus states (3px blue ring + elevation), universal hover effects (translateY + shadow), and smooth transitions across all interactive elements
- **Enhanced Shadow System**: 6-level depth scale (shadow-xs to shadow-2xl) with interactive states for consistent visual hierarchy and depth perception
- **Shadcn/UI Components**: Comprehensive set of accessible, customizable UI components built on Radix UI primitives with enhanced animations and unified interactive behavior
- **Motion-Enabled Tailwind CSS**: Extended utility-first CSS framework with comprehensive animation system, easing functions, and interaction states
- **Component Architecture**: Modular, reusable components with sophisticated hover states, loading animations, and micro-interactions following unified interactive patterns
- **Form Management**: React Hook Form integration with enhanced validation feedback, unified focus rings, and celebratory success states
- **Typography Excellence**: Fluid scaling system with tabular numbers for financial data, optimized reading measures (65-75 characters), and variable font support

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