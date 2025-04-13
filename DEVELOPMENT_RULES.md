# Development Rules and Standards

## Project Structure

### Backend Structure 
- Organize code into controllers, services, repositories, models, and middleware
- Keep configuration in a dedicated config folder
- Store database scripts in a db folder

### Frontend Structure
- Organize components by feature and reusability
- Separate UI components from containers/page components
- Keep hooks, utils, and services in dedicated folders

## Package Requirements

### Frontend Dependencies
- **Core**: React, React DOM
- **Styling**: Tailwind CSS with PostCSS and autoprefixer
- **UI Components**: shadcn UI
- **Data Management**: 
  - TanStack Table (for data tables)
  - TanStack Query (for data fetching and caching)
- **Form Management**: 
  - react-hook-form
  - @hookform/resolvers with Zod for schema validation
- **API Communication**: axios (in dedicated service files)
- **Additional UI Libraries**: Maintain necessary UI libraries like Radix UI, Framer Motion as needed
- **Build Tool**: Vite (with associated development scripts)

### Backend Dependencies
- **Core**: Express, Node.js
- **Database**: pg (PostgreSQL client)
- **Security & Middleware**:
  - cookie-parser
  - cors
  - express-rate-limit
  - express-session (for refresh token management)
  - bcrypt (for password hashing)
- **Utilities**:
  - dotenv (environment configuration)
  - body-parser
  - uuid
  - sharp (image processing)
  - nodemailer (email functionality)
  - twilio (messaging functionality)
- **Note**: Remove any unused packages (like mongoose or mysql2) that don't align with our PostgreSQL stack

## Coding Standards

### General
1. Use ESLint and Prettier for code formatting
2. Write meaningful commit messages
3. Document complex functions and components
4. Use TypeScript/JSDoc for type safety
5. Handle errors appropriately with try/catch
6. Use ES modules (import/export) consistently

### Backend Rules
1. **Repository Pattern**:
   - Use repositories for database access
   - Implement pgquery.js for database operations
   - Keep SQL queries in repositories
   - Return data in a consistent format

2. **Request Handling**:
   ```javascript
   // Controller pattern
   export const handleRequest = async (req, res, next) => {
     try {
       // Logic here
       return res.status(200).json(data);
     } catch (error) {
       next(error);
     }
   };
   ```

3. **Service Pattern**:
   ```javascript
   // Service pattern
   export const serviceFunction = async (params) => {
     // Business logic here
     return result;
   };
   ```

4. **Middleware Pattern**:
   ```javascript
   export const middleware = (req, res, next) => {
     // Middleware logic
     next();
   };
   ```

5. **Error Handling**:
   - Use custom error classes
   - Centralized error handling middleware
   - Consistent error responses
   - Use createError utility for standardized errors

### Frontend Rules
1. **Component Structure**:
   ```jsx
   // Functional components only
   export const ComponentName = ({ prop1, prop2 }) => {
     // Component logic
     return <div>...</div>;
   };
   ```

2. **Custom Hooks**:
   ```jsx
   export const useCustomHook = (params) => {
     // Hook logic
     return { data, methods };
   };
   ```

3. **API Integration**:
   ```jsx
   // Feature-based API functions in dedicated service files
   export const apiFunction = async (params) => {
     const { data } = await axios.get('/endpoint');
     return data;
   };
   ```

4. **Form Handling**:
   - Use react-hook-form with zod schemas
   - Implement client-side validation
   - Show loading states and error messages
   - Example pattern:
   ```jsx
   import { useForm } from 'react-hook-form';
   import { zodResolver } from '@hookform/resolvers/zod';
   import { z } from 'zod';

   const schema = z.object({
     name: z.string().min(2).max(100),
     email: z.string().email(),
   });

   export const MyForm = () => {
     const { register, handleSubmit, formState: { errors } } = useForm({
       resolver: zodResolver(schema)
     });

     const onSubmit = (data) => {
       // Handle form submission
     };

     return (
       <form onSubmit={handleSubmit(onSubmit)}>
         {/* Form fields */}
       </form>
     );
   };
   ```

