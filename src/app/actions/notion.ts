"use server";

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// export async function convertNotionToPDF(formData: FormData) {
//   try {
//     console.log("Starting PDF conversion process...");
//     const notionUrl = formData.get("notionUrl");
//     console.log("Received Notion URL:", notionUrl);

//     if (!notionUrl || typeof notionUrl !== "string") {
//       console.log("Invalid Notion URL provided");
//       return {
//         message: "Notion URL is required",
//         pdfPath: null,
//       };
//     }

//     // Extract page ID from URL
//     let pageId = notionUrl.split("?")[0].split("-").pop();
//     if (pageId?.includes("/")) {
//       pageId = pageId.split("/").pop();
//     }
//     pageId = pageId?.replace(/-/g, "") ?? "";
//     console.log("Extracted Page ID:", pageId);

//     // Initialize Notion client
//     console.log("Initializing Notion client...");
//     const notion = new Client({ auth: process.env.NOTION_API_KEY });
//     const n2m = new NotionToMarkdown({ notionClient: notion });

//     // Get page content
//     console.log("Fetching page content from Notion...");
//     const mdBlocks = await n2m.pageToMarkdown(pageId);
//     console.log("Converting blocks to markdown...");
//     const mdString = await n2m.toMarkdownString(mdBlocks);

//     const content =
//       typeof mdString === "object" && mdString.parent
//         ? `# Notion Export\n\n${mdString.parent}`
//         : mdString.toString();
//     console.log("Markdown content length:", content.length);

//     // Create temporary files in the public directory
//     const tmpDir = join(process.cwd(), "public", "tmp");
//     console.log("Creating temporary directory:", tmpDir);
//     await mkdir(tmpDir, { recursive: true });

//     const mdPath = join(tmpDir, `${pageId}.md`);
//     const pdfPath = join(tmpDir, `${pageId}.pdf`);
//     console.log("Markdown path:", mdPath);
//     console.log("PDF path:", pdfPath);

//     // Save markdown file
//     await writeFile(mdPath, content);
//     console.log("Markdown file saved successfully");

//     // Replace the PDF conversion part
//     console.log("Starting PDF conversion...");
//     const pdf = await mdToPdf({
//       path: mdPath,
//     });

//     if (!pdf) {
//       throw new Error("PDF conversion failed");
//     }

//     // Save the PDF
//     await writeFile(pdfPath, pdf.content);
//     console.log("PDF conversion completed successfully");

//     return {
//       message: "",
//       pdfPath: `/tmp/${pageId}.pdf`,
//     };
//   } catch (error) {
//     console.error("Error converting Notion to PDF:", error);
//     return {
//       message:
//         "Failed to convert Notion page to PDF. Please check the URL and try again.",
//       pdfPath: null,
//     };
//   }
// }

export async function convertNotionToMarkdown(formData: FormData) {
  try {
    const notionUrl = formData.get("notionUrl");

    if (!notionUrl || typeof notionUrl !== "string") {
      return {
        message: "Notion URL is required",
        markdown: null,
      };
    }

    // Extract page ID from URL
    let pageId = notionUrl.split("?")[0].split("-").pop();
    if (pageId?.includes("/")) {
      pageId = pageId.split("/").pop();
    }
    pageId = pageId?.replace(/-/g, "") ?? "";

    // Initialize Notion client
    const notion = new Client({ auth: process.env.NOTION_API_KEY });
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // Get page content
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = await n2m.toMarkdownString(mdBlocks);

    const content =
      typeof mdString === "object" && mdString.parent
        ? `# Notion Export\n\n${mdString.parent}`
        : mdString.toString();

    return {
      message: "",
      markdown: content,
    };
  } catch (error) {
    console.error("Error converting Notion to Markdown:", error);
    return {
      message: "Failed to convert Notion page. Please check the URL and try again.",
      markdown: null,
    };
  }
}
