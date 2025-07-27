# /preview Command - Live Development Preview

## ACTIVATION

When the user types `/preview [options]`, start a live development preview of the project.

## Overview

The `/preview` command launches development servers with hot reload, opens browser previews, and provides mobile device access via QR codes.

## Command Options

### Basic Usage
```
/preview
```
Starts dev server and opens default browser

### With Options
```
/preview mobile       # Include QR code for mobile
/preview no-open     # Don't open browser automatically  
/preview port=4000   # Use specific port
/preview browser=firefox  # Open in specific browser
```

## Execution Flow

### 1. Framework Detection
```
🔍 Detecting project framework...
✅ Found: Next.js project
```

### 2. Dev Server Startup
```
🚀 Starting development server...
📦 Checking dependencies...
✅ All dependencies installed

Starting Next.js dev server...
Port: 3000 (available)

⚡ Fast Refresh enabled
🔥 Hot reload active
✅ Server ready at http://localhost:3000
```

### 3. Browser Launch (if enabled)
```
🌐 Opening http://localhost:3000 in default browser...
✅ Browser launched successfully
```

### 4. Mobile Preview (if requested)
```
📱 Mobile Preview Setup
════════════════════════

Scan this QR code with your phone:

█████████████████████████
█████████████████████████
███ ▄▄▄▄▄ █▀ █▄█ ▄▄▄▄▄ ███
███ █   █ █▀▀▄ █ █   █ ███
███ █▄▄▄█ █▄▀ ▀▄ █▄▄▄█ ███
███▄▄▄▄▄▄▄█▄▀▄█▄▄▄▄▄▄▄███
███  ▄▄ ▄▄▄  ▀▄  ▄▀▄▀████
█████████████████████████
█████████████████████████

Or enter URL manually:
• http://192.168.1.100:3000
• http://10.0.0.5:3000

📌 Make sure your device is on the same network!
```

### 5. Live Monitoring
```
🔄 Watching for changes...

[3:14:22 PM] File change detected: src/App.tsx
[3:14:22 PM] Recompiling...
[3:14:23 PM] ✅ Compiled successfully in 287ms

[3:15:45 PM] File change detected: styles/globals.css
[3:15:45 PM] 🎨 CSS hot updated

Press Ctrl+C to stop the server
```

## Framework-Specific Features

### Next.js
- Fast Refresh for React components
- API route hot reloading
- Static file serving
- TypeScript support

### React (Create React App)
- Hot module replacement
- Error overlay
- ESLint integration
- Progressive web app features

### Vue/Vite
- Lightning fast HMR
- TypeScript/JSX support
- CSS pre-processor support
- Optimized builds

### Express/Node.js
- Nodemon for auto-restart
- Debug mode support
- Environment variable loading
- API testing endpoints

## Advanced Features

### Multiple Server Support
For projects with separate frontend/backend:
```
/preview full

Starting multiple servers...
🎨 Frontend: http://localhost:3000 (React)
🔧 Backend: http://localhost:5000 (Express)
📊 Database: mongodb://localhost:27017
```

### Environment Selection
```
/preview env=staging

Loading environment: staging
API_URL=https://staging-api.example.com
✅ Environment variables loaded
```

### Debug Mode
```
/preview debug

Starting in debug mode...
Node debugger listening on ws://127.0.0.1:9229
Chrome DevTools URL: devtools://devtools/bundled/inspector.html?ws=127.0.0.1:9229
```

## Error Handling

### Port Conflicts
```
⚠️ Port 3000 is already in use

Would you like to:
1. Use port 3001 instead
2. Kill process on port 3000
3. Choose different port

Choice (1-3):
```

### Missing Dependencies
```
❌ Missing required dependencies

The following packages are not installed:
- nodemon (dev server)
- concurrently (multiple servers)

Install now? (y/n):
```

### Server Crashes
```
💥 Server crashed!

Error: Cannot find module './components/Header'

Possible solutions:
1. Check import paths
2. Restart server
3. Clear cache

Attempting auto-restart in 5 seconds...
```

## Integration with Workflows

### Post-Implementation Preview
After `/baco execute` completes:
```
Implementation complete! Start preview? (y/n): y
```

### During Development
While working on features:
```
/preview watch

👀 Preview mode active
- Auto-refresh on save
- Error notifications
- Performance monitoring
```

## Tips and Best Practices

1. **Network Access**: Ensure firewall allows local network connections for mobile preview
2. **Performance**: Use production build preview (`/preview prod`) for performance testing
3. **Multiple Devices**: Test on various screen sizes and devices
4. **Browser DevTools**: Use for debugging and performance profiling
5. **Hot Reload Issues**: Clear cache or restart if hot reload stops working

## Common Workflows

### Development Cycle
```bash
/preview mobile          # Start with mobile preview
# Make changes in editor
# See instant updates
# Test on phone via QR
# Iterate quickly
```

### Demo Preparation
```bash
/preview port=8080 no-open  # Specific port, no auto-open
# Set up demo environment
# Share URL with stakeholders
```

### Full Stack Development
```bash
/preview full debug      # All servers with debugging
# Frontend on :3000
# Backend on :5000
# Debug both simultaneously
```

Remember: Live preview accelerates development with instant feedback and multi-device testing!