/**
 * Tests for Session State Management Library
 * 
 * These tests verify that session state:
 * - Initializes correctly
 * - Saves and loads from disk
 * - Tracks progress accurately
 * - Handles errors gracefully
 */

const {
  initializeSession,
  saveSessionState,
  loadSessionState,
  updatePhaseProgress,
  addGeneratedFile,
  listSavedProjects
} = require('../lib-implementations/session-state');

describe('Session State Management', () => {
  const testProjectName = 'test-project';
  const testProjectPath = '/tmp/test-project';
  
  beforeEach(() => {
    // Clean up any existing test sessions
    jest.clearAllMocks();
  });

  describe('initializeSession', () => {
    test('creates new session with default values', () => {
      const session = initializeSession(testProjectName, testProjectPath);
      
      expect(session.projectName).toBe(testProjectName);
      expect(session.projectPath).toBe(testProjectPath);
      expect(session.startedAt).toBeDefined();
      expect(session.phases).toEqual([]);
      expect(session.completedPhases).toEqual([]);
      expect(session.generatedFiles).toEqual([]);
      expect(session.currentPhase).toBe(0);
    });

    test('generates unique session ID', () => {
      const session1 = initializeSession('project1');
      const session2 = initializeSession('project2');
      
      expect(session1.id).toBeDefined();
      expect(session2.id).toBeDefined();
      expect(session1.id).not.toBe(session2.id);
    });
  });

  describe('saveSessionState', () => {
    test('persists session to disk', async () => {
      const session = initializeSession(testProjectName);
      session.generatedFiles = ['src/index.js', 'src/models/User.js'];
      
      const saved = await saveSessionState(session);
      
      expect(saved).toBe(true);
      // Verify file exists at expected location
      expect(mockFileSystem.exists(getSessionPath(session))).toBe(true);
    });

    test('handles save errors gracefully', async () => {
      const session = initializeSession(testProjectName);
      // Simulate write error
      mockFileSystem.throwOnWrite = true;
      
      const saved = await saveSessionState(session);
      
      expect(saved).toBe(false);
      expect(session.lastError).toBeDefined();
    });
  });

  describe('loadSessionState', () => {
    test('loads existing session from disk', async () => {
      const originalSession = initializeSession(testProjectName);
      originalSession.completedPhases = ['Phase 1', 'Phase 2'];
      await saveSessionState(originalSession);
      
      const loadedSession = await loadSessionState(testProjectName);
      
      expect(loadedSession.projectName).toBe(testProjectName);
      expect(loadedSession.completedPhases).toEqual(['Phase 1', 'Phase 2']);
    });

    test('returns null for non-existent session', async () => {
      const session = await loadSessionState('non-existent-project');
      
      expect(session).toBeNull();
    });
  });

  describe('updatePhaseProgress', () => {
    test('tracks phase completion', () => {
      let session = initializeSession(testProjectName);
      session.phases = [
        { number: 1, name: 'Foundation' },
        { number: 2, name: 'Features' },
        { number: 3, name: 'Testing' }
      ];
      
      session = updatePhaseProgress(session, 'Foundation');
      
      expect(session.completedPhases).toContain('Foundation');
      expect(session.currentPhase).toBe(1);
      expect(session.progress).toBe(33); // 1/3 phases complete
    });

    test('handles final phase completion', () => {
      let session = initializeSession(testProjectName);
      session.phases = [{ number: 1, name: 'Single Phase' }];
      
      session = updatePhaseProgress(session, 'Single Phase');
      
      expect(session.progress).toBe(100);
      expect(session.completedAt).toBeDefined();
    });
  });

  describe('addGeneratedFile', () => {
    test('tracks generated files', () => {
      let session = initializeSession(testProjectName);
      
      session = addGeneratedFile(session, 'src/index.js');
      session = addGeneratedFile(session, 'src/models/User.js');
      
      expect(session.generatedFiles).toHaveLength(2);
      expect(session.generatedFiles).toContain('src/index.js');
    });

    test('prevents duplicate file entries', () => {
      let session = initializeSession(testProjectName);
      
      session = addGeneratedFile(session, 'src/index.js');
      session = addGeneratedFile(session, 'src/index.js'); // Duplicate
      
      expect(session.generatedFiles).toHaveLength(1);
    });
  });

  describe('listSavedProjects', () => {
    test('returns all saved project sessions', async () => {
      await saveSessionState(initializeSession('project1'));
      await saveSessionState(initializeSession('project2'));
      await saveSessionState(initializeSession('project3'));
      
      const projects = await listSavedProjects();
      
      expect(projects).toHaveLength(3);
      expect(projects.map(p => p.name)).toContain('project1');
      expect(projects.map(p => p.name)).toContain('project2');
      expect(projects.map(p => p.name)).toContain('project3');
    });
  });
});

// Mock file system for testing
const mockFileSystem = {
  files: {},
  throwOnWrite: false,
  
  exists(path) {
    return this.files.hasOwnProperty(path);
  },
  
  write(path, content) {
    if (this.throwOnWrite) {
      throw new Error('Write error');
    }
    this.files[path] = content;
  },
  
  read(path) {
    return this.files[path] || null;
  }
};
