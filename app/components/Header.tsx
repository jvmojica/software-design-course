import { Link, NavLink } from "react-router";
import { siteConfig } from "~/site.config";

export function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-row">
        <Link to="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          {siteConfig.siteName}
        </Link>
        <nav aria-label="Main">
          <NavLink to="/lessons" end>Course map</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </div>
    </header>
  );
}
