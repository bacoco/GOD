import { EventEmitter } from 'events';

/**
 * ToolAccessManager - Manages dynamic tool access for gods
 * Handles temporary and permanent tool grants with audit trail
 */
export class ToolAccessManager extends EventEmitter {
  constructor(vulcan) {
    super();
    this.vulcan = vulcan;
    this.pantheon = vulcan.pantheon;
    
    // Track tool access grants
    this.permanentGrants = new Map(); // god -> Set of tools
    this.temporaryGrants = new Map(); // god -> Map of tool -> expiration
    
    // Audit trail
    this.accessLog = [];
    
    // Access policies
    this.policies = {
      maxTemporaryDuration: 30 * 24 * 60 * 60 * 1000, // 30 days max
      defaultDuration: 7 * 24 * 60 * 60 * 1000, // 7 days default
      requiresApproval: ['ALL'], // Tools that need special approval
      restricted: [] // Tools that cannot be granted
    };
    
    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Grant tool access to a god
   */
  async grantToolAccess(godName, tools, options = {}) {
    const {
      duration = '7d',
      permanent = false,
      reason = 'Requested through Vulcan'
    } = options;
    
    // Ensure tools is an array
    const toolList = Array.isArray(tools) ? tools : [tools];
    
    // Get the god instance
    const god = this.pantheon.gods.get(godName);
    if (!god) {
      throw new Error(`God ${godName} not found in pantheon`);
    }
    
    const grants = [];
    
    for (const tool of toolList) {
      // Check if tool is restricted
      if (this.policies.restricted.includes(tool)) {
        this.emit('access:denied', { god: godName, tool, reason: 'Restricted tool' });
        continue;
      }
      
      // Check if tool requires special approval
      if (this.policies.requiresApproval.includes(tool) && !options.approved) {
        this.emit('access:approval-needed', { god: godName, tool });
        continue;
      }
      
      // Grant access
      if (permanent) {
        await this.grantPermanentAccess(god, tool, reason);
      } else {
        await this.grantTemporaryAccess(god, tool, duration, reason);
      }
      
      grants.push({
        tool: typeof tool === 'object' ? tool.name : tool,
        duration: permanent ? 'permanent' : duration,
        grantedAt: new Date().toISOString()
      });
    }
    
    // Log the grant
    this.logAccess({
      type: 'grant',
      god: godName,
      tools: grants,
      reason,
      grantedBy: 'vulcan',
      timestamp: new Date().toISOString()
    });
    
    this.emit('access:granted', { god: godName, grants });
    
    return grants;
  }

  /**
   * Grant permanent tool access
   */
  async grantPermanentAccess(god, tool, reason) {
    // Get or create permanent grants set for this god
    if (!this.permanentGrants.has(god.name)) {
      this.permanentGrants.set(god.name, new Set());
    }
    
    const toolName = typeof tool === 'object' ? tool.name : tool;
    this.permanentGrants.get(god.name).add(toolName);
    
    // Update god's tool assignments
    await this.updateGodTools(god);
    
    this.emit('access:permanent-granted', { 
      god: god.name, 
      tool: toolName, 
      reason 
    });
  }

  /**
   * Grant temporary tool access
   */
  async grantTemporaryAccess(god, tool, duration, reason) {
    // Parse duration
    const durationMs = this.parseDuration(duration);
    const expiresAt = Date.now() + durationMs;
    
    // Get or create temporary grants map for this god
    if (!this.temporaryGrants.has(god.name)) {
      this.temporaryGrants.set(god.name, new Map());
    }
    
    const toolName = typeof tool === 'object' ? tool.name : tool;
    this.temporaryGrants.get(god.name).set(toolName, expiresAt);
    
    // Update god's tool assignments
    await this.updateGodTools(god);
    
    this.emit('access:temporary-granted', { 
      god: god.name, 
      tool: toolName, 
      duration, 
      expiresAt: new Date(expiresAt).toISOString(),
      reason 
    });
  }

  /**
   * Revoke tool access
   */
  async revokeToolAccess(godName, tools, reason = 'Access revoked by Vulcan') {
    const toolList = Array.isArray(tools) ? tools : [tools];
    const god = this.pantheon.gods.get(godName);
    
    if (!god) {
      throw new Error(`God ${godName} not found`);
    }
    
    const revoked = [];
    
    for (const tool of toolList) {
      const toolName = typeof tool === 'object' ? tool.name : tool;
      
      // Remove from permanent grants
      if (this.permanentGrants.has(godName)) {
        this.permanentGrants.get(godName).delete(toolName);
      }
      
      // Remove from temporary grants
      if (this.temporaryGrants.has(godName)) {
        this.temporaryGrants.get(godName).delete(toolName);
      }
      
      revoked.push(toolName);
    }
    
    // Update god's tool assignments
    await this.updateGodTools(god);
    
    // Log the revocation
    this.logAccess({
      type: 'revoke',
      god: godName,
      tools: revoked,
      reason,
      revokedBy: 'vulcan',
      timestamp: new Date().toISOString()
    });
    
    this.emit('access:revoked', { god: godName, tools: revoked, reason });
    
    return revoked;
  }

  /**
   * Check if a god has access to a tool
   */
  hasAccess(godName, tool) {
    const toolName = typeof tool === 'object' ? tool.name : tool;
    
    // Check original tools from pantheon config
    const originalTools = this.pantheon.toolAssignments[godName] || [];
    if (originalTools.includes('ALL') || originalTools.includes(toolName)) {
      return true;
    }
    
    // Check permanent grants
    if (this.permanentGrants.has(godName)) {
      if (this.permanentGrants.get(godName).has(toolName)) {
        return true;
      }
    }
    
    // Check temporary grants
    if (this.temporaryGrants.has(godName)) {
      const expiration = this.temporaryGrants.get(godName).get(toolName);
      if (expiration && expiration > Date.now()) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get all tools a god has access to
   */
  getGodTools(godName) {
    const tools = new Set();
    
    // Add original tools
    const originalTools = this.pantheon.toolAssignments[godName] || [];
    if (originalTools.includes('ALL')) {
      return ['ALL']; // Has access to everything
    }
    
    originalTools.forEach(tool => tools.add(tool));
    
    // Add permanent grants
    if (this.permanentGrants.has(godName)) {
      this.permanentGrants.get(godName).forEach(tool => tools.add(tool));
    }
    
    // Add valid temporary grants
    if (this.temporaryGrants.has(godName)) {
      const now = Date.now();
      this.temporaryGrants.get(godName).forEach((expiration, tool) => {
        if (expiration > now) {
          tools.add(tool);
        }
      });
    }
    
    return Array.from(tools);
  }

  /**
   * Update a god's available tools
   */
  async updateGodTools(god) {
    // Get all tools the god should have access to
    const allTools = this.getGodTools(god.name);
    
    // Update the god's tools property
    god.tools = allTools;
    
    // If the god has ALL tools, set the flag
    god.hasAllTools = allTools.includes('ALL');
    
    this.emit('tools:updated', { 
      god: god.name, 
      tools: allTools,
      permanent: Array.from(this.permanentGrants.get(god.name) || []),
      temporary: Array.from(this.temporaryGrants.get(god.name)?.keys() || [])
    });
  }

  /**
   * Parse duration string to milliseconds
   */
  parseDuration(duration) {
    if (typeof duration === 'number') {
      return duration;
    }
    
    const match = duration.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }
    
    const [, num, unit] = match;
    const value = parseInt(num);
    
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };
    
    return value * units[unit];
  }

  /**
   * Clean up expired temporary grants
   */
  cleanupExpiredGrants() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [godName, grants] of this.temporaryGrants.entries()) {
      const expired = [];
      
      for (const [tool, expiration] of grants.entries()) {
        if (expiration <= now) {
          expired.push(tool);
        }
      }
      
      if (expired.length > 0) {
        // Remove expired tools
        expired.forEach(tool => grants.delete(tool));
        cleaned += expired.length;
        
        // Update god's tools
        const god = this.pantheon.gods.get(godName);
        if (god) {
          this.updateGodTools(god);
        }
        
        // Log expiration
        this.logAccess({
          type: 'expired',
          god: godName,
          tools: expired,
          timestamp: new Date().toISOString()
        });
        
        this.emit('access:expired', { god: godName, tools: expired });
      }
      
      // Clean up empty maps
      if (grants.size === 0) {
        this.temporaryGrants.delete(godName);
      }
    }
    
