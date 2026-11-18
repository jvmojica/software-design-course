import { Link } from "react-router";
import { siteConfig } from "~/site.config";
import { SupportLink } from "./SupportLink";
import { ThemeToggle } from "./ThemeToggle";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-row">
        <p>
          {siteConfig.siteName} — a free, interactive course. <Link to="/about">About</Link>
        </p>
        <div className="footer-actions">
          <SupportLink />
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
}
