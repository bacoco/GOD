# Pantheon Deployment Guide

## Overview

This guide covers deploying Pantheon with the conversational /gods interface for various environments.

## Local Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm or yarn
- Git
- Claude API key (for Claude-Flow integration)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pantheon.git
   cd pantheon
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "CLAUDE_API_KEY=your_api_key_here" > .env
   ```

4. **Verify installation**
   ```bash
   # Test the /gods commands
   node claude-pantheon.js "/gods help"
   ```

## Directory Structure Required

Ensure these directories exist:
```bash
pantheon/
├── gods/
│   ├── lib/
│   │   ├── commands/       # Command implementations
│   │   └── .pantheon-state/  # Session storage
│   └── resources/
├── claude-flow/           # Claude-Flow dependency
└── node_modules/         # Dependencies
```

## Command Line Usage

### Within Claude Code CLI

The primary usage is through Claude Code:

```bash
# All commands use this format
node claude-pantheon.js "/gods [command] '[arguments]'"
```

### Standalone Usage

For development/testing outside Claude Code:

```bash
# Make executable
chmod +x claude-pantheon.js

# Run directly
./claude-pantheon.js "/gods init 'project idea'"
```

## Configuration

### Session Storage

Conversation states are stored in:
```
gods/.pantheon-state/
├── session-[id].json     # Individual sessions
└── current-session.json  # Active session
```

### Project Generation

Generated projects are created in the current working directory:
```
./project-name/
├── src/
├── tests/
├── package.json
├── README.md
└── .pantheon.json  # Project metadata
```

## Production Deployment

### As a CLI Tool

1. **Package for distribution**
   ```bash
   npm pack
   ```

2. **Install globally**
   ```bash
   npm install -g pantheon-god-agent-system-1.0.0.tgz
   ```

3. **Create wrapper script**
   ```bash
   #!/usr/bin/env node
   require('pantheon-god-agent-system/claude-pantheon.js');
   ```

### As a Service

For running Pantheon as a service:

1. **Create systemd service** (Linux)
   ```ini
   [Unit]
   Description=Pantheon God Agent System
   After=network.target

   [Service]
   Type=simple
   User=pantheon
   WorkingDirectory=/opt/pantheon
   ExecStart=/usr/bin/node /opt/pantheon/launch.js
   Restart=on-failure

   [Install]
   WantedBy=multi-user.target
   ```

2. **Docker deployment**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY . .
   RUN npm install --production
   EXPOSE 3000
   CMD ["node", "launch.js"]
   ```

## Environment Variables

```bash
# Required
CLAUDE_API_KEY=your_claude_api_key

# Optional
PANTHEON_MODE=production
PANTHEON_STATE_DIR=/var/lib/pantheon/state
PANTHEON_LOG_LEVEL=info
ENABLE_METACOGNITION=true
```

## Security Considerations

1. **API Key Protection**
   - Never commit `.env` files
   - Use environment variables in production
   - Rotate keys regularly

2. **Session Data**
   - Sessions contain conversation history
   - Implement cleanup for old sessions
   - Consider encryption for sensitive projects

3. **Generated Code**
   - Review generated code before deployment
   - Scan for security vulnerabilities
   - Don't auto-deploy without review

## Monitoring

### Health Check

```javascript
// Add to your monitoring
const checkPantheon = async () => {
  try {
    const result = await exec('node claude-pantheon.js "/gods help"');
    return result.includes('Pantheon - Where Gods Build Software');
  } catch (error) {
    return false;
  }
};
```

### Logging

Enable detailed logging:
```bash
DEBUG=pantheon:* node claude-pantheon.js "/gods init 'test'"
```

## Troubleshooting

### Common Issues

1. **"Cannot find module"**
   ```bash
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **"No Claude API key"**
   ```bash
   # Set environment variable
   export CLAUDE_API_KEY=your_key_here
   ```

3. **"Permission denied"**
   ```bash
   # Fix permissions
   chmod -R 755 gods/
   mkdir -p gods/.pantheon-state
   ```

### Debug Mode

Run with debugging:
```bash
DEBUG=1 node claude-pantheon.js "/gods init 'test project'"
```

## Performance Optimization

1. **Session Cleanup**
   ```bash
   # Clean old sessions (older than 30 days)
   find gods/.pantheon-state -name "session-*.json" -mtime +30 -delete
   ```

2. **Memory Management**
   - Limit concurrent sessions
   - Implement session timeout
   - Use streaming for large responses

3. **Caching**
   - Cache god configurations
   - Reuse conversation interface instances
   - Pool readline interfaces

## Backup and Recovery

### Backup Sessions
```bash
# Backup all sessions
tar -czf pantheon-backup-$(date +%Y%m%d).tar.gz gods/.pantheon-state/
```

### Restore Sessions
```bash
# Restore from backup
tar -xzf pantheon-backup-20240101.tar.gz
```

## Updates and Maintenance

### Update Procedure
1. Backup current state
2. Pull latest changes
3. Run `npm install`
4. Test with `/gods help`
5. Verify existing projects work

### Version Management
- Tag releases properly
- Maintain changelog
- Test migrations between versions

## Support

For issues:
1. Check logs in DEBUG mode
2. Verify all dependencies installed
3. Ensure proper permissions
4. Consult TROUBLESHOOTING.md

---

*Deployment guide v1.0 - Pantheon God Agent System*