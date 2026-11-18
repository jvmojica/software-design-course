import { act, fireEvent, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { useStepNav } from "~/player/useStepNav";

afterEach(() => history.replaceState(null, "", "/"));

const setHash = (h: string) => history.replaceState(null, "", `/${h}`);

describe("useStepNav", () => {
  test("starts at step 0 and clamps at both ends", () => {
    const { result } = renderHook(() => useStepNav(3));
    expect(result.current.index).toBe(0);
    act(() => result.current.prev());
    expect(result.current.index).toBe(0);
    act(() => { result.current.go(2); });
    act(() => result.current.next());
    expect(result.current.index).toBe(2);
  });

  test("go() writes a 1-based #step-N hash", () => {
    const { result } = renderHook(() => useStepNav(5));
    act(() => result.current.go(2));
    expect(location.hash).toBe("#step-3");
  });

  test("reads the initial step from the hash", () => {
    setHash("#step-3");
    const { result } = renderHook(() => useStepNav(5));
    expect(result.current.index).toBe(2);
  });

  test.each([
    ["#step-0", 0],
    ["#step-99", 4],
    ["#step-abc", 0],
    ["#other", 0],
  ])("bad hash %s clamps to step index %i", (hash, expected) => {
    setHash(hash);
    const { result } = renderHook(() => useStepNav(5));
    expect(result.current.index).toBe(expected);
  });

  test("arrow keys move between steps", () => {
    const { result } = renderHook(() => useStepNav(5));
    act(() => { fireEvent.keyDown(window, { key: "ArrowRight" }); });
    act(() => { fireEvent.keyDown(window, { key: "ArrowRight" }); });
    expect(result.current.index).toBe(2);
    act(() => { fireEvent.keyDown(window, { key: "ArrowLeft" }); });
    expect(result.current.index).toBe(1);
  });

  test("PageUp/PageDown keep scrolling the page and do not change steps", () => {
    const { result } = renderHook(() => useStepNav(5));
    let prevented = false;
    act(() => { prevented = !fireEvent.keyDown(window, { key: "PageDown" }); });
    expect(result.current.index).toBe(0);
    expect(prevented).toBe(false);
  });

  test("arrow keys typed into an input do not change steps", () => {
    function Probe() {
      const nav = useStepNav(5);
      return (
        <>
          <input aria-label="email" />
          <output>{nav.index}</output>
        </>
      );
    }
    render(<Probe />);
    const input = screen.getByLabelText("email");
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("0");
  });
});
