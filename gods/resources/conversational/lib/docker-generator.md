# Docker Generator for Pantheon

Automatically generates optimized Docker configurations for any project type.

## Overview

The Docker generator creates:
- Multi-stage Dockerfiles
- docker-compose.yml for production
- docker-compose.dev.yml for development
- .dockerignore files
- Kubernetes manifests (optional)

## Detection Strategy

### 1. Framework Detection
```yaml
Node.js: package.json present
Python: requirements.txt or pyproject.toml
Go: go.mod present
Rust: Cargo.toml present
Ruby: Gemfile present
```

### 2. Optimization Patterns
- Multi-stage builds for smaller images
- Layer caching optimization
- Security best practices
- Development vs production configs

## Generated Configurations

### Node.js/Next.js Dockerfile
```dockerfile
# Dependencies stage
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=${DB_NAME}
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### docker-compose.dev.yml
```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    command: npm run dev
```

## Integration with /gods

### During `/gods execute`:
1. Check workflow.docker_enabled
2. Detect project framework
3. Generate appropriate Dockerfile
4. Create docker-compose files if requested
5. Add .dockerignore

### Environment Variables
Automatically detects and includes:
- Database connections
- API keys (as placeholders)
- Port configurations
- Environment-specific settings

## Best Practices

1. **Security**
   - Non-root user
   - Minimal base images
   - No secrets in images

2. **Performance**
   - Multi-stage builds
   - Layer caching
   - Optimized COPY order

3. **Development**
   - Hot reload support
   - Volume mounting
   - Debug configurations

The Docker generator ensures projects are container-ready from day one.