5. **State Management**:
   - Use TanStack Query for server state
   - Context API for global UI state
   - Local state for component-specific data
   - Example TanStack Query usage:
   ```jsx
   import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { fetchUsers, createUser } from '../services/api';

   export const UsersList = () => {
     const { data, isLoading, error } = useQuery({
       queryKey: ['users'],
       queryFn: fetchUsers
     });

     const mutation = useMutation({
       mutationFn: createUser,
       onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['users'] });
       }
     });

     if (isLoading) return <div>Loading...</div>;
     if (error) return <div>Error: {error.message}</div>;

     return (
       <div>
         {/* Render users */}
       </div>
     );
   };
   ```

6. **Data Tables**:
   - Use TanStack Table for complex table requirements
   - Example:
   ```jsx
   import { 
     useReactTable, 
     getCoreRowModel, 
     getPaginationRowModel, 
     flexRender 
   } from '@tanstack/react-table';

   export const DataTable = ({ data }) => {
     const columns = [
       {
         accessorKey: 'name',
         header: 'Name'
       },
       // Other columns
     ];

     const table = useReactTable({
       data,
       columns,
       getCoreRowModel: getCoreRowModel(),
       getPaginationRowModel: getPaginationRowModel(),
     });

     return (
       // Table rendering
     );
   };
   ```

## Authentication & Authorization

1. **JWT Handling**:
   - Store in httpOnly cookies
   - Implement refresh token rotation
   - Clear tokens on logout
   - Use separate secrets for access and refresh tokens

2. **Session Management**:
   - Use express-session or similar for backend session management
   - Store refresh tokens in database
   - Implement token expiration
   - Allow multiple sessions per user
   - Invalidate sessions on logout

3. **Protected Routes**:
   - Implement route guards
   - Role-based access control
   - Redirect unauthorized access

4. **API Security**:
   - Rate limiting with express-rate-limit
   - CORS configuration
   - Input validation
   - XSS protection
   - CSRF protection

## Database Interactions

1. **Query Pattern**:
   ```javascript
   // Using pgquery.js
   export const findOne = async (params) => {
     const result = await pgquery('SELECT * FROM table WHERE id = $1', [params.id]);
     return result[0];
   };
   ```

2. **Transaction Pattern**:
   ```javascript
   export const transaction = async (operations) => {
     const client = await pool.connect();
     try {
       await client.query('BEGIN');
       // operations
       await client.query('COMMIT');
     } catch (error) {
       await client.query('ROLLBACK');
       throw error;
     } finally {
       client.release();
     }
   };
   ```

3. **Repository Pattern**:
   - Centralize database access in repositories
   - Use consistent naming conventions
   - Handle database errors appropriately
   - Return data in a consistent format

## Testing Standards

1. **Backend Tests**:
   - Unit tests for utilities and services
   - Integration tests for API endpoints
   - Use Jest and Supertest

2. **Frontend Tests**:
   - Component tests with React Testing Library
   - Hook testing
   - Integration tests for user flows
   - Test TanStack Query hooks with proper mocking

## Performance Guidelines

1. **Backend**:
   - Implement caching where appropriate
   - Optimize database queries
   - Use pagination for large datasets
   - Implement connection pooling

2. **Frontend**:
   - Lazy loading for routes
   - Image optimization
   - Memoization for expensive calculations
   - Optimize TanStack Query with proper cache configuration
   - Use Tailwind's purge feature for production CSS optimization

## Deployment & Environment

1. **Environment Variables**:
   - Use .env files
   - Never commit sensitive data
   - Document required variables

2. **Build Process**:
   - Optimize builds for production (Vite for frontend)
   - Implement CI/CD pipelines
   - Version control for assets

## Code Review Guidelines

1. **Pull Request Requirements**:
   - Clear description of changes
   - Tests included
   - No linting errors
   - Follows project structure

2. **Review Checklist**:
   - Code follows standards
   - Proper error handling
   - Security considerations
   - Performance impact
   - Dependencies properly managed

## Documentation

1. **API Documentation**:
   - OpenAPI/Swagger for endpoints
   - Include request/response examples
   - Document error responses

2. **Component Documentation**:
   - Props documentation
   - Usage examples
   - State management explanation
   - Dependencies and external libraries used