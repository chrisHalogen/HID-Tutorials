# Best way to render markdown in react

Install in React:
```bash
npm install react-markdown remark-gfm rehype-raw react-syntax-highlighter
```

Create MarkdownRenderer.jsx:
```jsx
import React from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";

export default function MarkdownRenderer({ children }) {
  return (
    <Markdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children: codeChildren, ...props }) {
          const match = /language-(\w+)/.exec(className || "");

          return !inline && match ? (
            <SyntaxHighlighter
              style={dracula}
              PreTag="div"
              language={match[1]}
              {...props}
            >
              {String(codeChildren).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {codeChildren}
            </code>
          );
        },

        p({ node, children, ...props }) {
          return (
            <p
              style={{ marginBottom: "0.5rem", whiteSpace: "pre-line" }}
              {...props}
            >
              {children}
            </p>
          );
        },
      }}
    >
      {children}
    </Markdown>
  );
}
```

Update The caller function:
```jsx
// Adjust as needed
import MarkdownRenderer from "./MarkdownRenderer";

// Replace the ListItemText secondary content with:
<MarkdownRenderer>
    {markdown_text.replace(/(\[.*?\])/g, "$1\n")}
</MarkdownRenderer>
```

