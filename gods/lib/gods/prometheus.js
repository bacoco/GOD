import { ConversationalBaseGod } from '../conversational/conversational-base-god.js';

/**
 * Prometheus - The God of Product Management and Forethought
 * Specializes in defining product requirements, user stories, and strategic roadmaps.
 */
export class Prometheus extends ConversationalBaseGod {
  constructor(options) {
    super(options);
    this.name = 'prometheus';
  }

  /**
   * Overrides the default conversational style with a product-focused persona.
   */
  getDefaultConversationalStyle() {
    return {
      personality: {
        traits: ['analytical', 'user-focused', 'methodical', 'inquisitive'],
        tone: 'thoughtful and probing',
        approach: 'requirements discovery and problem validation'
      },
      patterns: {
        greeting: 'warm and professional',
        questions: 'open-ended and clarifying',
        transitions: 'logical and context-driven'
      }
    };
  }

  /**
   * Starts a conversation with a focus on product management.
   * @param {string} topic - The initial topic of the conversation.
   * @param {object} config - Configuration for the conversation.
   * @returns {Promise<object>} - The session, agent, and initial response.
   */
  async startConversation(topic, config = {}) {
    const conversationSpec = {
      baseAgent: 'product-manager', // Use a specialized base agent
      adaptations: {
        focus: `Elicit clear, actionable requirements and user stories for: ${topic}`,
        tools: ['generate-prd', 'user-story-creator', 'session-state'],
        context: {
          topic,
          godRole: this.name,
          persona: this.persona
        },
        personality: this.conversationalStyle.personality,
        ...config.adaptations
      }
    };

    return super.startConversation(topic, { ...config, ...conversationSpec });
  }

  /**
   * Generates a Product Requirements Document (PRD) from the session context.
   * @param {string} type - The type of document to generate (should be 'PRD').
   * @param {object} context - The context containing the session data.
   * @returns {Promise<string>} - The generated PRD in Markdown format.
   */
  async generateDocumentation(type, context) {
    if (type.toUpperCase() !== 'PRD') {
      return super.generateDocumentation(type, context);
    }

    const { session } = context;
    if (!session) {
      throw new Error('A session is required to generate a PRD.');
    }

    const sessionContext = session.getContextForGod(this.name).full;

    const prdAgent = await this.createSubAgent('prd-generator', {
      baseAgent: 'docs-writer',
      adaptations: {
        focus: 'Generate a comprehensive and well-structured Product Requirements Document (PRD).',
        format: 'markdown',
        style: 'clear, concise, and unambiguous, suitable for engineering and design teams.'
      }
    });

    const prdContent = {
      title: `PRD: ${sessionContext.project.name || topic}`,
      introduction: sessionContext.project.description || 'N/A',
      problemStatement: sessionContext.requirements.problem || 'N/A',
      userPersonas: sessionContext.requirements.userPersonas || [],
      features: sessionContext.requirements.functional || [],
      userStories: sessionContext.requirements.userStories || [],
      nonFunctionalRequirements: sessionContext.requirements.nonFunctional || [],
      successMetrics: sessionContext.project.metrics || []
    };

    const result = await prdAgent.execute({
      task: 'generate_prd_from_json',
      data: prdContent
    });

    return result.content;
  }
}

export default Prometheus;
