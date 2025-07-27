# Docker Command

## Overview
The Docker command provides intelligent Docker configuration generation for your projects, including Dockerfiles, docker-compose.yml, and optimization recommendations.

## Usage
```
/docker <subcommand> [options]
```

## Subcommands

### `generate`
Generate a Dockerfile for the current project.

```
/docker generate [--framework <name>] [--optimize] [--security]
```

Options:
- `--framework`: Override detected framework
- `--optimize`: Apply size and performance optimizations
- `--security`: Add enhanced security features

### `compose`
Generate a docker-compose.yml file for the project.

```
/docker compose [--services <list>] [--dev|--prod]
```

Options:
- `--services`: Comma-separated list of services (frontend,backend,db,cache)
- `--dev`: Development configuration with hot reload
- `--prod`: Production configuration with optimizations

### `optimize`
Analyze and optimize existing Docker configuration.

```
/docker optimize [--target <size|security|performance>]
```

### `security`
Add security best practices to Docker configuration.

```
/docker security [--scan] [--non-root] [--secrets]
```

### `validate`
Validate Docker configuration files.

```
/docker validate
```

## ACTIVATION

When the user runs `/docker [subcommand]`:

1. **Detect Project Type**
   - Check package.json, requirements.txt, go.mod, etc.
   - Identify framework (Next.js, Express, FastAPI, etc.)
   - Determine language and runtime

2. **Generate Configuration**
   - Load appropriate template from `.claude/templates/docker/`
   - Apply framework-specific optimizations
   - Include security best practices

3. **For `generate` subcommand**:
   ```typescript
   // 1. Analyze project
   const projectInfo = await analyzeProject();
   
   // 2. Select template
   const template = selectDockerTemplate(projectInfo.framework);
   
   // 3. Customize template
   const dockerfile = customizeTemplate(template, {
     baseImage: selectBaseImage(projectInfo),
     buildCommands: projectInfo.buildCommands,
     port: projectInfo.port || getDefaultPort(projectInfo.framework),
     healthcheck: generateHealthcheck(projectInfo),
     security: options.security ? SECURITY_FEATURES : {}
   });
   
   // 4. Write Dockerfile
   await writeFile('Dockerfile', dockerfile);
   
   // 5. Generate .dockerignore
   await generateDockerIgnore(projectInfo);
   ```

4. **For `compose` subcommand**:
   ```typescript
   // 1. Determine services
   const services = options.services || detectServices();
   
   // 2. Generate service configurations
   const composeConfig = {
     version: '3.8',
     services: {},
     networks: { app: { driver: 'bridge' } },
     volumes: {}
   };
   
   // 3. Add each service
   for (const service of services) {
     composeConfig.services[service] = generateServiceConfig(service, {
       mode: options.dev ? 'development' : 'production'
     });
   }
   
   // 4. Write docker-compose.yml
   await writeYaml('docker-compose.yml', composeConfig);
   ```

5. **Multi-Stage Build Pattern**:
   ```dockerfile
   # Dependencies
   FROM node:18-alpine AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   # Build
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   # Production
   FROM node:18-alpine AS runner
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=deps /app/node_modules ./node_modules
   EXPOSE 3000
   CMD ["node", "dist/index.js"]
   ```

6. **Security Features**:
   - Non-root user execution
   - Minimal base images (Alpine, distroless)
   - No unnecessary packages
   - Proper secret handling
   - Health checks

7. **Optimization Strategies**:
   - Layer caching optimization
   - Multi-stage builds
   - Minimal final image size
   - Efficient COPY operations
   - Build argument usage

## Examples

### Basic Dockerfile Generation
```
/docker generate
```
Output:
```
🐳 Analyzing project...
✓ Detected: Next.js 13.5.6
✓ Framework: React with SSR
✓ Package manager: npm

📝 Generating optimized Dockerfile...
✓ Created Dockerfile
✓ Created .dockerignore

📊 Optimization Summary:
- Multi-stage build (3 stages)
- Final image size: ~150MB
- Non-root user enabled
- Health check configured

🚀 Next steps:
1. Build: docker build -t myapp .
2. Run: docker run -p 3000:3000 myapp
3. Scan: docker scan myapp
```

### Full Stack Compose Generation
```
/docker compose --services frontend,backend,postgres,redis
```
Output:
```
🐳 Generating docker-compose.yml...
✓ Frontend service (React)
✓ Backend service (Express)
✓ PostgreSQL database
✓ Redis cache

📝 Created docker-compose.yml
📝 Created .env.example

🚀 Quick start:
1. Copy .env.example to .env
2. Run: docker-compose up -d
3. Access: http://localhost:3000
```

### Docker Optimization
```
/docker optimize --target size
```
Output:
```
🔍 Analyzing current Dockerfile...

📊 Current Analysis:
- Image size: 850MB
- Layers: 18
- Security score: B

🔧 Applying optimizations...
✓ Switched to Alpine base image
✓ Combined RUN commands
✓ Added .dockerignore entries
✓ Implemented multi-stage build

📈 Results:
- New size: 125MB (-85%)
- Layers: 8 (-55%)
- Security score: A

✓ Dockerfile updated
```

## Integration with BACO Workflow

1. **Automatic Generation**
   After project creation:
   ```typescript
   if (project.includeDocker) {
     await executeCommand('/docker generate --optimize');
     await executeCommand('/docker compose --prod');
   }
   ```

2. **CI/CD Integration**
   Generate GitHub Actions workflow:
   ```yaml
   - name: Build and push Docker image
     run: |
       docker build -t ${{ github.repository }}:${{ github.sha }} .
       docker push ${{ github.repository }}:${{ github.sha }}
   ```

3. **Development Workflow**
   ```bash
   # Generate development compose file
   /docker compose --dev
   
   # Start services
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

## Best Practices

1. **Always use multi-stage builds** for compiled languages
2. **Run as non-root user** in production
3. **Use specific version tags** for base images
4. **Include health checks** for all services
5. **Optimize layer caching** by ordering Dockerfile commands correctly
6. **Use .dockerignore** to exclude unnecessary files
7. **Scan images** for vulnerabilities before deployment

## Error Handling

Common issues and solutions:
- **Port already in use**: Check for running containers
- **Build failures**: Ensure all dependencies are available
- **Permission errors**: Check file ownership and USER directive
- **Large image size**: Review multi-stage build implementation