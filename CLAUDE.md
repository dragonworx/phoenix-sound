# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js web application featuring an interactive 3D starfield visualization built with Three.js. The project uses the Next.js App Router with TypeScript, Bun runtime, and Tailwind CSS. The main feature is a sophisticated starfield scene with particle systems, post-processing effects, and procedural generation.

## Development Commands

### Core Development
- `bun run dev` - Start development server with Bun runtime
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Next.js ESLint

### Docker Commands
- `bun run docker:dev` - Run development environment in Docker
- `bun run docker:prod` - Run production environment in Docker
- `bun run docker:build` - Build production Docker image
- `bun run docker:clean` - Clean Docker containers and volumes
- `bun run docker:fresh` - Fresh Docker development start

### Utility Commands
- `bun run kill3000` - Kill processes on port 3000

## Architecture

### File Structure
```
app/
├── (default)/                    # Next.js route group (default layout)
│   ├── components/
│   │   ├── client/               # Client-side components
│   │   │   └── ThreeRenderer.tsx # Core Three.js rendering component
│   │   └── server/               # Server-side components
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── starfield/                # Starfield system modules
│   │   ├── StarfieldConfig.ts    # Configuration and defaults
│   │   ├── StarfieldDistribution.ts # Spatial distribution algorithms
│   │   ├── StarfieldManager.ts   # Main starfield controller
│   │   └── StarfieldParticle.ts  # Particle system implementation
│   ├── starfieldScene.ts         # Scene setup and update functions
│   ├── scene.ts                  # General scene utilities
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Homepage with starfield
└── globals.css                   # Global styles with Tailwind
```

### Key Components

**ThreeRenderer Component** (`app/(default)/components/client/ThreeRenderer.tsx`)
- Flexible Three.js wrapper supporting both perspective and orthographic cameras
- Handles automatic resizing, post-processing effects, and frame rate control
- Supports afterimage effects with oscillation parameters
- Configurable sizing modes (auto-fill or fixed dimensions)

**Starfield System** (`app/(default)/starfield/`)
- `StarfieldManager`: Controls particle lifecycle, camera movement, and scene updates
- `StarfieldParticle`: Handles instanced particle rendering with custom materials
- `StarfieldDistribution`: Implements various spatial distribution patterns (radial, uniform, galactic)
- `StarfieldConfig`: Centralized configuration with sensible defaults

**Scene Architecture** (`app/(default)/starfieldScene.ts`)
- Initializes the complete starfield scene with configurable parameters
- Manages global state for the starfield system
- Provides update loop integration with Next.js components

### TypeScript Configuration
- Path aliases: `@/*` → `app/*`, `@lib/*` → `app/lib/*`, `@components/*` → `app/components/*`
- Strict mode enabled with relaxed property initialization
- Bundler module resolution for modern tooling

### Styling Approach
- Tailwind CSS with utility-first methodology
- Custom color variables and shadow utilities in config
- Global user-select: none for better UX
- Responsive design with auto-fill layouts

### Asset Structure
- Static assets in `public/img/` including galaxy textures and star sprites
- Star textures located in `public/img/stars/` directory

## Development Notes

- Uses Bun as the JavaScript runtime for improved performance
- Three.js integration uses modern ES modules and addons
- Component architecture separates client and server components appropriately
- The starfield uses instanced rendering for performance with large particle counts
- Post-processing pipeline includes afterimage effects for motion trails
- Docker support for both development and production environments