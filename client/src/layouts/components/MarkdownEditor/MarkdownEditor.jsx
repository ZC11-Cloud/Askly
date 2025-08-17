// MarkdownEditor.jsx
import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MarkdownEditor = ({ answer, onSave, onCancel, isEditing, readOnly = false }) => {
  const [text, setText] = useState(answer);

  // 当 answer 或 isEditing 变化时更新内部状态
  useEffect(() => {
    if (isEditing) {
      setText(answer);
    }
  }, [answer, isEditing]);

  const handleSave = () => {
    onSave && onSave(text);
  };

  const handleCancel = () => {
    setText(answer);
    onCancel && onCancel();
  };

  // 如果是只读模式或者不处于编辑状态，只显示预览
  if (readOnly || !isEditing) {
    // 仅显示预览模式
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                style={materialDark}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {answer}
      </ReactMarkdown>
    );
  }

  // 显示编辑模式
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ display: "flex", gap: "20px" }}>
        {/* 输入区 */}
        <textarea
          style={{ width: "50%", height: "400px" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        {/* 实时渲染区 */}
        <div
          style={{
            width: "50%",
            border: "1px solid #ddd",
            padding: "10px",
            overflowY: "auto",
            maxHeight: "400px",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={materialDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={handleSave} style={{ padding: "5px 10px" }}>
          保存
        </button>
        <button onClick={handleCancel} style={{ padding: "5px 10px" }}>
          取消
        </button>
      </div>
    </div>
  );
};

export default MarkdownEditor;