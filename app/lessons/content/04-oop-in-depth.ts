import type { Lesson } from "../types";

export const lesson04: Pick<Lesson, "scene" | "steps"> = {
  scene: "oop-in-depth",
  steps: [
    {
      title: "Abstraction: hide the hard parts",
      body: `You drive a car with a wheel and two pedals. You don't need to know how fuel injection works. That's **abstraction**: a simple surface over complicated insides.

Code works the same way. Here a drawing app needs shapes. It only sees \`Shape\`, with two simple methods: \`draw()\` and \`area()\`. The geometry math, pixel drawing and SVG paths are behind it, dimmed, because the app never deals with them.

Abstraction lets you think about *what* something does without holding *how* in your head. It's what makes big programs possible to understand.`,
      code: {
        lang: "ts",
        source: `// All the app needs to know about shapes:
interface Shape {
  draw(ctx: CanvasRenderingContext2D): void;
  area(): number;
}

console.log(shape.area()); // no idea how, and doesn't need one`,
      },
      sceneState: { phase: "abstraction" },
    },
    {
      title: "Inheritance: share what's common",
      body: `Every shape on the canvas has a position and a color, and every shape can be moved. Writing that code three times would be repetitive and error-prone.

With **inheritance**, a base class \`Shape\` holds the shared code once. \`Circle\`, \`Square\` and \`Triangle\` **extend** it, as the arrows show. Each child automatically gets everything the parent has.

A child class reads as "a Circle **is a** Shape". That *is-a* relationship is the test for when inheritance fits.`,
      code: {
        lang: "ts",
        source: `abstract class Shape {
  constructor(public x: number, public y: number, public color: string) {}
  move(dx: number, dy: number) { this.x += dx; this.y += dy; }
}

class Circle extends Shape { /* ... */ }
class Square extends Shape { /* ... */ }
class Triangle extends Shape { /* ... */ }`,
        highlight: [6, 7, 8],
      },
      sceneState: { phase: "inheritance" },
    },
    {
      title: "Write it once, use it everywhere",
      body: `\`move()\` is written once, in \`Shape\`, and every child can use it. The glowing arrows show the shared code flowing down.

Fix a bug in \`move()\` and all three shapes get the fix. Add a \`rotate()\` method to \`Shape\` and every shape can rotate.

That's the benefit of inheritance done well: **common behavior lives in one place**.`,
      code: {
        lang: "ts",
        source: `const c = new Circle(10, 10, "teal", 5);
const s = new Square(40, 10, "gold", 8);

c.move(5, 0); // inherited from Shape
s.move(0, 5); // same method, same code`,
        highlight: [4, 5],
      },
      sceneState: { phase: "shared" },
    },
    {
      title: "Each child fills in its own details",
      body: `Some things *can't* be shared. There's no single formula for area: a circle uses π·r², a square s², a triangle ½·b·h.

So \`Shape\` declares \`area()\` as **abstract**: "every shape must have an area, but I can't say how". Each child then **overrides** it with its own version. Because \`Shape\` itself is abstract, you can't create a plain \`new Shape()\`, only real circles, squares and triangles.

The parent sets the contract, and each child keeps it in its own way.`,
      code: {
        lang: "ts",
        source: `abstract class Shape {
  abstract area(): number;
}

class Circle extends Shape {
  constructor(x: number, y: number, color: string, public r: number) { super(x, y, color); }
  area() { return Math.PI * this.r ** 2; }
}

class Square extends Shape {
  constructor(x: number, y: number, color: string, public side: number) { super(x, y, color); }
  area() { return this.side ** 2; }
}`,
        highlight: [2, 7, 12],
      },
      sceneState: { phase: "override" },
    },
    {
      title: "Polymorphism: one call, many forms",
      body: `Now the payoff. The drawing app keeps a list of shapes and calls \`draw()\` on each one. It doesn't check *which kind* of shape it has.

Each shape responds with **its own** version: the circle draws a circle, the square draws a square. Same call, different behavior. That's **polymorphism** ("many forms").

Notice what's missing from the app's code: no \`if (shape is Circle) … else if (shape is Square) …\`. The decision lives inside each shape instead.`,
      code: {
        lang: "ts",
        source: `const shapes: Shape[] = [
  new Circle(10, 10, "teal", 5),
  new Square(40, 10, "gold", 8),
  new Triangle(70, 10, "sage", 6, 9),
];

for (const shape of shapes) {
  shape.draw(ctx); // each one knows how to draw itself
}`,
        highlight: [7, 8, 9],
      },
      sceneState: { phase: "polymorphism" },
    },
    {
      title: "New shapes plug right in",
      body: `Users ask for stars. Write a \`Star\` class that extends \`Shape\` and implements \`draw()\` and \`area()\`. That's it.

The drawing app's loop **doesn't change at all**. The new star receives \`draw()\` just like the others, because the app only ever depended on \`Shape\`, never on specific kinds of shapes.

This is how polymorphism keeps code open to new features without editing what already works. You'll see it again in Strategy, State and many other patterns.`,
      code: {
        lang: "ts",
        source: `class Star extends Shape {
  constructor(x: number, y: number, color: string, public points: number) { super(x, y, color); }
  draw(ctx: CanvasRenderingContext2D) { /* star path */ }
  area() { /* ... */ return 0; }
}

shapes.push(new Star(100, 10, "coral", 5)); // the loop is untouched`,
      },
      sceneState: { phase: "poly-new" },
    },
    {
      title: "The four pillars of OOP",
      body: `With lesson 3, you've now seen all four:

- **Encapsulation:** an object protects its own data behind methods.
- **Abstraction:** a simple interface hides complicated details.
- **Inheritance:** child classes share and extend a parent's code.
- **Polymorphism:** one call works on many types, each responding its own way.

A word of caution: inheritance is the pillar most often overused. It fits when "is-a" is true and stable. Lesson 10, *composition over inheritance*, shows what happens when it isn't.

Next: **separation of concerns**, organizing a whole program, not just one class.`,
      sceneState: { phase: "pillars" },
    },
  ],
};
