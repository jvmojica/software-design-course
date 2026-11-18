import type { Lesson } from "../types";

export const lesson06: Pick<Lesson, "scene" | "steps"> = {
  scene: "coupling-cohesion",
  steps: [
    {
      title: "Nine functions, three files",
      body: `Here's a small shop backend: nine functions spread across three files, \`helpers.ts\`, \`utils.ts\` and \`main.ts\`. Arrows show which function calls which.

The colors show what each function is *about*: **blue** for users, **gold** for orders, **green** for email.

Look at the files. Each one holds a mix of colors. The functions ended up wherever someone happened to write them. This is extremely common, and it's exactly what this lesson teaches you to spot and fix.`,
      sceneState: { phase: "scattered" },
    },
    {
      title: "Coupling: how tangled the files are",
      body: `**Coupling** measures how much one module depends on others. Here a module is a file.

The red arrows are calls that cross from one file into another. There are **seven** of them. Each one is a dependency: if the function on the other side changes its name, its inputs or its behavior, this file can break.

High coupling means you can't change, test or understand one file without dragging the others along. You want as **few** arrows crossing boundaries as possible.`,
      code: {
        lang: "ts",
        source: `// helpers.ts
import { hashPw } from "./utils";
import { checkEmail, discount } from "./main";

export function createUser(email: string, pw: string) { /* ... */ }
export function total(items: Item[]) { /* ...uses discount() */ }
export function send(to: string, kind: string) { /* ... */ }`,
        highlight: [2, 3],
      },
      sceneState: { phase: "coupling" },
    },
    {
      title: "Cohesion: does a file have one job?",
      body: `**Cohesion** measures how strongly the things *inside* a module belong together.

Look at \`helpers.ts\`. It holds \`createUser\` (users), \`total\` (orders) and \`send\` (email): three unrelated jobs. The only thing they share is that someone called them "helpers".

Low cohesion makes code hard to find and hard to name. When a file's honest name would be "misc", that's a sign its cohesion is low. You want each module to hold **one** clear responsibility.`,
      sceneState: { phase: "cohesion" },
    },
    {
      title: "Why it hurts: one change, three files",
      body: `Now a real request comes in: *"Change how emails are formatted."*

That change involves \`send\`, \`template\` and \`queue\`, and they live in **three different files**. You have to open all three, understand all three, and every one of those files also contains unrelated code you could break.

Low cohesion and high coupling usually appear together, and they make a simple change spread everywhere.`,
      sceneState: { phase: "change" },
    },
    {
      title: "Regroup: put together what changes together",
      body: `Let's move each function next to the functions it belongs with. User code goes to \`users.ts\`, order code to \`orders.ts\`, email code to \`email.ts\`.

We didn't change a single line inside any function. We only changed **where things live**, and each file now has one color.

A good rule of thumb: **things that change together should live together.**`,
      sceneState: { phase: "regroup" },
    },
    {
      title: "Coupling drops from seven to two",
      body: `Count the arrows crossing between files now: just **two**. Both users and orders need to send an email, which is a real dependency on the email module.

The other calls became *internal*: a file calling its own functions. Internal calls are cheap because they change together anyway.

That's the goal: **high cohesion inside modules, low coupling between them.** The two remaining arrows are deliberate and easy to see.`,
      code: {
        lang: "ts",
        source: `// orders.ts
import { send } from "./email"; // the only import

export function placeOrder(cart: Cart) {
  const amount = total(cart.items); // same file
  send(cart.customerEmail, "order-confirmation");
}`,
        highlight: [2],
      },
      sceneState: { phase: "clean-coupling" },
    },
    {
      title: "The same change, now in one place",
      body: `Remember the request to change email formatting? Now everything it touches is in \`email.ts\`.

One file to open, one file to test, one file to review. Users and orders keep calling \`send\` exactly as before. As long as \`send\` keeps its shape, they never notice the change.

This is the payoff you saw in lesson 1, now with names: Version B was **cohesive** and **loosely coupled**.`,
      sceneState: { phase: "clean-change" },
    },
    {
      title: "How to use this every day",
      body: `Ask two questions whenever you add or move code:

- **Cohesion:** does this belong with what's already in this module? Could I describe the module in one short sentence without "and"?
- **Coupling:** does this module really need to know about that one? Can I depend on fewer things?

Almost every principle and pattern later in this course, from SOLID to clean architecture, is a more specific way of raising cohesion and lowering coupling.`,
      sceneState: { phase: "summary" },
    },
  ],
};
