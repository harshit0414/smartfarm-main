import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "SmartFarm — Solar Powered IoT Farming Dashboard" },
      { name: "description", content: "Self-optimizing solar powered smart farming system using AI and IoT. Monitor ESP32 sensors, soil, weather and more." },
      { property: "og:title", content: "SmartFarm — Solar Powered IoT Dashboard" },
      { property: "og:description", content: "AI-powered precision agriculture with real-time IoT monitoring." },
    ],
  }),
});

function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <LoginPage />;
  return <Dashboard />;
}
