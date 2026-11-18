// @vitest-environment node
import { expect, test } from "vitest";
import { highlightCode } from "~/content-render/highlight";
import { renderMarkdown } from "~/content-render/markdown";

test("renderMarkdown renders markdown and escapes raw HTML", () => {
  const html = renderMarkdown("**a** <script>x</script>");
  expect(html).toContain("<strong>a</strong>");
  expect(html).not.toContain("<script>");
});

test("highlightCode produces a pre block with dual-theme CSS variables", async () => {
  const html = await highlightCode("const a = 1");
  expect(html).toContain("<pre");
  expect(html).toContain("--shiki-dark");
});

test("highlightCode marks requested lines", async () => {
  const html = await highlightCode("const a = 1\nconst b = 2", [2]);
  expect(html.match(/data-highlighted/g)).toHaveLength(1);
});
