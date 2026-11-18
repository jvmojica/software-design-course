import { Link, type MetaFunction } from "react-router";
import { EmailSignup } from "~/components/EmailSignup";
import { SupportLink } from "~/components/SupportLink";
import { pageMeta } from "~/seo/meta";
import { siteConfig } from "~/site.config";

export const meta: MetaFunction = () =>
  pageMeta({
    title: "About · Software Design",
    description: "Why this free interactive software design course exists, who it's for, and how to support it.",
    path: "/about",
  });

export default function About() {
  return (
    <main className="wrap prose-page">
      <h1 className="page-title">About this course</h1>
      <p>
        Software design is the craft of shaping code so it stays easy to understand and change. It's usually taught
        with walls of text and static boxes-and-arrows. This course shows it instead: every idea is a small 3D scene
        you step through, with the code changing alongside it.
      </p>
      <p>
        It's free, and it goes from beginner to advanced: from functions and your first class, through SOLID and
        design patterns, to clean architecture and a full refactoring capstone.{" "}
        <Link to="/lessons">See the course map</Link>.
      </p>
      <h2>Who made it</h2>
      <p>Built by {siteConfig.author} with React, Three.js and react-three-fiber.</p>
      <h2>Support</h2>
      <p>The course stays free for everyone. If it helped you, you can support new lessons.</p>
      <SupportLink />
      <EmailSignup />
    </main>
  );
}
