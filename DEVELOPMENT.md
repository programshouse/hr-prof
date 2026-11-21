# HR System - Development Guide

## 🎯 Overview

This is a production-ready HR Management System built with modern React patterns and best practices.

## 📦 Complete File Structure

```
hr-fe/
├── public/
│   ├── manifest.json
│   └── vite.svg
│
├── src/
│   ├── app/
│   │   ├── main.jsx                    # App entry point
│   │   ├── App.jsx                     # Root component
│   │   ├── routes/
│   │   │   ├── index.routes.jsx        # Route definitions
│   │   │   └── guards.jsx              # Auth/Permission guards
│   │   └── providers/
│   │       ├── QueryProvider.jsx       # TanStack Query setup
│   │
│   ├── layouts/
│   │   ├── DashboardLayout.jsx         # Main app layout
│   │   └── AuthLayout.jsx              # Login/auth layout
│   │
│   ├── components/
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── select.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── dropdown-menu.jsx
│   │   │   ├── toast.jsx
│   │   │   └── DataTable/
│   │   │       └── DataTable.jsx       # Table wrapper
│   │   ├── forms/
│   │   │   └── Form.jsx                # Form helpers
│   │   ├── charts/
│   │   │   ├── BarChart.jsx
│   │   │   └── LineChart.jsx
│   │   ├── feedback/
│   │   │   └── EmptyState.jsx
│   │   └── navigation/
│   │       ├── Sidebar.jsx
│   │       └── Topbar.jsx
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   └── pages/
│   │   │       └── LoginPage.jsx
│   │   ├── employees/
│   │   │   ├── pages/
│   │   │   │   ├── EmployeesListPage.jsx
│   │   │   │   └── EmployeeDetailsPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── EmployeeTable.jsx
│   │   │   │   ├── EmployeeFilters.jsx
│   │   │   │   └── EmployeeFormDialog.jsx
│   │   │   ├── api/
│   │   │   │   ├── employees.api.js
│   │   │   │   └── employees.keys.js
│   │   │   ├── hooks/
│   │   │   │   ├── useEmployeesQuery.js
│   │   │   │   └── useUpsertEmployee.js
│   │   │   └── schemas/
│   │   │       └── employee.schema.js
│   │   ├── attendance/
│   │   │   └── pages/
│   │   │       └── AttendancePage.jsx
│   │   ├── payroll/
│   │   │   └── pages/
│   │   │       └── PayrollPage.jsx
│   │   └── settings/
│   │       └── pages/
│   │           └── SettingsPage.jsx
│   │
│   ├── services/
│   │   ├── http/
│   │   │   └── axiosClient.js          # Axios instance + interceptors
│   │   └── auth/
│   │       ├── auth.api.js
│   │       └── auth.store.js           # Zustand auth store
│   │
│   ├── stores/
│   │   ├── useUIStore.js               # UI preferences
│   │
│   ├── lib/
│   │   ├── permissions.js              # Permission helpers
│   │   ├── pagination.js               # Pagination utils
│   │   ├── zodUtils.js                 # Zod helpers
│   │   └── utils.js                    # cn() utility
│   │
│   ├── constants/
│   │   ├── routes.js                   # Route constants
│   │   └── roles.js                    # Roles & permissions
│   │
│   ├── styles/
│   │   └── globals.css                 # Tailwind variables
│   │
│   └── types/
│       └── index.js                    # JSDoc type definitions
│
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .prettierrc
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.js
├── vite.config.js
├── README.md
└── QUICKSTART.md
```

## 🏗️ Architecture Patterns

### 1. Feature-Based Structure

Each feature is self-contained with:

- Pages (route components)
- Components (feature-specific UI)
- API (HTTP calls + query keys)
- Hooks (queries + mutations)
- Schemas (validation)

### 2. State Management Strategy

**Server State (TanStack Query)**

- All API data
- Automatic caching
- Background refetching
- Optimistic updates

**Client State (Zustand)**

- UI preferences (sidebar)
- Authentication state

### 3. Component Patterns

**shadcn/ui Vendored Components**

- All UI components are local (no CLI needed)
- Customizable with Tailwind
- Radix UI primitives for accessibility

**Compound Components**

