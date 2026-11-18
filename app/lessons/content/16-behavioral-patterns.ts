import type { Lesson } from "../types";

export const lesson16: Pick<Lesson, "scene" | "steps"> = {
  scene: "behavioral-patterns",
  steps: [
    {
      title: "Patterns for how objects talk",
      body: `**Behavioral patterns** are proven answers to one question: *how should objects share work and talk to each other?*

This lesson covers four you'll meet constantly:

- **Strategy:** swap *how* something is done.
- **Observer:** let many objects react to one change.
- **Command:** turn actions into objects you can queue and undo.
- **State:** let an object change its behavior when its state changes.

Each one is coupling and cohesion applied to a specific, recurring problem.`,
      sceneState: { phase: "intro" },
    },
    {
      title: "Strategy: the problem",
      body: `A checkout supports card payments. Then PayPal. Then crypto. Each new method adds another branch to one growing \`if\`/\`else\` inside \`Checkout\`.

Every new payment method means editing (and re-testing) checkout code that already works. The checkout knows the details of every payment provider: low cohesion, high coupling.`,
      code: {
        lang: "ts",
        source: `function checkout(total: number, method: string) {
  if (method === "card") { /* 40 lines of card logic */ }
  else if (method === "paypal") { /* 30 lines of PayPal logic */ }
  else if (method === "crypto") { /* ...and growing */ }
}`,
      },
      sceneState: { phase: "strategy-problem" },
    },
    {
      title: "Strategy: plug in the algorithm",
      body: `Pull each payment method out into its own object that follows one shared interface: \`pay(total)\`.

\`Checkout\` now holds *one* strategy and calls \`pay\`. It no longer knows or cares how card payments work. Each strategy is small, focused and testable on its own.`,
      code: {
        lang: "ts",
        source: `interface PaymentStrategy {
  pay(total: number): Promise<void>;
}

class Checkout {
  constructor(private payment: PaymentStrategy) {}
  complete(total: number) {
    return this.payment.pay(total);
  }
}

new Checkout(new CardPayment()).complete(42);`,
        highlight: [1, 2, 3, 6, 8],
      },
      sceneState: { phase: "strategy-card" },
    },
    {
      title: "Strategy: swap it without touching Checkout",
      body: `The customer picks PayPal instead, so we hand \`Checkout\` a different strategy. Nothing inside \`Checkout\` changed.

Adding a new payment method is now *adding a file*, not editing a big function. That's the **Open/Closed principle** from SOLID part 1 in action: open for extension, closed for modification.`,
      code: {
        lang: "ts",
        source: `new Checkout(new PayPalPayment()).complete(42);`,
      },
      sceneState: { phase: "strategy-paypal" },
    },
    {
      title: "Observer: broadcast changes",
      body: `When the shopping store's data changes, several parts of the app care: the cart badge, the price list, analytics.

The store could call each of them directly, but then it would depend on all of them. Instead, each part **subscribes** (dashed arrows), and the store simply **notifies** whoever is listening (the moving dots).

The store doesn't know what its observers do. It only knows that they want updates.`,
      code: {
        lang: "ts",
        source: `type Listener = (items: Item[]) => void;

class Store {
  private listeners: Listener[] = [];
  subscribe(fn: Listener) { this.listeners.push(fn); }
  private notify() { this.listeners.forEach((fn) => fn(this.items)); }
  add(item: Item) { this.items.push(item); this.notify(); }
}`,
      },
      sceneState: { phase: "observer" },
    },
    {
      title: "Observer: add listeners freely",
      body: `A new feature, a wishlist that reacts to price changes, just subscribes. The store's code didn't change at all.

You use this pattern all the time: DOM event listeners, React state updates and message queues are all observer at heart.

Watch out for one thing: observers that are never unsubscribed keep running and keep memory alive. Always pair \`subscribe\` with a way to unsubscribe.`,
      code: {
        lang: "ts",
        source: `store.subscribe((items) => wishlist.refreshPrices(items));`,
      },
      sceneState: { phase: "observer-add" },
    },
    {
      title: "Command: actions as objects",
      body: `In a text editor, clicking **Bold** doesn't just make text bold. It creates a *command object* that knows how to \`execute()\` itself and how to \`undo()\` itself.

Each command is pushed onto a **history** stack. The toolbar doesn't edit text directly; it just creates commands. This separates *deciding what to do* from *doing it*.`,
      code: {
        lang: "ts",
        source: `interface Command {
  execute(): void;
  undo(): void;
}

class BoldCommand implements Command {
  constructor(private editor: Editor, private range: Range) {}
  execute() { this.editor.setBold(this.range, true); }
  undo() { this.editor.setBold(this.range, false); }
}`,
      },
      sceneState: { phase: "command-queue" },
    },
    {
      title: "Command: undo for free",
      body: `Because every action is an object in the history, **undo** is simple: pop the last command and call its \`undo()\`. Here "Delete word" comes off the stack and the editor restores it.

The same idea powers redo, macros (a list of commands replayed), and job queues that run commands later or on another machine.`,
      code: {
        lang: "ts",
        source: `const history: Command[] = [];

function run(cmd: Command) { cmd.execute(); history.push(cmd); }
function undo() { history.pop()?.undo(); }`,
        highlight: [4],
      },
      sceneState: { phase: "command-undo" },
    },
    {
      title: "State: behavior that depends on state",
      body: `A traffic light behaves differently when it's red, green or yellow. The naive version is a \`switch\` on a status string in every method, repeated and easy to get wrong.

With the **State** pattern, each state is its own object. The light holds a reference to its *current* state (the solid arrow) and delegates to it. Right now it's red.`,
      code: {
        lang: "ts",
        source: `interface LightState {
  color: string;
  next(): LightState;
}

const Red: LightState = { color: "red", next: () => Green };
const Green: LightState = { color: "green", next: () => Yellow };
const Yellow: LightState = { color: "yellow", next: () => Red };`,
      },
      sceneState: { phase: "state-red" },
    },
    {
      title: "State: the object changes its behavior",
      body: `Call \`next()\` and the light swaps its current state object, from red to green. The dashed arrows show which state comes next.

Each state's rules live in one place. Adding a "flashing" state means adding one object, not editing every \`switch\` in the codebase.`,
      code: {
        lang: "ts",
        source: `class TrafficLight {
  private state: LightState = Red;
  next() { this.state = this.state.next(); }
  get color() { return this.state.color; }
}`,
        highlight: [3],
      },
      sceneState: { phase: "state-green" },
    },
    {
      title: "Choosing the right one",
      body: `Look for the smell, then pick the pattern:

- A growing \`if\`/\`switch\` choosing between **algorithms** → **Strategy**.
- One change that **many unrelated parts** need to react to → **Observer**.
- Actions you need to **queue, log, undo or redo** → **Command**.
- A \`switch\` on a **status** repeated in many methods → **State**.

Don't use a pattern because it exists. Use it when you can name the problem it solves in your code.`,
      sceneState: { phase: "summary" },
    },
  ],
};
