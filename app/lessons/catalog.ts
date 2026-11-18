import type { CatalogEntry, Level } from "./types";

type Entry = Omit<CatalogEntry, "number" | "level" | "status">;

const beginner: Entry[] = [
  { slug: "what-is-software-design", title: "What is software design?", summary: "Why some code is easy to change and other code fights you — and what designing software actually means." },
  { slug: "functions-and-naming", title: "Functions and naming, and breaking problems apart", summary: "Split a big problem into small, well-named functions that each do one clear job." },
  { slug: "oop-basics", title: "OOP basics: classes, objects and encapsulation", summary: "Bundle data with the behavior that owns it, and hide the details other code shouldn't touch." },
  { slug: "oop-in-depth", title: "OOP in depth: abstraction, inheritance and polymorphism", summary: "The remaining pillars of object-oriented programming: hiding complexity, sharing behavior, and one message with many responses." },
  { slug: "separation-of-concerns", title: "Separation of concerns", summary: "Keep UI, business rules and storage apart so a change in one doesn't spill into the others." },
  { slug: "coupling-and-cohesion", title: "Coupling and cohesion", summary: "Group code that changes together and loosen the ties between groups — the two forces behind every good design." },
  { slug: "dry-kiss-yagni", title: "Keep it simple: DRY, KISS and YAGNI", summary: "Three rules of thumb that fight duplication, cleverness and building things you don't need yet." },
];

const intermediate: Entry[] = [
  { slug: "solid-part-1", title: "SOLID, part 1: Single Responsibility and Open/Closed", summary: "Give each class one reason to change, and add new behavior without editing code that already works." },
  { slug: "solid-part-2", title: "SOLID, part 2: Liskov, Interface Segregation and Dependency Inversion", summary: "Substitutable subtypes, small focused interfaces, and depending on abstractions instead of details." },
  { slug: "composition-over-inheritance", title: "Composition over inheritance", summary: "Build objects from small capabilities instead of deep class trees that break when requirements change." },
  { slug: "interfaces-and-dependency-injection", title: "Interfaces and dependency injection", summary: "Pass dependencies in instead of creating them inside, so parts can be swapped, tested and reused." },
  { slug: "designing-for-testability", title: "Designing for testability", summary: "Code that is easy to test is usually well designed. Learn the seams that make testing painless." },
  { slug: "error-handling", title: "Error handling and defensive design", summary: "Fail loudly, fail early, and decide where errors are handled so problems never hide." },
  { slug: "creational-patterns", title: "Creational patterns: Factory, Builder and Singleton", summary: "Patterns for creating objects cleanly — and when Singleton does more harm than good." },
];

const advanced: Entry[] = [
  { slug: "structural-patterns", title: "Structural patterns: Adapter, Decorator, Facade and Composite", summary: "Patterns for fitting pieces together: translate interfaces, wrap behavior, simplify, and build trees." },
  { slug: "behavioral-patterns", title: "Behavioral patterns: Strategy, Observer, Command and State", summary: "Patterns for how objects talk: swap algorithms, broadcast changes, queue actions, and switch states." },
  { slug: "code-smells-and-refactoring", title: "Code smells and refactoring techniques", summary: "Spot the warning signs in code and fix them with small, safe, behavior-preserving steps." },
  { slug: "layered-architecture", title: "Layered architecture", summary: "Organize a whole application into layers with clear rules about which way dependencies point." },
  { slug: "hexagonal-and-clean-architecture", title: "Hexagonal and clean architecture", summary: "Put the business core at the center and plug databases, UIs and services in from the outside." },
  { slug: "domain-driven-design-basics", title: "Domain-driven design basics", summary: "Model software around the business: shared language, entities, value objects and bounded contexts." },
  { slug: "capstone-redesign", title: "Capstone: redesign a messy codebase step by step", summary: "Put everything together by turning a tangled codebase into a clean design, one safe step at a time." },
];

/**
 * Lesson numbers that are built. Their content lives in content.server.ts, which only build-time
 * loaders import, so lesson text never ships in the browser bundle (it is already in the HTML).
 * A test checks this list matches the content registry.
 */
const PUBLISHED = new Set([1, 2, 3, 4, 6, 10, 16]);

function build(level: Level, entries: Entry[], offset: number): CatalogEntry[] {
  return entries.map((e, i) => {
    const number = offset + i + 1;
    return { ...e, number, level, status: PUBLISHED.has(number) ? "published" : "coming-soon" };
  });
}

export const catalog: CatalogEntry[] = [
  ...build("beginner", beginner, 0),
  ...build("intermediate", intermediate, 7),
  ...build("advanced", advanced, 14),
];
