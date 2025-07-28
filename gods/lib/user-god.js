import { BaseGod } from './base-god.js';
import { EventEmitter } from 'events';
import readline from 'readline';

/**
 * UserGod - Represents a human user as a god in the Pantheon system
 * Enables formal task assignment to humans within workflows
 */
export class UserGod extends BaseGod {
  constructor(options = {}) {
    super({
      ...options,
      name: options.name || 'user',
      config: {
        ...options.config,
        capabilities: ['decide', 'review', 'approve', 'provide-input', 'manual-task'],
        orchestrationMode: 'js-only' // Users don't create AI agents
      }
    });
    
    // User-specific configuration
    this.userId = options.userId || 'default-user';
    this.userRole = options.userRole || 'collaborator';
    this.notificationMethod = options.notificationMethod || 'console';
    
    // Interface for user interaction
    this.interface = options.interface || this.createDefaultInterface();
    
    // Task queue for human tasks
    this.taskQueue = [];
    this.pendingTasks = new Map();
    
    // Response handlers
    this.responseHandlers = new Map();
    
    // User preferences
    this.preferences = {
      autoApprove: options.autoApprove || false,
      maxWaitTime: options.maxWaitTime || 3600000, // 1 hour default
      reminderInterval: options.reminderInterval || 300000, // 5 minutes
      workingHours: options.workingHours || { start: 9, end: 17 },
      timezone: options.timezone || 'UTC'
    };
    
    // User activity tracking
    this.activity = {
      lastActive: Date.now(),
      tasksCompleted: 0,
      averageResponseTime: 0,
      availability: 'available'
    };
  }

  async onInitialize() {
    await super.onInitialize();
    
    // Set user-specific capabilities
    this.capabilities = [
      'human-judgment',
      'creative-input',
      'decision-making',
      'quality-review',
      'manual-execution',
      'data-provision'
    ];
    
    this.responsibilities = [
      'Make critical decisions requiring human judgment',
      'Review and approve automated work',
      'Provide creative input and ideas',
      'Execute manual tasks that cannot be automated',
      'Supply information only humans can provide',
      'Validate results requiring human expertise'
    ];
    
    // Start monitoring for user responses
    this.startResponseMonitoring();
  }

  /**
   * Create default console interface
   */
  createDefaultInterface() {
    return {
      type: 'console',
      rl: readline.createInterface({
        input: process.stdin,
        output: process.stdout
      }),
      
      async prompt(question) {
        return new Promise((resolve) => {
          this.rl.question(question, (answer) => {
            resolve(answer);
          });
        });
      },
      
      notify(message) {
        console.log(`\n🔔 ${message}`);
      },
      
      display(content) {
        console.log(content);
      }
    };
  }

  /**
   * Execute task assigned to user
   */
  async performTask(task) {
    const taskId = `user-task-${Date.now()}`;
    const startTime = Date.now();
    
    // Add to pending tasks
    this.pendingTasks.set(taskId, {
      id: taskId,
      task,
      startTime,
      status: 'pending'
    });
    
    try {
      // Notify user
      await this.notifyUser(task);
      
      // Determine task type and handle appropriately
      const result = await this.handleUserTask(task);
      
      // Update activity
      const responseTime = Date.now() - startTime;
      this.updateActivity(responseTime);
      
      // Mark complete
      this.pendingTasks.get(taskId).status = 'completed';
      this.pendingTasks.get(taskId).result = result;
      
      return result;
      
    } catch (error) {
      this.pendingTasks.get(taskId).status = 'failed';
      this.pendingTasks.get(taskId).error = error;
      throw error;
    }
  }

  /**
   * Handle different types of user tasks
   */
  async handleUserTask(task) {
    const taskType = task.type || this.inferTaskType(task);
    
    switch (taskType) {
      case 'approval':
        return await this.handleApprovalTask(task);
        
      case 'review':
        return await this.handleReviewTask(task);
        
      case 'decision':
        return await this.handleDecisionTask(task);
        
      case 'input':
        return await this.handleInputTask(task);
        
      case 'manual':
        return await this.handleManualTask(task);
        
      case 'validation':
        return await this.handleValidationTask(task);
        
      default:
        return await this.handleGenericTask(task);
    }
  }

