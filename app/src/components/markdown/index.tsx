import React from "react";
import ReactMarkdown from "react-markdown";

// Import components
import { MDComponents } from "./_components";

// Import types
import type { MDContentProps } from "./type";

export default function MDContent(props: MDContentProps) {
  // const [content, setContent] = React.useState("");

  // Detect change of content
  React.useEffect(function () {}, [props.children]);

  if (typeof props.children !== "string") {
    return (
      <p className="text-red-700">
        Content of <span className="bg-outline rounded px-2 py-1">Remark</span>{" "}
        must be a string!
      </p>
    );
  }

  return (
    <ReactMarkdown components={MDComponents}>{props.children}</ReactMarkdown>
  );
}
