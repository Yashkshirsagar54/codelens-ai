import { jsPDF } from 'jspdf';
import { CodeIssue } from '@db/schema';
import { CodeMetrics, AnalysisMode } from './apiClient';

export interface ExportableAnalysis {
  id?: string;
  language?: string | null;
  mode?: AnalysisMode;
  overallScore: number;
  summary: string;
  issues: CodeIssue[];
  strengths: string[];
  code: string;
  refactoredCode?: string;
  generatedTests?: string;
  metrics?: CodeMetrics;
  createdAt?: string | Date;
}

/**
 * Helper to calculate Grade from numeric score
 */
function getScoreGrade(score: number): { grade: string; label: string; color: [number, number, number] } {
  if (score >= 90) return { grade: 'A+', label: 'EXCEPTIONAL', color: [16, 185, 129] }; // Emerald
  if (score >= 80) return { grade: 'A', label: 'PRODUCTION READY', color: [34, 197, 94] }; // Green
  if (score >= 70) return { grade: 'B', label: 'GOOD QUALITY', color: [59, 130, 246] }; // Blue
  if (score >= 50) return { grade: 'C', label: 'NEEDS REFACTOR', color: [245, 158, 11] }; // Amber
  return { grade: 'F', label: 'CRITICAL RISKS', color: [239, 68, 68] }; // Red
}

/**
 * Downloads data as a JSON file
 */