  /**
   * Handle approval tasks
   */
  async handleApprovalTask(task) {
    // Check auto-approval
    if (this.preferences.autoApprove && task.autoApprovable !== false) {
      this.emit('user:auto-approved', { task });
      return {
        approved: true,
        autoApproved: true,
        timestamp: Date.now()
      };
    }
    
    // Format approval request
    const request = this.formatApprovalRequest(task);
    
    // Display to user
    this.interface.display(request.display);
    
    // Get user response
    const response = await this.getUserResponse(request.prompt, {
      type: 'boolean',
      default: false
    });
    
    return {
      approved: response,
      timestamp: Date.now(),
      comments: response ? null : await this.getOptionalComments()
    };
  }

  /**
   * Handle review tasks
   */
  async handleReviewTask(task) {
    // Format review materials
    const review = this.formatReviewMaterials(task);
    
    // Display for review
    this.interface.display(review.display);
    
    // Collect feedback
    const feedback = await this.collectReviewFeedback(review.questions);
    
    return {
      reviewed: true,
      feedback,
      rating: feedback.rating,
      timestamp: Date.now()
    };
  }

  /**
   * Handle decision tasks
   */
  async handleDecisionTask(task) {
    // Present decision context
    const decision = this.formatDecisionContext(task);
    
    // Display options
    this.interface.display(decision.display);
    
    // Get user choice
    const choice = await this.getUserChoice(decision.options);
    
    // Get rationale if required
    let rationale = null;
    if (task.requireRationale) {
      rationale = await this.getUserResponse('Please explain your decision: ');
    }
    
    return {
      decision: choice,
      rationale,
      timestamp: Date.now()
    };
  }

  /**
   * Handle input tasks
   */
  async handleInputTask(task) {
    const prompts = task.prompts || [{ 
      field: 'input',
      prompt: task.prompt || 'Please provide the requested information: '
    }];
    
    const inputs = {};
    
    for (const prompt of prompts) {
      const value = await this.getUserResponse(prompt.prompt, {
        type: prompt.type || 'string',
        validation: prompt.validation
      });
      
      inputs[prompt.field] = value;
    }
    
    return {
      inputs,
      timestamp: Date.now()
    };
  }

  /**
   * Handle manual execution tasks
   */
  async handleManualTask(task) {
    // Display instructions
    const instructions = this.formatManualInstructions(task);
    this.interface.display(instructions);
    
    // Wait for confirmation
    await this.getUserResponse('Press Enter when completed...', {
      type: 'confirmation'
    });
    
    // Collect results if needed
    let results = null;
    if (task.collectResults) {
      results = await this.collectManualResults(task.resultFields);
    }
    
    return {
      completed: true,
      manual: true,
      results,
      timestamp: Date.now()
    };
  }

  /**
   * Handle validation tasks
   */
  async handleValidationTask(task) {
    // Display items to validate
    const validation = this.formatValidationItems(task);
    this.interface.display(validation.display);
    
    const results = [];
    
    for (const item of validation.items) {
      const valid = await this.getUserResponse(
        `Is "${item.name}" valid? (y/n): `,
        { type: 'boolean' }
      );
      
      let issues = null;
      if (!valid) {
        issues = await this.getUserResponse('What issues did you find? ');
      }
      
      results.push({
        item: item.name,
        valid,
        issues
      });
    }
    
    return {
      validationResults: results,
      allValid: results.every(r => r.valid),
      timestamp: Date.now()
    };
  }

  /**
   * Handle generic tasks
   */
  async handleGenericTask(task) {
    // Display task
    this.interface.display(`\n📋 Task: ${task.description || task}`);
    
    // Get response
    const response = await this.getUserResponse(
      'Please complete the task and describe the result: '
    );
    
    return {
      completed: true,
      response,
      timestamp: Date.now()
    };
  }

  /**
   * Notify user about new task
   */
  async notifyUser(task) {
    const notification = `New task assigned: ${task.description || task.type || 'Task'}`;
    
    switch (this.notificationMethod) {
      case 'console':
        this.interface.notify(notification);
        break;
        
      case 'email':
        await this.sendEmailNotification(notification, task);
        break;
        
      case 'webhook':
        await this.sendWebhookNotification(notification, task);
        break;
        
      case 'desktop':
        await this.sendDesktopNotification(notification);
        break;
    }
    
    this.emit('user:notified', { task, method: this.notificationMethod });
  }

