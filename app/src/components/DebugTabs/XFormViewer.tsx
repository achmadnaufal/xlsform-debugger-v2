import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
import xml from "react-syntax-highlighter/dist/esm/languages/hljs/xml";
import darkTheme from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

SyntaxHighlighter.registerLanguage("xml", xml);

interface XFormViewerProps {
  readonly xformXml: string | null;
}

export function XFormViewer({ xformXml }: XFormViewerProps) {
  if (!xformXml) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No XForm loaded yet.
      </div>
    );
  }

  return (
    <div className="overflow-auto h-full text-xs">
      <SyntaxHighlighter
        language="xml"
        style={darkTheme}
        customStyle={{
          margin: 0,
          padding: "0.75rem",
          background: "transparent",
          fontSize: "0.7rem",
          lineHeight: "1.4",
        }}
        showLineNumbers
        lineNumberStyle={{ color: "#4a5568", paddingRight: "1em" }}
      >
        {xformXml}
      </SyntaxHighlighter>
    </div>
  );
}
