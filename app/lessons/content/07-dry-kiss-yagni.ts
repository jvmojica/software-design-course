import type { Lesson } from "../types";

export const lesson07: Pick<Lesson, "scene" | "steps"> = {
  scene: "keep-simple",
  steps: [
    {
      title: "DRY: the same rule, written three times",
      body: `**DRY** stands for **Don't Repeat Yourself**. Every piece of knowledge in a program should have one home.

Here a shop calculates sales tax in three places: the cart, the checkout and the invoice. Each file has its own copy of \`price × 0.20\`. Someone copied it because it was quicker than finding a shared place for it.

Three copies of one rule look harmless. Watch what happens when the rule changes.`,
      code: {
        lang: "ts",
        source: `// cart.ts
const tax = subtotal * 0.2;

// checkout.ts
const tax = order.subtotal * 0.2;

// invoice.ts
const taxAmount = lines.reduce((s, l) => s + l.price, 0) * 0.2;`,
      },
      sceneState: { phase: "dry-copies" },
    },
    {
      title: "Change the rule, miss a copy",
      body: `The tax rate goes up to 25%. A developer searches for \`0.2\` and updates the cart and the checkout. The invoice used a different variable name, so it was missed.

Now customers are charged 25% but their invoices say 20%. Nothing crashed, no test failed, and the bug can hide for weeks.

That's the real danger of duplication: not the extra lines, but **copies drifting apart** when one is updated and another isn't.`,
      sceneState: { phase: "dry-change" },
    },
    {
      title: "Give the rule one home",
      body: `Put the rule in one function, \`calculateTax()\`, and have every place call it.

Now a rate change is a one-line edit in one file, and all three callers get it automatically. The rule also gets a name, so a reader sees *what* is being calculated, not just a mysterious \`0.2\`.

**A caution:** DRY is about repeated *knowledge*, not repeated-looking code. If shipping happens to also be \`price × 0.2\` today, don't merge it with tax. They're different rules that will change for different reasons.`,
      code: {
        lang: "ts",
        source: `// tax.ts: the one home of this rule
export const TAX_RATE = 0.25;
export function calculateTax(amount: number): number {
  return amount * TAX_RATE;
}

// cart.ts, checkout.ts, invoice.ts
const tax = calculateTax(subtotal);`,
      },
      sceneState: { phase: "dry-fixed" },
    },
    {
      title: "KISS: the clever version",
      body: `**KISS** stands for **Keep It Simple, Stupid**: the simplest solution that works is usually the best one.

Here's a real temptation: someone needs to check whether a number is even, and builds a factory, a strategy, a config object, an engine and a result type. Five parts, all wired together, all glowing red as things to maintain.

It looks "professional", but every extra part is something the next reader has to understand, test and keep working.`,
      code: {
        lang: "ts",
        source: `const checker = new ParityCheckerFactory(new ParityConfig({ mode: "even" }))
  .create(new ParityStrategy(new ModuloEngine(2)));

const isEven = checker.check(n).toBoolean();`,
      },
      sceneState: { phase: "kiss-clever" },
    },
    {
      title: "KISS: the simple version",
      body: `The same job in one line. Anyone can read it, it obviously works, and there's nothing to break.

Simple code isn't lazy code. It's often harder to write, because it requires understanding the problem well enough to see what's *not* needed.

A good habit: before adding a layer, a pattern or a configuration option, ask "what problem does this solve **today**?" If you can't name one, leave it out.`,
      code: {
        lang: "ts",
        source: `const isEven = (n: number) => n % 2 === 0;`,
      },
      sceneState: { phase: "kiss-simple" },
    },
    {
      title: "YAGNI: building for an imagined future",
      body: `**YAGNI** stands for **You Aren't Gonna Need It**. Don't build features until they're actually needed.

The users page needs a CSV export. While building it, a developer thinks: "we might want PDF later, and XML, and scheduled exports, so let's build a plugin system now."

The dimmed blocks are code written for requirements nobody has asked for. They take time to build, they make the real feature harder to read, and most of them will never be used, or will be needed in a different shape than guessed.`,
      code: {
        lang: "ts",
        source: `interface ExportPlugin { format: string; export(rows: Row[]): Blob }
class ExportRegistry { register(p: ExportPlugin) { /* ... */ } }
class ExportScheduler { /* cron jobs nobody asked for */ }
// ...and finally, the one thing that was needed:
class CsvExportPlugin implements ExportPlugin { /* ... */ }`,
      },
      sceneState: { phase: "yagni-future" },
    },
    {
      title: "YAGNI: build what's needed now",
      body: `Build only \`exportCsv()\`. It's small, it's done today, and it's easy to understand.

If PDF export really is requested next month, you'll add it then, knowing exactly what's needed. And because you've kept the code clean and separated, adding it will be easy.

YAGNI isn't "never plan ahead". Keep code **easy to change** (that's what this whole course is about), rather than trying to guess every change in advance.`,
      code: {
        lang: "ts",
        source: `export function exportCsv(rows: Row[]): string {
  const header = Object.keys(rows[0] ?? {}).join(",");
  const lines = rows.map((r) => Object.values(r).join(","));
  return [header, ...lines].join("\\n");
}`,
      },
      sceneState: { phase: "yagni-now" },
    },
    {
      title: "Three rules that keep code small",
      body: `- **DRY:** every rule gets one home, so a change happens in one place.
- **KISS:** prefer the simplest design that solves today's problem.
- **YAGNI:** don't build features or flexibility until you actually need them.

They pull in a useful direction together: less code, fewer moving parts, and fewer places for bugs to hide.

That completes the beginner level! Next comes the intermediate level, starting with **SOLID, part 1**: five principles that give these instincts precise names.`,
      sceneState: { phase: "summary" },
    },
  ],
};