  /**
   * Get user response with validation
   */
  async getUserResponse(prompt, options = {}) {
    let response;
    let valid = false;
    
    while (!valid) {
      response = await this.interface.prompt(prompt);
      
      // Type conversion
      if (options.type === 'boolean') {
        response = ['y', 'yes', 'true', '1'].includes(response.toLowerCase());
        valid = true;
      } else if (options.type === 'number') {
        response = parseFloat(response);
        valid = !isNaN(response);
        if (!valid) {
          this.interface.display('Please enter a valid number.');
        }
      } else if (options.type === 'confirmation') {
        valid = true; // Any input confirms
      } else {
        // String validation
        if (options.validation) {
          valid = options.validation(response);
          if (!valid) {
            this.interface.display('Invalid input. Please try again.');
          }
        } else {
          valid = response.trim().length > 0;
          if (!valid) {
            this.interface.display('Input cannot be empty.');
          }
        }
      }
    }
    
    return response;
  }

  /**
   * Get user choice from options
   */
  async getUserChoice(options) {
    // Display options
    options.forEach((option, index) => {
      this.interface.display(`${index + 1}. ${option.label || option}`);
    });
    
    // Get choice
    const choice = await this.getUserResponse(
      `Choose an option (1-${options.length}): `,
      {
        type: 'number',
        validation: (n) => n >= 1 && n <= options.length
      }
    );
    
    return options[Math.floor(choice) - 1];
  }

  /**
   * Collaboration methods
   */
  
  async collaborateWith(gods, task) {
    // User coordinates with AI gods
    const collaboration = {
      participants: [this.name, ...gods],
      task,
      contributions: []
    };
    
    // Gather AI analysis
    for (const god of gods) {
      const analysis = await this.requestAnalysis(god, task);
      collaboration.contributions.push({
        god,
        analysis
      });
    }
    
    // Present to user for decision
    const decision = await this.makeCollaborativeDecision(
      collaboration.contributions,
      task
    );
    
    return {
      collaboration,
      decision,
      timestamp: Date.now()
    };
  }

  /**
   * Handle handoff from AI god
   */
  async handleHandoff(fromGod, task, context) {
    this.interface.display(`\n🤝 Handoff from ${fromGod}`);
    this.interface.display(`Context: ${context.reason || 'Task requires human input'}`);
    
    // Execute the task
    const result = await this.executeTask(task);
    
    // Determine next steps
    const nextSteps = await this.determineNextSteps(result, context);
    
    return {
      result,
      nextSteps,
      handoffComplete: true
    };
  }

  /**
   * Check user availability
   */
  isAvailable() {
    const now = new Date();
    const hour = now.getHours();
    
    // Check working hours
    if (this.preferences.workingHours) {
      const { start, end } = this.preferences.workingHours;
      if (hour < start || hour >= end) {
        return false;
      }
    }
    
    // Check activity status
    return this.activity.availability === 'available';
  }

  /**
   * Set availability status
   */
  setAvailability(status, duration = null) {
    this.activity.availability = status;
    
    if (duration) {
      setTimeout(() => {
        this.activity.availability = 'available';
        this.emit('user:available');
      }, duration);
    }
    
    this.emit('user:availability-changed', { status, duration });
  }

  /**
   * Helper methods
   */
  
  inferTaskType(task) {
    const description = (task.description || '').toLowerCase();
    
    if (description.includes('approve') || description.includes('approval')) {
      return 'approval';
    } else if (description.includes('review')) {
      return 'review';
    } else if (description.includes('decide') || description.includes('decision')) {
      return 'decision';
    } else if (description.includes('provide') || description.includes('input')) {
      return 'input';
    } else if (description.includes('validate') || description.includes('check')) {
      return 'validation';
    } else if (description.includes('manual') || description.includes('perform')) {
      return 'manual';
    }
    
    return 'generic';
  }
  
  formatApprovalRequest(task) {
    return {
      display: `
╔════════════════════════════════════════╗
║          APPROVAL REQUIRED             ║
╚════════════════════════════════════════╝

${task.title || 'Approval Request'}

${task.description || task}

${task.details ? `Details:\n${task.details}\n` : ''}
${task.impact ? `Impact: ${task.impact}\n` : ''}
${task.risk ? `Risk Level: ${task.risk}\n` : ''}
`,
      prompt: 'Do you approve? (y/n): '
    };
  }
  
  formatReviewMaterials(task) {
    return {
      display: `
📄 REVIEW REQUEST
─────────────────

${task.title || 'Review Required'}

Materials to review:
${task.materials || task.description}

Please review the above and provide feedback.
`,
      questions: task.questions || [
        { id: 'quality', prompt: 'Quality rating (1-5): ', type: 'number' },
        { id: 'issues', prompt: 'Any issues found? ' },
        { id: 'suggestions', prompt: 'Suggestions for improvement: ' }
      ]
    };
  }
  
