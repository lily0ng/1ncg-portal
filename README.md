# CloudStack CMP - Cloud Management Portal

A production-ready Cloud Management Portal (CMP) for Apache CloudStack 4.22, built with Next.js 14 App Router + TypeScript + React + Tailwind CSS.

## Features

### Two Portals in One App
- **Admin Portal**: Full infrastructure management with complete CloudStack API integration
- **User Portal**: Self-service portal for end users to manage their resources

### Key Features
- Complete VM lifecycle management (deploy, start, stop, reboot, console access)
- Storage management (volumes, snapshots, backups)
- Network management (VPCs, guest networks, public IPs)
- Billing and usage tracking with cost calculation
- Kubernetes cluster management
- Auto-scaling groups
- SSH key management
- Real-time resource monitoring with charts
- 7 customizable themes
- Role-based access control (Admin, Reseller, User)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: Custom shadcn/ui-style components
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Data Fetching**: SWR
- **State**: Zustand
- **Database**: Prisma + PostgreSQL
- **Auth**: Jose (JWT)

## Project Structure

```
my-cmp/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Auth route group
│   ├── (admin)/            # Admin portal route group
│   └── (user)/             # User portal route group
├── components/             # React components
├── lib/                    # Utilities
├── hooks/                  # React hooks
├── types/                  # TypeScript types
├── prisma/                 # Database schema
└── middleware.ts          # Auth middleware
```

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local`:
```env
CS_URL=http://your-cloudstack-server:8080
CS_API_KEY=your_api_key
CS_SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@localhost:5432/cmp_db
JWT_SECRET=your_jwt_secret_minimum_32_characters
NEXTAUTH_URL=http://localhost:3000
```

### 3. Initialize Database
```bash
npm run db:generate
npm run db:push
```

### 4. Run Development Server
```bash
npm run dev
```

## License
MIT
