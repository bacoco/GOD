/**
 * Tests for Framework Detector Library
 * 
 * These tests verify framework detection for:
 * - JavaScript/TypeScript projects
 * - Package manager detection
 * - Test runner identification
 * - Build tool detection
 */

const {
  detectFramework,
  detectPackageManager,
  detectTestCommand,
  detectBuildTool,
  getFrameworkDefaults
} = require('../lib-implementations/framework-detector');

describe('Framework Detector', () => {
  describe('detectFramework', () => {
    test('detects React project', () => {
      const mockFiles = {
        'package.json': JSON.stringify({
          dependencies: { react: '^18.0.0', 'react-dom': '^18.0.0' }
        })
      };
      
      const framework = detectFramework('/project', mockFiles);
      
      expect(framework.name).toBe('react');
      expect(framework.version).toBe('18');
      expect(framework.type).toBe('frontend');
    });

    test('detects Next.js project', () => {
      const mockFiles = {
        'package.json': JSON.stringify({
          dependencies: { next: '^13.0.0', react: '^18.0.0' }
        }),
        'next.config.js': ''
      };
      
      const framework = detectFramework('/project', mockFiles);
      
      expect(framework.name).toBe('nextjs');
      expect(framework.type).toBe('fullstack');
    });

    test('detects Express project', () => {
      const mockFiles = {
        'package.json': JSON.stringify({
          dependencies: { express: '^4.18.0' }
        })
      };
      
      const framework = detectFramework('/project', mockFiles);
      
      expect(framework.name).toBe('express');
      expect(framework.type).toBe('backend');
    });

    test('returns null for unknown project type', () => {
      const mockFiles = {
        'package.json': JSON.stringify({ name: 'unknown-project' })
      };
      
      const framework = detectFramework('/project', mockFiles);
      
      expect(framework).toBeNull();
    });
  });

  describe('detectPackageManager', () => {
    test('detects npm (default)', () => {
      const mockFiles = {
        'package-lock.json': ''
      };
      
      const pm = detectPackageManager('/project', mockFiles);
      
      expect(pm).toBe('npm');
    });

    test('detects yarn', () => {
      const mockFiles = {
        'yarn.lock': ''
      };
      
      const pm = detectPackageManager('/project', mockFiles);
      
      expect(pm).toBe('yarn');
    });

    test('detects pnpm', () => {
      const mockFiles = {
        'pnpm-lock.yaml': ''
      };
      
      const pm = detectPackageManager('/project', mockFiles);
      
      expect(pm).toBe('pnpm');
    });

    test('detects bun', () => {
      const mockFiles = {
        'bun.lockb': ''
      };
      
      const pm = detectPackageManager('/project', mockFiles);
      
      expect(pm).toBe('bun');
    });
  });

  describe('detectTestCommand', () => {
    test('detects jest test command', () => {
      const mockFiles = {
        'package.json': JSON.stringify({
          scripts: { test: 'jest' },
          devDependencies: { jest: '^29.0.0' }
        })
      };
      
      const testCmd = detectTestCommand('/project', mockFiles);
      
      expect(testCmd).toBe('npm test');
    });

    test('detects custom test command with yarn', () => {
      const mockFiles = {
        'yarn.lock': '',
        'package.json': JSON.stringify({
          scripts: { test: 'mocha --recursive' }
        })
      };
      
      const testCmd = detectTestCommand('/project', mockFiles);
      
      expect(testCmd).toBe('yarn test');
    });

    test('returns null when no test command found', () => {
      const mockFiles = {
        'package.json': JSON.stringify({
          scripts: { build: 'webpack' }
        })
      };
      
      const testCmd = detectTestCommand('/project', mockFiles);
      
      expect(testCmd).toBeNull();
    });
  });

  describe('detectBuildTool', () => {
    test('detects webpack', () => {
      const mockFiles = {
        'webpack.config.js': ''
      };
      
      const buildTool = detectBuildTool('/project', mockFiles);
      
      expect(buildTool).toBe('webpack');
    });

    test('detects vite', () => {
      const mockFiles = {
        'vite.config.js': ''
      };
      
      const buildTool = detectBuildTool('/project', mockFiles);
      
      expect(buildTool).toBe('vite');
    });
  });

  describe('getFrameworkDefaults', () => {
    test('returns correct defaults for React', () => {
      const defaults = getFrameworkDefaults('react');
      
      expect(defaults.testFramework).toBe('jest');
      expect(defaults.componentExtension).toBe('.tsx');
      expect(defaults.srcDir).toBe('src');
    });

    test('returns correct defaults for Express', () => {
      const defaults = getFrameworkDefaults('express');
      
      expect(defaults.testFramework).toBe('mocha');
      expect(defaults.srcDir).toBe('src');
      expect(defaults.routerPattern).toBe('express.Router()');
    });
  });
});
