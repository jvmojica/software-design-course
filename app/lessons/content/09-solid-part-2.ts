import type { Lesson } from "../types";

export const lesson09: Pick<Lesson, "scene" | "steps"> = {
  scene: "solid-2",
  steps: [
    {
      title: "Subclasses the caller can trust",
      body: `The **L** in SOLID is about inheritance done right. A nightly **backup job** saves data to every configured store. It works with the base class \`Store\` and calls \`save()\` on each one.

\`LocalStore\` and \`CloudStore\` both extend \`Store\` and both save correctly. The backup job doesn't know or care which kind it has. That's polymorphism working as intended.`,
      code: {
        lang: "ts",
        source: `abstract class Store {
  abstract save(key: string, data: Uint8Array): Promise<void>;
}

async function backup(stores: Store[], snapshot: Uint8Array) {
  for (const s of stores) await s.save("nightly", snapshot);
}`,
      },
      sceneState: { phase: "lsp-ok" },
    },
    {
      title: "Liskov: a subclass that breaks the promise",
      body: `Someone adds \`ReadOnlyStore\`, for an archive that must never change. It extends \`Store\` (it *is* a kind of store, isn't it?), but its \`save()\` throws an error.

Now the backup job crashes at 3 a.m. Nothing in the job changed. A subclass simply broke a promise its parent made.

The **Liskov Substitution Principle** says: *anywhere the parent works, every subclass must work too*, without surprises. If a child has to throw, do nothing, or ask for special handling, it shouldn't be a child of that parent.`,
      code: {
        lang: "ts",
        source: `class ReadOnlyStore extends Store {
  async save() {
    throw new Error("This store is read-only"); // breaks every caller of Store
  }
}`,
        highlight: [3],
      },
      sceneState: { phase: "lsp-broken" },
    },
    {
      title: "Interface Segregation: a fat interface",
      body: `The real problem is that \`Store\` promises too much. Suppose it's an interface with five methods: \`read\`, \`stats\`, \`write\`, \`delete\` and \`backup\`.

A \`ReadOnlyCache\` only needs to read. But to implement \`Store\`, it must provide all five, so three of them are stubs that throw (the red ones).

The **Interface Segregation Principle** says: *no class should be forced to depend on methods it doesn't use.* Big interfaces force exactly this kind of fake implementation.`,
      code: {
        lang: "ts",
        source: `interface Store {
  read(key: string): Promise<Uint8Array>;
  stats(): Promise<Stats>;
  write(key: string, data: Uint8Array): Promise<void>;
  delete(key: string): Promise<void>;
  backup(): Promise<void>;
}

class ReadOnlyCache implements Store {
  write() { throw new Error("not supported"); }
  delete() { throw new Error("not supported"); }
  backup() { throw new Error("not supported"); }
  // ...read and stats are the only real ones
}`,
        highlight: [10, 11, 12],
      },
      sceneState: { phase: "isp-fat" },
    },
    {
      title: "Split it into small interfaces",
      body: `Split the fat interface by what clients actually need: \`Reader\` (read, stats) and \`Writer\` (write, delete).

\`ReadOnlyCache\` implements only \`Reader\`, with no stubs and no lies. \`DiskStore\` implements both. And the backup job now asks for a \`Writer\`, so a read-only store simply can't be passed to it. The compiler catches the bug that used to crash at 3 a.m.

That's Liskov and Interface Segregation working together: honest, small promises that every implementation can keep.`,
      code: {
        lang: "ts",
        source: `interface Reader { read(key: string): Promise<Uint8Array>; stats(): Promise<Stats>; }
interface Writer { write(key: string, data: Uint8Array): Promise<void>; delete(key: string): Promise<void>; }

class ReadOnlyCache implements Reader { /* only what it can really do */ }
class DiskStore implements Reader, Writer { /* everything */ }

async function backup(targets: Writer[], snapshot: Uint8Array) { /* ... */ }`,
        highlight: [7],
      },
      sceneState: { phase: "isp-split" },
    },
    {
      title: "Dependency Inversion: the problem",
      body: `The **D**. \`OrderService\` holds important business logic: pricing, stock checks, order rules. It creates and calls \`MySqlDatabase\` directly.

Look at the arrow: the **high-level** policy depends on a **low-level** detail. Changing databases means editing business logic. Testing an order rule needs a running MySQL server. The most important code is chained to the least important.`,
      code: {
        lang: "ts",
        source: `class OrderService {
  private db = new MySqlDatabase("mysql://prod");

  async place(order: Order) {
    if (order.items.length === 0) throw new Error("Empty order");
    await this.db.query("INSERT INTO orders ...", order);
  }
}`,
        highlight: [2],
      },
      sceneState: { phase: "dip-direct" },
    },
    {
      title: "Invert it: depend on an abstraction",
      body: `The **Dependency Inversion Principle** says: *high-level code shouldn't depend on low-level code; both should depend on abstractions.*

\`OrderService\` now depends on an \`OrderRepository\` interface, which sits on the *high-level* layer because the business decides what it needs: "save an order". \`MySqlOrderRepository\` implements it, so its arrow now points **up**.

That's the "inversion": the detail depends on the policy, instead of the policy depending on the detail.`,
      code: {
        lang: "ts",
        source: `// Owned by the business layer:
interface OrderRepository { save(order: Order): Promise<void>; }

class OrderService {
  constructor(private repo: OrderRepository) {}
  async place(order: Order) {
    if (order.items.length === 0) throw new Error("Empty order");
    await this.repo.save(order);
  }
}

// Low-level detail, depends on the abstraction:
class MySqlOrderRepository implements OrderRepository { /* SQL here */ }`,
        highlight: [2, 5],
      },
      sceneState: { phase: "dip-inverted" },
    },
    {
      title: "Swap the details freely",
      body: `Now any implementation of \`OrderRepository\` can plug in. For tests, an \`InMemoryOrderRepository\` stores orders in an array. Tests are fast, need no database, and \`OrderService\` hasn't changed a single line.

The same move lets you switch to Postgres, add caching, or call a remote API, all without touching the business rules.

Handing \`OrderService\` its repository through the constructor is called **dependency injection**, and it gets its own lesson next.`,
      code: {
        lang: "ts",
        source: `class InMemoryOrderRepository implements OrderRepository {
  orders: Order[] = [];
  async save(order: Order) { this.orders.push(order); }
}

test("places an order", async () => {
  const repo = new InMemoryOrderRepository();
  await new OrderService(repo).place(sampleOrder);
  expect(repo.orders).toHaveLength(1);
});`,
      },
      sceneState: { phase: "dip-swap" },
    },
    {
      title: "SOLID, complete",
      body: `The last three letters:

- **Liskov Substitution:** a subclass must work anywhere its parent does, with no surprises.
- **Interface Segregation:** prefer several small interfaces over one fat one.
- **Dependency Inversion:** important code depends on abstractions, not on details.

With part 1 you now have all five: **S**ingle responsibility, **O**pen/closed, **L**iskov, **I**nterface segregation, **D**ependency inversion. Use them as questions to ask when code hurts, not as rules to apply everywhere.

Next: **composition over inheritance**, a practical way to avoid many Liskov problems in the first place.`,
      sceneState: { phase: "summary" },
    },
  ],
};
