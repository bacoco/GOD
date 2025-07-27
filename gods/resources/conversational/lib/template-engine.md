# Template Engine for Pantheon

Processes and customizes code templates for project generation.

## Overview

The template engine:
- Loads templates from .claude/templates/
- Replaces variables with actual values
- Customizes for specific models
- Handles conditional sections
- Maintains code style consistency

## Template Format

### 1. Frontmatter
```yaml
---
name: rest-api-crud
description: RESTful CRUD API
framework: express
features: [api, crud, typescript]
---
```

### 2. Variables
```
{{variable}} - Simple replacement
{{ModelName}} - PascalCase version
{{modelName}} - camelCase version
{{model_name}} - snake_case version
{{model-name}} - kebab-case version
{{collection}} - Pluralized version
```

### 3. Conditionals
```
{{#if typescript}}
import { Request, Response } from 'express';
{{else}}
const express = require('express');
{{/if}}
```

## Variable Processing

### 1. Model Transformations
```typescript
function processModelName(name: string) {
  return {
    ModelName: toPascalCase(name),      // User
    modelName: toCamelCase(name),       // user
    model_name: toSnakeCase(name),      // user
    'model-name': toKebabCase(name),    // user
    collection: pluralize(name),        // users
    Collection: toPascalCase(pluralize(name)) // Users
  };
}
```

### 2. Custom Variables
```typescript
interface TemplateVariables {
  // Model-specific
  modelName: string;
  fields: Field[];
  relationships: Relationship[];
  
  // Project-specific
  projectName: string;
  framework: string;
  features: string[];
  
  // Configuration
  typescript: boolean;
  database: string;
  authentication: boolean;
}
```

## Template Processing

### 1. Load Template
```typescript
function loadTemplate(templateName: string): Template {
  const templatePath = `.claude/templates/${templateName}.md`;
  const content = readFile(templatePath);
  const { frontmatter, body } = parseFrontmatter(content);
  
  return {
    name: frontmatter.name,
    framework: frontmatter.framework,
    features: frontmatter.features,
    content: body
  };
}
```

### 2. Process Variables
```typescript
function processTemplate(
  template: string, 
  variables: TemplateVariables
): string {
  let processed = template;
  
  // Replace simple variables
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processed = processed.replace(regex, value);
  });
  
  // Process conditionals
  processed = processConditionals(processed, variables);
  
  // Process loops
  processed = processLoops(processed, variables);
  
  return processed;
}
```

### 3. Model Customization
```typescript
function customizeForModel(
  template: string,
  model: Entity
): string {
  let customized = template;
  
  // Replace generic "Item" with model name
  customized = customized.replace(/\bItem\b/g, model.name);
  customized = customized.replace(/\bitem\b/g, toCamelCase(model.name));
  
  // Insert field-specific code
  if (customized.includes('{{fields}}')) {
    const fieldCode = generateFieldCode(model.fields);
    customized = customized.replace('{{fields}}', fieldCode);
  }
  
  // Insert validation
  if (customized.includes('{{validations}}')) {
    const validationCode = generateValidation(model.fields);
    customized = customized.replace('{{validations}}', validationCode);
  }
  
  return customized;
}
```

## Template Matching

### 1. By Framework
```typescript
function findTemplatesByFramework(framework: string): Template[] {
  return templates.filter(t => 
    t.framework === framework || 
    t.framework === 'universal'
  );
}
```

### 2. By Features
```typescript
function findTemplatesByFeatures(features: string[]): Template[] {
  return templates.filter(t =>
    t.features.some(f => features.includes(f))
  );
}
```

### 3. Smart Matching
```typescript
function matchTemplates(
  project: ProjectInfo
): MatchedTemplate[] {
  const matches = [];
  
  // Match by framework
  const frameworkTemplates = findTemplatesByFramework(project.framework);
  
  // Match by features
  project.features.forEach(feature => {
    const featureTemplates = frameworkTemplates.filter(t =>
      isTemplateApplicable(t, feature)
    );
    
    matches.push(...featureTemplates.map(t => ({
      template: t,
      feature: feature,
      confidence: calculateConfidence(t, feature)
    })));
  });
  
  return matches.sort((a, b) => b.confidence - a.confidence);
}
```

## Integration with /gods

### During Plan
```typescript
// Find matching templates
const templates = matchTemplates({
  framework: detectedFramework,
  features: parsedFeatures,
  models: detectedModels
});

// Show to user
console.log("🧩 Available Templates:");
templates.forEach(t => {
  console.log(`  • ${t.template.name}: ${t.template.description}`);
});
```

### During Execute
```typescript
// For each matched template
for (const match of matchedTemplates) {
  // Load template
  const template = loadTemplate(match.template.name);
  
  // Customize for model
  const customized = customizeForModel(template.content, model);
  
  // Process variables
  const final = processTemplate(customized, {
    projectName,
    modelName: model.name,
    framework,
    // ... other variables
  });
  
  // Write file
  Write(outputPath, final);
}
```

## Benefits

1. **Consistency**: Same patterns across projects
2. **Customization**: Model-specific code
3. **Reusability**: Templates for common patterns
4. **Flexibility**: Easy to add new templates
5. **Quality**: Best practices built-in

The template engine ensures generated code follows best practices while being customized for each project.