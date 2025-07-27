# /add-feature Command - Add Features to Existing Projects

## ACTIVATION

When the user types `/add-feature [feature-name]` in an existing project, add the specified feature without breaking current functionality.

## Overview

The `/add-feature` command safely adds new capabilities to existing projects by:
- Analyzing current project state
- Checking compatibility
- Creating backups
- Merging code intelligently
- Updating dependencies

## Supported Features

### Authentication Features
- `auth-jwt`: JWT-based authentication
- `auth-oauth`: OAuth2 integration (Google, GitHub, etc.)
- `auth-2fa`: Two-factor authentication
- `auth-session`: Session-based auth

### API Features
- `api-rest`: RESTful API endpoints
- `api-graphql`: GraphQL server
- `api-websocket`: Real-time WebSocket
- `api-rate-limit`: Rate limiting

### Database Features
- `db-postgres`: PostgreSQL integration
- `db-mongodb`: MongoDB setup
- `db-redis`: Redis caching
- `db-migrations`: Migration system

### Frontend Features
- `ui-dashboard`: Admin dashboard
- `ui-forms`: Advanced form handling
- `ui-tables`: Data tables with sorting/filtering
- `ui-charts`: Data visualization

### Other Features
- `testing`: Comprehensive test setup
- `docker`: Docker containerization
- `ci-cd`: CI/CD pipelines
- `monitoring`: Application monitoring

## Execution Flow

### 1. Project Analysis
```
/add-feature auth-jwt

📊 Analyzing current project...

Project: task-manager
Framework: Express + React
Current features:
  ✓ Basic API endpoints
  ✓ MongoDB integration
  ✓ React frontend

Checking compatibility for JWT auth...
✅ Compatible - no conflicts detected
```

### 2. Feature Planning
```
📦 Planning JWT Authentication Feature

Will add:
  • 4 new files
  • 3 modified files
  • 3 new dependencies

New files:
  - src/middleware/auth.js
  - src/routes/auth.js
  - src/utils/jwt.js
  - src/models/RefreshToken.js

Modified files:
  - src/index.js (add auth routes)
  - src/models/User.js (add password field)
  - package.json (add dependencies)

New dependencies:
  - jsonwebtoken@^9.0.0
  - bcryptjs@^2.4.3
  - express-validator@^7.0.0

Continue? (y/n): y
```

### 3. Backup Creation
```
🔒 Creating backup...
✅ Backup created: .baco-backups/backup-1634567890

You can restore with: /restore-backup backup-1634567890
```

### 4. Implementation
```
🚀 Implementing JWT Authentication...

Creating new files:
  ✅ src/middleware/auth.js
  ✅ src/routes/auth.js
  ✅ src/utils/jwt.js
  ✅ src/models/RefreshToken.js

Updating existing files:
  ✅ src/index.js - Added auth routes
  ✅ src/models/User.js - Added auth fields
  ✅ package.json - Added dependencies

Installing dependencies:
  📦 jsonwebtoken@9.0.0
  📦 bcryptjs@2.4.3
  📦 express-validator@7.0.0
  ✅ Dependencies installed

Running tests:
  ✅ Existing tests still pass
  ✅ New auth tests pass
```

### 5. Integration Guide
```
✅ JWT Authentication added successfully!

Integration steps:
1. Update your .env file:
   JWT_SECRET=your-secret-key-here
   JWT_EXPIRE=7d
   REFRESH_TOKEN_EXPIRE=30d

2. The following endpoints are now available:
   POST /api/auth/register
   POST /api/auth/login
   POST /api/auth/refresh
   POST /api/auth/logout

3. Protect routes with auth middleware:
   ```javascript
   const { protect } = require('./middleware/auth');
   
   router.get('/protected', protect, (req, res) => {
     // req.user contains authenticated user
   });
   ```

4. Frontend integration example:
   ```javascript
   // Store token after login
   localStorage.setItem('token', response.data.token);
   
   // Add to API requests
   axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

Documentation generated at: docs/features/auth-jwt.md
```

## Smart Merging

### Import Management
When adding imports to existing files:
```javascript
// Before
import express from 'express';
import cors from 'cors';

// After (intelligently merged)
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { errorHandler } from './middleware/error';
```

### Route Integration
When adding routes to existing Express app:
```javascript
// Detects existing route structure
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
// Adds new route in appropriate location
app.use('/api/auth', authRouter);
```

### Model Extensions
When modifying existing models:
```javascript
// Preserves existing schema while adding new fields
const UserSchema = new Schema({
  // Existing fields preserved
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // New fields added
  password: { type: String, required: true, select: false },
  passwordResetToken: String,
  passwordResetExpire: Date
});
```

## Conflict Resolution

When conflicts are detected:
```
⚠️ Conflict in src/models/User.js

Existing code has custom validation.
New feature wants to add password field.

Options:
1. Keep existing validation, add password field
2. Replace with new validation  
3. Merge both validations
4. Skip this file

Choice (1-4): 3

✅ Merged successfully - both validations preserved
```

## Dependency Management

### Version Conflict Resolution
```
⚠️ Dependency conflict detected

Your project uses: express@4.17.1
Feature requires: express@^4.18.0

Options:
1. Update to 4.18.0 (recommended - minor update)
2. Keep 4.17.1 (may lack required features)
3. Review changes first

Choice (1-3): 1
```

### Breaking Changes Detection
```
⚠️ Breaking change detected

mongoose 5.x → 6.x includes breaking changes:
- Changed connection options
- Removed deprecated methods
- New query syntax

Would you like to:
1. Update with migration assistance
2. Skip mongoose update
3. View detailed changes

Choice (1-3): 1
```

## Feature Variations

Some features have variants:
```
/add-feature auth

Which authentication type?
1. JWT (Stateless tokens)
2. Session (Server sessions)
3. OAuth2 (Social login)
4. Basic (Username/password)

Choice (1-4): 1
```

## Rollback Support

If something goes wrong:
```
❌ Error during feature addition

Error: Test failures detected after modification

Options:
1. Automatically rollback to backup
2. Keep changes and fix manually
3. Partially rollback specific files

Choice (1-3): 1

🔄 Rolling back changes...
✅ Restored from backup: backup-1634567890
```

## Best Practices

1. **Always Review Changes**: Check the plan before confirming
2. **Run Tests**: Ensure existing tests still pass
3. **Incremental Updates**: Add one feature at a time
4. **Version Control**: Commit before adding features
5. **Read Documentation**: Check generated docs for usage

## Common Workflows

### Adding Auth to Existing API
```bash
/add-feature auth-jwt
# Adds complete JWT setup
# Updates existing user model
# Integrates with current routes
```

### Adding Admin Dashboard
```bash
/add-feature ui-dashboard
# Analyzes current frontend
# Adds admin routes
# Integrates with existing auth
```

### Database Migration
```bash
/add-feature db-migrations
# Sets up migration system
# Creates initial migration from current schema
# Adds migration commands
```

Remember: `/add-feature` is designed to enhance without breaking. Always review changes and test thoroughly!