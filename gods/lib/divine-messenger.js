import { EventEmitter } from 'events';

export class DivineMessenger extends EventEmitter {
  constructor(pantheon) {
    super();
    this.pantheon = pantheon;
    this.gods = new Map();
    this.messageQueue = [];
    this.messageHistory = [];
    this.priorityQueue = [];
    this.processing = false;
  }

  async initialize() {
    this.emit('messenger:initializing');
    
    // Start message processing loop
    this.startProcessingLoop();
    
    this.emit('messenger:initialized');
  }

  registerGod(god) {
    this.gods.set(god.name, god);
    this.emit('messenger:god-registered', { godName: god.name });
    
    // Set up god's message handler
    god.on('message', (message) => {
      this.handleGodMessage(god.name, message);
    });
  }

  unregisterGod(god) {
    this.gods.delete(god.name);
    this.emit('messenger:god-unregistered', { godName: god.name });
  }

  async send(fromGod, toGod, message, options = {}) {
    const messageObj = {
      id: crypto.randomUUID(),
      from: fromGod,
      to: toGod,
      content: message,
      timestamp: new Date(),
      priority: options.priority || 'normal',
      requiresResponse: options.requiresResponse || false,
      metadata: options.metadata || {}
    };
    
    // Zeus messages always have highest priority
    if (fromGod === 'zeus' || toGod === 'zeus') {
      messageObj.priority = 'highest';
    }
    
    if (messageObj.priority === 'highest') {
      this.priorityQueue.unshift(messageObj);
    } else {
      this.messageQueue.push(messageObj);
    }
    
    this.emit('messenger:message-queued', messageObj);
    
    // Process immediately if not already processing
    if (!this.processing) {
      await this.processNextMessage();
    }
    
    return messageObj.id;
  }

  async broadcast(fromGod, message, options = {}) {
    const recipients = Array.from(this.gods.keys()).filter(g => g !== fromGod);
    const messageIds = [];
    
    for (const recipient of recipients) {
      const id = await this.send(fromGod, recipient, message, {
        ...options,
        metadata: { ...options.metadata, broadcast: true }
      });
      messageIds.push(id);
    }
    
    return messageIds;
  }

  async multicast(fromGod, toGods, message, options = {}) {
    const messageIds = [];
    
    for (const toGod of toGods) {
      const id = await this.send(fromGod, toGod, message, {
        ...options,
        metadata: { ...options.metadata, multicast: true }
      });
      messageIds.push(id);
    }
    
    return messageIds;
  }

  async sendToZeus(fromGod, message, options = {}) {
    return await this.send(fromGod, 'zeus', message, {
      ...options,
      priority: 'high'
    });
  }

  async requestFromZeus(fromGod, request, options = {}) {
    const messageId = await this.sendToZeus(fromGod, request, {
      ...options,
      requiresResponse: true
    });
    
    return await this.waitForResponse(messageId, options.timeout || 30000);
  }

  async processNextMessage() {
    if (this.processing) return;
    
    this.processing = true;
    
    try {
      let message = null;
      
      // Check priority queue first
      if (this.priorityQueue.length > 0) {
        message = this.priorityQueue.shift();
      } else if (this.messageQueue.length > 0) {
        message = this.messageQueue.shift();
      }
      
      if (message) {
        await this.deliverMessage(message);
      }
    } finally {
      this.processing = false;
      
      // Continue processing if more messages
      if (this.priorityQueue.length > 0 || this.messageQueue.length > 0) {
        setImmediate(() => this.processNextMessage());
      }
    }
  }

  async deliverMessage(message) {
    const recipient = this.gods.get(message.to);
    
    if (!recipient) {
      this.emit('messenger:delivery-failed', {
        message,
        reason: 'Recipient not found'
      });
      return;
    }
    
    try {
      this.emit('messenger:delivering', message);
      
      // Add to history
      this.messageHistory.push(message);
      
      // Deliver to recipient
      const response = await recipient.receiveMessage(message);
      
      // Handle response if required
      if (message.requiresResponse && response) {
        await this.send(message.to, message.from, response, {
          metadata: { 
            inResponseTo: message.id,
            originalMessage: message.content 
          }
        });
      }
      
      this.emit('messenger:delivered', { message, response });
    } catch (error) {
      this.emit('messenger:delivery-error', { message, error });
    }
  }

  async waitForResponse(messageId, timeout = 30000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.off('messenger:delivered', handler);
        reject(new Error(`Response timeout for message ${messageId}`));
      }, timeout);
      
      const handler = ({ message, response }) => {
        if (message.metadata?.inResponseTo === messageId) {
          clearTimeout(timer);
          this.off('messenger:delivered', handler);
          resolve(response);
        }
      };
      
      this.on('messenger:delivered', handler);
    });
  }

  handleGodMessage(godName, message) {
    // Internal handling when a god emits a message event
    if (message.to) {
      this.send(godName, message.to, message.content, message.options);
    } else if (message.broadcast) {
      this.broadcast(godName, message.content, message.options);
    }
  }

  startProcessingLoop() {
    // Process messages continuously
    setInterval(() => {
      if (!this.processing && 
          (this.priorityQueue.length > 0 || this.messageQueue.length > 0)) {
        this.processNextMessage();
      }
    }, 100);
  }

  getMessageHistory(filter = {}) {
    let history = [...this.messageHistory];
    
    if (filter.from) {
      history = history.filter(m => m.from === filter.from);
    }
    if (filter.to) {
      history = history.filter(m => m.to === filter.to);
    }
    if (filter.since) {
      history = history.filter(m => m.timestamp >= filter.since);
    }
    
    return history;
  }

  getQueueStatus() {
    return {
      priorityQueue: this.priorityQueue.length,
      normalQueue: this.messageQueue.length,
      processing: this.processing,
      totalDelivered: this.messageHistory.length
    };
  }

  async shutdown() {
    this.emit('messenger:shutting-down');
    
    // Clear queues
    this.messageQueue = [];
    this.priorityQueue = [];
    this.processing = false;
    
    // Remove all listeners
    this.removeAllListeners();
    
    this.emit('messenger:shutdown');
  }
}

export default DivineMessenger;