export function exportToJson(analysis: ExportableAnalysis): void {
  const jsonString = JSON.stringify(analysis, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codelens-audit-${analysis.id || 'export'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads data as a Markdown document
 */
export function exportToMarkdown(analysis: ExportableAnalysis): void {
  const gradeInfo = getScoreGrade(analysis.overallScore);
  const createdDate = analysis.createdAt ? new Date(analysis.createdAt).toLocaleString() : new Date().toLocaleString();

  let md = `# 🛡️ CodeLens AI — Executive Code Security & Quality Audit\n\n`;
  md += `**Audit Report ID:** \`${analysis.id || 'AUDIT-' + Date.now()}\`\n`;
  md += `**Date:** ${createdDate}\n`;
  md += `**Target Language:** ${(analysis.language || 'Auto-detected').toUpperCase()}\n`;
  md += `**Analysis Mode:** ${(analysis.mode || 'general').toUpperCase()}\n`;
  md += `**Overall Security & Quality Score:** **${analysis.overallScore} / 100** (${gradeInfo.grade} - ${gradeInfo.label})\n\n`;

  md += `---\n\n`;

  if (analysis.metrics) {
    md += `## 📊 Code Complexity & Architecture Metrics\n\n`;
    md += `| Metric Parameter | Measured Value | Standard Target |\n`;
    md += `| :--- | :--- | :--- |\n`;
    md += `| **Maintainability Index** | ${analysis.metrics.maintainabilityIndex} / 100 | > 75 |\n`;
    md += `| **Security Compliance Score** | ${analysis.metrics.securityScore} / 100 | > 85 |\n`;
    md += `| **Performance Efficiency** | ${analysis.metrics.performanceScore} / 100 | > 80 |\n`;
    md += `| **Cyclomatic Complexity** | ${analysis.metrics.cyclomaticComplexity} | < 15 |\n`;
    md += `| **Cognitive Complexity** | ${analysis.metrics.cognitiveLoad} | Low |\n`;
    md += `| **Lines of Code (LOC)** | ${analysis.metrics.linesOfCode} lines | Optimal |\n`;
    md += `| **Comment Documentation Ratio** | ${analysis.metrics.commentRatio}% | > 15% |\n\n`;
  }

  md += `## 📝 Executive Summary\n${analysis.summary}\n\n`;

  if (analysis.strengths && analysis.strengths.length > 0) {
    md += `## ✅ Verified Architectural Strengths\n`;
    analysis.strengths.forEach((strength) => {
      md += `- ✓ **${strength}**\n`;
    });
    md += `\n`;
  }

  if (analysis.issues && analysis.issues.length > 0) {
    md += `## ⚠️ Identified Vulnerabilities & Code Issues (${analysis.issues.length})\n\n`;
    analysis.issues.forEach((issue, idx) => {
      md += `### ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}\n`;
      if (issue.line) md += `*Offending Line:* Line ${issue.line}\n\n`;
      md += `**Detailed Impact:**\n${issue.description}\n\n`;
      md += `**AI Suggested Remediation:**\n\`\`\`\n${issue.suggestion}\n\`\`\`\n\n`;
    });
  }

  if (analysis.refactoredCode) {
    md += `## 🚀 Full AI Optimized Code Patch\n\`\`\`${analysis.language || ''}\n${analysis.refactoredCode}\n\`\`\`\n\n`;
  }

  if (analysis.generatedTests) {
    md += `## 🧪 Production Unit & Edge-Case Test Suite\n\`\`\`${analysis.language || ''}\n${analysis.generatedTests}\n\`\`\`\n\n`;
  }

  md += `---\n*Generated automatically by CodeLens AI Enterprise Code Review Suite.*`;

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `codelens-audit-${analysis.id || 'export'}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a branded, high-fidelity Executive PDF Audit Report
 */
export function exportToPdf(analysis: ExportableAnalysis): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const gradeInfo = getScoreGrade(analysis.overallScore);
  const auditId = analysis.id ? analysis.id.slice(0, 16) : `AUD-${Date.now()}`;
  const reportDate = analysis.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  let currentPage = 1;

  const drawPageFrame = () => {
    // Dark sleek background
    doc.setFillColor(11, 15, 25); // Deep slate
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Subtle header accent line
    doc.setFillColor(21, 156, 99); // Emerald
    doc.rect(0, 0, pageWidth, 2.5, 'F');

    // Page footer
    doc.setDrawColor(30, 41, 59);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`CodeLens AI Enterprise Audit Suite — Reference: ${auditId}`, marginX, pageHeight - 7);
    doc.text(`Page ${currentPage}`, pageWidth - marginX - 12, pageHeight - 7);
  };

  // Draw Page 1 Base
  drawPageFrame();

  // --- BRAND HEADER ---
  let cursorY = 14;

  doc.setTextColor(94, 210, 156); // Brand green
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('CODELENS AI', marginX, cursorY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('EXECUTIVE CODE SECURITY & ARCHITECTURE AUDIT', marginX, cursorY + 5);

  // Scorecard Badge Card in Header Top Right
  const badgeW = 60;
  const badgeH = 20;
  const badgeX = pageWidth - marginX - badgeW;
  doc.setFillColor(19, 27, 44);
  doc.setDrawColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  doc.roundedRect(badgeX, cursorY - 4, badgeW, badgeH, 2.5, 2.5, 'FD');

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(gradeInfo.color[0], gradeInfo.color[1], gradeInfo.color[2]);
  doc.text(`${analysis.overallScore}/100`, badgeX + 6, cursorY + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text(`GRADE ${gradeInfo.grade}`, badgeX + 32, cursorY + 3);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(gradeInfo.label, badgeX + 32, cursorY + 8);

  cursorY += 22;

  // --- METADATA STRIP ---
  doc.setFillColor(17, 24, 39);
  doc.roundedRect(marginX, cursorY, contentWidth, 11, 2, 2, 'F');

  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');

  const metaCols = [
    `AUDIT ID: ${auditId}`,
    `LANGUAGE: ${(analysis.language || 'Auto').toUpperCase()}`,
    `AUDIT MODE: ${(analysis.mode || 'General').toUpperCase()}`,
    `DATE: ${reportDate}`,
  ];

  metaCols.forEach((text, i) => {
    doc.text(text, marginX + 4 + i * 46, cursorY + 7);
  });

  cursorY += 17;

  // --- EXECUTIVE SUMMARY SECTION ---
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('1. EXECUTIVE AUDIT SUMMARY', marginX, cursorY);
  cursorY += 4.5;

  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(30, 41, 59);
  const summaryLines = doc.splitTextToSize(analysis.summary, contentWidth - 8);
  const summaryBoxH = Math.max(16, summaryLines.length * 4.2 + 6);

  doc.roundedRect(marginX, cursorY, contentWidth, summaryBoxH, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(226, 232, 240);
  doc.text(summaryLines, marginX + 4, cursorY + 5);

  cursorY += summaryBoxH + 7;

  // --- CODE METRICS GRID ---
  if (analysis.metrics) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('2. ARCHITECTURE & COMPLEXITY BENCHMARKS', marginX, cursorY);
    cursorY += 4.5;

    const metricItems = [
      { name: 'Maintainability Index', val: `${analysis.metrics.maintainabilityIndex}/100`, target: '> 75' },
      { name: 'Security Score', val: `${analysis.metrics.securityScore}/100`, target: '> 85' },
      { name: 'Performance Score', val: `${analysis.metrics.performanceScore}/100`, target: '> 80' },
      { name: 'Cyclomatic Complexity', val: `${analysis.metrics.cyclomaticComplexity}`, target: '< 15' },
      { name: 'Cognitive Load', val: `${analysis.metrics.cognitiveLoad}`, target: 'Low' },
      { name: 'Lines of Code', val: `${analysis.metrics.linesOfCode} LOC`, target: 'Optimal' },
    ];

    const cardW = (contentWidth - 10) / 3;
    const cardH = 13;

    metricItems.forEach((m, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const x = marginX + col * (cardW + 5);
      const y = cursorY + row * (cardH + 3);

      doc.setFillColor(17, 24, 39);
      doc.setDrawColor(30, 41, 59);
      doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

      doc.setFontSize(6.8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(m.name, x + 3.5, y + 4.5);

      doc.setFontSize(9);
      doc.setTextColor(94, 210, 156);
      doc.setFont('helvetica', 'bold');
      doc.text(m.val, x + 3.5, y + 10);

      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(`Target: ${m.target}`, x + cardW - 18, y + 10);
    });

    cursorY += (cardH + 3) * 2 + 6;
  }

  // --- OBSERVED STRENGTHS ---
  if (analysis.strengths && analysis.strengths.length > 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('3. VERIFIED ARCHITECTURAL STRENGTHS', marginX, cursorY);
    cursorY += 4.5;

    analysis.strengths.slice(0, 4).forEach((str) => {
      doc.setFillColor(16, 185, 129, 25);
      doc.setFontSize(7.5);
      doc.setTextColor(52, 211, 153);
      doc.text(`✓  ${str}`, marginX + 3, cursorY + 2);
      cursorY += 5;
    });
    cursorY += 4;
  }

  // --- IDENTIFIED ISSUES SECTION ---
  if (analysis.issues && analysis.issues.length > 0) {
    if (cursorY > 230) {
      doc.addPage();
      currentPage++;
      drawPageFrame();
      cursorY = 16;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`4. IDENTIFIED VULNERABILITIES & FIX RECOMMENDATIONS (${analysis.issues.length})`, marginX, cursorY);
    cursorY += 6;

    analysis.issues.forEach((issue, index) => {
      const descLines = doc.splitTextToSize(issue.description, contentWidth - 10);
      const suggLines = doc.splitTextToSize(`Fix: ${issue.suggestion}`, contentWidth - 10);
      const boxHeight = 12 + descLines.length * 3.8 + suggLines.length * 3.8;

      if (cursorY + boxHeight > pageHeight - 18) {
        doc.addPage();
        currentPage++;
        drawPageFrame();
        cursorY = 16;
      }

      // Issue Card Container
      doc.setFillColor(17, 24, 39);
      doc.setDrawColor(issue.severity === 'high' ? 239 : issue.severity === 'medium' ? 245 : 59, 68, 68);
      doc.roundedRect(marginX, cursorY, contentWidth, boxHeight, 2, 2, 'FD');

      // Severity Pill
      const sevColor =
        issue.severity === 'high'
          ? [239, 68, 68]
          : issue.severity === 'medium'
          ? [245, 158, 11]
          : [59, 130, 246];

      doc.setFillColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.roundedRect(marginX + 3, cursorY + 3, 14, 4.5, 1, 1, 'F');
      doc.setFontSize(6);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(issue.severity.toUpperCase(), marginX + 4.5, cursorY + 6.3);

      // Title & Line
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      const titleText = `${index + 1}. ${issue.title}${issue.line ? ` [Line ${issue.line}]` : ''}`;
      doc.text(titleText, marginX + 20, cursorY + 6.5);

      let textY = cursorY + 11;

      // Description
      doc.setFontSize(7.2);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(203, 213, 225);
      doc.text(descLines, marginX + 4, textY);
      textY += descLines.length * 3.8 + 2;

      // Suggestion
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(94, 210, 156);
      doc.text(suggLines, marginX + 4, textY);

      cursorY += boxHeight + 4;
    });
  }

  // --- REFACTORED CODE SNIPPET SECTION ---
  if (analysis.refactoredCode) {
    if (cursorY > 200) {
      doc.addPage();
      currentPage++;
      drawPageFrame();
      cursorY = 16;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('5. AI OPTIMIZED CODE PATCH', marginX, cursorY);
    cursorY += 5;

    doc.setFillColor(15, 23, 42);
    doc.setDrawColor(30, 41, 59);

    const codeSnippet = analysis.refactoredCode.split('\n').slice(0, 25).join('\n');
    const codeLines = doc.splitTextToSize(codeSnippet, contentWidth - 8);
    const codeBoxH = Math.min(65, codeLines.length * 3.6 + 6);

    doc.roundedRect(marginX, cursorY, contentWidth, codeBoxH, 2, 2, 'FD');

    doc.setFontSize(6.8);
    doc.setFont('courier', 'normal');
    doc.setTextColor(167, 243, 208);
    doc.text(codeLines, marginX + 4, cursorY + 5);

    cursorY += codeBoxH + 6;
  }

  // Save the generated PDF
  doc.save(`CodeLens-Audit-Report-${auditId}.pdf`);
}
