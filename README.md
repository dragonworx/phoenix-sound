# Next.js + Bun + Tailwind + Docker Template

This is a **Next.js web application** built with TypeScript, Bun, and Tailwind CSS. The project uses Next.js App Router for routing and React for component architecture.

### Tech Stack
- **Framework**: Next.js (v15.5.2)
- **Runtime**: Bun
- **Language**: TypeScript (v5.9.2)
- **UI Library**: React (v19.1.1)
- **Styling**: Tailwind CSS (v3.4.0)
- **Containerization**: Docker & Docker Compose

### Architecture

**Application**:
- Next.js App Router for file-based routing
- React components with TypeScript
- Server-side rendering and client-side hydration
- API routes through Next.js API endpoints

**Styling**:
- Tailwind CSS for utility-first styling
- PostCSS for CSS processing
- Responsive design support

### Key Features
- **React Components**: Modern React 19 with hooks and functional components
- **File-Based Routing**: Next.js App Router for automatic route generation
- **Docker Support**: Containerized development and production environments
- **Hot Reload**: Next.js Fast Refresh for instant updates
- **TypeScript**: Full type safety across the application

### Project Structure
```
my-project/
├── app/             # Next.js App Router pages and layouts
├── components/      # Reusable React components
├── lib/             # Utility functions and shared code
├── public/          # Static assets
├── styles/          # Global styles and Tailwind config
└── docker/          # Docker configuration files
```

### Development Commands
- `bun run dev`: Start Next.js development server with Bun
- `bun run dev:local`: Alternative local development command
- `bun run build`: Build for production
- `bun run start`: Start production server
- `bun run lint`: Run Next.js linter
- `bun run docker:dev`: Run development environment in Docker
- `bun run docker:prod`: Run production environment in Docker
- `bun run docker:build`: Build production Docker image
- `bun run docker:clean`: Clean Docker containers and volumes
- `bun run docker:fresh`: Fresh Docker development start

### Dependencies

**Production:**
- Next.js: v15.5.2
- React: v19.1.1
- React DOM: v19.1.1

**Development:**
- TypeScript: v5.9.2
- Tailwind CSS: v3.4.0
- PostCSS: v8.5.6
- @types/node: v24.3.1
- @types/react: v19.1.12
- @types/react-dom: v19.1.9
