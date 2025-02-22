'use client'

import { useFormStatus } from 'react-dom'
import { useState, useTransition } from 'react'
import { convertNotionToMarkdown } from '@/app/actions/notion'
import { pdf } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import ReactMarkdown from 'react-markdown'

// Add PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
  },
  text: {
    marginBottom: 10,
    fontFamily: 'Helvetica',
  },
});

// Add PDF Document component
const PDFDocument = ({ markdown }: { markdown: string }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View>
        <Text style={styles.text}>{markdown}</Text>
      </View>
    </Page>
  </Document>
);

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

  // Add download PDF function
  const downloadPDF = async () => {
    if (!markdown) return;
    
    const blob = await pdf(<PDFDocument markdown={markdown} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'notion-export.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSubmit} className="w-full space-y-4">
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

      {markdown && (
        <div className="space-y-4">
          <textarea
            value={markdown}
            readOnly
            className="w-full h-[500px] px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent font-mono text-sm"
          />
          <div className="flex gap-4">
            <button
              onClick={() => navigator.clipboard.writeText(markdown)}
              className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-5"
            >
              Copy to Clipboard
            </button>
            <button
              onClick={downloadPDF}
              className="flex-1 rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-12 px-5"
            >
              Download PDF
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 