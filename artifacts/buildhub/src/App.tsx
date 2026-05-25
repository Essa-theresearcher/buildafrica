import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, createContext, useContext } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Builders from "@/pages/Builders";
import BuilderProfile from "@/pages/BuilderProfile";
import Projects from "@/pages/Projects";
import CompanyRequest from "@/pages/CompanyRequest";
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient();

export type Theme = "light" | "dark";
export const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "dark", toggle: () => {} });

export function useTheme() { return useContext(ThemeContext); }

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="section-eyebrow mb-3">404</p>
      <h1 className="text-3xl font-bold" style={{ color: "var(--text)" }}>Page not found</h1>
      <p className="mt-2" style={{ color: "var(--text-muted)", fontSize: "15px" }}>This page doesn't exist.</p>
      <a href="/" className="btn btn-primary mt-8">Go Home</a>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/builders" component={Builders} />
      <Route path="/builders/:username" component={BuilderProfile} />
      <Route path="/projects" component={Projects} />
      <Route path="/request" component={CompanyRequest} />
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("buildhub-theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("buildhub-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <Navbar />
            <main
              style={{
                flex: 1,
                width: "100%",
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 24px 80px",
              }}
            >
              <Router />
            </main>
            <Footer />
          </div>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;
