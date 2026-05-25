import { useEffect, useRef, useState } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { shadcn } from "@clerk/themes";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ThemeContext, type Theme } from "@/lib/theme";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Builders from "@/pages/Builders";
import BuilderProfile from "@/pages/BuilderProfile";
import Projects from "@/pages/Projects";
import CompanyRequest from "@/pages/CompanyRequest";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminVerifications from "@/pages/AdminVerifications";
import VerifyApply from "@/pages/VerifyApply";
import VerifyStatus from "@/pages/VerifyStatus";

// ── Clerk config ──────────────────────────────────────────────────────────────
// REQUIRED — copy verbatim per Replit Clerk skill
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

const queryClient = new QueryClient();

// ── Clerk appearance (BuildHub-branded) ───────────────────────────────────────
const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
    socialButtonsVariant: "iconButton" as const,
  },
  variables: {
    colorPrimary: "#4f46e5",
    colorForeground: "#0d0b1e",
    colorMutedForeground: "#7b7899",
    colorDanger: "#e11d48",
    colorBackground: "#f5f4ff",
    colorInput: "#ffffff",
    colorInputForeground: "#0d0b1e",
    colorNeutral: "#dddaf5",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "10px",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-lg",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#0d0b1e] font-bold",
    headerSubtitle: "text-[#7b7899]",
    socialButtonsBlockButtonText: "text-[#0d0b1e] font-medium",
    formFieldLabel: "text-[#0d0b1e] font-semibold text-sm",
    footerActionLink: "text-[#4f46e5] font-semibold",
    footerActionText: "text-[#7b7899]",
    dividerText: "text-[#7b7899]",
    identityPreviewEditButton: "text-[#4f46e5]",
    formFieldSuccessText: "text-[#059669]",
    alertText: "text-[#0d0b1e]",
    logoBox: "flex items-center justify-center py-2",
    logoImage: "h-10 w-10",
    socialButtonsBlockButton: "border border-[#dddaf5] bg-white hover:bg-[#f5f4ff] rounded-xl",
    formButtonPrimary: "bg-[#4f46e5] hover:bg-[#3730c4] rounded-xl font-semibold",
    formFieldInput: "bg-white border border-[#dddaf5] rounded-xl text-[#0d0b1e]",
    footerAction: "bg-transparent",
    dividerLine: "bg-[#dddaf5]",
    alert: "bg-[rgba(225,29,72,0.08)] border border-[rgba(225,29,72,0.2)] rounded-xl",
    otpCodeFieldInput: "border border-[#dddaf5] rounded-xl",
    formFieldRow: "gap-3",
    main: "gap-4",
  },
};

// ── Auth pages ────────────────────────────────────────────────────────────────
function SignInPage() {
  return (
    <div style={{
      display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div style={{
      display: "flex", minHeight: "100dvh", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", padding: 24,
    }}>
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

// ── Home redirect ─────────────────────────────────────────────────────────────
function HomeRedirect() {
  return (
    <>
      <Show when="signed-in"><Redirect to="/builders" /></Show>
      <Show when="signed-out"><Home /></Show>
    </>
  );
}

// ── Query client cache invalidation on auth change ────────────────────────────
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const uid = user?.id ?? null;
      if (prevRef.current !== undefined && prevRef.current !== uid) qc.clear();
      prevRef.current = uid;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

// ── App shell (wraps every page with Navbar + Footer) ────────────────────────
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1, width: "100%", maxWidth: 1200, margin: "0 auto", padding: "40px 24px 80px" }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}

// ── Main router ───────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
      <p className="section-eyebrow" style={{ marginBottom: 12 }}>404</p>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)" }}>Page not found</h1>
      <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 15 }}>This page doesn't exist.</p>
      <a href="/" className="btn btn-primary" style={{ marginTop: 32 }}>Go Home</a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/builders" component={Builders} />
      <Route path="/builders/:username" component={BuilderProfile} />
      <Route path="/projects" component={Projects} />
      <Route path="/request" component={CompanyRequest} />
      <Route path="/admin">
        <AppShell><AdminDashboard /></AppShell>
      </Route>
      <Route path="/admin/verifications">
        <AppShell><AdminVerifications /></AppShell>
      </Route>
      <Route path="/verify">
        <AppShell><VerifyApply /></AppShell>
      </Route>
      <Route path="/verify/status">
        <AppShell><VerifyStatus /></AppShell>
      </Route>
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// ── ClerkProvider with router ─────────────────────────────────────────────────
function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Welcome back to BuildHub", subtitle: "Sign in to your builder account" } },
        signUp: { start: { title: "Join BuildHub", subtitle: "Prove execution. Get discovered." } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        {/* Most routes need Navbar/Footer — handled per-route above for auth pages that don't */}
        <Switch>
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route>
            <AppShell>
              <Switch>
                <Route path="/" component={HomeRedirect} />
                <Route path="/builders" component={Builders} />
                <Route path="/builders/:username" component={BuilderProfile} />
                <Route path="/projects" component={Projects} />
                <Route path="/request" component={CompanyRequest} />
                <Route path="/admin" component={AdminDashboard} />
                <Route path="/admin/verifications" component={AdminVerifications} />
                <Route path="/verify" component={VerifyApply} />
                <Route path="/verify/status" component={VerifyStatus} />
                <Route component={NotFound} />
              </Switch>
            </AppShell>
          </Route>
        </Switch>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("buildhub-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("buildhub-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
    </ThemeContext.Provider>
  );
}

export default App;
