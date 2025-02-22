'use server'

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import markdownPdf from 'markdown-pdf';
import hljs from 'highlight.js';

// Custom CSS copied from index.js
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

pre {
  padding: 1em;
  background: #f6f8fa;
  border-radius: 4px;
  overflow-x: auto;
}

code {
  font-family: 'Courier New', Courier, monospace;
  background: #f6f8fa;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}
`;

const pdfOptions = {
  remarkable: {
    html: true,
    breaks: true,
    typographer: true,
    highlight: function (code: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {}
      }
      try {
        return hljs.highlightAuto(code).value;
      } catch (err) {
        return code;
      }
    }
  },
  cssPath: null,
  paperFormat: 'A4',
  paperOrientation: 'portrait',
  paperBorder: '1.2cm',
  runningsPath: null,
  cssStylesToInclude: customCSS,
  renderDelay: 2000,
  timeout: 100000,
};

export async function convertNotionToPDF(formData: FormData) {
  try {
    console.log('Starting PDF conversion process...');
    const notionUrl = formData.get('notionUrl');
    console.log('Received Notion URL:', notionUrl);

    if (!notionUrl || typeof notionUrl !== 'string') {
      console.log('Invalid Notion URL provided');
      return {
        message: 'Notion URL is required',
        pdfPath: null
      };
    }
    
    // Extract page ID from URL
    let pageId = notionUrl.split('?')[0].split('-').pop();
    if (pageId?.includes('/')) {
      pageId = pageId.split('/').pop();
    }
    pageId = pageId?.replace(/-/g, '') ?? '';
    console.log('Extracted Page ID:', pageId);

    // Initialize Notion client
    console.log('Initializing Notion client...');
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // Get page content
    console.log('Fetching page content from Notion...');
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    console.log('Converting blocks to markdown...');
    const mdString = await n2m.toMarkdownString(mdBlocks);
    
    const content = typeof mdString === 'object' && mdString.parent 
      ? `# Notion Export\n\n${mdString.parent}`
      : mdString.toString();
    console.log('Markdown content length:', content.length);

    // Create temporary files in the public directory
    const tmpDir = join(process.cwd(), 'public', 'tmp');
    console.log('Creating temporary directory:', tmpDir);
    await mkdir(tmpDir, { recursive: true });
    
    const mdPath = join(tmpDir, `${pageId}.md`);
    const pdfPath = join(tmpDir, `${pageId}.pdf`);
    console.log('Markdown path:', mdPath);
    console.log('PDF path:', pdfPath);

    // Save markdown file
    await writeFile(mdPath, content);
    console.log('Markdown file saved successfully');

    // Convert to PDF using markdown-pdf
    console.log('Starting PDF conversion...');
    return new Promise((resolve) => {
      markdownPdf(pdfOptions)
        .from.string(content)
        .to(pdfPath, function(err) {
          if (err) {
            console.error('PDF conversion error:', err);
            resolve({
              message: 'Failed to convert to PDF',
              pdfPath: null
            });
          } else {
            console.log('PDF conversion completed successfully');
            resolve({
              message: '',
              pdfPath: `/tmp/${pageId}.pdf`
            });
          }
        });
    });

  } catch (error) {
    console.error('Error converting Notion to PDF:', error);
    return {
      message: 'Failed to convert Notion page to PDF. Please check the URL and try again.',
      pdfPath: null
    };
  }
} 