/**
 * Tests for Model Generator Library
 * 
 * These tests verify that the model generator correctly:
 * - Parses feature text to extract entities
 * - Generates TypeScript interfaces
 * - Creates database schemas
 * - Detects relationships
 */

const {
  parseFeatureText,
  generateTypeScriptInterface,
  generateMongooseSchema,
  detectRelationships,
  extractFieldsFromDescription
} = require('../lib-implementations/model-generator');

describe('Model Generator', () => {
  describe('parseFeatureText', () => {
    test('extracts simple entities from feature description', () => {
      const text = 'Users can create Tasks with title and description';
      const entities = parseFeatureText(text);
      
      expect(entities).toHaveLength(2);
      expect(entities[0].name).toBe('User');
      expect(entities[1].name).toBe('Task');
      expect(entities[1].fields).toContainEqual(
        expect.objectContaining({ name: 'title', type: 'string' })
      );
    });

    test('detects relationships between entities', () => {
      const text = 'Users can create multiple Projects. Each Project has many Tasks.';
      const entities = parseFeatureText(text);
      const relationships = detectRelationships(entities);
      
      expect(relationships).toContainEqual(
        expect.objectContaining({
          from: 'User',
          to: 'Project',
          type: 'one-to-many'
        })
      );
    });

    test('identifies field types correctly', () => {
      const text = 'Product with name (string), price (number), inStock (boolean)';
      const entities = parseFeatureText(text);
      const product = entities.find(e => e.name === 'Product');
      
      expect(product.fields).toContainEqual({ name: 'name', type: 'string', required: true });
      expect(product.fields).toContainEqual({ name: 'price', type: 'number', required: true });
      expect(product.fields).toContainEqual({ name: 'inStock', type: 'boolean', required: true });
    });
  });

  describe('generateTypeScriptInterface', () => {
    test('generates correct interface for entity', () => {
      const entity = {
        name: 'User',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'email', type: 'string', required: true },
          { name: 'age', type: 'number', required: false }
        ]
      };
      
      const tsInterface = generateTypeScriptInterface(entity);
      
      expect(tsInterface).toContain('export interface User {');
      expect(tsInterface).toContain('id: string;');
      expect(tsInterface).toContain('email: string;');
      expect(tsInterface).toContain('age?: number;');
    });
  });

  describe('generateMongooseSchema', () => {
    test('generates valid Mongoose schema', () => {
      const entity = {
        name: 'Task',
        fields: [
          { name: 'title', type: 'string', required: true },
          { name: 'completed', type: 'boolean', required: true, default: false }
        ]
      };
      
      const schema = generateMongooseSchema(entity);
      
      expect(schema).toContain('const TaskSchema = new Schema({');
      expect(schema).toContain('title: { type: String, required: true }');
      expect(schema).toContain('completed: { type: Boolean, required: true, default: false }');
    });
  });
});
