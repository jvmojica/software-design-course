import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { FullLessonText } from "~/player/FullLessonText";
import { LessonPlayer } from "~/player/LessonPlayer";
import type { RenderedStep } from "~/player/types";

afterEach(() => history.replaceState(null, "", "/"));

const steps: RenderedStep[] = [
  { title: "First idea", bodyHtml: "<p>one</p>", sceneState: { s: 1 } },
  { title: "Second idea", bodyHtml: "<p>two</p>", codeHtml: "<pre>code</pre>", sceneState: { s: 2 } },
  { title: "Third idea", bodyHtml: "<p>three</p>", sceneState: { s: 3 } },
];

const renderPlayer = () =>
  render(
    <LessonPlayer
      title="Coupling"
      steps={steps}
      renderScene={(state, i) => <div data-testid="scene">{`scene ${i} ${JSON.stringify(state)}`}</div>}
    />,
  );

test("shows step position and moves forward with Next", () => {
  renderPlayer();
  expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "First idea" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Second idea" })).toBeInTheDocument();
  expect(screen.getByText("code")).toBeInTheDocument();
  expect(screen.getByTestId("scene")).toHaveTextContent('scene 1 {"s":2}');
});

test("dots are labeled and mark the current step", () => {
  renderPlayer();
  const dot = screen.getByRole("button", { name: "Go to step 3" });
  fireEvent.click(dot);
  expect(dot).toHaveAttribute("aria-current", "step");
  expect(screen.getByRole("button", { name: "Go to step 1" })).not.toHaveAttribute("aria-current");
});

test("Prev is disabled on the first step and Next on the last", () => {
  renderPlayer();
  expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Go to step 3" }));
  expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
});

test("step text sits in a polite live region", () => {
  const { container } = renderPlayer();
  const live = container.querySelector('[aria-live="polite"]');
  expect(live).not.toBeNull();
  expect(within(live as HTMLElement).getByText("one")).toBeInTheDocument();
});

test("switching to a lesson with fewer steps never renders a missing step", () => {
  const { rerender } = renderPlayer();
  fireEvent.click(screen.getByRole("button", { name: "Go to step 3" }));
  rerender(<LessonPlayer title="Other" steps={steps.slice(0, 1)} renderScene={() => null} />);
  expect(screen.getByRole("heading", { name: "First idea" })).toBeInTheDocument();
});

test("FullLessonText renders every step as a section heading", () => {
  render(<FullLessonText steps={steps} />);
  expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  expect(screen.getByText("three")).toBeInTheDocument();
});
