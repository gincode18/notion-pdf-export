# Notion to Markdown/PDF Converter

A Next.js application that converts Notion pages to Markdown with syntax highlighting and PDF export capabilities. Built with React, TypeScript, and the Notion API.

## Features

- Convert Notion pages to beautifully formatted Markdown
- Syntax highlighting for code blocks
- Print to PDF functionality
- Copy markdown to clipboard
- Dark mode support for code blocks
- Responsive design
- Server-side processing with Next.js server actions

## Prerequisites

- Node.js 18+ 
- A Notion integration token
- Notion pages must be shared with your integration

## Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/notion-to-markdown-pdf.git
cd notion-to-markdown-pdf
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with your Notion API key:

```bash
NOTION_API_KEY=your_notion_api_key
```

## Usage

1. Copy the URL of a Notion page that's shared with your integration
2. Paste the URL into the converter
3. Click "Convert to Markdown"
4. You can then:
   - View the formatted markdown with syntax highlighting
   - Copy the raw markdown to clipboard
   - Print the document to PDF

## Project Structure

```
notion-export/
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── notion.ts      # Server actions for Notion conversion
│   │   ├── components/
│   │   │   └── NotionConverter.tsx  # Main converter component
│   │   └── page.tsx           # Main page component
├── public/
│   └── tmp/                   # Temporary storage for generated files
├── .env.local                 # Environment variables
└── package.json
```

## Key Technologies

- **Next.js** - React framework with server actions
- **@notionhq/client** - Official Notion API client
- **notion-to-md** - Converts Notion blocks to markdown
- **react-markdown** - Renders markdown as React components
- **react-syntax-highlighter** - Code syntax highlighting
- **remark-gfm** - GitHub Flavored Markdown support



## Development

To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project as you wish.

## Acknowledgments

- [Notion API Documentation](https://developers.notion.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [notion-to-md](https://github.com/souvikinator/notion-to-md)

## Support

For issues and feature requests, please use the GitHub issues page.
```

