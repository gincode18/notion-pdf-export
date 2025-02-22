"use client";

import { useFormStatus } from "react-dom";
import { useEffect, useState, useTransition } from "react";
import { convertNotionToMarkdown } from "@/app/actions/notion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

export function NotionConverter() {
  const { pending } = useFormStatus();
  const [isPending, startTransition] = useTransition();
  const [markdown, setMarkdown] = useState<string | null>(null);
  const isPrint = useMediaQuery("print");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await convertNotionToMarkdown(formData);
      if (result.markdown) {
        setMarkdown(result.markdown);
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full space-y-6">
      <div className="print:hidden">
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
            {pending || isPending ? "Converting..." : "Convert to Markdown"}
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

          {/* Markdown Preview */}
          <div
            className={`
            prose dark:prose-invert max-w-none
            ${isPrint ? "" : "border rounded-lg p-8 bg-card"}
          `}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline && match ? (
                    <SyntaxHighlighter
                      {...props}
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code {...props} className={className}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {markdown}
            </ReactMarkdown>
          </div>

          <div className="flex gap-4 print:hidden">
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
  );
}

// Add this hook to your project
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [matches, query]);

  return matches;
}
