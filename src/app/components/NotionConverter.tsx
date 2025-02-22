'use client'

import { useFormStatus } from 'react-dom'
import { useState, useTransition } from 'react'
import { convertNotionToMarkdown } from '@/app/actions/notion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'

const MarkdownStyles = `
  .markdown-body {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  .markdown-body h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #111;
  }
  
  .markdown-body h2 {
    font-size: 1.8rem;
    font-weight: 600;
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: #333;
  }
  
  .markdown-body h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: #444;
  }
  
  .markdown-body p {
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 1rem;
    color: #374151;
  }
  
  .markdown-body ul, .markdown-body ol {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
  }
  
  .markdown-body li {
    margin-bottom: 0.5rem;
  }
  
  .markdown-body code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: ui-monospace, monospace;
    font-size: 0.9em;
  }
  
  .markdown-body pre {
    background-color: #1f2937;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    margin: 1rem 0;
  }
  
  .markdown-body pre code {
    background-color: transparent;
    padding: 0;
    color: #e5e7eb;
  }
  
  .markdown-body blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1rem;
    margin: 1rem 0;
    color: #6b7280;
  }
  
  .markdown-body a {
    color: #2563eb;
    text-decoration: underline;
  }
  
  .markdown-body hr {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin: 2rem 0;
  }
  
  @media print {
    .markdown-body {
      padding: 0;
    }
    
    .markdown-body pre {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
  }
`

export function NotionConverter() {
  const { pending } = useFormStatus()
  const [isPending, startTransition] = useTransition()
  const [markdown, setMarkdown] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await convertNotionToMarkdown(formData)
      if (result.markdown) {
        setMarkdown(result.markdown)
      }
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style jsx global>{MarkdownStyles}</style>
      <div className="w-full max-w-4xl mx-auto">
        <div className="print:hidden space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="notionUrl" className="text-sm font-medium">
                Notion Page URL
              </label>
              <input
                type="url"
                id="notionUrl"
                name="notionUrl"
                required
                placeholder="https://www.notion.so/your-page"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={pending || isPending}
              className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-5 disabled:opacity-50"
            >
              {(pending || isPending) ? 'Converting...' : 'Convert to Markdown'}
            </button>
          </form>
        </div>

        {markdown && (
          <div className="space-y-4">
            <div className="print:hidden">
              <textarea
                value={markdown}
                readOnly
                className="w-full h-[200px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent font-mono text-sm"
              />
            </div>

            <div className="markdown-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({node, inline, className, children, ...props}: {
                    node?: any;
                    inline?: boolean;
                    className?: string;
                    children?: React.ReactNode;
                  } & React.HTMLAttributes<HTMLElement>) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={tomorrow}
                        language={match[1]}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code {...props} className={className}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {markdown}
              </ReactMarkdown>
            </div>

            <div className="flex gap-4 print:hidden mt-6">
              <button
                onClick={() => navigator.clipboard.writeText(markdown)}
                className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-5"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-5"
              >
                Print Document
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}