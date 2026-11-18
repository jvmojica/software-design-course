import { render, screen } from "@testing-library/react";
import { createRoutesStub } from "react-router";
import { expect, test } from "vitest";
import Home from "~/routes/home";

test("home page shows the course title as its h1", async () => {
  const Stub = createRoutesStub([{ path: "/", Component: Home }]);
  render(<Stub initialEntries={["/"]} />);
  expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Software Design");
});
