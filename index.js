require("dotenv").config();
const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");
const markdownPdf = require("markdown-pdf");
const fs = require("fs");
const path = require("path");
const hljs = require('highlight.js');

// Initialize Notion Client
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Custom CSS for dark mode and better formatting
const customCSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: #0d1117;
  color: #c9d1d9;
  line-height: 1.7;
  padding: 3em;
  max-width: 1000px;
  margin: 0 auto;
}

h1, h2, h3, h4, h5, h6 {
  color: #ffffff;
  margin-top: 2em;
  margin-bottom: 1em;
  font-weight: 600;
  letter-spacing: -0.02em;
}

h1 { 
  font-size: 2.5em; 
  border-bottom: 2px solid #30363d; 
  padding-bottom: 0.3em;
  color: #58a6ff;
}

h2 { 
  font-size: 2em; 
  border-bottom: 1px solid #30363d; 
  padding-bottom: 0.2em;
  color: #58a6ff;
}

h3 { 
  font-size: 1.6em; 
  color: #58a6ff;
}

p { 
  margin: 1.2em 0;
  line-height: 1.8;
}

code {
  font-family: 'Fira Code', 'JetBrains Mono', 'Consolas', monospace;
  background-color: #1f2937;
  color: #e6e6e6;
  padding: 0.2em 0.4em;
  border-radius: 6px;
  font-size: 0.9em;
  border: 1px solid #30363d;
}

pre {
  background-color: #1f2937;
  padding: 1.2em;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1.5em 0;
  border: 1px solid #30363d;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

pre code {
  background-color: transparent;
  padding: 0;
  border: none;
  font-size: 0.95em;
  line-height: 1.7;
}

blockquote {
  border-left: 4px solid #58a6ff;
  margin: 1.5em 0;
  padding: 1em 1.5em;
  background-color: #1f2937;
  border-radius: 0 8px 8px 0;
  font-style: italic;
}

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1.5em 0;
  background-color: #1f2937;
  border-radius: 8px;
  overflow: hidden;
}

th, td {
  border: 1px solid #30363d;
  padding: 12px 16px;
  text-align: left;
}

th {
  background-color: #2d3748;
  font-weight: 600;
  color: #ffffff;
}

tr:nth-child(even) {
  background-color: #242f3d;
}

a {
  color: #58a6ff;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

a:hover {
  border-bottom-color: #58a6ff;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1.5em 0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

hr {
  border: none;
  border-top: 2px solid #30363d;
  margin: 2.5em 0;
}

ul, ol {
  padding-left: 2em;
  margin: 1.2em 0;
}

li {
  margin: 0.5em 0;
}

/* Syntax highlighting theme */
.hljs {
  display: block;
  overflow-x: auto;
  padding: 1em;
  color: #c9d1d9;
  background: #1f2937;
}

.hljs-comment,
.hljs-quote {
  color: #8b949e;
  font-style: italic;
}

.hljs-keyword,
.hljs-selector-tag {
  color: #ff7b72;
}

.hljs-string,
.hljs-doctag {
  color: #a5d6ff;
}

.hljs-title,
.hljs-section,
.hljs-selector-id {
  color: #d2a8ff;
  font-weight: bold;
}

.hljs-template-variable,
.hljs-variable {
  color: #ff7b72;
}

.hljs-type,
.hljs-tag {
  color: #7ee787;
}

.hljs-name {
  color: #7ee787;
  font-weight: bold;
}

.hljs-regexp,
.hljs-link {
  color: #a5d6ff;
}

.hljs-symbol,
.hljs-bullet {
  color: #f2cc60;
}

.hljs-built_in,
.hljs-builtin-name {
  color: #ffa657;
}

.hljs-number {
  color: #a5d6ff;
}
`;

// PDF conversion options
const pdfOptions = {
  remarkable: {
    html: true,
    breaks: true,
    typographer: true,
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {}
      }
      // If language not found, try to auto-detect
      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {
        return code; // Return plain code if highlighting fails
      }
    }
  },
  cssPath: null, // We'll use our custom CSS
  paperFormat: 'A4',
  paperOrientation: 'portrait',
  paperBorder: '1.2cm',
  runningsPath: null,
  cssStylesToInclude: customCSS,
  phantomPath: require('phantomjs-prebuilt').path,
  renderDelay: 2000, // Give more time for fonts to load
  timeout: 100000, // Increased timeout for larger documents
};

async function getPageContent(pageId) {
  console.log(`Fetching content for page: ${pageId}...`);
  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    
    // Convert blocks to markdown string
    const mdString = await n2m.toMarkdownString(mdBlocks);
    
    if (typeof mdString === 'object' && mdString.parent) {
      // Add a title and some spacing at the top
      return `# CI/CD Process Management\n\n${mdString.parent}`;
    }
    return mdString;
  } catch (error) {
    console.error('Error in getPageContent:', error);
    throw error;
  }
}

async function exportNotionToPDF(pageUrl) {
  try {
    // Extract page ID from URL
    let pageId = pageUrl.split('?')[0].split('-').pop();
    if (pageId.includes('/')) {
      pageId = pageId.split('/').pop();
    }
    pageId = pageId.replace(/-/g, '');
    
    console.log('Extracted Page ID:', pageId);
    const content = await getPageContent(pageId);
    
    // Make sure content is a string before writing
    if (typeof content !== 'string') {
      console.error('Content type:', typeof content);
      console.error('Content value:', content);
      throw new Error('Content must be a string');
    }

    // Save markdown file
    fs.writeFileSync("notion.md", content);
    console.log("Markdown file saved.");

    // Convert to PDF with custom styling
    markdownPdf(pdfOptions)
      .from.string(content)
      .to("notion.pdf", () => {
        console.log("✅ PDF Exported: notion.pdf");
      });
  } catch (error) {
    console.error("Error:", error.message);
    if (error.code === 'notionhq_client_response_error') {
      console.error("Notion API Error. Make sure:");
      console.error("1. Your Notion API key is correct in .env file");
      console.error("2. The page is shared with your integration");
      console.error("3. The page ID is correct");
    }
  }
}

const notionPageURL =
  "https://www.notion.so/CI-CD-Process-management-1a2b8fc7dab580bba3b4d8592d9234f3";
exportNotionToPDF(notionPageURL);
