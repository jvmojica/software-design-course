import { useId } from "react";
import { siteConfig } from "~/site.config";

/** Embedded third-party signup form (Buttondown / Kit). Hidden until a form action is configured. */
export function EmailSignup({ action = siteConfig.emailFormAction }: { action?: string }) {
  const id = useId();
  if (!action) return null;
  return (
    <form className="signup" method="post" action={action} target="_blank" aria-label="Get email updates">
      <p className="signup-title">New lessons, straight to your inbox</p>
      <p className="signup-sub">One short email when a lesson is published. No spam, unsubscribe anytime.</p>
      <div className="signup-row">
        <label htmlFor={id} className="visually-hidden">Email address</label>
        <input id={id} type="email" name="email" required placeholder="you@example.com" autoComplete="email" />
        <button type="submit" className="btn btn-primary">Subscribe</button>
      </div>
    </form>
  );
}
