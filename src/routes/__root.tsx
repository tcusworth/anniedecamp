import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { CartProvider } from "../lib/cart";
import { CartDrawer } from "../components/CartDrawer";
import { GoogleAnalytics } from "../components/GoogleAnalytics";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// A crash caused by a stale module graph (the dev server restarted or re-bundled
// while the page was loading) cannot be repaired in place — only a fresh document
// load re-fetches the modules. Reload automatically, but never more than twice.
const CRASH_RELOAD_KEY = "ct-crash-reloads";
const MAX_AUTO_RELOADS = 2;

function readReloadCount() {
  try {
    return Number(window.sessionStorage.getItem(CRASH_RELOAD_KEY) || "0") || 0;
  } catch {
    return 0;
  }
}

function recordReload() {
  try {
    window.sessionStorage.setItem(CRASH_RELOAD_KEY, String(readReloadCount() + 1));
  } catch {
    /* storage unavailable — fall through to the manual retry UI */
  }
}

function isStaleModuleCrash(error: unknown) {
  const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
  return (
    /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|does not provide an export named|has already been declared|vite: (?:update|hot update) failed/i.test(
      message,
    ) ||
    /Cannot read properties of (?:null|undefined) \(reading '(?:useState|useEffect|useContext|useMemo)'\)/i.test(
      message,
    )
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    if (isStaleModuleCrash(error) && readReloadCount() < MAX_AUTO_RELOADS) {
      recordReload();
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
              // A hard reload re-fetches the page's modules, which a client-side
              // reset cannot do when the module graph itself is stale.
              window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Annie Decamp Art" },
      { name: "description", content: "Paintings and mixed-media work by Annie Decamp, Aspen, Colorado." },
      { name: "author", content: "Annie Decamp" },
      { property: "og:title", content: "Annie Decamp Art" },
      { property: "og:description", content: "Paintings and mixed-media work by Annie Decamp, Aspen, Colorado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@Lovable" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();



  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <CartDrawer />
        <GoogleAnalytics />
      </CartProvider>
    </QueryClientProvider>
  );
}
