#!/usr/bin/env node

/**
 * Pantheon MCP Server
 * Model Context Protocol server for the Pantheon divine orchestration system
 */

import { PantheonCore } from './gods/lib/pantheon-core.js';
import { createMCPServer } from './gods/lib/mcp-adapter.js';
import { ensureClaudeFlow } from './gods/lib/ensure-claude-flow.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

// Banner
console.error(`
🏛️ Pantheon MCP Server
Divine AI Orchestration System
Initializing...
`);

async function main() {
  try {
    // Ensure Claude-Flow is available
    console.error('Checking Claude-Flow installation...');
    ensureClaudeFlow();
    
    // Initialize Pantheon
    console.error('Summoning the gods...');
    const pantheon = new PantheonCore(null, {
      enableMCP: true,
      streamProgress: true
    });
    
    await pantheon.initialize();
    console.error(`✨ ${pantheon.gods.size} gods ready to serve!`);
    
    // Create MCP server configuration
    const serverConfig = createMCPServer(pantheon);
    
    // Create MCP server instance
    const server = new Server(
      {
        name: serverConfig.name,
        version: serverConfig.version
      },
      {
        capabilities: {
          tools: true,
          resources: true,
          streaming: true
        }
      }
    );
    
    // Register all tools
    console.error('Registering divine tools...');
    for (const [name, tool] of Object.entries(serverConfig.tools)) {
      server.setRequestHandler(`tools/${name}`, async (request) => {
        try {
          const result = await tool.handler(request.params);
          return { result };
        } catch (error) {
          return {
            error: {
              code: -32603,
              message: error.message
            }
          };
        }
      });
    }
    
    // Register all resources
    console.error('Registering divine resources...');
    for (const [name, resource] of Object.entries(serverConfig.resources)) {
      server.setRequestHandler(`resources/${name}`, async (request) => {
        try {
          const result = await resource.handler(request.params);
          return { result };
        } catch (error) {
          return {
            error: {
              code: -32603,
              message: error.message
            }
          };
        }
      });
    }
    
    // Tool listing handler
    server.setRequestHandler('tools/list', async () => {
      const tools = Object.entries(serverConfig.tools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));
      
      return { tools };
    });
    
    // Resource listing handler
    server.setRequestHandler('resources/list', async () => {
      const resources = Object.entries(serverConfig.resources).map(([name, resource]) => ({
        uri: `pantheon://${name}`,
        name,
        description: resource.description,
        mimeType: 'application/json'
      }));
      
      return { resources };
    });
    
    // Resource content handler
    server.setRequestHandler('resources/read', async (request) => {
      const uri = request.params.uri;
      const resourceName = uri.replace('pantheon://', '');
      const resource = serverConfig.resources[resourceName];
      
      if (!resource) {
        return {
          error: {
            code: -32602,
            message: `Resource not found: ${resourceName}`
          }
        };
      }
      
      try {
        const content = await resource.handler(request.params);
        return {
          contents: [{
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2)
          }]
        };
      } catch (error) {
        return {
          error: {
            code: -32603,
            message: error.message
          }
        };
      }
    });
    
    // Create transport
    const transport = new StdioServerTransport();
    
    // Connect server to transport
    await server.connect(transport);
    
    console.error(`
🏛️ Pantheon MCP Server Ready!
The gods await your commands...

Available tools: ${Object.keys(serverConfig.tools).length}
Available resources: ${Object.keys(serverConfig.resources).length}
    `);
    
    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
      console.error('\n⚡ Zeus commands the pantheon to rest...');
      await pantheon.shutdown();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize Pantheon MCP Server:', error.message);
    process.exit(1);
  }
}

// Run the server
main().catch(console.error);