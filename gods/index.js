import { PantheonCore } from './lib/pantheon-core.js';
import { createPluginAPI } from './lib/plugin-api.js';

/**
 * Pantheon God Agent System Plugin for Claude-Flow
 * @param {Object} claudeFlow - The Claude-Flow instance
 * @param {Object} options - Plugin options
 * @returns {Object} Plugin instance
 */
export default async function createPantheonPlugin(claudeFlow, options) {
  const { hooks, emit, meta } = options;
  
  // Create the Pantheon core instance
  const pantheon = new PantheonCore(claudeFlow, {
    hooks,
    emit,
    meta
  });
  
  // Initialize Pantheon
  await pantheon.initialize();
  
  // Register hooks
  hooks.on('beforeInit', async () => {
    emit('pantheon:initializing', { version: meta.version });
  });
  
  hooks.on('afterInit', async () => {
    emit('pantheon:ready', { gods: pantheon.getAvailableGods() });
  });
  
  hooks.on('beforeAgentSpawn', async ({ type, options }) => {
    // Check if this is a god agent request
    if (pantheon.isGodAgent(type)) {
      emit('pantheon:god-spawning', { god: type, options });
    }
  });
  
  hooks.on('afterAgentSpawn', async ({ agent, type }) => {
    if (pantheon.isGodAgent(type)) {
      emit('pantheon:god-spawned', { god: type, agentId: agent.id });
    }
  });
  
  // Create plugin API
  const api = createPluginAPI(pantheon);
  
  // Return plugin interface
  return {
    name: 'pantheon',
    version: meta.version || '1.0.0',
    
    // Core methods
    async summon(godName, options = {}) {
      return await pantheon.summonGod(godName, options);
    },
    
    async orchestrate(workflow) {
      return await pantheon.orchestrate(workflow);
    },
    
    async communicate(fromGod, toGod, message) {
      return await pantheon.getDivineMessenger().send(fromGod, toGod, message);
    },
    
    // Management methods
    getGods() {
      return pantheon.getActiveGods();
    },
    
    getGodStatus(godName) {
      return pantheon.getGodStatus(godName);
    },
    
    // Workflow methods
    async executeWorkflow(workflowName, params) {
      return await pantheon.executeWorkflow(workflowName, params);
    },
    
    // Cleanup
    async cleanup() {
      await pantheon.shutdown();
    },
    
    // Expose full API
    api,
    pantheon
  };
}

// Also export named components for direct access
export { PantheonCore } from './lib/pantheon-core.js';
export { GodFactory } from './lib/god-factory.js';
export { DivineMessenger } from './lib/divine-messenger.js';
export { BaseGod } from './lib/base-god.js';