# Task Manager Backend

A robust RESTful API backend for a task management system built with Node.js, Express, TypeScript, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin/User)
  - Password reset functionality
  - Secure password hashing

- 📋 **Task Management**
  - Create, read, update, and delete tasks
  - Task status toggling
  - Pagination and sorting
  - User-specific task views
  - Admin access to all tasks

- 🛡️ **Security**
  - Rate limiting
  - Helmet security headers
  - CORS protection
  - Input validation with Zod
  - Error handling middleware

- 🔧 **Developer Experience**
  - TypeScript for type safety
  - ESLint & Prettier configuration
  - Organized project structure
  - Comprehensive error handling
  - Winston logging system

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd task-manager-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file in the root directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task-manager
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

\`\`\`
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # Route definitions
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── tests/          # Test files
\`\`\`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/user` - Get user details
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password/:token` - Reset password

### Tasks
- GET `/api/tasks` - Get all tasks (paginated)
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/:id` - Update a task
- DELETE `/api/tasks/:id` - Delete a task
- PATCH `/api/tasks/:id/toggle-status` - Toggle task status

## Environment Variables

| Variable      | Description                | Default     |
|--------------|----------------------------|-------------|
| PORT         | Server port               | 5000        |
| MONGODB_URI  | MongoDB connection URL    | -           |
| JWT_SECRET   | JWT signing key          | -           |
| NODE_ENV     | Environment              | development |

## Scripts

- \`npm run dev\` - Start development server with hot reload
- \`npm run build\` - Build for production
- \`npm start\` - Start production server
- \`npm run lint\` - Run ESLint
- \`npm run lint:fix\` - Fix ESLint issues
- \`npm run format\` - Format code with Prettier
- \`npm run fix\` - Run both formatter and linter fixes

## Security Features

1. **Rate Limiting**
   - Protects against brute force attacks
   - Configurable limits per route

2. **Security Headers**
   - XSS protection
   - CSRF protection
   - Content Security Policy
   - And more via helmet

3. **Input Validation**
   - Request validation using Zod
   - Sanitized MongoDB queries
   - Type-safe request handling

## Error Handling

The application uses a centralized error handling system with:
- Custom AppError class
- Error middleware
- Detailed logging
- Development/Production error responses

## Logging

Winston logger is configured for:
- HTTP request logging
- Error logging with stack traces
- Daily rotating log files
- Console output in development

## Contributing

1. Fork the repository
2. Create your feature branch: \`git checkout -b feature/my-feature\`
3. Commit your changes: \`git commit -am 'Add new feature'\`
4. Push to the branch: \`git push origin feature/my-feature\`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Author

[Your Name]

## Acknowledgments

- Express.js team
- MongoDB team
- TypeScript team
- All other open source contributors