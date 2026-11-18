import { createHighlighter, type Highlighter } from "shiki";

let highlighter: Promise<Highlighter> | undefined;

function getHighlighter() {
  highlighter ??= createHighlighter({ themes: ["github-light", "github-dark"], langs: ["ts"] });
  return highlighter;
}

/** TypeScript source → highlighted HTML with light/dark colors as CSS variables. */
export async function highlightCode(source: string, highlight: number[] = []): Promise<string> {
  const h = await getHighlighter();
  return h.codeToHtml(source, {
    lang: "ts",
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: "light",
    transformers: [
      {
        line(node, line) {
          if (highlight.includes(line)) node.properties["data-highlighted"] = "";
        },
      },
    ],
  });
}
