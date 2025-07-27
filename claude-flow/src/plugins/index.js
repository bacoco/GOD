export { PluginSystem } from './plugin-system.js';

export const createPluginAPI = (claudeFlow) => {
  return {
    // Core Claude-Flow features
    agents: claudeFlow.agents,
    tasks: claudeFlow.tasks,
    memory: claudeFlow.memory,
    mcp: claudeFlow.mcp,
    swarm: claudeFlow.swarm,
    config: claudeFlow.config,
    logger: claudeFlow.logger,
    
    // Enhanced APIs for plugins
    createAgent: async (type, options) => {
      return await claudeFlow.agents.spawn(type, options);
    },
    
    createTask: async (type, description, options) => {
      return await claudeFlow.tasks.create(type, description, options);
    },
    
    orchestrate: async (workflow) => {
      return await claudeFlow.orchestrator.execute(workflow);
    },
    
    getMemory: async (key) => {
      return await claudeFlow.memory.get(key);
    },
    
    setMemory: async (key, value) => {
      return await claudeFlow.memory.set(key, value);
    },
    
    // Event system
    on: claudeFlow.on.bind(claudeFlow),
    off: claudeFlow.off.bind(claudeFlow),
    emit: claudeFlow.emit.bind(claudeFlow),
    
    // Utilities
    utils: {
      generateId: () => crypto.randomUUID(),
      formatDate: (date) => new Date(date).toISOString(),
      sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
    }
  };
};

export default { PluginSystem, createPluginAPI };