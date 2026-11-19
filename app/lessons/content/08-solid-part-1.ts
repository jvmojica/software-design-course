import type { Lesson } from "../types";

export const lesson08: Pick<Lesson, "scene" | "steps"> = {
  scene: "solid-1",
  steps: [
    {
      title: "One class, three bosses",
      body: `**SOLID** is a set of five design principles. This lesson covers the first two: the **S** and the **O**.

Meet \`Report\`, a class that calculates monthly numbers, formats them as a nice PDF and emails it out. Three different groups depend on it: the **finance team** owns the math, the **design team** owns the look, and **IT** owns the email setup.

Each arrow is a group that can ask for changes to this one class.`,
      code: {
        lang: "ts",
        source: `class Report {
  calculateTotals(sales: Sale[]) { /* finance rules */ }
  toPdf() { /* layout, fonts, colors */ }
  email(to: string[]) { /* SMTP settings */ }
}`,
      },
      sceneState: { phase: "srp-god" },
    },
    {
      title: "Their changes collide",
      body: `Finance needs new tax rules. In the same week, design wants a new layout. Both changes land in the same file.

Two developers edit \`Report\` at once. Merges conflict, and a layout tweak accidentally breaks a calculation that shared a helper. The finance team is now getting wrong numbers because of a *font* change.

When one class serves several groups, a change for one of them puts all the others at risk.`,
      sceneState: { phase: "srp-conflict" },
    },
    {
      title: "Single Responsibility: one reason to change",
      body: `The **Single Responsibility Principle** says: *a class should have only one reason to change.* Put differently, it should answer to one group of people.

Split \`Report\` into \`ReportCalculator\` (finance), \`ReportFormatter\` (design) and \`ReportMailer\` (IT). Each arrow now goes to exactly one class.

A tax change touches only the calculator. A new font touches only the formatter. Notice this is cohesion again, measured by *who* asks for changes.`,
      code: {
        lang: "ts",
        source: `class ReportCalculator { totals(sales: Sale[]): Totals { /* ... */ } }
class ReportFormatter { toPdf(totals: Totals): Pdf { /* ... */ } }
class ReportMailer { send(pdf: Pdf, to: string[]) { /* ... */ } }

const pdf = new ReportFormatter().toPdf(new ReportCalculator().totals(sales));
await new ReportMailer().send(pdf, managers);`,
      },
      sceneState: { phase: "srp-split" },
    },
    {
      title: "A calculator full of cases",
      body: `Now the **O**. A shop gives discounts by customer type. \`DiscountCalculator\` holds one big \`switch\`: regular customers get nothing, students get 10%, seniors get 15%.

Every rule lives inside the same method, and each \`case\` is a branch hanging off the calculator.

It reads fine with three cases. Watch what happens when the business adds a fourth.`,
      code: {
        lang: "ts",
        source: `class DiscountCalculator {
  discount(customer: Customer, total: number): number {
    switch (customer.type) {
      case "regular": return 0;
      case "student": return total * 0.1;
      case "senior":  return total * 0.15;
    }
  }
}`,
      },
      sceneState: { phase: "ocp-switch" },
    },
    {
      title: "Every new type means editing old code",
      body: `Marketing launches a **VIP** tier. To support it, someone opens \`DiscountCalculator\` and adds another \`case\`.

Code that was tested and working is being edited again, and the whole calculator needs re-testing. Next month it will be "employees", then "partners". The method grows forever, and every edit risks breaking the cases that already worked.`,
      code: {
        lang: "ts",
        source: `switch (customer.type) {
  case "regular": return 0;
  case "student": return total * 0.1;
  case "senior":  return total * 0.15;
  case "vip":     return total * 0.2; // edit + re-test everything
}`,
        highlight: [5],
      },
      sceneState: { phase: "ocp-edit" },
    },
    {
      title: "Open/Closed: extend, don't edit",
      body: `The **Open/Closed Principle** says: *code should be open for extension but closed for modification.* You should be able to add behavior without changing code that already works.

Give each rule its own class behind a shared interface, \`DiscountRule\`. The calculator just asks the customer's rule for the discount. It no longer knows any specific types.

The dashed arrows mean "implements": each rule fulfils the \`DiscountRule\` contract.`,
      code: {
        lang: "ts",
        source: `interface DiscountRule {
  discount(total: number): number;
}

class StudentRule implements DiscountRule {
  discount(total: number) { return total * 0.1; }
}

class DiscountCalculator {
  discount(customer: Customer, total: number) {
    return customer.rule.discount(total);
  }
}`,
      },
      sceneState: { phase: "ocp-open" },
    },
    {
      title: "VIP arrives: add a class, touch nothing else",
      body: `Now the VIP tier is a **new file**: \`VipRule\`. The calculator, the existing rules and their tests are all untouched; the calculator's arrows are exactly the same as before.

That's the payoff: new features arrive as *additions*, and additions can't break what's already there.

You've seen this shape before. It's polymorphism from lesson 4, and the Strategy pattern from lesson 16 is built on the same idea.`,
      code: {
        lang: "ts",
        source: `class VipRule implements DiscountRule {
  discount(total: number) { return total * 0.2; }
}`,
      },
      sceneState: { phase: "ocp-extend" },
    },
    {
      title: "Using S and O wisely",
      body: `- **Single Responsibility:** a class should have one reason to change, meaning it answers to one group of people.
- **Open/Closed:** add new behavior by adding code, not by editing code that works.

Both are judgment calls, not laws. Don't split a 30-line class into five, and don't build an interface for something that has only ever had one version (remember YAGNI). Apply them when you feel the pain: colliding changes, or the same \`switch\` being edited again and again.

Next: **SOLID, part 2**, the L, I and D.`,
      sceneState: { phase: "summary" },
    },
  ],
};
