import type { Lesson } from "../types";

export const lesson01: Pick<Lesson, "scene" | "steps"> = {
  scene: "what-is-design",
  steps: [
    {
      title: "Working code is only half the story",
      body: `Here is a small to-do app. You can add tasks, tick them off and see your list. It works.

But "it works" only describes today. Real software keeps changing: new features, fixed bugs, new people joining the team. The question this course is about is: **how easy is this code to change tomorrow?**

In the scene, the whole app is one block. From the outside, you can't tell whether it's easy or painful to change. Let's look inside.`,
      sceneState: { phase: "intro" },
    },
    {
      title: "Look inside: everything touches everything",
      body: `Open the app up and you find six pieces: the screen, the buttons, the validation rules, the text formatting, the database code and the list display.

Every arrow is one piece reaching directly into another. The screen talks to the database. The buttons run the rules *and* write to the database. The formatting code knows about the screen.

Nothing is wrong yet, and the app still works. But notice how many arrows there are. Each one is a place where a change in one piece can break another.`,
      code: {
        lang: "ts",
        source: `function addTodo(text: string) {
  const list = document.querySelector("#list")!;
  if (text.length > 0 && text.length < 200) {
    db.insert("todos", { text, done: false });
    list.innerHTML += \`<li>\${text.trim()}</li>\`;
  }
}`,
      },
      sceneState: { phase: "inside" },
    },
    {
      title: "The same app, built another way",
      body: `On the right is **Version B**: exactly the same features, organized differently.

It has three parts stacked like floors in a building. The **UI** shows things and takes input. The **task rules** decide what a valid task is. The **storage** saves and loads tasks. Each part only talks to the one directly below it.

Both versions work, and a user would never notice the difference. The difference shows up when something has to change.`,
      code: {
        lang: "ts",
        source: `// ui.ts: shows things, forwards input
addButton.onclick = () => tasks.add(input.value);

// tasks.ts: the rules
export function add(text: string) {
  if (!isValidText(text)) throw new Error("Invalid task");
  storage.save({ text, done: false });
}

// storage.ts: saving and loading
export const save = (task: Task) => db.insert("todos", task);`,
      },
      sceneState: { phase: "two-ways" },
    },
    {
      title: "A new requirement arrives",
      body: `Your users ask for something reasonable: **"Can tasks have due dates?"**

This is completely normal. Requirements change all the time, and good software is software that can absorb these changes calmly.

Watch the request travel into both versions. It lands on the rules first, because a due date is a new rule about what a task is.`,
      sceneState: { phase: "request" },
    },
    {
      title: "In Version A, the change ripples",
      body: `In the tangled version, adding a due date means editing almost everything. The rules need to check dates. The database code needs a new column. The formatting needs to show dates. The screen and the list both build their own HTML, so both need changing too.

Five of the six pieces turn red. Each edit risks breaking something that used to work, and you have to understand all of them to make the change safely.

In Version B, only one part lights up.`,
      code: {
        lang: "ts",
        source: `function addTodo(text: string, due?: string) {
  const list = document.querySelector("#list")!;
  if (text.length > 0 && text.length < 200 && isFutureDate(due)) {
    db.insert("todos", { text, done: false, due });
    list.innerHTML += \`<li>\${text.trim()} (due \${formatDate(due)})</li>\`;
  }
}
// ...and the same edits again in renderList(), editTodo(), importTodos()`,
        highlight: [1, 3, 4, 5, 8],
      },
      sceneState: { phase: "ripple" },
    },
    {
      title: "In Version B, the change stays put",
      body: `In the designed version, a due date is a new rule about tasks, so the change lives in the **task rules**. The UI gets one new input field, and storage just saves whatever task it is given.

The change has a clear home, and the rest of the app doesn't need to know about it. You can understand it, test it and review it in one place.

That is the payoff of design: **changes stay small, local and safe**.`,
      code: {
        lang: "ts",
        source: `// tasks.ts: the only file with real changes
export function add(text: string, due?: Date) {
  if (!isValidText(text)) throw new Error("Invalid task");
  if (due && due < today()) throw new Error("Due date is in the past");
  storage.save({ text, done: false, due });
}`,
        highlight: [2, 4, 5],
      },
      sceneState: { phase: "contained" },
    },
    {
      title: "So what is software design?",
      body: `**Software design is deciding how to split code into parts, and how those parts depend on each other, so that the code stays easy to understand and change.**

It's not about drawing diagrams or using fancy patterns. It's a set of everyday decisions: what goes in this function, which file owns this rule, who is allowed to call what.

Version A and Version B have the same features. They differ only in those decisions, and that difference decides how your next hundred changes will feel.`,
      sceneState: { phase: "definition" },
    },
    {
      title: "Where this course goes next",
      body: `Every lesson ahead gives you tools for making these decisions well:

- **Beginner:** functions, classes, and the core ideas of OOP, plus *coupling and cohesion*, the two forces you just saw in action.
- **Intermediate:** principles like SOLID, composition and dependency injection.
- **Advanced:** design patterns, refactoring, and how whole applications are structured.

Next up: **functions and naming**, the smallest unit of design.`,
      sceneState: { phase: "ahead" },
    },
  ],
};
