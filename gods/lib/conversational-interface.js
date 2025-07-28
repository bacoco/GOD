/**
 * Conversational Interface for Pantheon Gods
 * Handles natural dialogue and personality for each god
 */

import chalk from 'chalk';
import readline from 'readline/promises';

export class ConversationalInterface {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // God personalities and conversation styles
    this.gods = {
      Zeus: {
        color: chalk.blue,
        greeting: "Greetings! I am Zeus, orchestrator of the Pantheon. I'm here to understand your vision and guide you through bringing it to life.",
        style: 'wise and authoritative, yet approachable',
        askStyle: (question) => `${question} Share your thoughts freely - there are no wrong answers.`
      },
      Prometheus: {
        color: chalk.green,
        greeting: "Thank you, Zeus. I'm Prometheus, and I specialize in transforming visions into concrete features and user experiences.",
        style: 'innovative and forward-thinking',
        askStyle: (question) => `${question} Let's explore the possibilities together.`
      },
      Apollo: {
        color: chalk.yellow,
        greeting: "Hello! I'm Apollo, and I create experiences that delight. I believe great design isn't just about how things look, but how they feel.",
        style: 'artistic and empathetic',
        askStyle: (question) => `${question} Help me understand the experience you envision.`
      },
      Hephaestus: {
        color: chalk.red,
        greeting: "Greetings! I'm Hephaestus, master builder. I'll transform these plans into robust, working reality.",
        style: 'practical and detail-oriented',
        askStyle: (question) => `${question} Let's ensure we build this right.`
      },
      Athena: {
        color: chalk.cyan,
        greeting: "Hello. I'm Athena, bringing strategic wisdom to your project. Let me help you make informed decisions.",
        style: 'analytical and insightful',
        askStyle: (question) => `${question} Consider all angles carefully.`
      },
      Daedalus: {
        color: chalk.magenta,
        greeting: "Greetings! I'm Daedalus, architect of systems. I design foundations that scale and endure.",
        style: 'systematic and thorough',
        askStyle: (question) => `${question} Let's build on solid ground.`
      }
    };
  }

  /**
   * Display a god's message
   * @param {string} godName - Name of the speaking god
   * @param {string} message - Message to display
   */
  godSpeak(godName, message) {
    const god = this.gods[godName] || this.gods.Zeus;
    console.log(god.color(`\n[${godName}]: `) + message);
  }

  /**
   * Ask a question as a god
   * @param {string} godName - Name of the asking god
   * @param {string} question - Question to ask
   * @returns {Promise<string>} User's answer
   */
  async godAsk(godName, question) {
    const god = this.gods[godName] || this.gods.Zeus;
    const styledQuestion = god.askStyle(question);
    
    console.log(god.color(`\n[${godName}]: `) + styledQuestion);
    const answer = await this.rl.question(chalk.cyan('\nYou: '));
    
    return answer;
  }

  /**
   * Show a god transition
   * @param {string} fromGod - Current god
   * @param {string} toGod - New god
   * @param {string} reason - Reason for transition
   */
  async showTransition(fromGod, toGod, reason) {
    const from = this.gods[fromGod] || this.gods.Zeus;
    const to = this.gods[toGod] || this.gods.Zeus;

    console.log(from.color(`\n[${fromGod}]: `) + reason);
    console.log(chalk.gray('\n...'));
    
    // Brief pause for effect
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log(to.color(`\n[${toGod}]: `) + to.greeting);
  }

  /**
   * Display thinking/processing indicator
   * @param {string} godName - Name of the thinking god
   * @param {string} action - What they're doing
   */
  async showThinking(godName, action = 'analyzing') {
    const god = this.gods[godName] || this.gods.Zeus;
    console.log(chalk.gray(`\n[${godName} is ${action}...]`));
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  /**
   * Zeus's discovery conversation
   * @param {Object} state - Conversation state
   * @returns {Promise<Object>} Discovery results
   */
  async zeusDiscovery(state, projectIdea) {
    this.godSpeak('Zeus', `${projectIdea} - what an intriguing vision! To ensure we create exactly what you imagine, I'd like to understand a few things:`);

    // Core discovery questions
    const questions = [
      {
        key: 'users',
        question: "Who do you envision as the primary users of this?"
      },
      {
        key: 'core_feature',
        question: "What single feature would make this indispensable?"
      },
      {
        key: 'experience',
        question: "Is there a particular feeling or experience you want users to have?"
      }
    ];

    const discovery = {};

    for (const q of questions) {
      const answer = await this.godAsk('Zeus', q.question);
      discovery[q.key] = answer;
      await state.addResponse(q.question, answer);
    }

    // Determine next god based on answers
    let nextGod = 'Prometheus'; // Default
    let transitionReason = "Excellent insights! Based on what you've shared, I'll bring in Prometheus to help define the specific features.";

    // Check for design-heavy requirements
    if (discovery.experience && (
      discovery.experience.toLowerCase().includes('beautiful') ||
      discovery.experience.toLowerCase().includes('design') ||
      discovery.experience.toLowerCase().includes('intuitive')
    )) {
      nextGod = 'Apollo';
      transitionReason = "I can see that design and user experience are crucial to your vision. Let me bring in Apollo, our design maestro.";
    }

    // Check for technical/architecture needs
    if (discovery.core_feature && (
      discovery.core_feature.toLowerCase().includes('scale') ||
      discovery.core_feature.toLowerCase().includes('performance') ||
      discovery.core_feature.toLowerCase().includes('architecture')
    )) {
      nextGod = 'Daedalus';
      transitionReason = "This requires solid architectural thinking. Let me summon Daedalus, our master architect.";
    }

    return {
      discovery,
      nextGod,
      transitionReason
    };
  }

  /**
   * Prometheus's product planning conversation
   * @param {Object} state - Conversation state
   * @returns {Promise<Object>} Product plan
   */
  async prometheusPlanning(state) {
    const questions = [
      {
        key: 'mvp_features',
        question: "What are the 3-5 core features for your MVP?"
      },
      {
        key: 'user_journey',
        question: "Walk me through a user's first experience with your product."
      },
      {
        key: 'success_metrics',
        question: "How will you measure success?"
      }
    ];

    const plan = {};

    for (const q of questions) {
      const answer = await this.godAsk('Prometheus', q.question);
      plan[q.key] = answer;
      await state.addResponse(q.question, answer);
    }

    return plan;
  }

  /**
   * Apollo's design conversation
   * @param {Object} state - Conversation state
   * @returns {Promise<Object>} Design direction
   */
  async apolloDesign(state) {
    const questions = [
      {
        key: 'visual_style',
        question: "Describe the visual style you envision - modern, classic, playful, professional?"
      },
      {
        key: 'emotions',
        question: "What emotions should users feel when using your product?"
      },
      {
        key: 'inspiration',
        question: "Are there any products or designs that inspire you?"
      }
    ];

    const design = {};

    for (const q of questions) {
      const answer = await this.godAsk('Apollo', q.question);
      design[q.key] = answer;
      await state.addResponse(q.question, answer);
    }

    return design;
  }

  /**
   * Close the readline interface
   */
  close() {
    this.rl.close();
  }
}