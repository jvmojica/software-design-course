import type { Lesson } from "../types";

export const lesson02: Pick<Lesson, "scene" | "steps"> = {
  scene: "functions",
  steps: [
    {
      title: "One function that does everything",
      body: `Meet \`processOrder()\`: a single function, 120 lines long, that handles an online order from start to finish.

It works. But to change anything (say, how the total is calculated) you have to read the whole thing to find the right lines, and hope you don't break the parts around them.

Long functions are the most common design problem in real code, and the easiest one to fix. This lesson shows you how.`,
      code: {
        lang: "ts",
        source: `function processOrder(order: Order) {
  if (!order.items.length) throw new Error("Empty order");
  if (!order.email.includes("@")) throw new Error("Bad email");
  let total = 0;
  for (const item of order.items) total += item.price * item.qty;
  if (order.coupon === "SAVE10") total *= 0.9;
  const res = paymentApi.charge(order.cardToken, total);
  if (!res.ok) throw new Error("Payment failed");
  mailer.send(order.email, \`Thanks! You paid $\${total.toFixed(2)}\`);
  // ...and 110 more lines like these
}`,
      },
      sceneState: { phase: "monolith" },
    },
    {
      title: "Find the hidden jobs",
      body: `Read the function again and look for groups of lines that work toward one goal. Often the original author even left a comment above each group.

Here there are four jobs hiding inside one function: **check the input**, **add up the prices**, **take the payment** and **email a receipt**.

A comment that labels a block of code is a strong hint: that block wants to be its own function, and the comment is almost its name.`,
      code: {
        lang: "ts",
        source: `function processOrder(order: Order) {
  // check the input
  // ...
  // add up prices
  // ...
  // take payment
  // ...
  // email receipt
  // ...
}`,
        highlight: [2, 4, 6, 8],
      },
      sceneState: { phase: "sections" },
    },
    {
      title: "Pull each job into its own function",
      body: `Move each block into a small function of its own, and have \`processOrder\` call them in order. This move is called **Extract Function**, and it's the single most useful refactoring there is.

Behavior hasn't changed at all. The same lines run in the same order. But now each piece can be read, tested and changed on its own.

There's one problem left: look at the names in the scene.`,
      code: {
        lang: "ts",
        source: `function processOrder(order: Order) {
  doStuff(order);
  const t = calc2(order);
  handle(order, t);
  x(order, t);
}`,
      },
      sceneState: { phase: "extract" },
    },
    {
      title: "Names are the documentation",
      body: `\`doStuff\`, \`calc2\`, \`handle\`, \`x\`: technically split up, but you still have to open every function to know what it does.

A good function name says **what it does**, usually starting with a verb: \`validateOrder\`, \`calculateTotal\`, \`chargeCard\`, \`sendReceipt\`.

Now read \`processOrder\` again. It reads like a to-do list in plain English. You understand the whole flow without opening a single helper.`,
      code: {
        lang: "ts",
        source: `function processOrder(order: Order) {
  validateOrder(order);
  const total = calculateTotal(order);
  chargeCard(order.cardToken, total);
  sendReceipt(order.email, total);
}`,
      },
      sceneState: { phase: "names" },
    },
    {
      title: "One job per function",
      body: `Each function now does **one thing**. \`chargeCard\` takes a payment, and that's all it does. It doesn't validate, calculate or send email.

A quick test: can you describe the function in one sentence *without* the word "and"? "Charges the card for the total" works. "Validates the order and charges the card" means two functions.

Small, single-purpose functions are easier to test: give \`calculateTotal\` some items and check the number it returns. No payment API needed.`,
      code: {
        lang: "ts",
        source: `function chargeCard(cardToken: string, amount: number): void {
  const res = paymentApi.charge(cardToken, amount);
  if (!res.ok) throw new Error(\`Payment failed: \${res.reason}\`);
}`,
      },
      sceneState: { phase: "one-job" },
    },
    {
      title: "Small functions get reused",
      body: `A new feature: the cart page should show the total *before* checkout. In the old version, the price logic was buried in the middle of \`processOrder\`, so you'd have copied it.

Now \`showCart\` simply calls \`calculateTotal\`. One source of truth: when the coupon rules change, both places update together.

Reuse isn't the main reason to split functions. Clarity is. But it often comes for free.`,
      code: {
        lang: "ts",
        source: `function showCart(order: Order) {
  render(order.items, calculateTotal(order));
}`,
      },
      sceneState: { phase: "reuse" },
    },
    {
      title: "One level of detail at a time",
      body: `Notice the two layers. \`processOrder\` sits on top and tells the **story**: *what* happens. The small functions sit below and hold the **details**: *how* each step works.

Good functions stay at one level. Mixing them, for example a high-level step next to a raw \`for\` loop that adds prices, forces the reader to switch between thinking about the plan and thinking about arithmetic.

When you read code like this, you can stop at the level you need.`,
      sceneState: { phase: "levels" },
    },
    {
      title: "Your checklist",
      body: `When a function feels hard to read:

- **Find the jobs.** Look for blocks with a shared goal, especially ones with a comment on top.
- **Extract each job** into its own function.
- **Name it for what it does**, verb first. If you can't find a good name, the function probably does too much.
- **Keep one level of detail** per function: the story on top, the details below.

Next lesson: **classes, objects and encapsulation**, grouping functions with the data they work on.`,
      sceneState: { phase: "summary" },
    },
  ],
};
