# Agent Development Guidelines

## Build/Lint/Test Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on the codebase
- `npm run generate` - Generate Drizzle migrations
- `npm run migrate` - Run Drizzle migrations
- No test command configured (add one if needed)
- **Working Directory**: `/home/jack/projects/newsbaux/nextjs-newsbaux/`

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, use proper typing with React 19
- **Imports**: Use Next.js imports (`next/image`, `next/font/google`), `@/*` aliases for local files
- **Components**: Function declarations with explicit props typing, no `Readonly<{}>` wrapper needed
- **Props**: Use intersection types for component props (`React.ComponentProps<"button"> & {...}`)
- **Naming**: camelCase for variables/functions, PascalCase for components
- **CSS**: TailwindCSS v4 with utility classes, extensive custom styling patterns
- **Metadata**: Export const metadata for pages using Next.js Metadata API
- **Fonts**: Use Next.js font optimization with CSS variables (--font-geist-sans, etc.)
- **Client Components**: Use 'use client' directive, avoid in server components
- **File Structure**: App router (`src/app/`), UI components in `src/components/ui/`
- **Database**: Drizzle ORM with Turso, schema in `src/db/schema.ts`
- **State**: Zustand for client state, TanStack Query for server state

## Key Dependencies
- Next.js 15.5.4 with App Router and Turbopack
- React 19.1.0, TypeScript 5, TailwindCSS 4
- Drizzle ORM with Turso database, NextAuth 5 beta
