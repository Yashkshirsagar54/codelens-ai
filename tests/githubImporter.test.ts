import { describe, it, expect } from 'vitest';
import { parseGitHubUrl, detectLanguageFromFilename } from '../src/lib/githubImporter';

describe('GitHub Importer Suite', () => {
  describe('detectLanguageFromFilename', () => {
    it('accurately identifies programming languages from file extensions', () => {
      expect(detectLanguageFromFilename('App.tsx')).toBe('typescript');
      expect(detectLanguageFromFilename('server.js')).toBe('javascript');
      expect(detectLanguageFromFilename('main.py')).toBe('python');
      expect(detectLanguageFromFilename('algo.cpp')).toBe('cpp');
      expect(detectLanguageFromFilename('Application.java')).toBe('java');
      expect(detectLanguageFromFilename('styles.css')).toBe('css');
      expect(detectLanguageFromFilename('index.html')).toBe('html');
      expect(detectLanguageFromFilename('config.json')).toBe('json');
    });
  });

  describe('parseGitHubUrl', () => {
    it('parses standard GitHub blob URLs into raw content URLs', () => {
      const result = parseGitHubUrl('https://github.com/facebook/react/blob/main/packages/react/src/React.js');
      expect(result.rawUrl).toBe('https://raw.githubusercontent.com/facebook/react/main/packages/react/src/React.js');
      expect(result.filename).toBe('React.js');
      expect(result.isPrOrDiff).toBe(false);
    });

    it('parses GitHub Gist URLs into raw Gist URLs', () => {
      const result = parseGitHubUrl('https://gist.github.com/octocat/6cad326836d38bd3a7ae');
      expect(result.rawUrl).toBe('https://gist.githubusercontent.com/octocat/6cad326836d38bd3a7ae/raw');
      expect(result.isPrOrDiff).toBe(false);
    });

    it('parses GitHub Pull Request URLs into .diff URLs', () => {
      const result = parseGitHubUrl('https://github.com/vercel/next.js/pull/12345');
      expect(result.rawUrl).toBe('https://github.com/vercel/next.js/pull/12345.diff');
      expect(result.filename).toBe('pr-12345.diff');
      expect(result.isPrOrDiff).toBe(true);
    });

    it('preserves already raw URLs unmodified', () => {
      const raw = 'https://raw.githubusercontent.com/user/repo/main/code.py';
      const result = parseGitHubUrl(raw);
      expect(result.rawUrl).toBe(raw);
      expect(result.filename).toBe('code.py');
    });
  });
});
