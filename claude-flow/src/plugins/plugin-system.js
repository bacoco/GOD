import { EventEmitter } from 'events';
import { join, dirname } from 'path';
import { pathToFileURL } from 'url';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

export class PluginSystem extends EventEmitter {
  constructor(claudeFlow) {
    super();
    this.claudeFlow = claudeFlow;
    this.plugins = new Map();
    this.hooks = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    this.emit('system:initializing');
    
    // Register core hooks
    this.registerHook('beforeInit', 'async');
    this.registerHook('afterInit', 'async');
    this.registerHook('beforeCommand', 'async');
    this.registerHook('afterCommand', 'async');
    this.registerHook('beforeAgentSpawn', 'async');
    this.registerHook('afterAgentSpawn', 'async');
    this.registerHook('beforeTaskCreate', 'async');
    this.registerHook('afterTaskCreate', 'async');
    
    this.initialized = true;
    this.emit('system:initialized');
  }

  registerHook(name, type = 'sync') {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, {
        type,
        handlers: []
      });
    }
  }

  async loadPlugin(pluginPath) {
    try {
      const absolutePath = join(process.cwd(), pluginPath);
      
      // Check if plugin path exists
      if (!existsSync(absolutePath)) {
        throw new Error(`Plugin not found: ${absolutePath}`);
      }

      // Read package.json if it exists
      const packageJsonPath = join(absolutePath, 'package.json');
      let pluginMeta = {};
      
      if (existsSync(packageJsonPath)) {
        const packageContent = await readFile(packageJsonPath, 'utf-8');
        pluginMeta = JSON.parse(packageContent);
      }

      // Import the plugin module
      const pluginUrl = pathToFileURL(join(absolutePath, 'index.js')).href;
      const pluginModule = await import(pluginUrl);
      
      // Get the plugin factory function
      const createPlugin = pluginModule.default || pluginModule.createPlugin;
      
      if (typeof createPlugin !== 'function') {
        throw new Error(`Plugin ${pluginPath} must export a default function or createPlugin`);
      }

      // Create plugin instance
      const plugin = await createPlugin(this.claudeFlow, {
        hooks: this.createHooksAPI(),
        emit: this.emit.bind(this),
        meta: pluginMeta
      });

      // Store plugin
      const pluginId = pluginMeta.name || pluginPath;
      this.plugins.set(pluginId, {
        id: pluginId,
        path: absolutePath,
        instance: plugin,
        meta: pluginMeta
      });

      this.emit('plugin:loaded', { pluginId, meta: pluginMeta });
      
      return plugin;
    } catch (error) {
      this.emit('plugin:error', { pluginPath, error });
      throw new Error(`Failed to load plugin ${pluginPath}: ${error.message}`);
    }
  }

  createHooksAPI() {
    return {
      on: (hookName, handler) => {
        const hook = this.hooks.get(hookName);
        if (!hook) {
          throw new Error(`Unknown hook: ${hookName}`);
        }
        hook.handlers.push(handler);
      },
      
      off: (hookName, handler) => {
        const hook = this.hooks.get(hookName);
        if (hook) {
          const index = hook.handlers.indexOf(handler);
          if (index > -1) {
            hook.handlers.splice(index, 1);
          }
        }
      }
    };
  }

  async triggerHook(hookName, ...args) {
    const hook = this.hooks.get(hookName);
    if (!hook || hook.handlers.length === 0) {
      return;
    }

    if (hook.type === 'async') {
      for (const handler of hook.handlers) {
        await handler(...args);
      }
    } else {
      hook.handlers.forEach(handler => handler(...args));
    }
  }

  getPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    return plugin ? plugin.instance : null;
  }

  getAllPlugins() {
    return Array.from(this.plugins.values());
  }

  async unloadPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      return false;
    }

    // Call plugin cleanup if available
    if (plugin.instance && typeof plugin.instance.cleanup === 'function') {
      await plugin.instance.cleanup();
    }

    this.plugins.delete(pluginId);
    this.emit('plugin:unloaded', { pluginId });
    
    return true;
  }

  async shutdown() {
    // Unload all plugins
    for (const [pluginId] of this.plugins) {
      await this.unloadPlugin(pluginId);
    }
    
    this.removeAllListeners();
    this.initialized = false;
  }
}

export default PluginSystem;