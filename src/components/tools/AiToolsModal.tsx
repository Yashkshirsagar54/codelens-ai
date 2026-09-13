import React, { useState } from 'react';
import {
  X,
  Sparkles,
  BookOpen,
  Languages,
  FileCode2,
  Copy,
  Check,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import { explainCode, translateCode, generateDocs } from '../../lib/apiClient';

interface AiToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  code: string;
  language: string;
  onApplyCode: (newCode: string) => void;
  getToken?: () => Promise<string | null>;
}

export const AiToolsModal: React.FC<AiToolsModalProps> = ({
  isOpen,
  onClose,
  code,
  language,
  onApplyCode,
  getToken,
}) => {
  const [activeTab, setActiveTab] = useState<'explain' | 'translate' | 'docgen'>('explain');
  const [targetLanguage, setTargetLanguage] = useState<string>('python');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [translatedResult, setTranslatedResult] = useState<string | null>(null);
  const [documentedResult, setDocumentedResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExplain = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await explainCode(code, language, getToken);
      setExplanationResult(res.explanation);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to explain code.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslate = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await translateCode(code, language, targetLanguage, getToken);
      setTranslatedResult(res.translatedCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to translate code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDocs = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await generateDocs(code, language, getToken);
      setDocumentedResult(res.documentedCode);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate documentation.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">AI Developer Tools Suite</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Transform, explain, and document your source code with AI.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('explain')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'explain'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Code Explainer</span>
          </button>

          <button
            onClick={() => setActiveTab('translate')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'translate'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Code Translator</span>
          </button>

          <button
            onClick={() => setActiveTab('docgen')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'docgen'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800/60'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Docstring &amp; JSDoc Generator</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {/* TAB 1: CODE EXPLAINER */}
          {activeTab === 'explain' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">AI Plain-English Code Walkthrough</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Breaks down algorithms, logic flows, state mutations, and edge cases.</p>
                </div>
                <button
                  onClick={handleExplain}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? 'Analyzing...' : 'Generate Explanation'}</span>
                </button>
              </div>

              {explanationResult ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap shadow-xs">
                  {explanationResult}
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                  Click "Generate Explanation" to receive a comprehensive analysis of the code snippet currently loaded in your editor.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CODE TRANSLATOR */}
          {activeTab === 'translate' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 dark:text-slate-400">Convert from <strong className="text-slate-900 dark:text-white capitalize">{language}</strong> to:</span>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-purple-500 shadow-xs"
                  >
                    <option value="python">Python</option>
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <button
                  onClick={handleTranslate}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>{loading ? 'Translating...' : 'Translate Code'}</span>
                </button>
              </div>

              {translatedResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Translated Output ({targetLanguage})
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(translatedResult)}
                        className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onApplyCode(translatedResult);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] text-white px-3 py-1 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 font-bold shadow-xs cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Insert in Editor</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto max-h-[350px] shadow-inner">
                    <code>{translatedResult}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                  Select your target language and click "Translate Code" to generate an idiomatic equivalent snippet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DOCSTRING GENERATOR */}
          {activeTab === 'docgen' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Auto-Generate JSDoc / Docstrings</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Adds param annotations, return types, and descriptions to all methods.</p>
                </div>

                <button
                  onClick={handleGenerateDocs}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-purple-600/25 transition-all disabled:opacity-40 cursor-pointer"
                >
                  <FileCode2 className="w-3.5 h-3.5" />
                  <span>{loading ? 'Generating...' : 'Generate Docstrings'}</span>
                </button>
              </div>

              {documentedResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Documented Code</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(documentedResult)}
                        className="flex items-center gap-1 text-[11px] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy'}</span>
                      </button>
                      <button
                        onClick={() => {
                          onApplyCode(documentedResult);
                          onClose();
                        }}
                        className="flex items-center gap-1 text-[11px] text-white px-3 py-1 rounded-xl bg-gradient-to-r from-[#159C63] to-teal-600 hover:opacity-90 font-bold shadow-xs cursor-pointer"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Insert in Editor</span>
                      </button>
                    </div>
                  </div>
                  <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[350px] shadow-inner">
                    <code>{documentedResult}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-8 text-center bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-slate-500 dark:text-slate-400 text-xs shadow-xs">
                  Click "Generate Docstrings" to annotate your functions with industry-standard documentation blocks.
                </div>
              )}
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs">
              {errorMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
