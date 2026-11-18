import type { Lesson } from "../types";

export const lesson10: Pick<Lesson, "scene" | "steps"> = {
  scene: "composition",
  steps: [
    {
      title: "A neat class tree",
      body: `Inheritance lets a class reuse another class's code: a \`Bird\` *is an* \`Animal\`, so it gets everything \`Animal\` has, plus \`fly()\`. A \`Fish\` is also an \`Animal\`, plus \`swim()\`.

Each arrow points from a child class to its parent. \`Sparrow\` extends \`Bird\`, so sparrows can fly.

It looks tidy. Trees like this are often the first design people reach for, and for a while they work fine.`,
      code: {
        lang: "ts",
        source: `class Animal { eat() { /* ... */ } }

class Bird extends Animal { fly() { /* ... */ } }
class Fish extends Animal { swim() { /* ... */ } }

class Sparrow extends Bird {}`,
      },
      sceneState: { phase: "tree" },
    },
    {
      title: "The first crack: a bird that can't fly",
      body: `Now add \`Penguin\`. A penguin is a bird, so it extends \`Bird\`, and inherits \`fly()\`.

But penguins can't fly. Now you have a method that must never be called, so you override it to throw an error. Any code that loops over birds and calls \`fly()\` will crash on penguins.

The tree forced a promise on \`Penguin\` that it can't keep.`,
      code: {
        lang: "ts",
        source: `class Penguin extends Bird {
  fly() {
    throw new Error("Penguins can't fly");
  }
}`,
        highlight: [2, 3],
      },
      sceneState: { phase: "penguin" },
    },
    {
      title: "The tree breaks: a duck flies and swims",
      body: `Next comes \`Duck\`. Ducks fly *and* swim. Should \`Duck\` extend \`Bird\` or \`Fish\`?

In TypeScript (and most languages) a class can only have **one** parent. Whichever you pick, you have to copy the other half's code. If you add a \`SwimmingBird\` class in between, the tree gets deeper and more fragile with every new animal.

The real problem: inheritance makes you decide up front what a thing **is**. Requirements keep changing what things **do**.`,
      code: {
        lang: "ts",
        source: `class Duck extends Bird {
  // copied from Fish, because we can't extend both
  swim() { /* ... */ }
}`,
        highlight: [2, 3],
      },
      sceneState: { phase: "duck" },
    },
    {
      title: "Flip it around: small capabilities",
      body: `Composition starts from the other end. Instead of a tree of *kinds of animal*, write small, independent pieces of behavior: **CanFly**, **CanSwim**, **CanWalk**.

Each capability does one thing well and knows nothing about animals, which makes it highly cohesive.`,
      code: {
        lang: "ts",
        source: `type Flyer = { fly(): string };
type Swimmer = { swim(): string };
type Walker = { walk(): string };

const canFly = (name: string): Flyer => ({ fly: () => \`\${name} flies\` });
const canSwim = (name: string): Swimmer => ({ swim: () => \`\${name} swims\` });
const canWalk = (name: string): Walker => ({ walk: () => \`\${name} walks\` });`,
      },
      sceneState: { phase: "capabilities" },
    },
    {
      title: "Build animals from the pieces",
      body: `Now each animal is **composed** of exactly the capabilities it has. An object *has* abilities instead of *being* a kind of thing.

The duck simply gets all three. The penguin gets swim and walk, so it never had a \`fly()\` to fake. No throwing errors, no copied code, no awkward tree.

That's the meaning of **"composition over inheritance"**: prefer *has-a* over *is-a* when building behavior.`,
      code: {
        lang: "ts",
        source: `const sparrow = { name: "Sparrow", ...canFly("Sparrow"), ...canWalk("Sparrow") };
const penguin = { name: "Penguin", ...canSwim("Penguin"), ...canWalk("Penguin") };
const duck = {
  name: "Duck",
  ...canFly("Duck"),
  ...canSwim("Duck"),
  ...canWalk("Duck"),
};`,
        highlight: [3, 4, 5, 6, 7, 8],
      },
      sceneState: { phase: "compose" },
    },
    {
      title: "New requirements are now cheap",
      body: `A new request: **flying fish**. In the class tree, this would mean another awkward branch.

With composition it's one line: a flying fish swims and flies. Existing animals don't change, and neither do the capabilities.

New combinations cost almost nothing, because behavior is assembled rather than inherited.`,
      code: {
        lang: "ts",
        source: `const flyingFish = { name: "Flying fish", ...canSwim("Flying fish"), ...canFly("Flying fish") };`,
      },
      sceneState: { phase: "new-animal" },
    },
    {
      title: "When to use which",
      body: `Inheritance isn't forbidden. It's a good fit when the *is-a* relationship is real and stable, and the child can honor **everything** the parent promises (you'll meet this as the Liskov principle in SOLID part 2).

Reach for composition when:

- different objects need different **mixes** of behavior,
- you catch yourself overriding methods just to disable them,
- the class tree keeps getting deeper.

Next, **interfaces and dependency injection** take this idea further: passing capabilities *into* objects from outside.`,
      sceneState: { phase: "summary" },
    },
  ],
};
