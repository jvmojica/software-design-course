import type { Lesson } from "../types";

export const lesson03: Pick<Lesson, "scene" | "steps"> = {
  scene: "oop-basics",
  steps: [
    {
      title: "Data and functions, living apart",
      body: `Here's a simple banking program. It has some **data** (cylinders): a \`balance\` and an \`owner\`. It also has some **functions** (blocks): \`deposit\`, \`withdraw\` and \`statement\`.

They all live loose in the program. Other files, like \`checkout.ts\` and \`admin.ts\`, can read and change the balance directly, as the arrows show.

That feels convenient. Let's see what it costs.`,
      code: {
        lang: "ts",
        source: `let balance = 0;
let owner = "Alice";

function deposit(amount: number) { balance += amount; }
function withdraw(amount: number) { balance -= amount; }

// checkout.ts, admin.ts, anywhere:
balance += 25;`,
      },
      sceneState: { phase: "loose" },
    },
    {
      title: "Anyone can break the rules",
      body: `A bank account has rules: the balance can't go below zero, and deposits must be positive. Right now nothing enforces them.

\`admin.ts\` writes \`balance = -500\` directly. No function was called and no check ran. The data is now in a state that should be impossible, and the bug will surface somewhere far away, much later.

When any code can change data, **every** line in the program is a suspect when something goes wrong.`,
      code: {
        lang: "ts",
        source: `// admin.ts
balance = -500; // nothing stops this`,
      },
      sceneState: { phase: "danger" },
    },
    {
      title: "A class bundles data with its behavior",
      body: `A **class** groups data together with the functions that work on it. Inside a class, the data are called **fields** and the functions are called **methods**.

The slab in the scene is the class \`BankAccount\`: balance, owner, deposit, withdraw and statement now live together, because they belong together. That's cohesion again.

The outside files can still reach the balance, though. We'll fix that in a moment.`,
      code: {
        lang: "ts",
        source: `class BankAccount {
  balance = 0;
  constructor(public owner: string) {}

  deposit(amount: number) { this.balance += amount; }
  withdraw(amount: number) { this.balance -= amount; }
  statement() { return \`\${this.owner}: $\${this.balance}\`; }
}`,
      },
      sceneState: { phase: "class" },
    },
    {
      title: "Classes are blueprints, objects are the real things",
      body: `A class is a **blueprint**: it describes what every bank account has and can do, but it isn't an account itself.

Calling \`new BankAccount(...)\` builds an **object** from the blueprint. Each object has its *own* copy of the data: Alice's balance and Bob's balance are completely separate, even though they share the same methods.

You write the class once and create as many objects as you need.`,
      code: {
        lang: "ts",
        source: `const alice = new BankAccount("Alice");
const bob = new BankAccount("Bob");

alice.deposit(120);
bob.deposit(40);

alice.statement(); // "Alice: $120"
bob.statement();   // "Bob: $40"`,
      },
      sceneState: { phase: "objects" },
    },
    {
      title: "Encapsulation: make the data private",
      body: `Now the key idea. Mark the fields **private** (in TypeScript, with a \`#\` in front). Code outside the class can no longer touch them at all; it's a compile error.

Look at the arrows: \`checkout.ts\` and \`admin.ts\` now point at **methods**, not at the data. The methods are the only door in.

This is **encapsulation**: an object keeps its data to itself and offers a small set of methods for working with it.`,
      code: {
        lang: "ts",
        source: `class BankAccount {
  #balance = 0;
  #owner: string;
  constructor(owner: string) { this.#owner = owner; }

  deposit(amount: number) { /* ... */ }
  withdraw(amount: number) { /* ... */ }
}

account.#balance = -500; // ✗ Error: private field`,
        highlight: [2, 3, 10],
      },
      sceneState: { phase: "encapsulation" },
    },
    {
      title: "Methods guard the rules",
      body: `Because every change goes through a method, the rules can live **in one place**.

\`admin.ts\` tries \`withdraw(1000)\` from an account holding 120. The method checks, refuses, and throws a clear error. The balance never becomes invalid.

There's no way around it. An object that protects its own rules like this is said to keep its **invariants**: things that are always true about it.`,
      code: {
        lang: "ts",
        source: `withdraw(amount: number) {
  if (amount <= 0) throw new Error("Amount must be positive");
  if (amount > this.#balance) throw new Error("Insufficient funds");
  this.#balance -= amount;
}`,
        highlight: [2, 3],
      },
      sceneState: { phase: "guard" },
    },
    {
      title: "Change the inside without breaking the outside",
      body: `Encapsulation has a second payoff. The bank now wants a full history, so we replace the single \`#balance\` number with a private list of **transactions**, and calculate the balance from it.

Look at the arrows from \`checkout.ts\` and \`admin.ts\`: they haven't changed. They still call \`deposit\` and \`withdraw\`. Nothing outside the class had to change, because nothing outside could see the inside.

Private details can change freely; only the public methods are a promise.`,
      code: {
        lang: "ts",
        source: `class BankAccount {
  #transactions: number[] = [];

  get balance() {
    return this.#transactions.reduce((sum, t) => sum + t, 0);
  }
  deposit(amount: number) { /* checks */ this.#transactions.push(amount); }
  withdraw(amount: number) { /* checks */ this.#transactions.push(-amount); }
}`,
        highlight: [2, 4, 5, 6],
      },
      sceneState: { phase: "change-inside" },
    },
    {
      title: "Remember three ideas",
      body: `- **Class:** a blueprint that bundles data (fields) with the behavior (methods) that belongs to it.
- **Object:** a real instance built from the class, with its own data.
- **Encapsulation:** keep data private and expose a few methods, so the object can protect its rules and change its insides freely.

A good habit: start every field as **private**, and only expose what other code genuinely needs.

Next: **abstraction, inheritance and polymorphism**, the rest of the four pillars of OOP.`,
      sceneState: { phase: "summary" },
    },
  ],
};
