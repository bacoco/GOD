/**
 * Create a comprehensive API for the Pantheon plugin
 * @param {PantheonCore} pantheon - The Pantheon instance
 * @returns {Object} Plugin API
 */
export function createPluginAPI(pantheon) {
  return {
    // God management
    gods: {
      async summon(godName, options) {
        return await pantheon.summonGod(godName, options);
      },
      
      list() {
        return pantheon.getAvailableGods();
      },
      
      active() {
        return pantheon.getActiveGods();
      },
      
      status(godName) {
        return pantheon.getGodStatus(godName);
      },
      
      async dismiss(godName) {
        const god = pantheon.gods.get(godName);
        if (god) {
          await god.dismiss();
          pantheon.gods.delete(godName);
        }
      }
    },
    
    // Communication
    messenger: {
      async send(from, to, message, options) {
        return await pantheon.getDivineMessenger().send(from, to, message, options);
      },
      
      async broadcast(from, message, options) {
        return await pantheon.getDivineMessenger().broadcast(from, message, options);
      },
      
      async multicast(from, toGods, message, options) {
        return await pantheon.getDivineMessenger().multicast(from, toGods, message, options);
      },
      
      history(filter) {
        return pantheon.getDivineMessenger().getMessageHistory(filter);
      },
      
      status() {
        return pantheon.getDivineMessenger().getQueueStatus();
      }
    },
    
    // Orchestration
    orchestration: {
      async execute(workflow) {
        return await pantheon.orchestrate(workflow);
      },
      
      async workflow(name, params) {
        return await pantheon.executeWorkflow(name, params);
      },
      
      active() {
        return Array.from(pantheon.activeWorkflows.values());
      }
    },
    
    // Utility functions
    utils: {
      isGodAgent(type) {
        return pantheon.isGodAgent(type);
      },
      
      getToolAssignments(godName) {
        return pantheon.toolAssignments[godName] || [];
      },
      
      async createCollaboration(gods, task) {
        const zeus = await pantheon.summonGod('zeus');
        return await zeus.orchestrateCollaboration(gods, task);
      }
    },
    
    // Events
    events: {
      on(event, handler) {
        pantheon.on(event, handler);
      },
      
      off(event, handler) {
        pantheon.off(event, handler);
      },
      
      once(event, handler) {
        pantheon.once(event, handler);
      }
    },
    
    // Direct pantheon access
    pantheon
  };
}

export default createPluginAPI;