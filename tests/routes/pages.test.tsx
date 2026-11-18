import { render, screen, within } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import { EmailSignup } from "~/components/EmailSignup";
import { SupportLink } from "~/components/SupportLink";
import LessonsIndex from "~/routes/lessons-index";
import config from "../../react-router.config";

const renderPage = (Component: React.ComponentType) => {
  const Stub = createRoutesStub([{ path: "/", Component }]);
  return render(<Stub initialEntries={["/"]} />);
};

test("course map lists 21 lessons under three level headings", () => {
  renderPage(LessonsIndex);
  const levels = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
  expect(levels).toEqual(["Beginner", "Intermediate", "Advanced"]);
  expect(screen.getAllByRole("listitem")).toHaveLength(21);
  const soonCard = screen.getAllByRole("listitem").find((li) => li.textContent?.includes("Functions and naming"))!;
  expect(within(soonCard).getByText("Coming soon")).toBeInTheDocument();
});

test("EmailSignup renders nothing without a form action", () => {
  const { container } = render(<EmailSignup action="" />);
  expect(container).toBeEmptyDOMElement();
});

test("EmailSignup renders a POST form with an email field when configured", () => {
  render(<EmailSignup action="https://example.com/subscribe" />);
  const form = screen.getByRole("form", { name: /email updates/i });
  expect(form).toHaveAttribute("method", "post");
  expect(form).toHaveAttribute("action", "https://example.com/subscribe");
  expect(within(form).getByLabelText(/email/i)).toHaveAttribute("type", "email");
});

test("SupportLink depends on the support URL", () => {
  const { container, rerender } = render(<SupportLink url="" />);
  expect(container).toBeEmptyDOMElement();
  rerender(<SupportLink url="https://ko-fi.com/x" />);
  expect(screen.getByRole("link", { name: /support this course/i })).toHaveAttribute("href", "https://ko-fi.com/x");
});

test("prerender covers static pages, feeds and all 21 lessons", async () => {
  const paths = await (config.prerender as () => Promise<string[]>)();
  for (const p of ["/", "/lessons", "/about", "/sitemap.xml", "/robots.txt"]) expect(paths).toContain(p);
  expect(paths.filter((p) => p.startsWith("/lessons/"))).toHaveLength(21);
});
