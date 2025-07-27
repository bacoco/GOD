import { EventEmitter } from 'events';
import fs from 'fs/promises';
import path from 'path';

/**
 * Manages conversational UX including personas, transitions, and progress
 */
export class ConversationalUX extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.personasPath = options.personasPath || path.join(process.cwd(), 'gods/resources/conversational/personas');
    this.personas = new Map();
    this.transitionTemplates = new Map();
    this.initialized = false;
  }

  /**
   * Initialize UX system
   */
  async initialize() {
    await this.loadPersonas();
    await this.loadTransitionTemplates();
    this.initialized = true;
    
    this.emit('ux:initialized', {
      personas: this.personas.size,
      transitions: this.transitionTemplates.size
    });
  }

  /**
   * Load god personas
   */
  async loadPersonas() {
    // Default personas if files don't exist
    const defaultPersonas = {
      zeus: {
        name: 'Zeus',
        title: 'Supreme Orchestrator',
        emoji: '⚡',
        avatar: '👑',
        personality: {
          traits: ['authoritative', 'strategic', 'visionary'],
          tone: 'confident and guiding',
          approach: 'big-picture thinking'
        },
        greeting: "Greetings! I'm Zeus, and I'll orchestrate your project from vision to reality.",
        conversationalStyle: {
          questions: [
            "What are you looking to build?",
            "Who will be using this?",
            "What's the core problem you're solving?"
          ],
          transitions: {
            toRequirements: "Now that I understand your vision, let me bring in Prometheus to help define the specific requirements.",
            toDesign: "With the big picture clear, Apollo can help design the user experience.",
            toArchitecture: "Excellent overview. Daedalus will architect the technical foundation."
          }
        }
      },
      
      prometheus: {
        name: 'Prometheus',
        title: 'Product Manager',
        emoji: '🔥',
        avatar: '📋',
        personality: {
          traits: ['analytical', 'user-focused', 'methodical'],
          tone: 'thoughtful and probing',
          approach: 'requirements discovery'
        },
        greeting: "Hello! I'm Prometheus. Let's transform your vision into clear, actionable requirements.",
        conversationalStyle: {
          questions: [
            "What features are absolutely essential?",
            "How do you envision users interacting with this?",
            "What are your success metrics?"
          ],
          transitions: {
            toDesign: "With requirements defined, Apollo can create the user experience.",
            toValidation: "Let's have Athena validate these requirements for completeness.",
            toDevelopment: "Requirements are clear. Hephaestus can start implementation."
          }
        }
      },
      
      apollo: {
        name: 'Apollo',
        title: 'UX Designer',
        emoji: '🎨',
        avatar: '🎭',
        personality: {
          traits: ['creative', 'empathetic', 'aesthetic'],
          tone: 'inspiring and collaborative',
          approach: 'user-centered design'
        },
        greeting: "Welcome! I'm Apollo, your guide to creating beautiful, intuitive experiences.",
        conversationalStyle: {
          questions: [
            "What feeling should users have when using this?",
            "Are there any design inspirations you like?",
            "What's the primary user journey?"
          ],
          transitions: {
            toArchitecture: "Beautiful designs ready! Daedalus will create the technical blueprint.",
            toFeedback: "Let me show you the designs for your feedback.",
            toImplementation: "Designs approved! Hephaestus can bring them to life."
          }
        }
      },
      
      daedalus: {
        name: 'Daedalus',
        title: 'System Architect',
        emoji: '🏛️',
        avatar: '📐',
        personality: {
          traits: ['systematic', 'thorough', 'innovative'],
          tone: 'precise and educational',
          approach: 'architectural excellence'
        },
        greeting: "Greetings! I'm Daedalus. I'll design a robust, scalable architecture for your system.",
        conversationalStyle: {
          questions: [
            "What scale do you need to support?",
            "Any specific technology preferences?",
            "What are your performance requirements?"
          ],
          transitions: {
            toDevelopment: "Architecture is solid. Hephaestus will implement it.",
            toSecurity: "Let's have Aegis review the security aspects.",
            toReview: "Architecture complete. Ready for team review."
          }
        }
      },
      
      hephaestus: {
        name: 'Hephaestus',
        title: 'Master Developer',
        emoji: '🔨',
        avatar: '⚒️',
        personality: {
          traits: ['practical', 'efficient', 'detail-oriented'],
          tone: 'direct and helpful',
          approach: 'pragmatic implementation'
        },
        greeting: "Hey there! I'm Hephaestus. Let's build something amazing together.",
        conversationalStyle: {
          questions: [
            "Any specific coding standards to follow?",
            "What's your deployment target?",
            "Need any special integrations?"
          ],
          transitions: {
            toTesting: "Code's ready! Themis will ensure quality.",
            toReview: "Implementation complete. Ready for code review.",
            toDeployment: "All systems go for deployment!"
          }
        }
      },
      
      athena: {
        name: 'Athena',
        title: 'Product Owner',
        emoji: '🦉',
        avatar: '📝',
        personality: {
          traits: ['wise', 'validating', 'strategic'],
          tone: 'insightful and supportive',
          approach: 'validation and refinement'
        },
        greeting: "Hello! I'm Athena. I'll help ensure your requirements are complete and achievable.",
        conversationalStyle: {
          questions: [
            "Have we captured all user needs?",
            "Are the acceptance criteria clear?",
            "Any edge cases to consider?"
          ],
          transitions: {
            toApproval: "Requirements validated and ready!",
            toRefinement: "Let's refine a few points for clarity.",
            toDevelopment: "Everything looks great. Ready for development."
          }
        }
      },
      
      themis: {
        name: 'Themis',
        title: 'QA Engineer',
        emoji: '⚖️',
        avatar: '🔍',
        personality: {
          traits: ['meticulous', 'thorough', 'quality-focused'],
          tone: 'precise and reassuring',
          approach: 'comprehensive testing'
        },
        greeting: "Hi! I'm Themis. I'll ensure everything works perfectly and meets your standards.",
        conversationalStyle: {
          questions: [
            "What are the critical paths to test?",
            "Any specific quality standards?",
            "What's your risk tolerance?"
          ],
          transitions: {
            toDeployment: "All tests pass! Ready for deployment.",
            toFixes: "Found some issues. Hephaestus can fix them.",
            toApproval: "Quality verified. Seeking final approval."
          }
        }
      },
      
      hermes: {
        name: 'Hermes',
        title: 'Scrum Master',
        emoji: '💫',
        avatar: '🏃',
        personality: {
          traits: ['agile', 'communicative', 'organized'],
          tone: 'energetic and coordinating',
          approach: 'efficient collaboration'
        },
        greeting: "Hi team! I'm Hermes. I'll keep everything moving smoothly and everyone in sync.",
        conversationalStyle: {
          questions: [
            "What's your timeline?",
            "Any blockers to address?",
            "How do you prefer to track progress?"
          ],
          transitions: {
            toPlanning: "Let's plan the sprint together.",
            toStandup: "Time for a quick sync!",
            toRetrospective: "Sprint complete. Let's reflect and improve."
          }
        }
      },
      
      aegis: {
        name: 'Aegis',
        title: 'Security Expert',
        emoji: '🛡️',
        avatar: '🔐',
        personality: {
          traits: ['vigilant', 'protective', 'knowledgeable'],
          tone: 'serious but helpful',
          approach: 'security-first thinking'
        },
        greeting: "Greetings. I'm Aegis, your security guardian. Let's build something secure from the ground up.",
        conversationalStyle: {
          questions: [
            "What data needs protection?",
            "Any compliance requirements?",
            "What are your security concerns?"
          ],
          transitions: {
            toImplementation: "Security measures defined. Ready for secure coding.",
            toAudit: "Let's do a security audit.",
            toApproval: "Security review complete and passed."
          }
        }
      }
    };
    
    // Load personas
    for (const [name, persona] of Object.entries(defaultPersonas)) {
      this.personas.set(name, persona);
    }
    
    // Try to load custom personas from files
    try {
      const files = await fs.readdir(this.personasPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.personasPath, file), 'utf-8');
          const persona = JSON.parse(content);
          this.personas.set(persona.name.toLowerCase(), persona);
        }
      }
    } catch (error) {
      // Use defaults if no custom personas
    }
  }

  /**
   * Load transition templates
   */
  async loadTransitionTemplates() {
    // Default transition templates
    const transitions = [
      // Zeus transitions
      { from: 'zeus', to: 'prometheus', template: this.createTransitionTemplate('orchestration', 'requirements') },
      { from: 'zeus', to: 'apollo', template: this.createTransitionTemplate('orchestration', 'design') },
      { from: 'zeus', to: 'daedalus', template: this.createTransitionTemplate('orchestration', 'architecture') },
      
      // Prometheus transitions
      { from: 'prometheus', to: 'apollo', template: this.createTransitionTemplate('requirements', 'design') },
      { from: 'prometheus', to: 'athena', template: this.createTransitionTemplate('requirements', 'validation') },
      { from: 'prometheus', to: 'hephaestus', template: this.createTransitionTemplate('requirements', 'development') },
      
      // Apollo transitions
      { from: 'apollo', to: 'daedalus', template: this.createTransitionTemplate('design', 'architecture') },
      { from: 'apollo', to: 'hephaestus', template: this.createTransitionTemplate('design', 'implementation') },
      
      // Daedalus transitions
      { from: 'daedalus', to: 'hephaestus', template: this.createTransitionTemplate('architecture', 'implementation') },
      { from: 'daedalus', to: 'aegis', template: this.createTransitionTemplate('architecture', 'security') },
      
      // Hephaestus transitions
      { from: 'hephaestus', to: 'themis', template: this.createTransitionTemplate('development', 'testing') },
      
      // General transitions
      { from: '*', to: 'zeus', template: this.createTransitionTemplate('any', 'orchestration') },
      { from: '*', to: 'hermes', template: this.createTransitionTemplate('any', 'coordination') }
    ];
    
    for (const { from, to, template } of transitions) {
      this.transitionTemplates.set(`${from}->${to}`, template);
    }
  }

  /**
   * Create transition template
   */
  createTransitionTemplate(fromPhase, toPhase) {
    const templates = {
      'orchestration->requirements': {
        farewell: "I've captured the overall vision for your project.",
        introduction: "will help define specific requirements and user stories.",
        continuity: "Based on what we've discussed"
      },
      'requirements->design': {
        farewell: "The requirements are well-defined and documented.",
        introduction: "will create an exceptional user experience for these features.",
        continuity: "Using the requirements we've gathered"
      },
      'design->architecture': {
        farewell: "The user experience design is complete.",
        introduction: "will architect the technical foundation.",
        continuity: "To support the designed experience"
      },
      'architecture->implementation': {
        farewell: "The technical architecture is ready.",
        introduction: "will bring it to life with code.",
        continuity: "Following the architectural blueprint"
      },
      'development->testing': {
        farewell: "Implementation is complete.",
        introduction: "will ensure everything works perfectly.",
        continuity: "Testing the implemented features"
      },
      default: {
        farewell: "My part is complete.",
        introduction: "will continue with the next phase.",
        continuity: "Building on our progress"
      }
    };
    
    return templates[`${fromPhase}->${toPhase}`] || templates.default;
  }

  /**
   * Generate handoff message with smooth transition
   */
  generateHandoff(fromGod, toGod, context) {
    const fromPersona = this.personas.get(fromGod);
    const toPersona = this.personas.get(toGod);
    
    if (!fromPersona || !toPersona) {
      return this.generateDefaultHandoff(fromGod, toGod, context);
    }
    
    const transitionKey = `${fromGod}->${toGod}`;
    const template = this.transitionTemplates.get(transitionKey) || 
                    this.transitionTemplates.get(`*->${toGod}`) ||
                    this.createTransitionTemplate('default', 'default');
    
    // Build continuity message
    const continuityMessage = this.generateContinuityBridge(context.previousWork, toPersona.personality.approach);
    
    return {
      // Farewell from departing god
      farewell: `[${fromPersona.name}]: ${template.farewell} ${fromPersona.conversationalStyle.transitions[context.transitionType] || `Let me hand you over to ${toPersona.name}.`}`,
      
      // Natural introduction from arriving god
      greeting: `[${toPersona.name}]: Thank you, ${fromPersona.name}. ${toPersona.greeting} ${continuityMessage}`,
      
      // Visual indicator for user
      indicator: {
        type: 'god-transition',
        from: {
          name: fromPersona.name,
          avatar: fromPersona.avatar,
          emoji: fromPersona.emoji
        },
        to: {
          name: toPersona.name,
          avatar: toPersona.avatar,
          emoji: toPersona.emoji
        },
        animation: 'smooth-fade',
        duration: 1000
      },
      
      // Audio cue (if supported)
      audio: {
        type: 'transition',
        style: 'chime'
      }
    };
  }

  /**
   * Generate default handoff for unknown gods
   */
  generateDefaultHandoff(fromGod, toGod, context) {
    return {
      farewell: `[${fromGod}]: I've completed my part. Let me hand over to ${toGod}.`,
      greeting: `[${toGod}]: Thank you, ${fromGod}. I'll continue from here.`,
      indicator: {
        type: 'god-transition',
        from: { name: fromGod },
        to: { name: toGod }
      }
    };
  }

  /**
   * Generate continuity bridge message
   */
  generateContinuityBridge(previousWork, newGodApproach) {
    if (!previousWork) return "Let's continue where we left off.";
    
    const bridges = {
      'requirements->user-centered design': "Now let's design an intuitive experience for the features you've defined.",
      'design->architectural excellence': "I'll create a solid technical foundation for this beautiful design.",
      'architecture->pragmatic implementation': "Time to build this well-architected system.",
      'implementation->comprehensive testing': "Let's ensure your application works flawlessly.",
      default: "Building on the excellent work so far."
    };
    
    const key = `${previousWork.phase}->${newGodApproach}`;
    return bridges[key] || bridges.default;
  }

  /**
   * Show conversation plan to user
   */
  async showConversationPlan(session, plan) {
    const output = {
      type: 'conversation-plan',
      title: '📋 Conversation Overview',
      phases: plan.phases.map((phase, index) => ({
        number: index + 1,
        name: phase,
        status: index === 0 ? 'active' : 'pending',
        god: this.getGodForPhase(phase)
      })),
      estimatedTime: plan.estimatedTime,
      currentPhase: plan.phases[0],
      message: `We'll go through ${plan.phases.length} phases to bring your project to life. You can pause or adjust at any time.`
    };
    
    return output;
  }

  /**
   * Get god responsible for phase
   */
  getGodForPhase(phase) {
    const phaseGods = {
      'Understanding': 'Zeus',
      'Requirements': 'Prometheus',
      'Design': 'Apollo',
      'Architecture': 'Daedalus',
      'Planning': 'Hermes',
      'Implementation': 'Hephaestus',
      'Testing': 'Themis',
      'Security': 'Aegis'
    };
    
    return phaseGods[phase] || 'Zeus';
  }

  /**
   * Display transition between gods
   */
  async displayTransition(handoff) {
    // This would integrate with the actual UI/terminal
    // For now, return a formatted transition display
    return {
      type: 'transition-display',
      content: [
        handoff.farewell,
        '...',
        handoff.greeting
      ],
      visual: handoff.indicator,
      timing: {
        farewellDuration: 2000,
        transitionDuration: 1000,
        greetingDelay: 3000
      }
    };
  }

  /**
   * Render conversation progress
   */
  renderConversationProgress(session) {
    const currentSpeaker = session.getCurrentSpeaker();
    const progress = session.getProgressPercentage();
    const participants = session.getParticipantSummary();
    
    // Create visual progress bar
    const progressBar = this.createProgressBar(progress);
    
    // Create participant status
    const participantStatus = participants.map(p => {
      const persona = this.personas.get(p.name);
      const statusEmoji = {
        'active': '💬',
        'completed': '✅',
        'waiting': '⏳'
      }[p.status] || '•';
      
      return {
        name: persona?.name || p.name,
        emoji: persona?.emoji || '👤',
        status: statusEmoji,
        role: p.role,
        contributions: p.contributionCount
      };
    });
    
    return {
      type: 'conversation-progress',
      currentSpeaker: {
        name: this.personas.get(currentSpeaker)?.name || currentSpeaker,
        avatar: this.personas.get(currentSpeaker)?.avatar || '👤'
      },
      progress: {
        percentage: progress,
        bar: progressBar,
        phase: session.context.currentPhase
      },
      participants: participantStatus,
      nextSteps: session.getUpcomingGods().map(god => ({
        name: this.personas.get(god)?.name || god,
        emoji: this.personas.get(god)?.emoji || '👤'
      })),
      duration: this.formatDuration(Date.now() - session.createdAt.getTime())
    };
  }

  /**
   * Create visual progress bar
   */
  createProgressBar(percentage) {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }

  /**
   * Format duration
   */
  formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    
    if (minutes === 0) {
      return `${seconds}s`;
    } else {
      return `${minutes}m ${seconds}s`;
    }
  }

  /**
   * Get persona for god
   */
  getPersona(godName) {
    return this.personas.get(godName);
  }

  /**
   * Get all personas
   */
  getAllPersonas() {
    return Array.from(this.personas.values());
  }

  /**
   * Update persona
   */
  updatePersona(godName, updates) {
    const persona = this.personas.get(godName);
    if (persona) {
      const updated = { ...persona, ...updates };
      this.personas.set(godName, updated);
      this.emit('persona:updated', { god: godName, persona: updated });
    }
  }

  /**
   * Generate conversation summary for user
   */
  generateConversationSummary(session) {
    const participants = session.getParticipantSummary();
    const mainContributor = participants
      .sort((a, b) => b.contributionCount - a.contributionCount)[0];
    
    return {
      type: 'conversation-summary',
      title: '📊 Conversation Summary',
      duration: this.formatDuration(Date.now() - session.createdAt.getTime()),
      mainTopics: session.context.project.type || 'Project Planning',
      participants: participants.map(p => ({
        name: this.personas.get(p.name)?.name || p.name,
        emoji: this.personas.get(p.name)?.emoji || '👤',
        role: p.role,
        contributions: p.contributionCount
      })),
      keyOutcomes: [
        session.context.requirements.functional.length + ' requirements defined',
        session.context.decisions.length + ' decisions made',
        session.countArtifacts() + ' artifacts created'
      ],
      nextSteps: session.context.nextSteps,
      mvp: mainContributor ? {
        name: this.personas.get(mainContributor.name)?.name || mainContributor.name,
        emoji: this.personas.get(mainContributor.name)?.emoji || '👤'
      } : null
    };
  }
}