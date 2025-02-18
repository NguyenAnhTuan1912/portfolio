import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneLight,
  oneDark
} from "react-syntax-highlighter/dist/esm/styles/prism";

// Import components
import CopyCodeButton from "../code-copy-button";

// Import states
import { useSettingsState } from "src/states/settings";

// Import types
import type { Components } from "react-markdown";

type TextHeaderType = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
type ListType = "ul" | "ol";

const getHeaderComponent = (function () {
  const $$$: { [key in TextHeaderType]: string } = {
    h1: "font-bold text-4xl mb-5",
    h2: "font-bold text-3xl mb-4",
    h3: "font-bold text-2xl mb-3",
    h4: "font-bold text-xl mb-2",
    h5: "font-bold text-lg mb-1",
    h6: "font-bold text-sm",
  };

  return function (textHeaderType: TextHeaderType): any {
    return function Header({
      children,
    }: {
      children: React.ReactNode | string;
    }) {
      return React.createElement(textHeaderType, {
        children,
        className: $$$[textHeaderType],
      });
    };
  };
})();

const getListComponent = (function () {
  const $$$: { [key in ListType]: string } = {
    ul: "list-[initial] list-inside ps-3",
    ol: "list-[initial] list-inside ps-3",
  };

  return function (textHeaderType: ListType): any {
    return function Header({
      children,
    }: {
      children: React.ReactNode | string;
    }) {
      return React.createElement(textHeaderType, {
        children,
        className: $$$[textHeaderType],
      });
    };
  };
})();

function List({ children }: { children: React.ReactNode | string }) {
  return <li className="[&>p]:inline">{children}</li>;
}

function Break() {
  return <br />;
}

function Paragraph({ children }: { children: React.ReactNode | string }) {
  return <p className="mb-2">{children}</p>;
}

function Pre({ children }: { children: React.ReactNode | string }) {
  return <>{children}</>;
}

function PlainText({ children }: { children: React.ReactNode | string }) {
  return <span>{children}</span>;
}

function Image(props: any) {
  return (
    <div className="flex justify-center">
      <img className="" src={props.src} alt={props.alt} />
    </div>
  );
}

function Code({
  children,
  className,
}: {
  children: string | Array<string>;
  className: string;
}) {
  const { theme } = useSettingsState();

  if (!className) {
    return (
      <code className="bg-secondary border rounded px-2 py-1">{children}</code>
    );
  }

  const match = /language-(\w+)/.exec(className || "");
  const lang = match![1];
  return (
    <div className="relative w-full [&>span]:text-sm">
      <div className="flex flex-row items-center justify-between h-10 w-full absolute top-0 px-6 ">
        <div className="flex flex-row items-center gap-x-2">
          {["#27C93F", "#FF5F56", "#FFBD2E"].map(function (color: string) {
            return (
              <div
                key={color}
                className={"h-3 w-3 rounded-full"}
                style={{ backgroundColor: `${color}` }}
              />
            );
          })}
        </div>

        <div className="flex flex-row items-center">
          <div className="flex flex-row items-center ms-4 cursor-pointer">
            <span className="material-symbols-outlined">terminal</span>
            <div className="text-sm ms-2">{lang}</div>
          </div>
          <CopyCodeButton text={children as string} />
        </div>
      </div>

      <SyntaxHighlighter
        showLineNumbers
        language={lang}
        style={theme == "light" ? oneLight : oneDark}
        customStyle={{
          borderRadius: "8px",
          marginTop: "1rem",
          marginBottom: "1rem",
          padding: "1.5rem",
          paddingTop: "4rem",
          borderColor: "hsl(var(--primary))",
          borderWidth: "1px",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
}

export const MDComponents: Components = {
  h1: getHeaderComponent("h1"),
  h2: getHeaderComponent("h2"),
  h3: getHeaderComponent("h3"),
  h4: getHeaderComponent("h4"),
  h5: getHeaderComponent("h5"),
  h6: getHeaderComponent("h6"),
  ul: getListComponent("ul"),
  ol: getListComponent("ol"),
  li: List as any,
  p: Paragraph as any,
  pre: Pre as any,
  code: Code as any,
  br: Break,
  img: Image as any,
  text: PlainText as any,
};
