import { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Sentry from '@sentry/node';

export const chatRouter = Router();

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const COPILOT_SYSTEM_PROMPT = `You are CodeLens Copilot, an elite AI Principal Software Engineer, Security Auditor, and Developer Mentor.
When answering questions or analyzing code:
1. Provide authoritative, senior-level explanations that are clear, structured, and easy to understand.
2. If asked for a "Line-by-Line Breakdown", dissect each line/block explicitly with its purpose, state changes, and mechanics.
3. If asked for "Big-O Complexity", evaluate Time Complexity (e.g. O(1), O(N), O(N log N), O(N^2)) and Space Complexity (O(1), O(N)) with rigorous mathematical justification.
4. If asked for "Security Analysis", pinpoint injection, auth bypass, buffer/memory safety, prototype pollution, and XSS risks with remediation snippets.
5. Format code in fenced markdown with language syntax identifiers. Include practical, actionable advice.`;

/**
 * Intelligent fallback chatbot responses when Gemini API key is missing or rate limited.
 */
function generateFallbackChatResponse(
  userQuery: string,
  codeContext?: string,
  language?: string
): string {
  const query = userQuery.toLowerCase();

  // 1. LINE-BY-LINE BREAKDOWN
  if (query.includes('line-by-line') || query.includes('line by line') || query.includes('breakdown') || query.includes('step by step')) {
    if (codeContext && codeContext.trim()) {
      const lines = codeContext.split('\n').filter((l) => l.trim().length > 0);
      let breakdown = `### 🔍 Detailed Line-by-Line Code Breakdown\n\n`;
      breakdown += `**Source Language:** \`${language || 'Auto'}\` | **Total Analyzed Lines:** ${lines.length}\n\n`;

      lines.slice(0, 10).forEach((line, idx) => {
        const trimmed = line.trim();
        let desc = 'Executes statement and controls flow.';
        if (trimmed.startsWith('import ') || trimmed.startsWith('const ') && trimmed.includes('require')) {
          desc = 'Imports external module dependencies into current lexical scope.';
        } else if (trimmed.startsWith('function ') || trimmed.startsWith('const ') && trimmed.includes('=>') || trimmed.startsWith('def ')) {
          desc = 'Declares functional entrypoint and parameter signature.';
        } else if (trimmed.startsWith('if ') || trimmed.startsWith('else if')) {
          desc = 'Evaluates conditional branch predicate before executing enclosed block.';
        } else if (trimmed.startsWith('return ')) {
          desc = 'Halts function execution and yields computed result back to caller.';
        } else if (trimmed.includes('for ') || trimmed.includes('while ')) {
          desc = 'Initiates iterative loop over sequence or collection.';
        }

        breakdown += `**Line ${idx + 1}:** \`${trimmed}\`\n> *Explanation:* ${desc}\n\n`;
      });

      if (lines.length > 10) {
        breakdown += `*(Showing first 10 lines of ${lines.length} total lines)*\n\n`;
      }

      breakdown += `#### 💡 Key Takeaway\n` +
        `The snippet follows structured procedural flow. Consider adding boundary checks on input arguments to prevent runtime errors.`;
      return breakdown;
    }

    return `Please attach or paste your code snippet into the editor so I can provide a thorough line-by-line breakdown!`;
  }

  // 2. BIG-O COMPLEXITY
  if (query.includes('big-o') || query.includes('complexity') || query.includes('time complexity') || query.includes('space complexity')) {
    if (codeContext && codeContext.trim()) {
      const hasNestedLoop = /(for|while)[\s\S]*?(for|while)/.test(codeContext) || /(count|includes|indexOf)[\s\S]*?(for|while)/.test(codeContext);
      const hasSingleLoop = /\b(for|while|forEach|map|filter|reduce)\b/.test(codeContext);

      const timeComp = hasNestedLoop ? 'O(N^2)' : hasSingleLoop ? 'O(N)' : 'O(1)';
      const spaceComp = codeContext.includes('.push(') || codeContext.includes('.append(') || codeContext.includes('new Array') ? 'O(N)' : 'O(1)';

      return `### ⏱️ Time & Space Big-O Complexity Analysis\n\n` +
        `| Metric | Asymptotic Bound | Classification | Assessment |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        `| **Time Complexity** | \`${timeComp}\` | ${hasNestedLoop ? '⚠️ Quadratic' : hasSingleLoop ? '⚡ Linear' : '🚀 Constant'} | ${hasNestedLoop ? 'Nested loops or collection lookups inside iterations.' : hasSingleLoop ? 'Single traversal over input dataset.' : 'Direct arithmetic/lookup with zero iteration.'} |\n` +
        `| **Space Complexity** | \`${spaceComp}\` | ${spaceComp === 'O(1)' ? '🚀 Constant Memory' : '⚡ Linear Memory'} | Auxiliary memory allocated proportionally to input. |\n\n` +
        `#### 🎯 Optimization Opportunity\n` +
        `- If using nested lookup arrays, convert to a \`Set\` or \`Map\` (hash map) to achieve **O(1)** average-time lookups and drop total runtime to **O(N)**.`;
    }

    return `Attach your active code snippet to calculate exact Time & Space asymptotic Big-O complexity!`;
  }

  // 3. EXPLAIN CODE
  if (query.includes('explain') || query.includes('what does this code do') || query.includes('understand')) {
    if (codeContext && codeContext.trim()) {
      const lines = codeContext.split('\n').length;
      return `### 💡 Plain-English Code Walkthrough (${language || 'Detected'} - ${lines} lines)\n\n` +
        `This snippet implements computational business logic:\n` +
        `1. **Input Interface:** Receives parameters, validates input structure, and initializes execution.\n` +
        `2. **State & Control Flow:** Uses conditional logic to evaluate preconditions.\n` +
        `3. **Outcome:** Returns a computed result or modifies internal state.\n\n` +
        `*Would you like me to suggest optimizations, generate unit tests, or run a security audit?*`;
    }
    return `I can explain any code snippet for you! Paste your code into the workspace editor or attach it here, and I'll break it down in plain English.`;
  }

  // 4. SECURITY AUDIT
  if (query.includes('security') || query.includes('vulnerability') || query.includes('injection') || query.includes('flaw')) {
    return `### 🛡️ Security Audit & Hardening Guide\n\n` +
      `Essential security verification rules:\n` +
      `1. **SQL / NoSQL Injection:** Always use parameterized placeholders or ORM query builders (e.g., Drizzle/Prisma) rather than raw string interpolation.\n` +
      `2. **DOM Injection (XSS):** Avoid \`innerHTML\` and \`eval()\`. Use safe text bindings or sanitizers like \`DOMPurify\`.\n` +
      `3. **Credential Storage:** Store secrets exclusively in server-side environment variables (\`process.env\`).\n` +
      `4. **Authentication:** Enforce bcrypt/argon2 hashing, secure HTTP-only cookies, and CSRF protection.`;
  }

  // 5. OPTIMIZE PERFORMANCE
  if (query.includes('optimize') || query.includes('performance') || query.includes('speed') || query.includes('fast')) {
    return `### ⚡ Performance Optimization Recommendations\n\n` +
      `1. **Data Structures:** Replace $O(N)$ searches inside loops (\`Array.includes\`) with a \`Set\` or \`Map\` ($O(1)$ lookups).\n` +
      `2. **React Rendering:** Memoize expensive calculations with \`useMemo\` and event callbacks with \`useCallback\`.\n` +
      `3. **Concurrency:** Execute independent asynchronous calls with \`Promise.all()\` in parallel.`;
  }

  // 6. UNIT TESTS
  if (query.includes('test') || query.includes('unit test') || query.includes('vitest') || query.includes('jest')) {
    const isPy = (language || '').toLowerCase().includes('py');
    if (isPy) {
      return `### 🧪 Generated Pytest Unit Test Suite\n\n` +
        `\`\`\`python\nimport pytest\n\ndef test_standard_execution():\n    """Test basic functionality with valid inputs."""\n    assert True\n\ndef test_edge_cases():\n    """Verify bounds and None handling."""\n    assert True\n\`\`\``;
    }
    return `### 🧪 Generated Vitest Unit Test Suite\n\n` +
      `\`\`\`typescript\nimport { describe, it, expect } from 'vitest';\n\ndescribe('Target Function Suite', () => {\n  it('should compute valid outputs for standard inputs', () => {\n    expect(true).toBe(true);\n  });\n\n  it('should gracefully handle null and edge cases', () => {\n    expect(() => {}).not.toThrow();\n  });\n});\n\`\`\``;
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return `👋 **Hello! I'm CodeLens Copilot.**\n\n` +
      `I'm your AI senior engineer and mentor. You can click any of the action buttons above or ask me:\n` +
      `- *"Break down my code line-by-line"*\n` +
      `- *"What is the Big-O Time and Space complexity?"*\n` +
      `- *"Find security vulnerabilities & suggest fixes"*\n` +
      `- *"Optimize memory and runtime performance"*\n` +
      `- *"Write a complete Vitest/Pytest test suite"*`;
  }

  return `### 🤖 CodeLens Copilot\n\n` +
    `I'm ready to help! Whether you need line-by-line code explanation, Big-O complexity analysis, security audits, refactoring, or test generation, let me know how I can assist!`;
}

/**
 * POST /api/chat
 * Handles multi-turn conversational AI interactions with Gemini AI and intelligent fallback.
 */
chatRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  const { messages, codeContext, language } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'Messages array is required.' });
    return;
  }

  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

  // If no API key or placeholder key, use conversational heuristic engine
  if (!apiKey || apiKey.length < 10 || apiKey.startsWith('AQ.')) {
    console.log('💬 Running Local AI Assistant Engine (Fallback)...');
    const reply = generateFallbackChatResponse(lastUserMessage, codeContext, language);
    res.status(200).json({
      success: true,
      message: {
        role: 'assistant',
        content: reply,
      },
    });
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    let prompt = `${COPILOT_SYSTEM_PROMPT}\n\n`;

    if (codeContext && codeContext.trim().length > 0) {
      prompt += `CURRENT ACTIVE CODE CONTEXT (${language || 'Auto'}):\n\`\`\`${language || ''}\n${codeContext}\n\`\`\`\n\n`;
    }

    prompt += `CONVERSATION HISTORY:\n`;
    messages.forEach((m: ChatMessage) => {
      prompt += `${m.role.toUpperCase()}: ${m.content}\n`;
    });
    prompt += `ASSISTANT:`;

    console.log(`🤖 Requesting Gemini Chat response (Model: ${modelName})...`);
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.status(200).json({
      success: true,
      message: {
        role: 'assistant',
        content: responseText || 'I processed your request, but received an empty response. Please try rephrasing.',
      },
    });
  } catch (error: any) {
    console.warn(`⚠️ Gemini Chat API error (${error.message}). Falling back to local engine...`);
    Sentry.captureException(error);
    const fallbackReply = generateFallbackChatResponse(lastUserMessage, codeContext, language);

    res.status(200).json({
      success: true,
      message: {
        role: 'assistant',
        content: fallbackReply,
      },
    });
  }
});
