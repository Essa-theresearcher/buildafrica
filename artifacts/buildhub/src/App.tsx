import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Home from "@/pages/Home";
import Builders from "@/pages/Builders";
import BuilderProfile from "@/pages/BuilderProfile";
import Projects from "@/pages/Projects";
import CompanyRequest from "@/pages/CompanyRequest";
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-bold text-[var(--text)]">404</h1>
      <p className="mt-2 text-[var(--text-muted)]">Page not found.</p>
      <a href="/" className="btn-primary mt-6 inline-flex">
        Go Home
      </a>
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
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
            <Router />
          </main>
          <Footer />
        </div>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