  formatDecisionContext(task) {
    return {
      display: `
🤔 DECISION REQUIRED
───────────────────

${task.title || 'Decision Needed'}

Context:
${task.context || task.description}

${task.implications ? `\nImplications:\n${task.implications}` : ''}
`,
      options: task.options || []
    };
  }
  
  formatManualInstructions(task) {
    return `
🔧 MANUAL TASK
──────────────

${task.title || 'Manual Action Required'}

Instructions:
${task.instructions || task.description}

${task.steps ? '\nSteps:\n' + task.steps.map((s, i) => `${i + 1}. ${s}`).join('\n') : ''}

Please complete the task and confirm when done.
`;
  }
  
  formatValidationItems(task) {
    return {
      display: `
✓ VALIDATION REQUIRED
───────────────────

Please validate the following items:
`,
      items: task.items || []
    };
  }
  
  async getOptionalComments() {
    const response = await this.interface.prompt('Comments (optional, press Enter to skip): ');
    return response.trim() || null;
  }
  
  async collectReviewFeedback(questions) {
    const feedback = {};
    
    for (const question of questions) {
      feedback[question.id] = await this.getUserResponse(
        question.prompt,
        { type: question.type }
      );
    }
    
    // Calculate rating if present
    if (feedback.quality) {
      feedback.rating = feedback.quality;
    }
    
    return feedback;
  }
  
  async collectManualResults(fields) {
    const results = {};
    
    for (const field of fields) {
      results[field.name] = await this.getUserResponse(
        field.prompt || `Enter ${field.name}: `,
        { type: field.type }
      );
    }
    
    return results;
  }
  
  updateActivity(responseTime) {
    this.activity.lastActive = Date.now();
    this.activity.tasksCompleted++;
    
    // Update average response time
    const prev = this.activity.averageResponseTime;
    const count = this.activity.tasksCompleted;
    this.activity.averageResponseTime = (prev * (count - 1) + responseTime) / count;
  }
  
  startResponseMonitoring() {
    // Monitor for pending tasks that need reminders
    this.reminderInterval = setInterval(() => {
      this.checkPendingTasks();
    }, this.preferences.reminderInterval);
  }
  
  checkPendingTasks() {
    const now = Date.now();
    
    this.pendingTasks.forEach((task, taskId) => {
      if (task.status === 'pending') {
        const elapsed = now - task.startTime;
        
        // Send reminder if needed
        if (elapsed > this.preferences.reminderInterval && 
            !task.reminderSent) {
          this.interface.notify(`⏰ Reminder: Task "${task.task.description}" is waiting for your response`);
          task.reminderSent = true;
        }
        
        // Timeout if exceeded max wait time
        if (elapsed > this.preferences.maxWaitTime) {
          task.status = 'timeout';
          this.emit('user:task-timeout', { taskId, task });
        }
      }
    });
  }
  
  async requestAnalysis(god, task) {
    // Simulate requesting analysis from AI god
    return {
      recommendation: `${god} recommends...`,
      confidence: 0.85,
      reasoning: 'Based on analysis...'
    };
  }
  
  async makeCollaborativeDecision(contributions, task) {
    // Present AI analyses to user
    this.interface.display('\n🤝 Collaborative Decision\n');
    this.interface.display('AI Analyses:');
    
    contributions.forEach(({ god, analysis }) => {
      this.interface.display(`\n${god}: ${analysis.recommendation}`);
      this.interface.display(`Confidence: ${(analysis.confidence * 100).toFixed(0)}%`);
    });
    
    // Get user decision
    return await this.getUserResponse('\nYour decision: ');
  }
  
  async determineNextSteps(result, context) {
    // Determine what should happen after user completes task
    if (context.returnTo) {
      return {
        action: 'handoff',
        target: context.returnTo,
        data: result
      };
    }
    
    return {
      action: 'complete',
      data: result
    };
  }
  
  async sendEmailNotification(message, task) {
    // Would integrate with email service
    console.log(`[Email notification would be sent: ${message}]`);
  }
  
  async sendWebhookNotification(message, task) {
    // Would call webhook URL
    console.log(`[Webhook notification would be sent: ${message}]`);
  }
  
  async sendDesktopNotification(message) {
    // Would use system notifications
    console.log(`[Desktop notification would be shown: ${message}]`);
  }
  
  // Cleanup
  async shutdown() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
    
    if (this.interface.rl) {
      this.interface.rl.close();
    }
    
    await super.shutdown();
  }
}

export default UserGod;