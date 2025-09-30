# Agent Development Guidelines

## Build/Lint/Test Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack 
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on the codebase
- No test command configured (add one if needed)

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, use proper typing with React 19
- **Imports**: Use Next.js imports (`next/image`, `next/font/google`), relative imports for local files
- **Components**: Use function declarations with proper TypeScript interfaces
- **Props**: Use `Readonly<{}>` wrapper for component props with explicit types
- **Naming**: camelCase for variables/functions, PascalCase for components
- **CSS**: TailwindCSS v4 with utility classes, use `className` prop
- **Metadata**: Export const metadata for pages using Next.js Metadata API
- **Fonts**: Use Next.js font optimization with CSS variables
- **Error Handling**: Follow Next.js patterns, use proper error boundaries
- **File Structure**: App router pattern (`src/app/`), components in appropriate directories
- **ESLint**: Extends `next/core-web-vitals` and `next/typescript` configs
- **Path Aliases**: Use `@/*` for `./src/*` imports when helpful

## Key Dependencies
- Next.js 15.5.4 with App Router and Turbopack
- React 19.1.0, TypeScript 5, TailwindCSS 4