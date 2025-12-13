import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function renderMessage(text) {
  // Try parse as JSON first
  try {
    const obj = JSON.parse(text);

    // 🔥 DETEKSI RESPONSE STATUS MESIN
    if (obj.machine_id && (obj.prediction || obj.anomaly || obj.air_temp)) {
      return <MachineStatusCard data={obj} />;
    }

    // fallback JSON debug
    return (
      <pre className="whitespace-pre-wrap text-xs p-3 bg-gray-900 text-green-300 rounded-xl overflow-x-auto">
        {JSON.stringify(obj, null, 2)}
      </pre>
    );
  } catch { }


  // Render Markdown with better spacing
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Paragraphs - reduced margin
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>
          ),

          // Headers - compact spacing
          h2: ({ children }) => (
            <h2 className="text-base font-bold mt-3 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
          ),

          // Lists - better spacing
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2 space-y-0.5">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-0.5">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="mb-0.5 leading-relaxed">{children}</li>
          ),

          // Tables - compact style
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">{children}</thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-gray-200">{children}</tbody>
          ),
          tr: ({ children }) => (
            <tr>{children}</tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-1.5 text-left text-xs font-semibold text-gray-700 border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-1.5 text-xs text-gray-900 border">
              {children}
            </td>
          ),

          // Code blocks
          code: ({ inline, children }) => {
            if (inline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 text-red-600 rounded text-xs font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="block p-2 bg-gray-900 text-green-300 rounded text-xs font-mono overflow-x-auto">
                {children}
              </code>
            );
          },

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-indigo-500 pl-3 py-1 my-2 text-gray-700 italic">
              {children}
            </blockquote>
          ),

          // Horizontal rule
          hr: () => (
            <hr className="my-3 border-gray-200" />
          ),

          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">{children}</strong>
          ),

          // Emphasis/Italic
          em: ({ children }) => (
            <em className="italic text-gray-700">{children}</em>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}