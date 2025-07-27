// Export all workflows
export { default as fullStackDev } from './full-stack-dev.js';
export { default as productPlanning } from './product-planning.js';
export { default as designSystem } from './design-system.js';

// Workflow registry
export const workflows = {
  'full-stack-dev': {
    name: 'Full Stack Development',
    description: 'Complete application development workflow',
    module: './full-stack-dev.js'
  },
  'product-planning': {
    name: 'Product Planning',
    description: 'Product strategy and roadmap workflow',
    module: './product-planning.js'
  },
  'design-system': {
    name: 'Design System',
    description: 'UI/UX design system creation workflow',
    module: './design-system.js'
  }
};

export default workflows;