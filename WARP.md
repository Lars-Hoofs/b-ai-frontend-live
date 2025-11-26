# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
- `npm run dev` - Start development server (runs on port 3001, proxies to backend on port 3000)
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Important Notes
- Frontend runs on `http://localhost:3001` (configured in `.env.local`)
- Backend API runs on `http://localhost:3000` (hardcoded in `app/api/[...path]/route.ts`)
- All API requests are proxied through Next.js to handle cookies properly (same-origin)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 16 with App Router (React 19)
- **Styling**: Tailwind CSS 4 with shadcn/ui components (New York variant)
- **Authentication**: Better Auth with HttpOnly cookies
- **State Management**: React Context (AuthContext, WorkspaceContext)
- **UI Components**: shadcn/ui, Radix UI, Framer Motion
- **Workflow Builder**: React Flow (visual workflow editor)
- **Icons**: Remix Icons, Lucide React, React Icons

### Project Structure

```
app/                    # Next.js App Router pages
  api/[...path]/       # API proxy route (forwards to backend)
  dashboard/           # Protected dashboard routes
    agents/
    teams/
    widgets/
    workflows/
      [id]/            # Dynamic workflow editor route
  login/
  register/

components/            # React components organized by feature
  agents/
  dashboard/           # Sidebar, Topbar
  knowledge/
  teams/
  ui/                  # shadcn/ui components (button, Modal)
  widgets/
  workflows/           # WorkflowEditor (React Flow), WorkflowNodes

contexts/              # React Context providers
  AuthContext.js       # Better Auth integration
  WorkspaceContext.tsx # Workspace selection/management

lib/
  api.js               # Main API client with all endpoint functions
  api/
    workspaces.ts      # Workspace-specific API helpers
  auth-client.ts       # Better Auth client setup
  utils.ts             # Utility functions (cn, etc.)
```

### Key Architecture Patterns

#### Authentication Flow
- Uses Better Auth with HttpOnly cookies for security
- **Important**: All API requests go through Next.js proxy (`app/api/[...path]/route.ts`) to ensure cookies work correctly (same-origin policy)
- `AuthContext` wraps the app in `app/layout.tsx` and provides `user`, `login`, `logout`, `isAuthenticated`, `loading`
- Dashboard routes protected by checking auth state in `app/dashboard/layout.tsx`
- Cookie modification happens in proxy: removes `Secure` flag and changes `SameSite=Strict` to `Lax` for localhost development

#### Workspace Management
- Multi-tenant architecture: users can belong to multiple workspaces
- `WorkspaceContext` manages workspace selection and state
- Selected workspace ID stored in `localStorage` for persistence
- All API calls to workspace-scoped resources require `workspaceId` parameter
- Dashboard layout wraps children in `WorkspaceProvider`

#### API Client Architecture
- Central API client in `lib/api.js` with organized endpoint groups:
  - `userAPI` - User profile operations
  - `workspaceAPI` - Workspace CRUD + webhook configuration
  - `agentAPI` - AI agent management
  - `chatAPI` - Conversation and message handling (public + authenticated endpoints)
  - `widgetAPI` - Chat widget configuration + embed code generation
  - `knowledgeBaseAPI` - Knowledge base + document management (RAG)
  - `workflowAPI` - Visual workflow builder (nodes, edges, execution)
  - `inviteAPI` - Team member invitations + role management
  - `dashboardAPI` - Analytics and real-time stats
  - `scraperAPI` - Website content scraping for knowledge base
  - `mediaAPI` - File upload (images, documents) with public/authenticated variants
- All requests use `credentials: 'include'` to send cookies
- 401 responses trigger global `auth:logout` event instead of throwing errors
- API base URL is empty string (same-origin) to use Next.js proxy

#### Workflow System
- Visual workflow builder using React Flow
- Workflows consist of nodes (triggers, conditions, actions, AI actions) and edges (connections with optional conditions)
- Node types defined in `components/workflows/WorkflowNodes.tsx`
- Editor provides drag-and-drop interface for building automation flows
- Workflows stored in backend with:
  - Nodes: type, label, config, position (x, y)
  - Edges: source/target node IDs, optional condition, label
- Start node is virtual (not saved to backend)

#### Component Patterns
- shadcn/ui components follow "New York" style variant
- Path alias `@/*` maps to project root (configured in `tsconfig.json` and `components.json`)
- Client components marked with `'use client'` directive (all context consumers, interactive UI)
- Server components by default (layout.tsx files without 'use client')

## Important Development Considerations

### Backend Dependency
- Frontend requires backend API running on `localhost:3000` for all functionality
- API proxy will fail gracefully with connection errors if backend is down
- Backend uses Better Auth which sets the authentication cookies

### Environment Variables
- `NEXT_PUBLIC_FRONTEND_URL` - Frontend URL (default: http://localhost:3001)
- `NEXT_PUBLIC_API_URL` - Should be empty string to use Next.js proxy

### React Compiler
- Project uses experimental React Compiler (`reactCompiler: true` in next.config.ts)
- Babel plugin configured for automatic optimization

### Image Configuration
- Remote images allowed from `images.unsplash.com` (configured in next.config.ts)

### TypeScript Configuration
- Target: ES2017
- Strict mode enabled
- Path aliases: `@/*` maps to project root
- Module resolution: bundler

### Cookie Handling
- Development environment modifies cookies in API proxy:
  - Removes `Secure` flag (not HTTPS)
  - Changes `SameSite=Strict` to `SameSite=Lax`
- This allows Better Auth cookies to work between Next.js (3001) and backend (3000)

### File Organization
- Keep components feature-organized (agents/, widgets/, workflows/, etc.)
- Place shared UI components in `components/ui/`
- API functions grouped by resource type in `lib/api.js`
- Context providers in `contexts/` directory
