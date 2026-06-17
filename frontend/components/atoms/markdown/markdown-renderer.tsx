"use client";

import React from "react";
import ReactMarkdown, { Components, defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer = ({ 
  content, 
  className 
}: MarkdownRendererProps) => {
  const components: Components = {
    p: ({ children }) => (
      <p className="mb-4 last:mb-0 leading-relaxed">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-xl font-bold mb-4 mt-6 first:mt-0 tracking-tight">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-bold mb-3 mt-5 first:mt-0 tracking-tight">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-bold mb-2 mt-4 first:mt-0 tracking-tight">{children}</h3>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-sm">{children}</li>
    ),
    strong: ({ children }) => (
      <strong className="font-black text-foreground">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic opacity-90">{children}</em>
    ),
    a: ({ href, children }) => {
      if (href?.startsWith("mention:")) {
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[13px] cursor-pointer hover:bg-primary/20 transition-colors">
            {children}
          </span>
        );
      }
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary underline underline-offset-4 hover:text-primary/80 transition-colors font-medium"
        >
          {children}
        </a>
      );
    },
    code: ({ children }) => (
      <code className="px-1.5 py-0.5 rounded-md bg-muted font-mono text-[13px] text-primary border border-border/50">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="p-4 rounded-xl bg-muted/50 border border-border/50 overflow-x-auto my-4 font-mono text-sm scrollbar-hide">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="pl-4 border-l-4 border-primary/20 italic text-muted-foreground my-4">
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-border/50" />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-sm text-left">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/50 border-b border-border/50 text-[10px] uppercase font-bold tracking-wider">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-2">{children}</th>,
    td: ({ children }) => <td className="px-4 py-2 border-t border-border/10">{children}</td>,
  };

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none break-words", className)}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={components}
        urlTransform={(url) => {
          if (url.startsWith("mention:")) {
            return url;
          }
          return defaultUrlTransform(url);
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