    if (cleaned > 0) {
      this.emit('cleanup:complete', { expiredGrants: cleaned });
    }
  }

  /**
   * Start cleanup interval
   */
  startCleanupInterval() {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredGrants();
    }, 60 * 60 * 1000);
  }

  /**
   * Log access events
   */
  logAccess(event) {
    this.accessLog.push(event);
    
    // Keep log size manageable (last 1000 entries)
    if (this.accessLog.length > 1000) {
      this.accessLog = this.accessLog.slice(-1000);
    }
    
    this.emit('access:logged', event);
  }

  /**
   * Get access logs
   */
  getAccessLogs(filters = {}) {
    let logs = [...this.accessLog];
    
    // Filter by god
    if (filters.god) {
      logs = logs.filter(log => log.god === filters.god);
    }
    
    // Filter by type
    if (filters.type) {
      logs = logs.filter(log => log.type === filters.type);
    }
    
    // Filter by date range
    if (filters.since) {
      const since = new Date(filters.since).getTime();
      logs = logs.filter(log => new Date(log.timestamp).getTime() >= since);
    }
    
    return logs;
  }

  /**
   * Get access statistics
   */
  getAccessStatistics() {
    const stats = {
      totalGrants: 0,
      permanentGrants: 0,
      temporaryGrants: 0,
      expiredGrants: 0,
      revokedGrants: 0,
      godStats: {}
    };
    
    // Count grants by type
    this.accessLog.forEach(log => {
      if (log.type === 'grant') {
        stats.totalGrants += log.tools.length;
        log.tools.forEach(grant => {
          if (grant.duration === 'permanent') {
            stats.permanentGrants++;
          } else {
            stats.temporaryGrants++;
          }
        });
      } else if (log.type === 'expired') {
        stats.expiredGrants += log.tools.length;
      } else if (log.type === 'revoke') {
        stats.revokedGrants += log.tools.length;
      }
      
      // Per-god statistics
      if (!stats.godStats[log.god]) {
        stats.godStats[log.god] = {
          grants: 0,
          revokes: 0,
          expired: 0
        };
      }
      
      if (log.type === 'grant') {
        stats.godStats[log.god].grants += log.tools.length;
      } else if (log.type === 'revoke') {
        stats.godStats[log.god].revokes += log.tools.length;
      } else if (log.type === 'expired') {
        stats.godStats[log.god].expired += log.tools.length;
      }
    });
    
    return stats;
  }

  /**
   * Shutdown and cleanup
   */
  shutdown() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    this.emit('shutdown');
  }
}