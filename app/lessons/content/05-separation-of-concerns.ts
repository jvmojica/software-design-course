import type { Lesson } from "../types";

export const lesson05: Pick<Lesson, "scene" | "steps"> = {
  scene: "separation-of-concerns",
  steps: [
    {
      title: "One file, four kinds of work",
      body: `Here's a signup feature, all in one file: \`signup.ts\`. Inside, four very different kinds of code are woven together: building an HTML **form**, checking **rules** like "users must be 13 or older", **saving** to a database with SQL, and **sending** a welcome email.

The red lines show how tangled they are. The HTML code calls the database, the SQL sits inside the validation, and the email is built in the middle of everything.

It works, until you need to change any one of those things.`,
      code: {
        lang: "ts",
        source: `async function handleSignup(req: Request) {
  const form = await req.formData();
  const age = Number(form.get("age"));
  if (age < 13) return html(\`<p class="error">Too young</p>\`);
  await db.run("INSERT INTO users (email, age) VALUES (?, ?)", [form.get("email"), age]);
  await smtp.send(String(form.get("email")), "Welcome!", \`<h1>Hi!</h1>\`);
  return html(\`<p>Thanks for signing up!</p>\`);
}`,
      },
      sceneState: { phase: "mixed" },
    },
    {
      title: "Name the concerns",
      body: `A **concern** is one kind of job a program has to do. Here there are four:

- **UI:** what the user sees and clicks.
- **Business rules:** what's allowed (age limits, required fields).
- **Storage:** how data is saved and loaded.
- **Email:** how messages get sent.

Each concern changes for *different reasons* and often at the hands of different people. Designers change the UI. The business changes the rules. Ops changes the database. Mixing them means every change risks breaking the others.`,
      sceneState: { phase: "concerns" },
    },
    {
      title: "Give each concern its own place",
      body: `**Separation of concerns** means each kind of work gets its own module. The form only handles the screen. \`SignupRules\` only decides what's valid. The store only talks to the database. The mailer only sends mail.

Look at the arrows: the UI asks the rules, and the rules use storage and email. The UI never touches the database directly.

You'll recognize the shape from lesson 1's Version B. Now you know the name of the principle behind it.`,
      code: {
        lang: "ts",
        source: `// signup-form.ts: UI only
form.onsubmit = async () => show(await signup(readForm()));

// signup-rules.ts: business rules only
export async function signup(input: SignupInput) {
  if (input.age < 13) return { ok: false, error: "You must be 13 or older" };
  const user = await userStore.save(input);
  await mailer.sendWelcome(user.email);
  return { ok: true };
}`,
      },
      sceneState: { phase: "separate" },
    },
    {
      title: "A new screen reuses the same rules",
      body: `The company launches a **mobile app**. It needs signup too.

Because the rules live on their own, the mobile app just calls the same \`signup\` function. The age limit is enforced identically on web and mobile, and nobody copied any validation code.

The rules module didn't move or change at all. Only a new UI was added next to the old one.`,
      code: {
        lang: "ts",
        source: `// mobile/SignupScreen.tsx: a second UI, same rules
const result = await signup({ email, age });`,
      },
      sceneState: { phase: "change-ui" },
    },
    {
      title: "Swap the database, touch one block",
      body: `The app outgrows SQLite and moves to **Postgres**. Only the storage block changes: \`SqliteUserStore\` becomes \`PostgresUserStore\`, with the same \`save()\` method.

The rules still call \`userStore.save(...)\`, the UI still calls the rules, and the mailer never knew a database existed.

When concerns are separated, a big change in one area becomes a small, contained change.`,
      code: {
        lang: "ts",
        source: `class PostgresUserStore {
  async save(input: SignupInput): Promise<User> {
    const { rows } = await pg.query(
      "INSERT INTO users (email, age) VALUES ($1, $2) RETURNING *",
      [input.email, input.age],
    );
    return rows[0];
  }
}`,
      },
      sceneState: { phase: "change-db" },
    },
    {
      title: "Test the rules on their own",
      body: `In the tangled version, testing "under-13s are rejected" meant faking an HTTP request, a database and an email server.

Now the rules can be tested directly: pass in an age of 12 and check the answer. The UI, storage and email are set aside, dimmed in the scene. (Lesson 11, *dependency injection*, shows how to hand the rules fake versions of storage and email.)

Fast, focused tests are one of the biggest practical rewards of separating concerns.`,
      code: {
        lang: "ts",
        source: `test("rejects users under 13", async () => {
  const result = await signup({ email: "kid@example.com", age: 12 });
  expect(result).toEqual({ ok: false, error: "You must be 13 or older" });
});`,
      },
      sceneState: { phase: "test-rules" },
    },
    {
      title: "How to apply it",
      body: `When code feels hard to change, ask: **how many different kinds of work is this doing?**

- Keep **UI** code about displaying and collecting input.
- Keep **business rules** free of HTML, SQL and network calls.
- Keep **storage** and **external services** (email, payments) behind small modules.

Don't overdo it: a 20-line script doesn't need four files. Separate concerns when they really change for different reasons.

Next: **coupling and cohesion**, the two forces that tell you *how* to draw these boundaries.`,
      sceneState: { phase: "summary" },
    },
  ],
};
