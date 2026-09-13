/**
 * githubImporter.ts — Parses GitHub URLs, Gists, and Pull Requests to fetch source code or git diffs.
 */

export interface GitHubImportResult {
  code: string;
  filename: string;
  language: string;
  isDiff?: boolean;
}

/**
 * Detects programming language from file extension or diff syntax.
 */
export function detectLanguageFromFilename(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) return 'typescript';
  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs')) return 'javascript';
  if (lower.endsWith('.py')) return 'python';
  if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.h') || lower.endsWith('.hpp') || lower.endsWith('.c')) return 'cpp';
  if (lower.endsWith('.java')) return 'java';
  if (lower.endsWith('.html') || lower.endsWith('.htm')) return 'html';
  if (lower.endsWith('.css') || lower.endsWith('.scss')) return 'css';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.diff') || lower.endsWith('.patch')) return 'javascript';
  return 'auto';
}

/**
 * Converts a GitHub web URL into a raw content URL
 * Examples:
 * https://github.com/octocat/Hello-World/blob/master/README.md -> https://raw.githubusercontent.com/octocat/Hello-World/master/README.md
 * https://gist.github.com/user/123456 -> https://gist.githubusercontent.com/user/123456/raw
 */
export function parseGitHubUrl(inputUrl: string): { rawUrl: string; filename: string; isPrOrDiff: boolean } {
  let trimmed = inputUrl.trim();

  // If already raw url
  if (trimmed.includes('raw.githubusercontent.com') || trimmed.includes('gist.githubusercontent.com')) {
    const filename = trimmed.split('/').pop()?.split('?')[0] || 'snippet';
    return { rawUrl: trimmed, filename, isPrOrDiff: false };
  }

  // Gist URL: https://gist.github.com/username/gistId
  const gistMatch = trimmed.match(/gist\.github\.com\/([^/]+)\/([a-zA-Z0-9]+)/);
  if (gistMatch) {
    return {
      rawUrl: `https://gist.githubusercontent.com/${gistMatch[1]}/${gistMatch[2]}/raw`,
      filename: 'gist_snippet',
      isPrOrDiff: false,
    };
  }

  // Pull Request URL: https://github.com/owner/repo/pull/123
  const prMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
  if (prMatch) {
    return {
      rawUrl: `https://github.com/${prMatch[1]}/${prMatch[2]}/pull/${prMatch[3]}.diff`,
      filename: `pr-${prMatch[3]}.diff`,
      isPrOrDiff: true,
    };
  }

  // Commit URL: https://github.com/owner/repo/commit/abc1234
  const commitMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/commit\/([a-f0-9]+)/);
  if (commitMatch) {
    return {
      rawUrl: `https://github.com/${commitMatch[1]}/${commitMatch[2]}/commit/${commitMatch[3]}.diff`,
      filename: `commit-${commitMatch[3].slice(0, 7)}.diff`,
      isPrOrDiff: true,
    };
  }

  // Blob File URL: https://github.com/owner/repo/blob/branch/.../filename.ext
  const blobMatch = trimmed.match(/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)/);
  if (blobMatch) {
    const [, owner, repo, branch, filepath] = blobMatch;
    const filename = filepath.split('/').pop() || 'snippet';
    return {
      rawUrl: `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filepath}`,
      filename,
      isPrOrDiff: false,
    };
  }

  // Fallback direct url
  const filename = trimmed.split('/').pop()?.split('?')[0] || 'snippet';
  return { rawUrl: trimmed, filename, isPrOrDiff: false };
}

/**
 * Fetches file content from a GitHub URL or raw URL.
 */
export async function fetchGitHubContent(url: string): Promise<GitHubImportResult> {
  const { rawUrl, filename, isPrOrDiff } = parseGitHubUrl(url);

  try {
    const response = await fetch(rawUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch from GitHub (HTTP ${response.status}). Ensure the repository/file is public.`);
    }

    const text = await response.text();
    if (!text || text.trim().length === 0) {
      throw new Error('Retrieved file is empty.');
    }

    const language = detectLanguageFromFilename(filename);

    return {
      code: text,
      filename,
      language,
      isDiff: isPrOrDiff,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Could not fetch GitHub resource. Please check the URL.');
  }
}
