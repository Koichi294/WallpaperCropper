# Replit.md

## Overview

This is a modern full-stack image cropping tool application built with React, TypeScript, Express.js, and PostgreSQL. The application allows users to upload images and create multiple crop frames with different aspect ratios optimized for various monitor configurations. It features a sophisticated frontend built with React and shadcn/ui components, a RESTful Express.js backend, and uses Drizzle ORM for database operations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **File Handling**: Multer for multipart uploads, Sharp for image processing
- **Session Management**: Express sessions with PostgreSQL store

### Database Schema
- **ORM**: Drizzle ORM with type-safe queries
- **Migration**: Drizzle Kit for schema management
- **Tables**: 
  - `crop_projects`: Stores project metadata, image info, and crop frame configurations
  - Session storage for user state management

## Key Components

### Frontend Components
1. **CroppingTool**: Main application interface coordinating all cropping functionality
2. **ImageUploadZone**: Drag-and-drop file upload with validation
3. **CanvasArea**: Interactive canvas for image display and crop frame manipulation
4. **CropFrame**: Individual draggable/resizable crop areas with aspect ratio constraints
5. **CropSettings**: Controls for aspect ratios and monitor configurations
6. **ExportPanel**: Batch export functionality for multiple crop outputs

### Backend Services
1. **Storage Layer**: Abstracted storage interface with in-memory implementation
2. **Image Processing**: Sharp-based image manipulation for cropping and format conversion
3. **File Management**: Organized upload handling with public asset serving
4. **API Routes**: RESTful endpoints for CRUD operations on crop projects

## Data Flow

1. **Image Upload**: User uploads image → Multer processes file → Sharp validates and extracts metadata → File saved to public directory
2. **Crop Creation**: User defines crop frames → State managed in React → Sent to backend for persistence
3. **Real-time Editing**: Crop frame updates → Local state changes → Debounced API calls for persistence
4. **Export Process**: User triggers export → Backend processes multiple crops → Returns downloadable assets

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React ecosystem with hooks and context
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: TanStack Query for server synchronization
- **Image Handling**: Browser native File API with drag-and-drop support

### Backend Dependencies
- **Database**: Neon PostgreSQL for production-ready database hosting
- **Image Processing**: Sharp for high-performance image manipulation
- **File Upload**: Multer for handling multipart form data
- **Validation**: Zod for runtime type checking and validation

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Database Tools**: Drizzle Kit for migrations and schema management
- **Code Quality**: TypeScript for static typing across the entire stack

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and React Fast Refresh
- **Backend**: tsx for TypeScript execution with hot reload
- **Database**: Development connection to Neon PostgreSQL
- **Asset Serving**: Vite handles static assets in development

### Production Build
- **Frontend**: Vite builds optimized React bundle to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static files served directly by Express in production
- **Environment**: NODE_ENV-based configuration switching

### Deployment Architecture
- **Single Server**: Express serves both API routes and static frontend
- **Database**: External PostgreSQL connection via DATABASE_URL
- **File Storage**: Local filesystem with organized upload directories
- **Process Management**: Single Node.js process handling all requests

## Changelog

```
Changelog:
- July 05, 2025. Initial setup
- July 05, 2025. Added individual frame aspect ratio settings and base frame auto-scaling functionality
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```