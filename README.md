# HR System - React Frontend

A modern, full-featured HR Management System built with React 19, Vite, and TailwindCSS.
## 🚀 Tech Stack
- **Frontend Framework**: Vite + React 19 (JavaScript)
- **Routing**: React Router v7
- **Server State**: TanStack Query (React Query)
- **Global State**: Zustand (UI/Auth)
- **HTTP Client**: Axios with interceptors
- **UI Library**: TailwindCSS + shadcn/ui + Lucide React
- **Tables**: TanStack Table
- **Charts**: Recharts
- **Forms & Validation**: React Hook Form + Zod
- **Utilities**: clsx, date-fns
## 📁 Project Structure
``
hr-fe/
├── src/
│   ├── app/                    # App core (main.jsx, App.jsx, routes, providers)
│   ├── layouts/                # DashboardLayout, AuthLayout
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── forms/              # Form helpers
│   │   ├── feedback/           # EmptyState
│   │   └── navigation/         # Sidebar, Topbar
│   ├── features/               # Feature modules
│   │   ├── employees/          # Complete CRUD with pages, components, API, hooks
│   │   ├── attendance/
│   │   ├── payroll/
│   │   └── settings/
│   ├── services/               # HTTP client, auth
│   ├── stores/                 # Zustand stores
│   ├── lib/                    # Utilities
│   ├── constants/              # Routes, roles
│   └── styles/                 # Global CSS
```
## Tech Stack
- React 19 + Vite
- React Router v7
- TanStack Query
- Zustand
- Axios
- TailwindCSS + shadcn/ui
- React Hook Form + Zod
- Recharts
- date-fns
## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm


### Installation
1. Clone the repository
2. Install dependencies:

```bash
npm install
```
3. Create `.env` file:

```bash
cp .env.example .env
```

4. Update the API URL in `.env`:

```
VITE_API_URL=http://localhost:8000/api
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🎨 Features

### Implemented

- ✅ Complete authentication flow with JWT
- ✅ Employee management (CRUD operations)
- ✅ Advanced filtering and search
- ✅ Data table with sorting and pagination
- ✅ Responsive layouts
- ✅ Dark mode support
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Error handling and boundaries

## 📝 Development Notes

- All components use shadcn/ui vendored pattern (no CLI needed)
- Forms use React Hook Form + Zod for validation
- API calls use Axios with automatic token refresh
- State management: TanStack Query for server state, Zustand for client state
- All code follows ESLint rules (run `npm run lint`)

## 🔐 Authentication

The app uses JWT-based authentication with:

- Access tokens (stored in localStorage)
- Refresh token flow
- Automatic token refresh on 401
- Protected routes with guards

## 🎯 Key Patterns

### Feature Structure

Each feature follows a consistent pattern:

- `pages/` - Route components
- `components/` - Feature-specific components
- `api/` - API functions and query keys
- `hooks/` - Custom hooks (queries, mutations)
- `schemas/` - Zod validation schemas

### State Management

- **Server State**: TanStack Query for all API data
- **UI State**: Zustand store for sidebar
- **Auth State**: Zustand store with persistence

## 📚 Documentation

For more details on the architecture and patterns used, see the inline code documentation.

## 🤝 Contributing

This is a template project. Feel free to customize and extend as needed.

## 📄 License

MIT
