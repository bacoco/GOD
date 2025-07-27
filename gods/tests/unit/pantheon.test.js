import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { PantheonCore } from '../../lib/pantheon-core.js';
import { BaseGod } from '../../lib/base-god.js';

describe('Pantheon Core', () => {
  let pantheon;
  let mockClaudeFlow;

  beforeEach(() => {
    mockClaudeFlow = {
      agents: {},
      tasks: {},
      memory: {},
      on: () => {},
      off: () => {},
      emit: () => {}
    };
    
    pantheon = new PantheonCore(mockClaudeFlow);
  });

  it('should initialize successfully', async () => {
    await pantheon.initialize();
    assert.ok(pantheon.godFactory);
    assert.ok(pantheon.divineMessenger);
  });

  it('should load god configurations', async () => {
    await pantheon.initialize();
    const gods = pantheon.getAvailableGods();
    assert.ok(gods.includes('zeus'));
    assert.ok(gods.includes('janus'));
    assert.equal(gods.length, 16);
  });

  it('should summon a god', async () => {
    await pantheon.initialize();
    const zeus = await pantheon.summonGod('zeus');
    assert.ok(zeus);
    assert.equal(zeus.name, 'zeus');
  });
});

describe('BaseGod', () => {
  let god;

  beforeEach(() => {
    god = new BaseGod({
      name: 'test-god',
      config: { capabilities: ['test'] }
    });
  });

  it('should create sub-agents', async () => {
    god.factory = {
      createSubAgent: async () => ({ id: 'sub-1', type: 'test' })
    };
    
    const subAgent = await god.createSubAgent('test-type');
    assert.ok(subAgent);
    assert.equal(subAgent.id, 'sub-1');
  });

  it('should handle memory operations', async () => {
    await god.remember('key', 'value');
    const value = await god.recall('key');
    assert.equal(value, 'value');
  });

  it('should track metrics', () => {
    const status = god.getStatus();
    assert.ok(status.metrics);
    assert.equal(status.metrics.tasksCompleted, 0);
  });
});