- Card (Card, CardHeader, CardTitle, etc.)
- Form (Form, FormField, ErrorText)
- Dialog (Dialog, DialogContent, etc.)

### 4. Data Fetching

```javascript
// Query Pattern
const { data, isLoading } = useEmployeesQuery(filters);

// Mutation Pattern
const { mutate } = useUpsertEmployee();
mutate({ id, data });
```

### 5. Form Handling

```javascript
// React Hook Form + Zod
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: {...}
});

const onSubmit = (data) => {
  mutation.mutate(data);
};
```

## 🔐 Authentication Flow

1. User submits login form
2. `authApi.login()` called
3. Backend returns user + tokens
4. Tokens stored in localStorage
5. User data stored in Zustand
6. Axios interceptor adds token to requests
7. 401 triggers refresh token flow
8. On refresh fail, redirect to login

## 🎨 Theming

**CSS Variables (Tailwind)**

- HSL color system

## 📊 Tables & Pagination

**TanStack Table Features**

- Sorting (client or server)
- Filtering
- Pagination
- Row selection
- Column visibility

**Usage**

```javascript
<DataTable
  columns={columns}
  data={data}
  pagination={pagination}
  onPaginationChange={setPagination}
/>
```

## ✅ Form Validation

**Zod Schemas**

```javascript
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});
```

**Utilities**

- `requiredString` - Non-empty string
- `email` - Email validation
- `phone` - Phone number
- `positiveNumber` - Positive numbers

## 🚦 Routing & Guards

**Route Protection**

```javascript
// Requires authentication
<Route element={<AuthGuard />}>
  <Route path="/" element={<Dashboard />} />
</Route>

// Requires specific permission
<PermissionGuard permission="view_employees">
  <EmployeesList />
</PermissionGuard>
```

## 🛠️ Adding New Features

### Step 1: Create Feature Structure

```
features/
└── my-feature/
    ├── pages/
    ├── components/
    ├── api/
    ├── hooks/
    └── schemas/
```

### Step 2: Define API

```javascript
// api/myFeature.api.js
export const myFeatureApi = {
  getItems: async (params) => {
    const response = await axiosClient.get('/items', { params });
    return response.data;
  },
};

// api/myFeature.keys.js
export const myFeatureKeys = {
  all: ['myFeature'],
  lists: () => [...myFeatureKeys.all, 'list'],
  list: (filters) => [...myFeatureKeys.lists(), filters],
};
```

### Step 3: Create Hooks

```javascript
// hooks/useMyFeatureQuery.js
export function useMyFeatureQuery(filters) {
  return useQuery({
    queryKey: myFeatureKeys.list(filters),
    queryFn: () => myFeatureApi.getItems(filters),
  });
}
```

### Step 4: Build Components & Pages

```javascript
// pages/MyFeaturePage.jsx
export default function MyFeaturePage() {
  const { data, isLoading } = useMyFeatureQuery();
  return <div>...</div>;
}
```

### Step 5: Add Routes

```javascript
// app/routes/index.routes.jsx
{
  path: '/my-feature',
  element: <MyFeaturePage />,
}
```

## 📝 Best Practices

1. **Always use Zod for validation**
2. **Keep components small and focused**
3. **Use TanStack Query for all API calls**
4. **Avoid prop drilling - use context or Zustand**
5. **Follow the feature structure pattern**
6. **Use TypeScript JSDoc for better IntelliSense**
7. **Handle loading and error states**
8. **Use semantic HTML and ARIA labels**

## 🐛 Debugging

**React Query DevTools** (add to App.jsx):

```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />;
```

**Zustand DevTools**:

```javascript
import { devtools } from 'zustand/middleware';

create(devtools((set) => ({...})));
```

## 🚀 Deployment

1. Build the app:

   ```bash
   npm run build
   ```

2. Preview locally:

   ```bash
   npm run preview
   ```

3. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting

## 🔧 Environment Variables

```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=HR System
VITE_APP_VERSION=1.0.0
```

Access in code:

```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📚 Resources

- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [shadcn/ui](https://ui.shadcn.com/)
- [Zod Docs](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/)

## 🤝 Contributing

1. Follow the existing code patterns
2. Write meaningful commit messages
3. Test your changes
4. Run `npm run lint` before committing

---

Happy coding! 🎉
