import { Marked } from "marked";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const marked = new Marked({
  gfm: true,
  renderer: {
    // Lesson copy is plain markdown; raw HTML is shown as text, never injected.
    html({ text }) {
      return escapeHtml(text);
    },
  },
});

/** Markdown → HTML. Runs at build time inside route loaders. */
export function renderMarkdown(md: string): string {
  return marked.parse(md, { async: false });
}
