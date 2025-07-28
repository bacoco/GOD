# Pantheon Troubleshooting Guide

## Common Issues and Solutions

### Installation Issues

#### "Cannot find module" errors
```bash
# Solution 1: Clean install
rm -rf node_modules package-lock.json
npm install

# Solution 2: Check Node version
node --version  # Should be 18.0.0 or higher
```

#### "Permission denied" when running commands
```bash
# Make scripts executable
chmod +x claude-pantheon.js
chmod +x launch.js

# Fix directory permissions
chmod -R 755 gods/
```

### /gods Commands Not Working

#### "Command not found" or no response
**Problem**: The command format might be incorrect.

**Solution**: Always use quotes around the full command:
```bash
# ✅ Correct
node claude-pantheon.js "/gods init 'my project idea'"

# ❌ Wrong - missing quotes
node claude-pantheon.js /gods init my project idea

# ❌ Wrong - incorrect quotes
node claude-pantheon.js /gods init "my project idea"
```

#### "No projects found" when running /gods resume
**Problem**: No saved sessions exist.

**Solution**: 
1. First create a project with `/gods init`
2. Check if state directory exists: `ls gods/.pantheon-state/`
3. If missing, create it: `mkdir -p gods/.pantheon-state`

#### Conversation gets stuck or hangs
**Problem**: The readline interface might be waiting for input.

**Solution**:
1. Press `Ctrl+C` to exit
2. Run `/gods resume` to continue where you left off
3. If still stuck, check for Node process: `ps aux | grep node`

### State and Session Issues

#### Lost project progress
**Problem**: Session files might be corrupted or deleted.

**Solution**:
```bash
# Check for session files
ls -la gods/.pantheon-state/

# Look for backup or recent session
cat gods/.pantheon-state/current-session.json

# If corrupted, you may need to start fresh
rm gods/.pantheon-state/current-session.json
```

#### Multiple projects mixed up
**Problem**: Current session pointer is incorrect.

**Solution**:
```bash
# List all projects
node claude-pantheon.js "/gods projects"

# Resume specific project by name
node claude-pantheon.js "/gods resume 'project-name'"
```

### Generation Issues

#### Project files not created
**Problem**: Permissions or path issues.

**Solution**:
1. Check current directory permissions
2. Ensure you have write access
3. Try creating in a different directory
4. Check disk space: `df -h`

#### Generated code has errors
**Problem**: Template issues or conversation context problems.

**Solution**:
1. The generated code is a starting point
2. Review and fix any syntax errors
3. Install missing dependencies: `npm install`
4. Report persistent issues

### Claude-Flow Integration Issues

#### "PantheonCore is not defined"
**Problem**: Import or initialization issue.

**Solution**:
```javascript
// Ensure proper imports
import { PantheonCore } from './gods/lib/pantheon-core.js';

// Check file exists
ls gods/lib/pantheon-core.js
```

#### "Cannot summon god"
**Problem**: God factory or configuration issue.

**Solution**:
1. Check god exists in factory
2. Verify god markdown files: `ls gods/lib/gods/`
3. Check initialization logs with DEBUG=1

### Performance Issues

#### Slow response times
**Problem**: Multiple factors possible.

**Solution**:
1. Check system resources: `top` or `htop`
2. Clear old sessions: `find gods/.pantheon-state -mtime +30 -delete`
3. Restart with fresh state
4. Check network connectivity for API calls

#### High memory usage
**Problem**: Session accumulation or memory leaks.

**Solution**:
1. Limit active sessions
2. Restart the process
3. Monitor with: `node --max-old-space-size=2048 claude-pantheon.js`

### Debug Mode

Enable detailed debugging:
```bash
# Set debug environment variable
DEBUG=1 node claude-pantheon.js "/gods init 'test'"

# Or for specific debugging
DEBUG=pantheon:* node claude-pantheon.js "/gods help"
```

### Error Messages

#### "SyntaxError: Identifier already declared"
**Problem**: Variable naming conflict in generated code.

**Solution**: Fixed in latest version. Update your code.

#### "TypeError: Cannot read property of undefined"
**Problem**: Missing initialization or null check.

**Solution**:
1. Ensure all imports are correct
2. Check that pantheon is initialized
3. Verify command format is correct

### Getting Help

If issues persist:

1. **Check logs**: Run with `DEBUG=1` for detailed output
2. **Verify setup**: Run `npm run test:commands`
3. **Clean state**: Remove `.pantheon-state` and try fresh
4. **Report issue**: Include:
   - Exact command used
   - Error message
   - Node version
   - OS information

### Quick Fixes Checklist

- [ ] Node.js version 18+?
- [ ] Dependencies installed? (`npm install`)
- [ ] Correct command format with quotes?
- [ ] State directory exists and writable?
- [ ] No conflicting Node processes?
- [ ] Sufficient disk space?
- [ ] Correct working directory?

---

*If you encounter issues not covered here, please report them with full error details.*