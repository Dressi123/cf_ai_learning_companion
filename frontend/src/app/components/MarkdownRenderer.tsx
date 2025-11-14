'use client'

import { useEffect, useState, ReactNode } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'

/**
 * Props interface for the MarkdownRenderer component
 */
interface Props {
  content: string
  inline?: boolean // If true, renders as inline content without block elements
}

/**
 * Props interface for MDX components
 */
interface MDXComponentProps {
  children?: ReactNode
  href?: string
  className?: string
}

// Inline components - used when inline=true (no block-level elements)
const inlineComponents = {
  // Inline code
  code: ({ children }: MDXComponentProps) => (
    <code className="bg-[#333333] text-blue-500 px-1.5 py-0.5 rounded font-mono text-sm">
      {children}
    </code>
  ),
  p: ({ children }: MDXComponentProps) => <span className="text-gray-300">{children}</span>,
  strong: ({ children }: MDXComponentProps) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }: MDXComponentProps) => <em className="italic text-gray-300">{children}</em>,
  a: ({ children, href }: MDXComponentProps) => (
    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

// Custom components for markdown elements with proper styling
const components = {
  // Inline code
  code: ({ children, className }: MDXComponentProps) => {
    // Check if this is a code block (has className) or inline code
    const isCodeBlock = className?.startsWith('language-');

    if (isCodeBlock) {
      // Code block
      return (
        <code
          className="block bg-[#1e1e1e] text-gray-300 p-4 rounded-lg overflow-x-auto font-mono text-sm my-2"
        >
          {children}
        </code>
      );
    }

    // Inline code
    return (
      <code className="bg-[#333333] text-blue-500 px-1.5 py-0.5 rounded font-mono text-sm">
        {children}
      </code>
    );
  },
  // Pre tag for code blocks
  pre: ({ children }: MDXComponentProps) => (
    <pre className="bg-[#1e1e1e] rounded-lg overflow-x-auto my-4">
      {children}
    </pre>
  ),
  // Headers
  h1: ({ children }: MDXComponentProps) => (
    <h1 className="text-2xl font-bold text-white mb-4 mt-6">{children}</h1>
  ),
  h2: ({ children }: MDXComponentProps) => (
    <h2 className="text-xl font-bold text-white mb-3 mt-5">{children}</h2>
  ),
  h3: ({ children }: MDXComponentProps) => (
    <h3 className="text-lg font-bold text-white mb-2 mt-4">{children}</h3>
  ),
  // Paragraphs
  p: ({ children }: MDXComponentProps) => (
    <p className="text-gray-300 mb-2 leading-relaxed">{children}</p>
  ),
  // Lists
  ul: ({ children }: MDXComponentProps) => (
    <ul className="list-disc list-inside text-gray-300 mb-2 space-y-1 ml-4">{children}</ul>
  ),
  ol: ({ children }: MDXComponentProps) => (
    <ol className="list-decimal list-inside text-gray-300 mb-2 space-y-1 ml-4">{children}</ol>
  ),
  li: ({ children }: MDXComponentProps) => (
    <li className="text-gray-300">{children}</li>
  ),
  // Links
  a: ({ children, href }: MDXComponentProps) => (
    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  // Blockquotes
  blockquote: ({ children }: MDXComponentProps) => (
    <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-3">
      {children}
    </blockquote>
  ),
  // Strong/Bold
  strong: ({ children }: MDXComponentProps) => (
    <strong className="font-bold text-white">{children}</strong>
  ),
  // Emphasis/Italic
  em: ({ children }: MDXComponentProps) => (
    <em className="italic text-gray-300">{children}</em>
  ),
  // Horizontal rule
  hr: () => (
    <hr className="border-gray-600 my-4" />
  ),
  // Tables
  table: ({ children }: MDXComponentProps) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border border-gray-600">{children}</table>
    </div>
  ),
  thead: ({ children }: MDXComponentProps) => (
    <thead className="bg-[#333333]">{children}</thead>
  ),
  tbody: ({ children }: MDXComponentProps) => (
    <tbody>{children}</tbody>
  ),
  tr: ({ children }: MDXComponentProps) => (
    <tr className="border-b border-gray-600">{children}</tr>
  ),
  th: ({ children }: MDXComponentProps) => (
    <th className="px-4 py-2 text-left text-white font-semibold">{children}</th>
  ),
  td: ({ children }: MDXComponentProps) => (
    <td className="px-4 py-2 text-gray-300">{children}</td>
  ),
};

/**
 * MarkdownRenderer component for converting and displaying markdown content as React components
 * Uses next-mdx-remote to serialize markdown content and render it with MDX support
 *
 * @param props - The component props containing the markdown content
 * @returns JSX element containing the rendered markdown or loading state
 */
export default function MarkdownRenderer({ content, inline = false }: Props) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)

  /**
   * Effect hook to serialize markdown content when it changes
   * Converts raw markdown string to MDX format for safe rendering
   */
  useEffect(() => {
    /**
     * Asynchronous function to serialize markdown content
     * Handles serialization errors gracefully with console logging
     */
    const serializeContent = async () => {
      try {
        // Escape < and > that are not part of markdown/HTML tags
        // This prevents <= and >= from being interpreted as malformed tags
        const escapedContent = content
          .replace(/<=(?!\w)/g, '&lt;=')
          .replace(/(?<!\w)>=/g, '&gt;=');

        const serialized = await serialize(escapedContent, {
          mdxOptions: {
            development: false,
          },
        })
        setMdxSource(serialized)
      } catch (error) {
        console.error('Error serializing markdown:', error)
      }
    }

    serializeContent()
  }, [content])

  // Show loading state while content is being serialized
  if (!mdxSource) {
    return null
  }

  return <MDXRemote {...mdxSource} components={inline ? inlineComponents : components} />
}