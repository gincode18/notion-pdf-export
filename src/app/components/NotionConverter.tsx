'use client'

import { useFormStatus } from 'react-dom'
import { useEffect, useTransition } from 'react'
import { convertNotionToPDF } from '@/app/actions/notion'

export function DownloadButton() {
  const { pending } = useFormStatus()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      const result = await convertNotionToPDF(formData)
      if (result.pdfPath) {
        window.location.href = result.pdfPath
      }
    })
  }

  return (
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
        {(pending || isPending) ? 'Converting...' : 'Convert to PDF'}
      </button>
    </form>
  )
} 