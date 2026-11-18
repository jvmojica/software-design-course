import { isRouteErrorResponse, Link, Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError } from "react-router";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { THEME_INIT_SCRIPT } from "./components/ThemeToggle";
import "@fontsource/atkinson-hyperlegible/400.css";
import "@fontsource/atkinson-hyperlegible/700.css";
import "./styles/tokens.css";
import "./styles/global.css";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#f6f1e9" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip-link" href="#content">Skip to content</a>
        <Header />
        <div id="content">{children}</div>
        <Footer />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main className="wrap error-page">
      <h1>{notFound ? "Page not found" : "Something went wrong"}</h1>
      <p>{notFound ? "That page doesn't exist — it may have moved." : "Please try reloading the page."}</p>
      <p>
        <Link to="/lessons">Go to the course map</Link>
      </p>
    </main>
  );
}
