# Phoenix Sound Website

This is a Next.js web application featuring an interactive 3D starfield visualization built with Three.js. The project includes a PostgreSQL database, admin panel, and Docker support for easy development.

## Prerequisites

- [Bun](https://bun.sh/) - JavaScript runtime and package manager
- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) (if not using Bun for all tasks)

## Quick Start

1. **Clone and install dependencies**
   ```bash
   git clone <your-repo-url>
   cd www.phoenixsound.com
   bun install
   ```

2. **Start the database services**
   ```bash
   bun run docker:db
   ```
   This will start PostgreSQL and pgAdmin containers.

3. **Create an admin user**
   ```bash
   bun run db:seed
   ```
   Follow the prompts to create your admin user.

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Access the application**
   - Main site: http://localhost:3000
   - Admin panel: http://localhost:3000/admin/login
   - pgAdmin: http://localhost:5050

## Development Commands

### Core Development
- `bun run dev` - Start development server with Bun runtime
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run Next.js ESLint

### Docker Management
- `bun run docker:dev` - Run full development environment in Docker
- `bun run docker:prod` - Run production environment in Docker
- `bun run docker:db` - Start only database services (PostgreSQL + pgAdmin)
- `bun run docker:build` - Build production Docker image
- `bun run docker:clean` - Clean Docker containers and volumes
- `bun run docker:fresh` - Fresh Docker development start
- `bun run docker:logs` - View Docker container logs
- `bun run docker:restart` - Restart Docker services

### Database Management
- `bun run db:seed` - Create admin user interactively
- `bun run db:seed:password` - Create admin user with password argument

### Utility Commands
- `bun run kill3000` - Kill processes running on port 3000
- `bun run pgadmin` - Display pgAdmin connection details
- `bun run admin` - Display admin panel URL

## Database Access

### pgAdmin Web Interface
- URL: http://localhost:5050
- Email: admin@phoenixsound.com
- Password: admin_password

### Direct PostgreSQL Connection
- Host: localhost
- Port: 5432
- Database: phoenixsound
- Username: phoenix_user
- Password: phoenix_password

## Environment Variables

Create a `.env.local` file in the root directory for local development:

```env
# Database
DATABASE_URL=postgresql://phoenix_user:phoenix_password@localhost:5432/phoenixsound

# JWT Secret (change in production)
JWT_SECRET=your-secret-key-change-in-production

# Node Environment
NODE_ENV=development
```

## Project Structure

```
├── app/
│   ├── (default)/           # Default layout routes
│   │   ├── components/      # React components
│   │   ├── starfield/       # 3D starfield system
│   │   └── page.tsx         # Homepage
│   ├── admin/               # Admin panel routes
│   │   ├── login/
│   │   ├── events/
│   │   └── users/
│   ├── api/                 # API routes
│   │   ├── auth/
│   │   ├── events/
│   │   └── users/
│   └── lib/                 # Utilities and models
│       ├── models/          # Database models
│       ├── auth.ts          # Authentication utilities
│       └── db.ts            # Database connection
├── docker-compose.yml       # Docker services configuration
├── init.sql                 # Database initialization
└── scripts/                 # Utility scripts
    └── seed-admin.js        # Admin user seeding
```

## Features

- **Interactive 3D Starfield**: Built with Three.js and WebGL
- **Admin Panel**: User and event management with authentication
- **PostgreSQL Database**: Persistent data storage with Docker
- **JWT Authentication**: Secure session management
- **Docker Support**: Complete containerized development environment
- **TypeScript**: Full type safety throughout the application

## Tech Stack

- **Framework**: Next.js (v15.5.2)
- **Runtime**: Bun
- **Language**: TypeScript (v5.9.2)
- **UI Library**: React (v19.1.1)
- **3D Graphics**: Three.js (v0.180.0)
- **Database**: PostgreSQL (v15)
- **Authentication**: JWT + bcrypt
- **Styling**: Tailwind CSS (v3.4.0)
- **Containerization**: Docker & Docker Compose

## Development Workflow

1. **Start database services**: `bun run docker:db`
2. **Seed admin user**: `bun run db:seed`
3. **Start development server**: `bun run dev`
4. **Access admin panel**: Login at http://localhost:3000/admin/login
5. **View database**: Use pgAdmin at http://localhost:5050

## Troubleshooting

### Port 3000 in use
```bash
bun run kill3000
```

### Fresh Docker start
```bash
bun run docker:fresh
```

### Database connection issues
- Ensure Docker services are running: `docker-compose ps`
- Check container logs: `bun run docker:logs`
- Restart services: `bun run docker:restart`

### Admin login issues
- Create a new admin user: `bun run db:seed`
- Check database connection in pgAdmin
- Verify JWT_SECRET is set in environment

## Production Deployment

1. **Build the application**
   ```bash
   bun run build
   ```

2. **Run production Docker setup**
   ```bash
   bun run docker:build
   bun run docker:prod
   ```

3. **Set production environment variables**
   - Change JWT_SECRET to a secure random string
   - Set NODE_ENV=production
   - Configure proper DATABASE_URL for production database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `bun run lint` to check code style
5. Test your changes locally
6. Submit a pull request

