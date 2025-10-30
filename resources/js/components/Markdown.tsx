import React, { memo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'

interface MarkdownProps {
  children: string
}

// Memoize to prevent unnecessary re-renders during streaming
function Markdown({ children }: MarkdownProps) {
  // If content is empty or just whitespace, render as plain text
  if (!children?.trim()) {
    return <span>{children}</span>
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeHighlight]}
        skipHtml={true} // Security: skip HTML for performance
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

export default memo(Markdown)
