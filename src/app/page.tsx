import { DownloadButton } from "@/app/components/NotionConverter";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-center sm:text-left">
          Notion to PDF Converter
        </h1>

        <div className="w-full space-y-4">
          <DownloadButton />
        </div>

        <div className="text-sm text-center sm:text-left space-y-2">
          <p>Instructions:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              Make sure your Notion page is public or shared with the
              integration
            </li>
            <li>Copy and paste your Notion page URL above</li>
            <li>Click convert and wait for your PDF to download</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
